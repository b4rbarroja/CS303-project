import express from "express";
import { getAllBooks, createBook, updateBook, deleteBook, rateBook, getMyRating } from "../controllers/bookController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Public: anyone (including guests) can view books
router.get("/getall", getAllBooks);

//  Admin and Super Admin can manage books
router.post("/add", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), createBook);
router.put("/update/:id", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), updateBook);
router.delete("/delete/:id", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), deleteBook);

// Authenticated users: submit or update a book rating
router.post("/:id/rate", isAuthenticatedUser, rateBook);

// Authenticated users: fetch their own rating for a specific book
router.get("/:id/myrating", isAuthenticatedUser, getMyRating);

export default router;

