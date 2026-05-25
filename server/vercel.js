import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import { app } from "./app.js";
import { connectDB } from "./database/db.js";
import { loadLibraryKnowledgeBase } from "./utils/aiCache.js";
import cloudinary from "cloudinary";

connectDB();
loadLibraryKnowledgeBase();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default app;
