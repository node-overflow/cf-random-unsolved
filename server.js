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

const CF_BASE = "https://codeforces.com/api";
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
    const filtered = problems.filter(p => Number.isInteger(p.rating) && p.contestId && p.index && Array.isArray(p.tags));
    const tagSet = new Set();
    filtered.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    problemCache = { lastFetched: now, problems: filtered, tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)) };
};

const getSolvedSet = async (handle) => {
    try {
        const submissions = await cfGet(`/user.status?handle=${encodeURIComponent(handle)}&from=1&count=100000`);
        const solved = new Set();
        submissions.forEach(sub => {
            if (sub.verdict === "OK" && sub.problem && sub.problem.contestId && sub.problem.index)
                solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
        });
        return solved;
    } catch (e) {
        const msg = e.message || "";
        if (/HTTP 400/i.test(msg) || /handles should satisfy/i.test(msg) || /not found/i.test(msg)) {
            const err = new Error(`User '${handle}' not found on Codeforces`);
            err.code = 404;
            throw err;
        }
        throw e;
    }
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
        res.json({ contestId: prob.contestId, index: prob.index, name: prob.name, rating: prob.rating, tags: prob.tags, url });
    } catch (e) {
        const code = e.code || 500;
        res.status(code).json({ error: e.message || "Unknown error" });
    }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

process.on("unhandledRejection", err => console.error("UnhandledRejection:", err));
