import { db } from "../database/db.js";

/**
 * Global in-memory cache for the library book catalog.
 * Loaded ONCE at server startup — zero Firestore reads per chat request.
 */
let libraryKnowledgeBase = "";

/**
 * Fetches all books from Firestore and builds a concise catalog string.
 * Format: "Title by Author [Genre, Edition]" separated by " | "
 */
export const loadLibraryKnowledgeBase = async () => {
  try {
    const snapshot = await db.collection("books").get();

    if (snapshot.empty) {
      libraryKnowledgeBase = "No books in catalog.";
      console.log("  ⚠  Library knowledge base: catalog is empty.");
      return;
    }

    const entries = [];
    snapshot.forEach((doc) => {
      const { title, author, genre, edition } = doc.data();
      if (title) {
        entries.push(
          `${title} by ${author || "Unknown"} [${genre || "General"}, ${edition || "N/A"}]`
        );
      }
    });

    libraryKnowledgeBase = entries.join(" | ");
    console.log(`  ✓  Library knowledge base loaded: ${entries.length} books cached.`);
  } catch (error) {
    console.error("  ✗  Failed to load library knowledge base:", error.message);
    libraryKnowledgeBase = "Catalog temporarily unavailable.";
  }
};

export const getLibraryKnowledgeBase = () => libraryKnowledgeBase;
