import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const getErrorMsg = (error) =>
  error?.response?.data?.message || error.message || "Something went wrong";

const bookSlice = createSlice({
  name: "book",
  initialState: {
    books: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    // Fetch all books
    fetchBooksRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchBooksSuccess(state, action) {
      state.loading = false;
      state.books = action.payload;
    },
    fetchBooksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add book
    addBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    addBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Update book
    updateBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    updateBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload;
    },
    updateBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete book
    deleteBookRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    deleteBookSuccess(state, action) {
      state.loading = false;
      state.message = action.payload.message;
      state.books = state.books.filter(
        (book) => book._id !== action.payload.id
      );
    },
    deleteBookFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updateBookStatus(state, action) {
      const { id, newStatus } = action.payload;
      const bookIndex = state.books.findIndex(
        (b) => b._id === id || b.id === id
      );
      if (bookIndex !== -1) {
        state.books[bookIndex].status = newStatus;
      }
    },

    // Optimistically update rating in the books array after a successful submission
    updateBookRating(state, action) {
      const { bookId, rating, ratingCount } = action.payload;
      const idx = state.books.findIndex((b) => (b._id || b.id) === bookId);
      if (idx !== -1) {
        state.books[idx].rating = rating;
        state.books[idx].ratingCount = ratingCount;
      }
    },

    resetBookSlice(state) {
      state.error = null;
      state.message = null;
      state.loading = false;
    },
  },
});

// ── Async Actions ──────────────────────────────────────────────────────────────

export const fetchAllBooks = () => (dispatch) => {
  dispatch(bookSlice.actions.fetchBooksRequest());
  api
    .get("/api/v1/book/getall")
    .then((res) =>
      dispatch(bookSlice.actions.fetchBooksSuccess(res.data.data.books))
    )
    .catch((error) =>
      dispatch(bookSlice.actions.fetchBooksFailed(getErrorMsg(error)))
    );
};

export const addBook = (formData) => (dispatch) => {
  dispatch(bookSlice.actions.addBookRequest());
  api
    .post("/api/v1/book/add", formData, {
      headers: { "Content-Type": undefined },
    })
    .then((res) => {
      dispatch(bookSlice.actions.addBookSuccess(res.data.message));
      dispatch(fetchAllBooks()); 
    })
    .catch((error) =>
      dispatch(bookSlice.actions.addBookFailed(getErrorMsg(error)))
    );
};

export const updateBook = (id, formData) => (dispatch) => {
  dispatch(bookSlice.actions.updateBookRequest());
  api
    .put(`/api/v1/book/update/${id}`, formData, {
      headers: { "Content-Type": undefined },
    })
    .then((res) => {
      dispatch(bookSlice.actions.updateBookSuccess(res.data.message));
      dispatch(fetchAllBooks()); 
    })
    .catch((error) =>
      dispatch(bookSlice.actions.updateBookFailed(getErrorMsg(error)))
    );
};

export const deleteBook = (id) => (dispatch) => {
  dispatch(bookSlice.actions.deleteBookRequest());
  api
    .delete(`/api/v1/book/delete/${id}`)
    .then((res) =>
      dispatch(bookSlice.actions.deleteBookSuccess({ message: res.data.message, id }))
    )
    .catch((error) =>
      dispatch(bookSlice.actions.deleteBookFailed(getErrorMsg(error)))
    );
};

/**
 * rateBook — POST /api/v1/book/:id/rate
 * Returns { ok, rating, ratingCount, userRating } on success
 *         { ok: false, error } on failure
 */
export const rateBook = ({ bookId, rating }) => async (dispatch) => {
  try {
    const res = await api.post(`/api/v1/book/${bookId}/rate`, { rating });
    const { rating: newAvg, ratingCount, userRating } = res.data.data;

    // Update the in-memory books list immediately (no full refetch needed)
    dispatch(bookSlice.actions.updateBookRating({ bookId, rating: newAvg, ratingCount }));

    return { ok: true, rating: newAvg, ratingCount, userRating };
  } catch (error) {
    return { ok: false, error: getErrorMsg(error) };
  }
};

/**
 * fetchMyRating — GET /api/v1/book/:id/myrating
 * Returns { ok, userRating, rating, ratingCount } on success
 */
export const fetchMyRating = (bookId) => async () => {
  try {
    const res = await api.get(`/api/v1/book/${bookId}/myrating`);
    const { userRating, rating, ratingCount } = res.data.data;
    return { ok: true, userRating, rating, ratingCount };
  } catch {
    return { ok: false, userRating: 0, rating: 0, ratingCount: 0 };
  }
};

export const { updateBookStatus, updateBookRating } = bookSlice.actions;

export const resetBookSlice = () => (dispatch) => {
  dispatch(bookSlice.actions.resetBookSlice());
};

export default bookSlice.reducer;