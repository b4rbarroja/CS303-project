/**
 * BookCard (Enhanced with Design Tokens)
 * Now uses design tokens for consistent styling across web and mobile
 * Maintains all existing functionality with improved design system
 */

import React, { useCallback, useState } from "react";
import {
  FaBookOpen,
  FaPlusCircle,
  FaExclamationTriangle,
  FaClock,
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
import { 
  notifyWarning, 
  notifyInfo, 
  notifyError 
} from "../utils/toastNotificationManager";
import { 
  getBadgeClasses, 
  getButtonClasses,
  DESIGN_TOKENS 
} from "../utils/designTokens";
import { ImSpinner2 } from "react-icons/im";

const BookCardEnhanced = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── STATE ───
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ─── PROPS EXTRACTION & NORMALIZATION ───
  const bookId = extractBookId(props);
  const bookTitle = extractBookTitle(props);
  const bookImage = props.image?.url;
  const bookAuthor = props.author || "Unknown Author";
  const bookGenre = props.genre || "Uncategorized";
  const bookRating = props.rating || 0;
  const bookReviews = props.reviews || [];

  // Availability logic
  const availableCopies = Number(props.availableCopies);
  const hasExplicitStockValue = Number.isFinite(availableCopies);
  const isAvailable = hasExplicitStockValue
    ? availableCopies > 0
    : props.status === "Available";

  // ─── REDUX STATE ───
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userBorrowedBooks = [] } = useSelector((state) => state.borrow);

  // ─── FIND ACTIVE BORROW RECORD ───
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

      // Network check
      if (!navigator.onLine) {
        notifyError("Critical Failure: No internet connection detected.");
        return;
      }

      // Authentication check
      if (!isAuthenticated) {
        notifyInfo("Please login to borrow this book.");
        navigate("/login");
        return;
      }

      // Overdue block
      if (hasOverdueBooks) {
        notifyError("You are blocked from borrowing due to overdue books. Please return them immediately.");
        return;
      }

      // Availability check
      if (!isAvailable) {
        notifyWarning("This book is currently out of stock.");
        return;
      }

      // Already has active request
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

      // Prevent rapid double-submissions
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await dispatch(recordBorrowBook(bookId));

        if (!result.ok) {
          setIsSubmitting(false);
          return;
        }

        setTimeout(() => {
          setIsSubmitting(false);
        }, 1000);
      } catch (err) {
        console.error("[BookCard] Unexpected error:", err);
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

  // ─── DETERMINE STATUS & STYLING ───
  const getStatusBadgeInfo = () => {
    if (isAlreadyBorrowed) {
      return {
        status: 'borrowed',
        icon: FaClock,
        label: 'Borrowed',
        badgeClass: 'bg-indigo-50 border border-indigo-100 text-indigo-600',
        dotClass: 'bg-indigo-500',
        pulse: false,
      };
    }
    if (isPending) {
      return {
        status: 'pending',
        icon: FaExclamationTriangle,
        label: 'Pending Approval',
        badgeClass: getBadgeClasses('pending'),
        dotClass: DESIGN_TOKENS.COLORS.status.pending,
        pulse: true,
      };
    }
    if (isAvailable) {
      return {
        status: 'available',
        icon: FaPlusCircle,
        label: `${availableCopies}/${props.totalCopies || availableCopies} Available`,
        badgeClass: getBadgeClasses('available'),
        dotClass: DESIGN_TOKENS.COLORS.status.available,
        pulse: true,
      };
    }
    return {
      status: 'unavailable',
      icon: FaExclamationTriangle,
      label: 'Out of Stock',
      badgeClass: getBadgeClasses('unavailable'),
      dotClass: DESIGN_TOKENS.COLORS.status.unavailable,
      pulse: false,
    };
  };

  const statusInfo = getStatusBadgeInfo();

  // ─── RENDER ───
  return (
    <div
      className="bg-white p-6 rounded-3xl shadow-sm border transition-all duration-500 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 group relative"
      style={{ borderColor: DESIGN_TOKENS.COLORS.border.light }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book Cover Image */}
      <div
        className="w-full h-64 rounded-2xl mb-6 overflow-hidden flex items-center justify-center relative shadow-inner border transition-all"
        style={{
          backgroundColor: DESIGN_TOKENS.COLORS.background.secondary,
          borderColor: DESIGN_TOKENS.COLORS.border.light,
        }}
      >
        {bookImage ? (
          <img
            src={bookImage}
            alt={bookTitle}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        ) : (
          <FaBookOpen
            size={45}
            style={{ color: DESIGN_TOKENS.COLORS.neutral[200] }}
          />
        )}

        {/* Genre Badge */}
        <div
          className="absolute top-4 left-4 backdrop-blur-md text-xs px-3 py-1.5 rounded-xl font-bold uppercase tracking-wide shadow-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: DESIGN_TOKENS.COLORS.brand.primary,
          }}
        >
          {bookGenre}
        </div>

        {/* Rating Badge (if available) */}
        {bookRating > 0 && (
          <div
            className="absolute top-4 right-4 backdrop-blur-md text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: DESIGN_TOKENS.COLORS.status.warning,
            }}
          >
            ⭐ {bookRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Title & Author */}
      <div className="mb-4 w-full">
        <h3
          className="font-black text-sm mb-1 line-clamp-2 transition-colors tracking-tight"
          style={{ color: DESIGN_TOKENS.COLORS.text.primary }}
        >
          {bookTitle}
        </h3>
        <p
          className="text-xs font-bold uppercase tracking-wide opacity-60"
          style={{ color: DESIGN_TOKENS.COLORS.text.secondary }}
        >
          by {bookAuthor}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="w-full mb-4 flex gap-2 text-xs justify-center flex-wrap">
        {props.publicationYear && (
          <div
            className="px-2 py-1 rounded-md"
            style={{
              backgroundColor: DESIGN_TOKENS.COLORS.background.tertiary,
              color: DESIGN_TOKENS.COLORS.text.secondary,
            }}
          >
            📅 {props.publicationYear}
          </div>
        )}
        {props.isbn && (
          <div
            className="px-2 py-1 rounded-md"
            style={{
              backgroundColor: DESIGN_TOKENS.COLORS.background.tertiary,
              color: DESIGN_TOKENS.COLORS.text.secondary,
            }}
          >
            📖 ISBN
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div
        className={`w-full mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border justify-center`}
        style={{
          backgroundColor: statusInfo.badgeClass.includes('bg-') ? 
            statusInfo.badgeClass.split(' ')[0].replace('bg-', '') : 'transparent',
          borderColor: statusInfo.badgeClass.includes('border-') ?
            statusInfo.badgeClass.split(' ').find(c => c.startsWith('border-')) : DESIGN_TOKENS.COLORS.border.light,
        }}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            statusInfo.pulse ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: statusInfo.dotClass }}
        />
        <span
          className="text-xs font-black uppercase tracking-wider"
          style={{
            color: statusInfo.badgeClass.includes('text-emerald') ? DESIGN_TOKENS.COLORS.status.available :
                   statusInfo.badgeClass.includes('text-rose') ? DESIGN_TOKENS.COLORS.status.unavailable :
                   statusInfo.badgeClass.includes('text-amber') ? DESIGN_TOKENS.COLORS.status.pending :
                   statusInfo.badgeClass.includes('text-indigo') ? '#4f46e5' :
                   DESIGN_TOKENS.COLORS.status.warning
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleBorrowRequest}
        disabled={
          isSubmitting ||
          hasOverdueBooks ||
          (!isAvailable && !isPending && !isAlreadyBorrowed) ||
          isAlreadyBorrowed
        }
        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
          isSubmitting
            ? 'cursor-wait opacity-70'
            : hasOverdueBooks
            ? 'cursor-not-allowed opacity-50'
            : isAlreadyBorrowed
            ? 'cursor-not-allowed opacity-70'
            : isPending
            ? 'cursor-default opacity-70'
            : !isAvailable
            ? 'cursor-not-allowed opacity-30'
            : 'hover:shadow-xl'
        }`}
        style={{
          backgroundColor:
            isSubmitting || hasOverdueBooks || isAlreadyBorrowed || isPending || !isAvailable
              ? DESIGN_TOKENS.COLORS.neutral[200]
              : DESIGN_TOKENS.COLORS.brand.primary,
          color:
            isSubmitting || hasOverdueBooks || isAlreadyBorrowed || isPending || !isAvailable
              ? DESIGN_TOKENS.COLORS.text.tertiary
              : DESIGN_TOKENS.COLORS.text.onBrand,
        }}
      >
        {isSubmitting ? (
          <>
            <ImSpinner2 className="animate-spin" size={16} /> Requesting...
          </>
        ) : hasOverdueBooks ? (
          <>
            <FaExclamationTriangle size={14} /> Return Overdue Books
          </>
        ) : isAlreadyBorrowed ? (
          <>
            <FaClock size={14} /> Already Borrowed
          </>
        ) : isPending ? (
          <>
            <FaExclamationTriangle size={14} /> Pending Approval
          </>
        ) : !isAvailable ? (
          <>
            <FaExclamationTriangle size={14} /> Out of Stock
          </>
        ) : (
          <>
            <FaPlusCircle size={14} /> Borrow Book
          </>
        )}
      </button>

      {/* Description Preview */}
      {props.description && (
        <div className="mt-4 text-xs opacity-60 line-clamp-2">
          <p style={{ color: DESIGN_TOKENS.COLORS.text.secondary }}>
            {props.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookCardEnhanced;
