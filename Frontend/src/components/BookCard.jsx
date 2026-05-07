
import React, { useCallback, useState, useEffect } from "react";
import {
  FaBookOpen,
  FaPlusCircle,
  FaExclamationTriangle,
  FaClock,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { recordBorrowBook } from "../store/slices/borrowSlice";
import {
  extractBookId,
  extractBookTitle,
  isBorrowBorrowedOrOverdue,
  isBorrowPending,
  normalizeBorrowRecord,
} from "../utils/dataShapeNormalizer";
import { notifyWarning, notifyInfo, notifyError } from "../utils/toastNotificationManager";
import { ImSpinner2 } from "react-icons/im";
import { fetchMyRating } from "../store/slices/bookSlice";
import RateBookPopup from "../popups/RateBookPopup";

import { db } from "../utils/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const BookCard = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── STATE ───
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveUser, setLiveUser] = useState(null);
  const [showRatePopup, setShowRatePopup] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [liveRating, setLiveRating] = useState(null);     // null = use props
  const [liveRatingCount, setLiveRatingCount] = useState(null);

  // ─── PROPS EXTRACTION & NORMALIZATION ───
  // Extract ID: support both _id and id formats
  const bookId = extractBookId(props);
  const bookTitle = extractBookTitle(props);
  const bookImage = props.image?.url;
  const bookAuthor = props.author || "Unknown Author";
  const bookGenre = props.genre || "Uncategorized";
  const bookEdition = props.edition || "";

  // Availability: prefer explicit availableCopies count over status string
  const availableCopies = Number(props.availableCopies);
  const hasExplicitStockValue = Number.isFinite(availableCopies);
  const isAvailable = hasExplicitStockValue
    ? availableCopies > 0
    : props.status === "Available";

  // Rating: use live value if we have it (after a rating submission), else fall back to prop
  const displayRating = liveRating !== null
    ? liveRating
    : (Number.isFinite(Number(props.rating)) ? Math.min(5, Math.max(0, Number(props.rating))) : 0);
  const displayRatingCount = liveRatingCount !== null ? liveRatingCount : (props.ratingCount || 0);

  // ─── REDUX STATE ───
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { userBorrowedBooks = [] } = useSelector(
    (state) => state.borrow
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const unsub = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      if (docSnap.exists()) {
        setLiveUser(docSnap.data());
      }
    });
    return () => unsub();
  }, [isAuthenticated, user?.id]);

  // Load user's existing rating for this book when authenticated
  useEffect(() => {
    if (!isAuthenticated || !bookId) return;
    dispatch(fetchMyRating(bookId)).then((res) => {
      if (res?.ok) setMyRating(res.userRating || 0);
    });
  }, [isAuthenticated, bookId, dispatch]);

  // ─── FIND ACTIVE BORROW RECORD FOR THIS BOOK ───
  // Search across different payload shapes
  const findUserBorrowRecord = useCallback(() => {
    if (!bookId || !userBorrowedBooks.length || !isAuthenticated) return null;

    return userBorrowedBooks.find((record) => {
      const normalized = normalizeBorrowRecord(record);
      const st = (normalized.status || "").toLowerCase();
      return normalized.bookId === bookId && (st === 'pending' || st === 'borrowed' || st === 'overdue');
    });
  }, [bookId, userBorrowedBooks, isAuthenticated]);

  const userBorrowRecord = findUserBorrowRecord();
  const isPending = isAuthenticated && isBorrowPending(userBorrowRecord);
  const isAlreadyBorrowed = isAuthenticated && isBorrowBorrowedOrOverdue(userBorrowRecord);

  const hasOverdueBooks = isAuthenticated && userBorrowedBooks.some(record => {
    const normalized = normalizeBorrowRecord(record);
    return (normalized.status || "").toLowerCase() === "overdue";
  });

  // ─── EVENT HANDLERS ───
  const handleBorrowRequest = useCallback(
    async (e) => {
      e.stopPropagation();
      //  Network Death Shield
      if (!navigator.onLine) {
        notifyError("Critical Failure: No internet connection detected.");
        return;
      }
      //  Authentication check
      if (!isAuthenticated) {
        notifyInfo("Please login to borrow this book.");
        navigate("/login");
        return;
      }

      //  Overdue Block
      if (hasOverdueBooks) {
        notifyError("You are blocked from borrowing due to overdue books. Please return them immediately.");
        return;
      }

      // Guard 2: Availability check
      if (!isAvailable) {
        notifyWarning("This book is currently out of stock.");
        return;
      }

      //  Already has active request
      if (isPending || isAlreadyBorrowed) {
        notifyWarning(
          isPending
            ? "You already have a pending request for this book."
            : "You already have this book borrowed."
        );
        return;
      }

      // Missing book ID 
      if (!bookId) {
        notifyWarning(
          "Book record is incomplete. Please refresh and try again."
        );
        return;
      }

      //  Prevent rapid double-submissions
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      try {
        // Dispatch borrow request
        const result = await dispatch(recordBorrowBook(bookId));

        // Handle result 
        if (!result.ok) {
          // Error already shown by thunk
          setIsSubmitting(false);
          return;
        }

        // Success reset submit state after brief delay
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);
      } catch (err) {
        console.error("[BorrowCard] Unexpected error:", err);
        setIsSubmitting(false);
      }
    },
    [
      isAuthenticated,
      isAvailable,
      isPending,
      isAlreadyBorrowed,
      hasOverdueBooks,
      bookId,
      isSubmitting,
      navigate,
      dispatch,
    ]
  );

  // ─── RENDER ───
  return (
    <div className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
      {/* Book Cover Image */}
      <div className="w-full h-64 bg-slate-50 rounded-[2.5rem] mb-6 overflow-hidden flex items-center justify-center relative shadow-inner border border-slate-100">
        {bookImage ? (
          <img
            src={bookImage}
            alt={bookTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <FaBookOpen size={45} className="text-slate-200" />
        )}

        {/* Genre Badge */}
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[9px] px-3 py-1.5 rounded-xl font-black text-[#358a74] uppercase tracking-widest shadow-sm">
          {bookGenre}
        </span>
      </div>

      {/* Title & Author */}
      <div className="mb-4 w-full">
        <h3 className="font-black text-slate-800 text-sm mb-1 line-clamp-2 group-hover:text-[#358a74] transition-colors tracking-tight">
          {bookTitle}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">
          by {bookAuthor}
        </p>
        {bookEdition && (
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
            {bookEdition} Edition
          </p>
        )}
      </div>

      {/* Rating — display average + count chip */}
      <div className="w-full mb-3 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            i < Math.round(displayRating) ? (
              <FaStar key={i} size={12} className="text-[#358a74]" />
            ) : (
              <FaRegStar key={i} size={12} className="text-slate-300" />
            )
          ))}
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          {displayRating > 0
            ? `${displayRating.toFixed ? displayRating.toFixed(1) : displayRating}/5`
            : "Unrated"}
          {displayRatingCount > 0 && (
            <span className="ml-1 text-slate-300">({displayRatingCount})</span>
          )}
        </span>
      </div>

      {/* Status Badge */}
      <div className="w-full mb-6">
        <div
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-500 ${
            isAlreadyBorrowed
              ? "bg-indigo-50 border-indigo-100 text-indigo-600"
              : isPending
              ? "bg-amber-50 border-amber-100 text-amber-600"
              : isAvailable
              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
              : "bg-rose-50 border-rose-100 text-rose-500"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isPending || (isAvailable && !isAlreadyBorrowed) ? "animate-pulse" : ""
            } ${
              isAlreadyBorrowed
                ? "bg-indigo-500"
                : isPending
                ? "bg-amber-500"
                : isAvailable
                ? "bg-emerald-500"
                : "bg-rose-500"
            }`}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {isAlreadyBorrowed
              ? "Borrowed"
              : isPending
              ? "Pending Approval"
              : isAvailable
              ? `${availableCopies}/${props.totalCopies || availableCopies} Available`
              : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Interactive Rating — popup trigger button */}
      {isAuthenticated && (
        <div className="w-full mb-4">
          <button
            id={`rate-book-btn-${bookId}`}
            onClick={(e) => { e.stopPropagation(); setShowRatePopup(true); }}
            className="w-full py-2.5 rounded-2xl border border-dashed border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-[#358a74] hover:text-[#358a74] hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <FaStar size={11} />
            {myRating > 0 ? `Your rating: ${myRating}/5 · Edit` : "Rate this book"}
          </button>
        </div>
      )}

      {/* Rating Popup */}
      {showRatePopup && (
        <RateBookPopup
          book={{ ...props, id: bookId }}
          initialUserRating={myRating}
          onClose={() => setShowRatePopup(false)}
        />
      )}

      {/* Action Button */}
      <button
        onClick={handleBorrowRequest}
        disabled={isSubmitting || hasOverdueBooks || (!isAvailable && !isPending && !isAlreadyBorrowed) || isAlreadyBorrowed}
        className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95
          ${
            isSubmitting
              ? "bg-slate-100 text-slate-400 cursor-wait"
              : hasOverdueBooks
              ? "bg-rose-100 text-rose-700 cursor-not-allowed"
              : isAlreadyBorrowed
              ? "bg-indigo-100 text-indigo-600 cursor-not-allowed"
              : isPending
              ? "bg-amber-100 text-amber-600 cursor-default"
              : !isAvailable
              ? "bg-slate-50 text-slate-300 shadow-none cursor-not-allowed"
              : "bg-[#358a74] text-white hover:bg-slate-900 shadow-emerald-900/10"
          }`}
      >
        {isSubmitting ? (
          <>
            <ImSpinner2 className="animate-spin" size={16} /> Requesting...
          </>
        ) : hasOverdueBooks ? (
          <>
            <FaExclamationTriangle size={12} /> Blocked - Return Overdue
          </>
        ) : isAlreadyBorrowed ? (
          <>
            <FaBookOpen size={12} /> Borrowed
          </>
        ) : isPending ? (
          <>
            <FaClock size={12} /> Pending
          </>
        ) : !isAvailable ? (
          <>
            <FaExclamationTriangle size={12} /> Out of Stock
          </>
        ) : (
          <>
            Borrow Asset <FaPlusCircle size={14} />
          </>
        )}
      </button>
    </div>
  );
};

export default BookCard;
