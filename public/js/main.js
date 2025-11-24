/* ----------------------------------------------------------------------------------------- */

/* ALL IMPORTS */

import {
    fetchTagsAPI,
    fetchRandomAPI,
    fetchAvatarAPI
} from "./api.js";

import {
    setStatus,
    renderProblem,
    renderTags,
    renderBadges,
    renderSolvedCount
} from "./render.js";

import { LIGHT_STYLE } from "./light-mode.js";

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* VARIABLES */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const form = $("#filterForm");
const tagsBox = $("#tagsBox");
const handleInput = $("#handle");
const goBtn = $("#goBtn");
const againBtn = $("#againBtn");
const avatarDiv = $(".avatar");
const resultCard = $("#result");
const probLink = $("#probLink");
const probContestLink = $("#probContestLink");
const AVATAR_DEBOUNCE_MS = 250;


let lastQuery = null;
let avatarDebounceTimer = null;

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* LOAD TAGS INTO CONTAINER UI */

const loadTags = async () => {
    setStatus("Loading tags…");

    try {
        const data = await fetchTagsAPI();
        const availableTags = data.tags || [];

        tagsBox.innerHTML = "";

        availableTags.forEach(t => {
            const div = document.createElement("div");

            div.className = "tag-item";
            div.textContent = t;
            div.dataset.tag = t;

            div.onclick = () => div.classList.toggle("selected");

            tagsBox.appendChild(div);
        });

        setStatus("");
    } catch (e) {
        setStatus("Could not load tags");
        tagsBox.textContent = "Unable to load tags.";
    }
};

loadTags();

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* EXTRACT SELECTED TAGS */

const getSelectedTags = () =>
    $$(".tag-item.selected").map(el => el.dataset.tag);

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* FETCH + RENDER RANDOM PROBLEMS */

const fetchRandom = async (query) => {
    const params = new URLSearchParams();

    params.set("handle", query.handle);

    if (query.tags?.length) params.set("tags", query.tags.join(","));

    params.set("min", query.min);
    params.set("max", query.max);
    params.set("match", "all");

    query.is_ticked = $("#is_ticked_checkbox").checked;
    query.tag_check = $("#tag_check_checkbox").checked;
    query.single_tag = $("#single_tag_checkbox").checked;

    params.set("single_tag", query.single_tag);

    setStatus(`Checking handle ${query.handle}…`);

    goBtn.disabled = true;
    againBtn.disabled = true;

    try {
        const res = await fetchRandomAPI(params);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

        renderProblem(data, query);
        renderTags(data.tags, query);
        renderBadges(data.contestType);
        renderSolvedCount(data.solvedCount);

        probLink.href = data.url;
        probContestLink.href = `https://codeforces.com/contest/${data.contestId}`;

        resultCard.classList.remove("hidden");
        setStatus("");
    } catch (err) {
        resultCard.classList.add("hidden");
        setStatus(err.message || "Failed to load.");
    }

    goBtn.disabled = false;
    againBtn.disabled = false;
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* HANDLE FORM SUBMIT */

form.addEventListener("submit", ev => {
    ev.preventDefault();

    const handle = handleInput.value.trim();

    if (!handle) return setStatus("Please enter a Codeforces handle.");

    const min = +$("#min").value || 800;
    const max = +$("#max").value || 3500;

    if (min > max) return setStatus("Min rating must be <= max rating.");

    const tags = getSelectedTags();

    if ($("#single_tag_checkbox").checked && tags.length === 0) {
        setStatus("Select at least 1 tag when using Tags Only mode.");
        return;
    }

    lastQuery = { handle, min, max, tags };

    fetchRandom(lastQuery);
});

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* AGAIN BTN FUNCTIONALITY */

againBtn.addEventListener("click", () => {
    const handle = $("#handle").value.trim();
    const min = parseInt($("#min").value, 10) || 800;
    const max = parseInt($("#max").value, 10) || 3500;
    const tags = getSelectedTags();

    const newQuery = { handle, min, max, tags };

    lastQuery = newQuery;

    fetchRandom(newQuery);
});

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* AVATAR LOGIC */

const loadAvatar = async (handle) => {
    if (!handle) return;

    avatarDiv.style.backgroundImage = "url('/assets/avatar-placeholder.png')";
    avatarDiv.style.opacity = "0.6";

    try {
        const res = await fetchAvatarAPI(handle);
        const data = await res.json();
        const url = data?.avatarURL || "/default-avatar.png";

        const img = new Image();

        img.onload = () => {
            avatarDiv.style.transition = "background-image 0.4s ease, opacity 0.4s ease";
            avatarDiv.style.backgroundImage = `url('${url}')`;
            avatarDiv.style.opacity = "1";
        };

        img.onerror = () => {
            avatarDiv.style.backgroundImage = "url('/default-avatar.png')";
            avatarDiv.style.opacity = "1";
        };

        img.src = url;
    } catch (err) {
        avatarDiv.style.backgroundImage = "url('/default-avatar.png')";
        avatarDiv.style.opacity = "1";

        console.error("Avatar load failed:", err);
    }
};

const handleChange = () => {
    const handle = handleInput.value.trim();

    if (!handle) {
        avatarDiv.style.backgroundImage = "url('/assets/avatar-placeholder.svg')";
        avatarDiv.style.opacity = "0.6";
        return;
    }

    clearTimeout(avatarDebounceTimer);

    avatarDebounceTimer = setTimeout(() => loadAvatar(handle), AVATAR_DEBOUNCE_MS);
};

handleInput.addEventListener("input", handleChange);

avatarDiv.addEventListener("click", () => {
    const handle = handleInput.value.trim();

    if (handle) window.open(`https://codeforces.com/profile/${handle}`, "_blank");
});

document.addEventListener("DOMContentLoaded", () => {
    loadFilters();

    const initialHandle = handleInput.value.trim();

    if (initialHandle) loadAvatar(initialHandle);
});

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* LOCAL STORAGE - SAVE USERNAME + RATING RANGE */

const saveFilters = () => {
    const handle = $("#handle").value.trim();
    const min = parseInt($("#min").value, 10) || 800;
    const max = parseInt($("#max").value, 10) || 3500;

    const data = { handle, min, max };
    localStorage.setItem("cfRandomBasicFilters", JSON.stringify(data));
}

handleInput.addEventListener("input", saveFilters);
$("#min").addEventListener("input", saveFilters);
$("#max").addEventListener("input", saveFilters);

const loadFilters = () => {
    const raw = localStorage.getItem("cfRandomBasicFilters");
    if (!raw) return;

    try {
        const data = JSON.parse(raw);

        if (data.handle) $("#handle").value = data.handle;
        if (data.min) $("#min").value = data.min;
        if (data.max) $("#max").value = data.max;

    } catch (err) {
        console.error("Failed to load filters:", err);
    }
}

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* LIGHT MODE TOGGLE */

const enableLightMode = () => {
    let style = document.getElementById("light-theme");

    if (!style) {
        style = document.createElement("style");
        style.id = "light-theme";
        style.textContent = LIGHT_STYLE;
        document.head.appendChild(style);
    }
}

const disableLightMode = () => {
    const style = document.getElementById("light-theme");

    if (style) style.remove();
}

const toggleBtn = $("#toggleThemeBtn");

let lightMode = false;

toggleBtn.addEventListener("click", () => {
    lightMode = !lightMode;

    if (lightMode) {
        enableLightMode();
    } else {
        disableLightMode();
    }

    toggleBtn.innerHTML = lightMode
        ? `<i class="fa-solid fa-sun"></i>`
        : `<i class="fa-solid fa-moon"></i>`;
});

/* ----------------------------------------------------------------------------------------- */
