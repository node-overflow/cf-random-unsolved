import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "assets")));

const CF_BASE = "https://codeforces.com/api";
const userCache = new Map();
let problemCache = { lastFetched: 0, problems: [], tags: [] };

const cfGet = async (endpoint) => {
    const res = await fetch(`${CF_BASE}${endpoint}`, { headers: { "User-Agent": "cf-random-unsolved/1.0" } });
    if (!res.ok) throw new Error(`CF API HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "OK") throw new Error(`CF API error: ${data.comment || "Unknown"}`);
    return data.result;
};

const ensureProblemCache = async () => {
    const now = Date.now();
    if (now - problemCache.lastFetched < 30 * 60 * 1000 && problemCache.problems.length) return;
    const result = await cfGet("/problemset.problems");
    const problems = result.problems || [];
    const stats = result.problemStatistics || [];

    const statMap = new Map(stats.map(s => [`${s.contestId}-${s.index}`, s.solvedCount]));

    const filtered = problems
        .filter(p => Number.isInteger(p.rating) && p.contestId && p.index && Array.isArray(p.tags))
        .map(p => ({
            ...p,
            solvedCount: statMap.get(`${p.contestId}-${p.index}`) || 0
        }));
    const tagSet = new Set();
    filtered.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    problemCache = { lastFetched: now, problems: filtered, tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)) };
};

const getSolvedSet = async (handle) => {
    const now = Date.now();
    const cache = userCache.get(handle);
    if (cache && now - cache.lastFetched < 5 * 60 * 1000) return cache.solvedSet;

    const submissions = await cfGet(`/user.status?handle=${encodeURIComponent(handle)}&from=1&count=100000`);
    const solved = new Set(submissions
        .filter(sub => sub.verdict === "OK" && sub.problem?.contestId && sub.problem?.index)
        .map(sub => `${sub.problem.contestId}-${sub.problem.index}`));

    userCache.set(handle, { lastFetched: now, solvedSet: solved });
    return solved;
};

const matchesTags = (problemTags, selected, mode) => {
    if (!selected || selected.length === 0) return true;
    const set = new Set(problemTags);
    return mode === "all" ? selected.every(t => set.has(t)) : selected.some(t => set.has(t));
};

app.get("/api/tags", async (req, res) => {
    try {
        await ensureProblemCache();
        res.json({ tags: problemCache.tags });
    } catch (e) {
        res.status(500).json({ error: e.message || "Failed to fetch tags" });
    }
});

app.get("/api/random-problem", async (req, res) => {
    try {
        const handle = (req.query.handle || "").trim();
        if (!handle) return res.status(400).json({ error: "Missing 'handle' query param" });
        const tagsParam = (req.query.tags || "").trim();
        const tags = tagsParam ? tagsParam.split(",").map(s => s.trim()).filter(Boolean) : [];
        const match = (req.query.match || "any").toLowerCase() === "all" ? "all" : "any";
        const minRating = Number.isFinite(Number(req.query.min)) ? parseInt(req.query.min, 10) : 800;
        const maxRating = Number.isFinite(Number(req.query.max)) ? parseInt(req.query.max, 10) : 3500;
        if (minRating > maxRating) return res.status(400).json({ error: "min rating must be <= max rating" });

        await ensureProblemCache();
        const solvedSet = await getSolvedSet(handle);
        let candidates = problemCache.problems.filter(p => {
            if (p.rating < minRating || p.rating > maxRating) return false;

            if (!matchesTags(p.tags, tags, match)) return false;

            if (req.query.single_tag === "true") {
                if (p.tags.length !== 1) return false;
                if (!tags.includes(p.tags[0])) return false;
            }

            const key = `${p.contestId}-${p.index}`;
            return !solvedSet.has(key);
        });


        if (candidates.length === 0 && minRating === maxRating) {
            let next = minRating + 100;
            while (next <= 3500 && candidates.length === 0) {
                candidates = problemCache.problems.filter(p => {
                    if (p.rating !== next) return false;
                    if (!matchesTags(p.tags, tags, match)) return false;
                    const key = `${p.contestId}-${p.index}`;
                    return !solvedSet.has(key);
                });
                next += 100;
            }
        }

        if (candidates.length === 0) return res.status(404).json({ error: "No unsolved problems found for given filters." });

        const rnd = Math.floor(Math.random() * candidates.length);
        const prob = candidates[rnd];
        const url = `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`;
        res.json({
            contestId: prob.contestId,
            index: prob.index,
            name: prob.name,
            rating: prob.rating,
            tags: prob.tags,
            url,
            solvedCount: prob.solvedCount,
        });
    } catch (e) {
        const code = e.code || 500;
        res.status(code).json({ error: e.message || "Unknown error" });
    }
});

app.get("/api/user-avatar", async (req, res) => {
    try {
        const handle = (req.query.handle || "").trim();
        if (!handle) return res.status(400).json({ error: "Missing handle query param" });

        const userData = await cfGet(`/user.info?handles=${encodeURIComponent(handle)}`);
        if (!userData?.length) return res.status(404).json({ error: "User not found" });

        const user = userData[0];

        const avatarURL = user.titlePhoto?.startsWith("http")
            ? user.titlePhoto
            : `https:${user.titlePhoto}`;

        res.json({ handle: user.handle, avatarURL });
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to fetch avatar" });
    }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

ensureProblemCache();

process.on("unhandledRejection", err => console.error("UnhandledRejection:", err));
