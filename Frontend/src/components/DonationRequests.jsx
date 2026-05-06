import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDonations,
  approveDonation,
  rejectDonation,
  resetDonationSlice,
} from "../store/slices/donationSlice";
import { fetchAllBooks } from "../store/slices/bookSlice";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaGift, FaFilter } from "react-icons/fa";

const DonationRequests = () => {
  const dispatch = useDispatch();
  const { donations, loading, error, message } = useSelector((state) => state.donation);

  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllDonations());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetDonationSlice());
      dispatch(fetchAllBooks());
    }
    if (error) {
      toast.error(error);
      dispatch(resetDonationSlice());
    }
  }, [message, error, dispatch]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    await dispatch(approveDonation(id));
    setActionLoadingId(null);
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    await dispatch(rejectDonation(id));
    setActionLoadingId(null);
  };

  const getFilteredDonations = () => {
    switch (activeTab) {
      case "pending":
        return donations.filter((d) => d.status === "Pending");
      case "approved":
        return donations.filter((d) => d.status === "Approved");
      case "rejected":
        return donations.filter((d) => d.status === "Rejected");
      case "all":
      default:
        return donations;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700 border-amber-200",
      Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = dateValue._seconds
      ? new Date(dateValue._seconds * 1000)
      : new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredDonations = getFilteredDonations();
  const pendingCount = donations.filter((d) => d.status === "Pending").length;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-amber-500 rounded-full"></div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Book Donations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage book donation requests
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
            <span className="text-amber-700 font-black text-sm">
              {pendingCount} Pending
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-[#358a74] text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && filteredDonations.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-32 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#358a74]"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Loading donations...
          </p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <span className="text-6xl mb-4 block">🎁</span>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
            {activeTab === "pending"
              ? "No pending donation requests"
              : `No ${activeTab} donations found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDonations.map((donation) => (
            <div
              key={donation.id}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6 flex gap-5">
                <img
                  src={donation.image?.url || "https://via.placeholder.com/80x110"}
                  alt={donation.title}
                  className="w-20 h-28 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-black text-gray-800 truncate">
                      {donation.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex-shrink-0 ${getStatusBadge(
                        donation.status
                      )}`}
                    >
                      {donation.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 font-medium">
                    {donation.author}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {donation.genre} • {donation.edition}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#358a74] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {donation.donorName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">
                        {donation.donorName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                  </div>

                  {donation.note && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-500">📝 {donation.note}</p>
                    </div>
                  )}
                </div>
              </div>

              {donation.status === "Pending" && (
                <div className="border-t border-gray-50 px-6 py-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(donation.id)}
                    disabled={actionLoadingId === donation.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 border border-emerald-100 transition-all disabled:opacity-50"
                  >
                    <FaCheck size={12} />
                    {actionLoadingId === donation.id ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(donation.id)}
                    disabled={actionLoadingId === donation.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider hover:bg-red-100 border border-red-100 transition-all disabled:opacity-50"
                  >
                    <FaTimes size={12} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationRequests;
