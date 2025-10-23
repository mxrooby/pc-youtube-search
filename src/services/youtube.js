// src/services/youtube.js
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const API_PROXY = import.meta.env.VITE_API_PROXY || ""; // e.g. "http://localhost:4000/api/search"
const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function searchYouTube(q, pageToken = null, maxResults = 5) {
  try {
    if (API_PROXY) {
      const url = new URL(API_PROXY);
      url.searchParams.set("q", q || "");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      url.searchParams.set("maxResults", String(maxResults || 5));

      console.log("[proxy] requesting:", url.toString());
      const resp = await fetch(url.toString());
      const text = await resp.text();
      // try parse JSON for logs (proxy should return JSON)
      let data;
      try { data = JSON.parse(text); } catch(e){ data = text; }
      console.log("[proxy] response status:", resp.status, "body:", data);
      if (!resp.ok) throw new Error(`Proxy request failed: ${resp.status}`);
      return flattenSearchResponse(typeof data === "string" ? JSON.parse(text) : data);
    }

    // No proxy
    if (!API_KEY) throw new Error("No VITE_YOUTUBE_API_KEY configured and no proxy set.");
    const params = new URLSearchParams({
      key: API_KEY,
      part: "snippet",
      q: q || "",
      type: "video",
      maxResults: String(maxResults || 5),
      videoEmbeddable: "true",
      safeSearch: "none",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const url = `${YT_SEARCH_URL}?${params.toString()}`;
    console.log("[yt direct] requesting:", url);
    const resp = await fetch(url);
    const data = await resp.json();
    console.log("[yt direct] status:", resp.status, "data.items:", (data.items||[]).length);
    return flattenSearchResponse(data);
  } catch (err) {
    console.error("searchYouTube error", err);
    throw err;
  }
}

function flattenSearchResponse(raw) {
  console.log("flattenSearchResponse raw:", raw && (raw.items ? `items:${raw.items.length}` : raw));
  const items = (raw.items || []).map((it) => {
    const vidId = it?.id?.videoId || it?.id;
    const snippet = it?.snippet || {};
    const thumb = snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || "";

    return {
      id: vidId,
      title: snippet?.title || "",
      description: snippet?.description || "",
      thumbnail: thumb,
      channel: snippet?.channelTitle || "",
      channelId: snippet?.channelId || "",
      publishedAt: snippet?.publishedAt || "",
      views: "-",
      duration: "-",
    };
  });

  return { items, nextPageToken: raw.nextPageToken || null };
}