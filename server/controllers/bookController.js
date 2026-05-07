import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { db } from "../database/db.js";
import cloudinary from "cloudinary";
import { FieldValue } from "firebase-admin/firestore";

// Get All Books (Added Pagination for DB DoS Protection)
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    const { skip = 0, limit = 1000 } = req.query; // Default upper bound 1000
    const snapshot = await db.collection("books")
        .orderBy("createdAt", "desc")
        .offset(parseInt(skip))
        .limit(parseInt(limit))
        .get();

    const books = [];
    snapshot.forEach((doc) => books.push({ id: doc.id, ...doc.data() }));
    
    // Also return count to allow frontend pagination
    const countSnap = await db.collection("books").count().get();
    
    res.status(200).json({
        success: true,
        message: "Books fetched successfully.",
        data: { books, total: countSnap.data().count },
        error: null,
    });
});

// 1. Create a New Book (Admin and super admin)
export const createBook = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Book image is required.", 400));
    }

    const { image } = req.files;
    const { title, genre, author, edition, totalCopies, rating } = req.body;

    if (!title || !genre || !author || !edition) {
        return next(new ErrorHandler("Please provide title, genre, author, and edition.", 400));
    }

    // Validate totalCopies (new field for borrowing system)
    const copies = totalCopies ? parseInt(totalCopies) : 1;
    if (isNaN(copies) || copies <= 0) {
        return next(new ErrorHandler("Total copies must be a positive number.", 400));
    }

    // Validate rating
    const bookRating = rating ? parseFloat(rating) : 0;
    if (isNaN(bookRating) || bookRating < 0 || bookRating > 5) {
        return next(new ErrorHandler("Rating must be a number between 0 and 5.", 400));
    }

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(image.tempFilePath, {
        folder: "Library_Books",
    });

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("Failed to upload book image.", 500));
    }

    const newBook = {
        title,
        genre,
        author,
        edition,
        status: "Available", 
        totalCopies: copies,
        availableCopies: copies,
        rating: bookRating,
        image: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        addedBy: req.user.id, 
        createdAt: new Date(),
    };

    const docRef = await db.collection("books").add(newBook);

    res.status(201).json({
        success: true,
        message: "Book added successfully.",
        data: { bookId: docRef.id },
        error: null,
    });
});

// 2. Update a Book (Admin and super admin)
export const updateBook = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.params.id;
    const { title, genre, author, edition, totalCopies, rating } = req.body;

    const bookRef = db.collection("books").doc(bookId);
    let bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    let bookDataForImage = bookDoc.data();

    // Ensure no copies are currently borrowed before allowing an edit
    if (bookDataForImage.totalCopies !== bookDataForImage.availableCopies) {
        return next(new ErrorHandler("Cannot edit book details while copies are currently borrowed or unreturned.", 403));
    }

    let newImageData = null;

    // Do slow network ops outside transaction
    if (req.files && req.files.image) {
        const { image } = req.files;

        if (bookDataForImage.image && bookDataForImage.image.public_id) {
            await cloudinary.v2.uploader.destroy(bookDataForImage.image.public_id);
        }

        const cloudinaryResponse = await cloudinary.v2.uploader.upload(image.tempFilePath, {
            folder: "Library_Books",
        });

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(new ErrorHandler("Failed to upload new book image.", 500));
        }

        newImageData = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        };
    }

    // Validate rating
    let bookRating = null;
    if (rating !== undefined) {
        bookRating = parseFloat(rating);
        if (isNaN(bookRating) || bookRating < 0 || bookRating > 5) {
            return next(new ErrorHandler("Rating must be a number between 0 and 5.", 400));
        }
    }

    // Atomic Math Update
    await db.runTransaction(async (transaction) => {
        const latestDoc = await transaction.get(bookRef);
        if (!latestDoc.exists) {
            throw new Error("Book removed during update");
        }
        
        let latestData = latestDoc.data();
        let updateData = {
            title: title || latestData.title,
            genre: genre || latestData.genre,
            author: author || latestData.author,
            edition: edition || latestData.edition,
            updatedAt: new Date(),
        };

        if (bookRating !== null) {
            updateData.rating = bookRating;
        }

        if (newImageData) {
            updateData.image = newImageData;
        }

        // Handle totalCopies change with delta logic cleanly inside transaction
        if (totalCopies !== undefined) {
            const newTotal = parseInt(totalCopies);
            if (isNaN(newTotal) || newTotal <= 0) {
                throw new ErrorHandler("Total copies must be a positive number.", 400);
            }

            const oldTotal = latestData.totalCopies || 1;
            const delta = newTotal - oldTotal;
            const newAvailable = Math.max(0, (latestData.availableCopies || oldTotal) + delta);

            // Prevent availableCopies from going below 0
            if (newAvailable < 0) {
                throw new ErrorHandler(
                    `Cannot reduce total copies below ${oldTotal - (latestData.availableCopies || oldTotal)} (currently borrowed).`,
                    400
                );
            }

            updateData.totalCopies = newTotal;
            updateData.availableCopies = newAvailable;
            updateData.status = newAvailable > 0 ? "Available" : "Borrowed";
        }

        transaction.update(bookRef, updateData);
    });

    res.status(200).json({
        success: true,
        message: "Book updated successfully.",
        data: null,
        error: null,
    });
});

// 3. Delete a Book (Admin and super admin)
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.params.id;

    const bookRef = db.collection("books").doc(bookId);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const bookData = bookDoc.data();

    // Block deletion only when there are truly active borrow records.
    // This avoids false blocks from legacy copy-count mismatches (e.g. old Lost/Damaged flows).
    const activeBorrowSnapshot = await db
        .collection("borrow")
        .where("book_id", "==", bookId)
        .where("status", "in", ["Pending", "Borrowed", "Overdue"])
        .limit(1)
        .get();

    if (!activeBorrowSnapshot.empty) {
        return next(new ErrorHandler("Cannot delete book while it still has active borrow records.", 400));
    }

    if (bookData.image && bookData.image.public_id) {
        await cloudinary.v2.uploader.destroy(bookData.image.public_id);
    }

    await bookRef.delete();

    res.status(200).json({
        success: true,
        message: "Book and its image deleted successfully.",
        data: null,
        error: null,
    });
});

// 4. Rate a Book (authenticated users only) — upserts user vote, recalculates average atomically
export const rateBook = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.params.id;
    const userId  = req.user.id;
    const { rating } = req.body;

    // Validate rating value
    const score = parseInt(rating);
    if (isNaN(score) || score < 1 || score > 5) {
        return next(new ErrorHandler("Rating must be a whole number between 1 and 5.", 400));
    }

    // Check if user has overdue books
    const overdueSnapshot = await db.collection("borrow")
        .where("user_id", "==", userId)
        .where("status", "==", "Overdue")
        .limit(1)
        .get();

    if (!overdueSnapshot.empty) {
        return next(new ErrorHandler("You cannot rate books while you have overdue items.", 403));
    }

    // Check if user has borrowed this specific book
    const borrowHistory = await db.collection("borrow")
        .where("user_id", "==", userId)
        .where("book_id", "==", bookId)
        .get();

    const hasBorrowed = borrowHistory.docs.some(doc => {
        const status = doc.data().status;
        return status === "Borrowed" || status === "Returned";
    });

    if (!hasBorrowed) {
        return next(new ErrorHandler("You can only rate books you have actually borrowed.", 403));
    }

    const bookRef = db.collection("books").doc(bookId);

    let resultData;

    await db.runTransaction(async (transaction) => {
        const bookDoc = await transaction.get(bookRef);
        if (!bookDoc.exists) throw new ErrorHandler("Book not found.", 404);

        const data = bookDoc.data();

        // ratings is a map of { userId: score } stored on the document
        const existingRatings = data.ratings || {};
        const previousScore   = existingRatings[userId] || 0;
        const hadPreviousVote  = previousScore > 0;

        // Recalculate running totals
        const oldSum   = data.ratingSum   || 0;
        const oldCount = data.ratingCount || 0;

        const newSum   = oldSum - previousScore + score;
        const newCount = hadPreviousVote ? oldCount : oldCount + 1;
        const newAvg   = newCount > 0 ? parseFloat((newSum / newCount).toFixed(2)) : 0;

        transaction.update(bookRef, {
            [`ratings.${userId}`]: score, // upsert into the ratings map
            ratingSum:   newSum,
            ratingCount: newCount,
            rating:      newAvg,
            updatedAt:   new Date(),
        });

        resultData = { rating: newAvg, ratingCount: newCount, userRating: score };
    });

    res.status(200).json({
        success: true,
        message: "Rating submitted successfully.",
        data: resultData,
        error: null,
    });
});

// 5. Get My Rating for a Book — returns the calling user's existing vote (0 if never rated)
export const getMyRating = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.params.id;
    const userId  = req.user.id;

    const bookDoc = await db.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const data = bookDoc.data();
    const userRating = (data.ratings && data.ratings[userId]) || 0;

    res.status(200).json({
        success: true,
        message: "User rating fetched.",
        data: {
            userRating,
            rating:      data.rating      || 0,
            ratingCount: data.ratingCount || 0,
        },
        error: null,
    });
});
