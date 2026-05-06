import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { db } from "../database/db.js";
import cloudinary from "cloudinary";
import { createInAppNotification } from "../utils/notificationService.js";

export const submitDonation = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Book image is required.", 400));
    }

    const { image } = req.files;
    const { title, genre, author, edition } = req.body;

    if (!title || !genre || !author || !edition) {
        return next(new ErrorHandler("Please provide title, genre, author, and edition.", 400));
    }

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(image.tempFilePath, {
        folder: "Library_Donations",
    });

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("Failed to upload book image.", 500));
    }

    const donation = {
        title,
        genre,
        author,
        edition,
        image: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        status: "Pending",
        donorId: req.user.id,
        donorName: req.user.name || "Unknown",
        donorEmail: req.user.email || "Unknown",
        createdAt: new Date(),
    };

    const docRef = await db.collection("donations").add(donation);

    await createInAppNotification({
        userId: req.user.id,
        type: "DONATION_SUBMITTED",
        title: "Donation Submitted",
        message: `Your donation of "${title}" has been submitted and is pending admin review.`,
        donationId: docRef.id,
        actionUrl: "/settings",
    });

    // Notify admins
    try {
        const ADMIN_ROLES = ["Admin", "Super Admin", "admin", "super admin", "superadmin"];
        const adminSnapshot = await db.collection("users")
            .where("role", "in", ADMIN_ROLES)
            .get();

        const notifPromises = adminSnapshot.docs
            .filter((doc) => doc.id !== req.user.id)
            .map((adminDoc) => {
                return createInAppNotification({
                    userId: adminDoc.id,
                    type: "ADMIN_ALERT_NEW_DONATION",
                    title: "New Donation Request",
                    message: `${req.user.name || "A user"} wants to donate "${title}" to the library.`,
                    donationId: docRef.id,
                    actionRequired: true,
                    severity: "info",
                });
            });

        if (notifPromises.length > 0) {
            await Promise.all(notifPromises);
        }
    } catch (adminNotifError) {
        console.error("Failed to send admin notifications for donation:", adminNotifError);
    }

    res.status(201).json({
        success: true,
        message: "Donation request submitted successfully. It will be reviewed by an admin.",
        data: { donationId: docRef.id },
        error: null,
    });
});

export const getMyDonations = catchAsyncErrors(async (req, res, next) => {
    const snapshot = await db.collection("donations")
        .where("donorId", "==", req.user.id)
        .orderBy("createdAt", "desc")
        .get();

    const donations = [];
    snapshot.forEach((doc) => donations.push({ id: doc.id, ...doc.data() }));

    res.status(200).json({
        success: true,
        message: "Your donations fetched successfully.",
        data: { donations },
        error: null,
    });
});

export const getAllDonations = catchAsyncErrors(async (req, res, next) => {
    const snapshot = await db.collection("donations")
        .orderBy("createdAt", "desc")
        .get();

    const donations = [];
    snapshot.forEach((doc) => donations.push({ id: doc.id, ...doc.data() }));

    res.status(200).json({
        success: true,
        message: "All donations fetched successfully.",
        data: { donations },
        error: null,
    });
});

export const approveDonation = catchAsyncErrors(async (req, res, next) => {
    const donationId = req.params.id;
    const donationRef = db.collection("donations").doc(donationId);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
        return next(new ErrorHandler("Donation request not found.", 404));
    }

    const donationData = donationDoc.data();

    if (donationData.status !== "Pending") {
        return next(new ErrorHandler(`This donation has already been ${donationData.status.toLowerCase()}.`, 400));
    }

    // Case-insensitive match (Firestore has no native support, so we compare in JS)
    const allBooksSnapshot = await db.collection("books").get();

    let matchedBookDoc = null;
    const donatedTitle = donationData.title.trim().toLowerCase();
    const donatedAuthor = donationData.author.trim().toLowerCase();
    const donatedEdition = donationData.edition.trim().toLowerCase();

    allBooksSnapshot.forEach((doc) => {
        if (matchedBookDoc) return; // already found a match
        const bookData = doc.data();
        const bookTitle = (bookData.title || "").trim().toLowerCase();
        const bookAuthor = (bookData.author || "").trim().toLowerCase();
        const bookEdition = (bookData.edition || "").trim().toLowerCase();

        if (bookTitle === donatedTitle && bookAuthor === donatedAuthor && bookEdition === donatedEdition) {
            matchedBookDoc = { id: doc.id, ...bookData };
        }
    });

    if (matchedBookDoc) {
        const bookRef = db.collection("books").doc(matchedBookDoc.id);

        await db.runTransaction(async (transaction) => {
            const latestDoc = await transaction.get(bookRef);
            if (!latestDoc.exists) {
                throw new Error("Book was removed during approval.");
            }

            const latestData = latestDoc.data();
            transaction.update(bookRef, {
                totalCopies: (latestData.totalCopies || 1) + 1,
                availableCopies: (latestData.availableCopies || 0) + 1,
                status: "Available",
                updatedAt: new Date(),
            });
        });

        // Update donation status
        await donationRef.update({
            status: "Approved",
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            matchedBookId: matchedBookDoc.id,
            note: "Book already existed in library. Copies incremented by 1.",
        });

        res.status(200).json({
            success: true,
            message: `Donation approved. The book "${donationData.title}" already exists — copies increased by 1.`,
            data: { bookId: matchedBookDoc.id, action: "incremented" },
            error: null,
        });

        await createInAppNotification({
            userId: donationData.donorId,
            type: "DONATION_APPROVED",
            title: "Donation Approved ✅",
            message: `Your donation of "${donationData.title}" was approved! The book already existed — copies were incremented.`,
            donationId: donationId,
            actionUrl: "/settings",
        });
    } else {
        const newBook = {
            title: donationData.title,
            genre: donationData.genre,
            author: donationData.author,
            edition: donationData.edition,
            status: "Available",
            totalCopies: 1,
            availableCopies: 1,
            image: donationData.image,
            addedBy: req.user.id,
            donatedBy: donationData.donorId,
            createdAt: new Date(),
        };

        const newBookRef = await db.collection("books").add(newBook);

        // Update donation status
        await donationRef.update({
            status: "Approved",
            reviewedBy: req.user.id,
            reviewedAt: new Date(),
            matchedBookId: newBookRef.id,
            note: "New book added to the library.",
        });

        res.status(200).json({
            success: true,
            message: `Donation approved. "${donationData.title}" has been added as a new book to the library.`,
            data: { bookId: newBookRef.id, action: "created" },
            error: null,
        });

        await createInAppNotification({
            userId: donationData.donorId,
            type: "DONATION_APPROVED",
            title: "Donation Approved ✅",
            message: `Your donation of "${donationData.title}" was approved and added as a new book to the library!`,
            donationId: donationId,
            actionUrl: "/settings",
        });
    }
});

export const rejectDonation = catchAsyncErrors(async (req, res, next) => {
    const donationId = req.params.id;
    const donationRef = db.collection("donations").doc(donationId);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
        return next(new ErrorHandler("Donation request not found.", 404));
    }

    const donationData = donationDoc.data();

    if (donationData.status !== "Pending") {
        return next(new ErrorHandler(`This donation has already been ${donationData.status.toLowerCase()}.`, 400));
    }

    await donationRef.update({
        status: "Rejected",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
    });

    res.status(200).json({
        success: true,
        message: "Donation request has been rejected.",
        data: null,
        error: null,
    });

    await createInAppNotification({
        userId: donationData.donorId,
        type: "DONATION_REJECTED",
        title: "Donation Declined ❌",
        message: `Your donation of "${donationData.title}" was declined by an admin.`,
        donationId: donationId,
        actionUrl: "/settings",
    });
});
