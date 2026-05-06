import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const submitDonation = createAsyncThunk("donation/submit", async (formData, { rejectWithValue }) => {
    try {
        const response = await API.post("/api/v1/donation/submit", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to submit donation");
    }
});

export const fetchMyDonations = createAsyncThunk("donation/fetchMy", async (_, { rejectWithValue }) => {
    try {
        const response = await API.get("/api/v1/donation/my");
        return response.data.data.donations;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch your donations");
    }
});

export const fetchAllDonations = createAsyncThunk("donation/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const response = await API.get("/api/v1/donation/getall");
        return response.data.data.donations;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch donations");
    }
});

export const approveDonation = createAsyncThunk("donation/approve", async (id, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/v1/donation/approve/${id}`);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to approve donation");
    }
});

export const rejectDonation = createAsyncThunk("donation/reject", async (id, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/v1/donation/reject/${id}`);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to reject donation");
    }
});

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
        resetDonationSlice: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitDonation.pending, (state) => { state.loading = true; state.error = null; state.message = null; })
            .addCase(submitDonation.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(submitDonation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchMyDonations.pending, (state) => { state.loading = true; })
            .addCase(fetchMyDonations.fulfilled, (state, action) => {
                state.loading = false;
                state.myDonations = action.payload || [];
            })
            .addCase(fetchMyDonations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllDonations.pending, (state) => { state.loading = true; })
            .addCase(fetchAllDonations.fulfilled, (state, action) => {
                state.loading = false;
                state.donations = action.payload || [];
            })
            .addCase(fetchAllDonations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(approveDonation.pending, (state) => { state.loading = true; state.error = null; state.message = null; })
            .addCase(approveDonation.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(approveDonation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(rejectDonation.pending, (state) => { state.loading = true; state.error = null; state.message = null; })
            .addCase(rejectDonation.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(rejectDonation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetDonationSlice } = donationSlice.actions;
export default donationSlice.reducer;
