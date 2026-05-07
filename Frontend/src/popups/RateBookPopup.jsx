import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaStar, FaRegStar } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useDispatch } from "react-redux";
import { rateBook, fetchMyRating } from "../store/slices/bookSlice";
import { notifySuccess, notifyError } from "../utils/toastNotificationManager";

/**
 * RateBookPopup
 * A focused modal that lets a user pick 1-5 stars and confirm their rating.
 * Props:
 *   book        – the book object (must have .id or ._id, .title, .rating, .ratingCount)
 *   onClose     – called when the popup should be dismissed
 *   initialUserRating – the user's previously submitted rating (0 = none)
 */
const RateBookPopup = ({ book, onClose, initialUserRating = 0 }) => {
  const dispatch = useDispatch();

  const bookId = book?.id || book?._id;
  const bookTitle = book?.title || "This Book";
  const bookImage = book?.image?.url;
  const currentAvg = Number(book?.rating) || 0;
  const ratingCount = Number(book?.ratingCount) || 0;

  // ── State ──────────────────────────────────────────────────────────────────
  const [hovered, setHovered]     = useState(0);       // star index being hovered
  const [selected, setSelected]   = useState(initialUserRating); // confirmed selection
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]  = useState(false);
  const [liveAvg, setLiveAvg]      = useState(currentAvg);
  const [liveCount, setLiveCount]  = useState(ratingCount);

  // Sync if prop changes (e.g. user navigated to another book)
  useEffect(() => {
    setSelected(initialUserRating);
  }, [initialUserRating, bookId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const displayStar = hovered || selected; // which star index to fill up to

  const starLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleConfirm = useCallback(async () => {
    if (!selected || submitting) return;

    setSubmitting(true);
    try {
      const result = await dispatch(rateBook({ bookId, rating: selected }));

      if (result?.ok) {
        setLiveAvg(result.rating ?? liveAvg);
        setLiveCount(result.ratingCount ?? liveCount);
        setSubmitted(true);
        notifySuccess(`You rated "${bookTitle}" ${selected}/5 ⭐`);

        // Auto-close after brief celebration pause
        setTimeout(() => onClose(), 1800);
      } else {
        notifyError(result?.error || "Could not submit rating. Please try again.");
        setSubmitting(false);
      }
    } catch (err) {
      notifyError("Unexpected error. Please try again.");
      setSubmitting(false);
    }
  }, [selected, submitting, bookId, dispatch, bookTitle, liveAvg, liveCount, onClose]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!book) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(5, 30, 24, 0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Rate this book"
    >
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm relative overflow-hidden"
        style={{ animation: "slideUpFade 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Book Cover Banner ─────────────────────────────────────────── */}
        <div className="w-full h-40 relative flex items-center justify-center bg-emerald-50">
          {bookImage ? (
            <img src={bookImage} alt={bookTitle} className="w-auto h-full max-w-full object-contain p-4 z-10" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl select-none z-10">
              📚
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)" }} />
        </div>

        {/* ── Close Button ──────────────────────────────────────────────── */}
        <button
          id="rate-book-popup-close"
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-500 hover:text-rose-500 transition-all shadow-sm focus:outline-none"
        >
          <FaTimes size={14} />
        </button>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="px-8 pb-8 -mt-2 relative z-20 text-center space-y-5 bg-white">
          {/* Title */}
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight line-clamp-2">
              {bookTitle}
            </h2>
            {/* Current average chip */}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {liveCount > 0
                ? `⭐ ${liveAvg.toFixed(1)} avg · ${liveCount} rating${liveCount !== 1 ? "s" : ""}`
                : "No ratings yet — be the first!"}
            </p>
          </div>

          {submitted ? (
            /* ── Success State ── */
            <div className="py-4 space-y-2 animate-fadeIn">
              <p className="text-4xl">🎉</p>
              <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">
                Rating Submitted!
              </p>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <FaStar
                    key={i}
                    size={22}
                    className={i < selected ? "text-[#358a74]" : "text-slate-200"}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">{selected}/5 — {starLabel[selected]}</p>
            </div>
          ) : (
            <>
              {/* ── Star Selector ── */}
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  {initialUserRating > 0 ? "Update your rating" : "How would you rate this book?"}
                </p>

                <div className="flex justify-center gap-2 py-2" id="rate-book-stars">
                  {Array.from({ length: 5 }, (_, i) => {
                    const starNum = i + 1;
                    const filled = starNum <= displayStar;
                    return (
                      <button
                        key={i}
                        id={`rate-star-${starNum}`}
                        onMouseEnter={() => setHovered(starNum)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setSelected(starNum)}
                        className="transition-all duration-150 hover:scale-125 active:scale-95 focus:outline-none"
                        aria-label={`Rate ${starNum} star${starNum !== 1 ? "s" : ""}`}
                      >
                        {filled ? (
                          <FaStar size={36} className="text-[#358a74] drop-shadow-sm" />
                        ) : (
                          <FaRegStar size={36} className="text-slate-300 hover:text-[#358a74]/50" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Contextual label */}
                <p
                  className="text-xs font-bold uppercase tracking-widest transition-all"
                  style={{ color: displayStar ? "#358a74" : "#cbd5e1", minHeight: "1.2em" }}
                >
                  {displayStar ? starLabel[displayStar] : "Select a rating"}
                </p>
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex gap-3 pt-1">
                <button
                  id="rate-book-cancel"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  id="rate-book-confirm"
                  onClick={handleConfirm}
                  disabled={!selected || submitting}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg
                    ${selected && !submitting
                      ? "bg-[#358a74] text-white hover:bg-slate-900 shadow-emerald-900/15"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                >
                  {submitting ? (
                    <><ImSpinner2 className="animate-spin" size={14} /> Saving…</>
                  ) : (
                    initialUserRating > 0 ? "Update Rating" : "Confirm Rating"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out; }
      `}</style>
    </div>,
    document.body
  );
};

export default RateBookPopup;
