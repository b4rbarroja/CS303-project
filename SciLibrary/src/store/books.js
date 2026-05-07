import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

export const fetchAllBooks = createAsyncThunk("book/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const response = await API.get("/api/v1/book/getall"); 
        return response.data.data.books; 
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch books");
    }
});

export const addBook = createAsyncThunk("book/add", async (formData, { rejectWithValue }) => {
    try {
        const response = await API.post("/api/v1/book/add", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to add book");
    }
});

export const updateBook = createAsyncThunk("book/update", async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/v1/book/update/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to update book");
    }
});

export const deleteBook = createAsyncThunk("book/delete", async (id, { rejectWithValue }) => {
    try {
        const response = await API.delete(`/api/v1/book/delete/${id}`);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete book");
    }
});

export const rateBook = createAsyncThunk("book/rate", async ({ id, rating }, { rejectWithValue }) => {
    try {
        const response = await API.post(`/api/v1/book/${id}/rate`, { rating });
        return response.data.data; // returns { rating, ratingCount, userRating }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to rate book");
    }
});

export const fetchMyRating = createAsyncThunk("book/fetchMyRating", async (id, { rejectWithValue }) => {
    try {
        const response = await API.get(`/api/v1/book/${id}/myrating`);
        return { id, rating: response.data.data.rating };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch rating");
    }
});

const bookSlice = createSlice({
    name: "book",
    initialState: {
        books: [],
        loading: false,
        error: null,
        message: null,
    },
    reducers: {
        resetBookSlice: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(fetchAllBooks.pending, (state) => { state.loading = true; })
            .addCase(fetchAllBooks.fulfilled, (state, action) => {
                state.loading = false;
                state.books = action.payload || []; 
            })
            .addCase(fetchAllBooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(addBook.pending, (state) => { state.loading = true; })
            .addCase(addBook.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(addBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(updateBook.pending, (state) => { state.loading = true; })
            .addCase(updateBook.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(updateBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(deleteBook.pending, (state) => { state.loading = true; })
            .addCase(deleteBook.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
            })
            .addCase(deleteBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // rateBook
            .addCase(rateBook.fulfilled, (state, action) => {
                const index = state.books.findIndex((b) => b.id === action.meta.arg.id || b._id === action.meta.arg.id);
                if (index !== -1) {
                    state.books[index].rating = action.payload.rating;
                    state.books[index].ratingCount = action.payload.ratingCount;
                }
            });
    },
});

export const { resetBookSlice } = bookSlice.actions;
export default bookSlice.reducer;
