// server.js — YouTube Proxy with multi-key failover & caching

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Allow requests from your frontend
app.use(cors({ origin: "*" }));

// ------------- CONFIG -------------
const keys = (process.env.YOUTUBE_API_KEYS || "")
  .split(",")
  .map(k => k.trim())
  .filter(Boolean);

if (keys.length === 0) {
  console.error("❌ No YouTube API keys found. Set YOUTUBE_API_KEYS in Render Environment.");
  process.exit(1);
}

console.log(`🔑 Loaded ${keys.length} YouTube API key(s).`);

// Simple round-robin index
let currentIndex = 0;

// Small in-memory cache (60s)
const cache = new NodeCache({ stdTTL: 60 });

// ----------------------------------

// Helper to get next key in rotation
function getNextKey() {
  const key = keys[currentIndex];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

// Core proxy route
app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  const maxResults = req.query.maxResults || 5;
  const pageToken = req.query.pageToken || "";
  const cacheKey = `${q}:${pageToken}:${maxResults}`;

  // Serve cached results
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let lastError = null;

  // Try each key until success
  for (let i = 0; i < keys.length; i++) {
    const key = getNextKey();
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.search = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults,
      q,
      videoEmbeddable: "true",
      safeSearch: "none",
      key,
    });

    console.log(`[proxy] Using key[${i}] ending with ${key.slice(-6)} → ${q}`);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        const reason = data.error.errors?.[0]?.reason;
        console.warn(`[proxy] YouTube error reason=${reason}`);

        if (reason === "quotaExceeded") {
          lastError = reason;
          continue; // try next key
        } else if (reason === "keyInvalid" || reason === "API_KEY_INVALID") {
          lastError = reason;
          continue; // try next key
        } else {
          return res.status(400).json({ error: data.error });
        }
      }

      // Success
      cache.set(cacheKey, data);
      return res.json(data);
    } catch (err) {
      console.error("[proxy] fetch error:", err.message);
      lastError = err.message;
    }
  }

  // If we reach here, all keys failed
  if (lastError === "quotaExceeded") {
    return res
      .status(429)
      .json({ error: "quotaExceeded", message: "All YouTube API keys exceeded quota." });
  }

  return res
    .status(500)
    .json({ error: "All keys failed", message: lastError || "Unknown error" });
});

// ----------------------------------

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});