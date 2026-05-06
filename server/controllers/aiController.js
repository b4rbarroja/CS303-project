import Groq from "groq-sdk";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { getLibraryKnowledgeBase } from "../utils/aiCache.js";
import { db } from "../database/db.js";
import { FieldValue } from "firebase-admin/firestore";

// ── Groq client (lazy-initialized after dotenv loads) ──
let groq = null;
const getGroq = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in config.env");
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

// ── Tavily web search ──
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

async function tavilySearch(query) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      max_results: 3,
      search_depth: "basic"
    })
  });
  const data = await res.json();
  if (!data || !data.results || !Array.isArray(data.results)) {
    console.warn("[Tavily] No results returned:", data);
    return "";
  }
  return data.results.map(r => `${r.title}: ${r.content}`).join("\n");
}

// ── Firestore-backed daily quota limit──
const DAILY_LIMIT = 950;

const checkDailyQuota = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const docRef = db.collection("system_config").doc("gemini_quota");
  const doc = await docRef.get();

  if (!doc.exists || doc.data().date !== today) {
    await docRef.set({ date: today, count: 1 });
    return true;
  }

  if (doc.data().count >= DAILY_LIMIT) {
    return false;
  }

  await docRef.update({ count: FieldValue.increment(1) });
  return true;
};

const MAX_HISTORY = 6; // Keep last 6 messages to save tokens

/**
 * POST /api/v1/ai/chat
 * Body: { userMessage: string, history?: Array<{role, content}> }
 *
 * Uses Groq (Llama 3.3 70B) with the cached library catalog injected
 * as a system message. History is truncated to the last 6 messages.
 * Tavily web search is triggered for queries outside the catalog.
 */
export const chatWithAI = catchAsyncErrors(async (req, res, next) => {
  // Daily quota limiter
  if (!(await checkDailyQuota())) {
    return res.status(503).json({
      success: false,
      message: "AI service daily limit reached. Please try again tomorrow.",
      data: null,
      error: "Daily quota exceeded",
    });
  }

  const { userMessage, history } = req.body;

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return next(new ErrorHandler("Please provide a message.", 400));
  }

  const catalog = getLibraryKnowledgeBase();

  // Truncate history to last N messages to save tokens
  const trimmedHistory = (Array.isArray(history) ? history.slice(-MAX_HISTORY) : [])
    .map(msg => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: Array.isArray(msg.parts) ? msg.parts[0]?.text || "" : msg.content
    }));

  const systemContent = `You are a library assistant. You have access to this catalog: ${catalog}

Rules:
- If the book/topic IS in the catalog → answer from catalog only
- If NOT in catalog → you will receive web search results to answer from
- For book comparisons → use catalog first, then web results for outside books
- For latest/newest books in a field → always use web results
- For book summaries/reviews → use web results
- For older editions vs newer → use web results
- For technical questions related to a book topic → answer from your knowledge
- Always be concise, max 3 sentences`;

  // Determine if web search is needed
  const needsSearch = /not in catalog|recommend|latest|newest|best books|summary|review|compare|edition|where to (buy|find|get)/i.test(userMessage);

  let searchContext = "";
  if (needsSearch) {
    try {
      searchContext = await tavilySearch(userMessage);
    } catch (err) {
      console.warn("[Tavily] Search failed:", err.message);
      searchContext = "";
    }
  }

  const messagesPayload = [
    { role: "system", content: systemContent },
    ...trimmedHistory,
    {
      role: "user",
      content: needsSearch
        ? `${userMessage}\n\nWeb search results:\n${searchContext}`
        : userMessage.trim()
    }
  ];

  const result = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messagesPayload,
    max_tokens: 300,
  });
  const response = result.choices[0].message.content;

  res.status(200).json({
    success: true,
    message: "AI response generated.",
    data: { response },
    error: null,
  });
});
