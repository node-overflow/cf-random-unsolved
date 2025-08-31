const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const form = $("#filterForm");
const tagsBox = $("#tagsBox");
const statusBox = $("#status");
const resultCard = $("#result");
const probTitle = $("#probTitle");
const probMeta = $("#probMeta");
const probTags = $("#probTags");
const probLink = $("#probLink");
const againBtn = $("#againBtn");
const goBtn = $("#goBtn");

let lastQuery = null;

const setStatus = msg => {
  if (statusBox) statusBox.textContent = msg || "";
};

const loadTags = async () => {
  try {
    setStatus("Loading tags…");
    const res = await fetch("/api/tags");
    if (!res.ok) throw new Error("Failed to fetch tags");
    const data = await res.json();
    const availableTags = data.tags || [];

    tagsBox.innerHTML = "";
    availableTags.forEach(t => {
      const div = document.createElement("div");
      div.className = "tag-item";
      div.textContent = t;
      div.dataset.tag = t;
      div.addEventListener("click", () => div.classList.toggle("selected"));
      tagsBox.appendChild(div);
    });

    setStatus("");
  } catch (e) {
    setStatus(e.message || "Could not load tags.");
    tagsBox.textContent = "Unable to load tags.";
  }
};

const getSelectedTags = () => $$(".tag-item.selected").map(el => el.dataset.tag);

const fetchRandom = async query => {
  const params = new URLSearchParams();
  params.set("handle", query.handle);
  if (query.tags && query.tags.length) params.set("tags", query.tags.join(","));
  params.set("min", query.min);
  params.set("max", query.max);
  params.set("match", "all");

  setStatus(`Checking handle ${query.handle}…`);
  goBtn.disabled = true;

  try {
    const res = await fetch(`/api/random-problem?${params.toString()}`);
    let data;
    try { data = await res.json(); } catch { throw new Error(`Server returned ${res.status}`); }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

    probTitle.textContent = `${data.name} (${data.contestId}${data.index})`;
    probMeta.textContent = `Rating: ${data.rating} • Contest: ${data.contestId} • Problem: ${data.index}`;
    probTags.textContent = `Tags: ${data.tags.join(", ")}`;
    probLink.href = data.url;

    resultCard.classList.remove("hidden");
    setStatus("");
  } catch (e) {
    resultCard.classList.add("hidden");
    if (/not found/i.test(e.message)) setStatus("Handle not found on Codeforces.");
    else if (/No unsolved problems/i.test(e.message)) setStatus("No unsolved problems found for this user and filters.");
    else setStatus(e.message || "Unknown error.");
  } finally {
    goBtn.disabled = false;
  }
};

form.addEventListener("submit", ev => {
  ev.preventDefault();
  const handle = $("#handle").value.trim();
  if (!handle) { setStatus("Please enter a Codeforces handle."); return; }
  if (!/^[a-zA-Z0-9_]+$/.test(handle)) { setStatus("Invalid handle. Only letters, digits, and underscore are allowed."); return; }

  const min = parseInt($("#min").value, 10) || 800;
  const max = parseInt($("#max").value, 10) || 3500;
  if (min > max) { setStatus("Min rating must be <= max rating."); return; }

  const tags = getSelectedTags();
  lastQuery = { handle, min, max, tags };
  fetchRandom(lastQuery);
});

againBtn.addEventListener("click", () => { if (lastQuery) fetchRandom(lastQuery); });

loadTags();
