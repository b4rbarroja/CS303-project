import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitDonation, resetDonationSlice } from "../store/slices/donationSlice";
import { toggleDonateBookPopup } from "../store/slices/popUpSlice";
import { FaTimes, FaCloudUploadAlt, FaGift } from "react-icons/fa";
import { toast } from "react-toastify";

const DonateBookPopup = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.donation);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [edition, setEdition] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (submitted && !loading) {
      if (message) {
        toast.success(message);
        dispatch(resetDonationSlice());
        dispatch(toggleDonateBookPopup());
      }
      if (error) {
        toast.error(error);
        dispatch(resetDonationSlice());
      }
      setSubmitted(false);
    }
  }, [submitted, loading, message, error, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!image) {
      setLocalError("Please upload a book cover image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre);
    formData.append("edition", edition);
    formData.append("image", image);

    dispatch(submitDonation(formData));
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dispatch(toggleDonateBookPopup())}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-50"
        >
          <FaTimes size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <FaGift size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Donate a Book</h2>
            <p className="text-xs text-gray-500">
              Share a book with the library community.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Book Cover
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById("donate-image-input").click()}
            >
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-44 object-cover rounded-xl mb-3"
                  />
                  <p className="text-xs text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaCloudUploadAlt size={36} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click to upload book cover</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                id="donate-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-amber-300/30 focus:border-amber-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-amber-300/30 focus:border-amber-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Science, Fiction, History"
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-amber-300/30 focus:border-amber-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Edition
            </label>
            <input
              type="text"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="e.g. 1st, 2nd, 3rd"
              required
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-amber-300/30 focus:border-amber-400 outline-none transition-all"
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl px-4 py-3">
            📋 Your donation will be reviewed by a library admin. If approved, the book will be added to the catalog.
          </div>

          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {localError || error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? "Submitting..." : "🎁 Donate Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonateBookPopup;
