import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const getErrorMsg = (error) =>
  error?.response?.data?.message || error.message || "Something went wrong";

const donationSlice = createSlice({
  name: "donation",
  initialState: {
    donations: [],
    myDonations: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    submitDonationRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    submitDonationSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    submitDonationFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchMyDonationsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMyDonationsSuccess(state, action) {
      state.loading = false;
      state.myDonations = action.payload;
    },
    fetchMyDonationsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchAllDonationsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllDonationsSuccess(state, action) {
      state.loading = false;
      state.donations = action.payload;
    },
    fetchAllDonationsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    approveDonationRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    approveDonationSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    approveDonationFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    rejectDonationRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    rejectDonationSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    rejectDonationFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    resetDonationSlice(state) {
      state.error = null;
      state.message = null;
      state.loading = false;
    },
  },
});

// Async Actions

export const submitDonation = (formData) => (dispatch) => {
  dispatch(donationSlice.actions.submitDonationRequest());
  api
    .post("/api/v1/donation/submit", formData, {
      headers: { "Content-Type": undefined },
    })
    .then((res) => {
      dispatch(donationSlice.actions.submitDonationSuccess(res.data.message));
    })
    .catch((error) =>
      dispatch(donationSlice.actions.submitDonationFailed(getErrorMsg(error)))
    );
};

export const fetchMyDonations = () => (dispatch) => {
  dispatch(donationSlice.actions.fetchMyDonationsRequest());
  api
    .get("/api/v1/donation/my")
    .then((res) =>
      dispatch(donationSlice.actions.fetchMyDonationsSuccess(res.data.data.donations))
    )
    .catch((error) =>
      dispatch(donationSlice.actions.fetchMyDonationsFailed(getErrorMsg(error)))
    );
};

export const fetchAllDonations = () => (dispatch) => {
  dispatch(donationSlice.actions.fetchAllDonationsRequest());
  api
    .get("/api/v1/donation/getall")
    .then((res) =>
      dispatch(donationSlice.actions.fetchAllDonationsSuccess(res.data.data.donations))
    )
    .catch((error) =>
      dispatch(donationSlice.actions.fetchAllDonationsFailed(getErrorMsg(error)))
    );
};

export const approveDonation = (id) => (dispatch) => {
  dispatch(donationSlice.actions.approveDonationRequest());
  api
    .put(`/api/v1/donation/approve/${id}`)
    .then((res) => {
      dispatch(donationSlice.actions.approveDonationSuccess(res.data.message));
      dispatch(fetchAllDonations());
    })
    .catch((error) =>
      dispatch(donationSlice.actions.approveDonationFailed(getErrorMsg(error)))
    );
};

export const rejectDonation = (id) => (dispatch) => {
  dispatch(donationSlice.actions.rejectDonationRequest());
  api
    .put(`/api/v1/donation/reject/${id}`)
    .then((res) => {
      dispatch(donationSlice.actions.rejectDonationSuccess(res.data.message));
      dispatch(fetchAllDonations());
    })
    .catch((error) =>
      dispatch(donationSlice.actions.rejectDonationFailed(getErrorMsg(error)))
    );
};

export const resetDonationSlice = () => (dispatch) => {
  dispatch(donationSlice.actions.resetDonationSlice());
};

export default donationSlice.reducer;
