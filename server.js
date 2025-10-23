// server.js - simple YouTube proxy (drop-in)
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  console.error("Missing YOUTUBE_API_KEY in .env");
  process.exit(1);
}

app.use((req, res, next) => {
  // basic CORS for local dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const pageToken = req.query.pageToken || "";
    const maxResults = Math.min(parseInt(req.query.maxResults || "5", 10), 50);

    // basic validation
    if (!q) {
      return res.status(400).json({ error: "Missing ?q= parameter" });
    }

    const params = new URLSearchParams({
      key: API_KEY,
      part: "snippet",
      q,
      type: "video",
      maxResults: String(maxResults),
      videoEmbeddable: "true",
      safeSearch: "none",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

    console.log("[proxy] GET", url);
    const resp = await fetch(url);
    const data = await resp.json();

    // If YouTube error return it up (status 200 but with error body)
    if (!resp.ok) {
      console.error("[proxy] YouTube responded:", resp.status, data);
      return res.status(resp.status).json(data);
    }

    // Return the raw YouTube search result (we flatten on the client)
    return res.json(data);
  } catch (err) {
    console.error("[proxy] error:", err);
    return res.status(500).json({ error: "Proxy request failed", details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});