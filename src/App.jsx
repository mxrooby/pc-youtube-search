import React, { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import CategoryTabs from "./components/CategoryTabs";
import VideoCard from "./components/VideoCard";
import staticVideos from "./staticVideos";
import { searchYouTube } from "./services/youtube";

const CATEGORIES = [
  "All",
  "PC Builds",
  "Installing Components",
  "PC Troubleshooting",
  "Budget vs High-End Builds",
  "Choosing Compatible Parts",
];

// helper to normalize strings
const normalize = (s) => (s || "").toString().toLowerCase().trim();

// --- simple tech detection (tweak keywords if needed) ---
function isQueryTech(q) {
  if (!q) return false;
  const text = normalize(q);
  const TECH_KEYWORDS = [
    "pc", "computer", "tech", "build", "gaming", "gpu", "cpu", "intel",
    "amd", "nvidia", "motherboard", "ssd", "ram", "tutorial", "setup",
    "benchmark", "upgrade", "parts", "hardware", "bios", "fps", "review"
  ];
  return TECH_KEYWORDS.some((kw) => text.includes(kw));
}

// optional channel whitelist (if you want extra strictness)
// leave empty or remove if you want all API results
const CHANNEL_WHITELIST = [
  // "linus tech tips", "paul's hardware", "gamers nexus", ...
];

function isWhitelistedChannel(channelName = "") {
  if (!channelName) return true; // if whitelist empty, allow everything
  if (CHANNEL_WHITELIST.length === 0) return true;
  const n = normalize(channelName);
  return CHANNEL_WHITELIST.some((t) => n.includes(normalize(t)));
}

// map raw API item -> app shape
function mapApiItem(it) {
  return {
    id: it.id,
    youtubeId: it.id,
    videoId: it.id,
    title: it.title || it.name || "",
    channel: it.channel || it.channelTitle || "",
    description: it.description || "",
    views: it.views || "-",
    publishedAt: it.publishedAt || "",
    duration: it.duration || "-",
    thumbnail: it.thumbnail || "",
    featured: false,
    category: it.category || "Search",
  };
}

export default function App() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState([]); // will hold either static or API results
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState("");
  const [noTechResults, setNoTechResults] = useState(false);
  const sentinelRef = useRef();

  // initially show static videos (featured)
  useEffect(() => {
    setItems(staticVideos);
  }, []);

  function augmentQuery(q) {
    const bias = ["pc", "computer", "build"];
    const qLower = (q || "").toLowerCase();
    const add = bias.filter((b) => !qLower.includes(b)).join(" ");
    return `${q} ${add}`.trim();
  }

  // SEARCH: strict behavior
  // - non-tech query -> don't call API, show featured static and message
  // - tech query -> call API once and show API results ONLY (max 5). infinite scroll disabled during search
  async function doSearch(q) {
    setError("");
    setQuery(q);
    setPlayerId(null);
    setLoading(true);
    setNextPageToken(null);
    setNoTechResults(false);

    const queryIsTech = isQueryTech(q);

    if (!queryIsTech) {
      setNoTechResults(true);
      const featured = staticVideos.filter((s) => s.isStatic || s.featured);
      setItems([...featured]);
      setLoading(false);
      return;
    }

    try {
      const augmented = augmentQuery(q);
      console.log("doSearch: calling API with:", augmented);
      const res = await searchYouTube(augmented, null, 5);
      console.log("doSearch: raw res:", res);

      const mapped = (res.items || []).map(mapApiItem);
      console.log("doSearch: mapped items:", mapped);

      // don't apply whitelist for now — show any API results
      const filtered = mapped.filter(it => it && it.id);

      console.log("doSearch: filtered items length:", filtered.length);
      if (!filtered || filtered.length === 0) {
        setNoTechResults(true);
        setItems([]); // show nothing or change to featured if you prefer
        setNextPageToken(null);
      } else {
        setNoTechResults(false);
        setItems(filtered.slice(0,5)); // API results ONLY
        setNextPageToken(null);
      }
    } catch (err) {
      console.error("doSearch catch:", err);
      setError(err.message || "Search failed");
      setItems(staticVideos);
      setNextPageToken(null);
    } finally {
      setLoading(false);
    }
  }


  // LOAD MORE: only when not searching (query empty). Keeps browsing behavior.
  async function loadMore() {
    if (query) return; // disable during active search
    if (!nextPageToken) return;
    setLoading(true);
    try {
      const res = await searchYouTube("", nextPageToken, 12);
      const mapped = (res.items || []).map(mapApiItem);
      setItems((prev) => [...prev, ...mapped]);
      setNextPageToken(res.nextPageToken || null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Load more failed");
      setNextPageToken(null);
    } finally {
      setLoading(false);
    }
  }

  // IntersectionObserver: only triggers loadMore when NOT searching
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading && !query) {
            loadMore();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [sentinelRef.current, loading, nextPageToken, query]);

  // Category matching (keeps your alias logic)
  const CATEGORY_ALIASES = {
    "pc builds": ["builds", "pc build"],
    "installing components": ["install", "installing", "installation"],
    "pc troubleshooting": ["troubleshoot", "troubleshooting", "issues", "problems"],
    "budget vs high-end builds": ["budget", "high-end", "comparison"],
    "choosing compatible parts": ["compatibility", "parts", "compatible"],
  };

  const matchesCategory = (itemCat, activeCat) => {
    if (!activeCat || normalize(activeCat) === "all") return true;
    const a = normalize(activeCat);
    const i = normalize(itemCat);
    if (i.includes(a) || a.includes(i)) return true;
    const aliases = CATEGORY_ALIASES[a];
    if (aliases && aliases.some((alias) => i.includes(alias))) return true;
    return false;
  };

  const displayed = useMemo(() => {
    if (activeCategory === "All") return items;
    return items.filter((it) => matchesCategory(it.category || "", activeCategory));
  }, [items, activeCategory]);

  // select video to play
  function handleSelectVideo(id) {
    setPlayerId(id);
    document.getElementById("player")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-6xl mx-auto">
      <SearchBar onSearch={doSearch} />

      <CategoryTabs
        categories={CATEGORIES}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <div className="mt-4">
        {noTechResults && (
          <div className="text-sm text-amber-600">
            No tech/PC-related results were found for "{query}". Try another query or check spelling.
          </div>
        )}
      </div>

      {/* Player */}
      {playerId && (
        <div id="player" className="mt-6">
          {/* Responsive player wrapper: enforces 16:9 and prevents black bar */}
          <div className="relative w-full pt-[56.25%] bg-black rounded overflow-hidden">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0"
              title="YouTube player"
              src={`https://www.youtube.com/embed/${playerId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="mt-6">
        <div className="text-sm text-slate-600 mb-4">
          {displayed.length} guides found {query ? "" : "(loading more as you scroll)"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((it) => (
            <VideoCard key={it.id} item={it} onSelect={handleSelectVideo} />
          ))}
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div
          ref={sentinelRef}
          className="h-12 mt-6 flex items-center justify-center"
        >
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : !query && nextPageToken ? (
            <div className="text-sm text-slate-400">Scroll to load more</div>
          ) : (
            <div className="text-sm text-slate-400">{query ? "" : "No more results"}</div>
          )}
        </div>
      </section>
    </div>
  );
}