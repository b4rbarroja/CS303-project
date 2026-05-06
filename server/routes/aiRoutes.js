import express from "express";
import rateLimit from "express-rate-limit";
import { chatWithAI } from "../controllers/aiController.js";

const aiRouter = express.Router();

// Per-user rate limit: 5 requests per minute
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many AI requests. Please wait a minute before trying again.",
      data: null,
      error: "Rate limit exceeded",
    });
  },
});

// POST /api/v1/ai/chat — AI Librarian chat endpoint
aiRouter.post("/chat", aiRateLimiter, chatWithAI);

export default aiRouter;
