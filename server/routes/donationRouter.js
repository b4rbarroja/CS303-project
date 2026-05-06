import express from "express";
import {
    submitDonation,
    getMyDonations,
    getAllDonations,
    approveDonation,
    rejectDonation,
} from "../controllers/donationController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// User routes
router.post("/submit", isAuthenticatedUser, authorizeRoles("User"), submitDonation);
router.get("/my", isAuthenticatedUser, authorizeRoles("User"), getMyDonations);

// Admin routes
router.get("/getall", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), getAllDonations);
router.put("/approve/:id", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), approveDonation);
router.put("/reject/:id", isAuthenticatedUser, authorizeRoles("Admin", "Super Admin"), rejectDonation);

export default router;
