/* ----------------------------------------------------------------------------------------- */


/* VARIABLES */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const form = $("#filterForm");
const Box = $("#tagsBox");
const statusBox = $("#status");
const resultCard = $("#result");
const probTitle = $("#probTitle");
const probMeta = $("#probMeta");
const probTags = $("#probTags");
const probSolved = $("#probSolved");
const probLink = $("#probLink");
const probContestLink = $("#probContestLink");
const contestBadges = $("#contestBadges");
const againBtn = $("#againBtn");
const goBtn = $("#goBtn");
const avatarDiv = $(".avatar");
const handleInput = $("#handle");

let lightMode = false;
let lastQuery = null;


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* SET STATUS WHILE FETCHING PROBLEMS */

const setStatus = msg => {
  if (statusBox) statusBox.textContent = msg || "";
};


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* TAGS */

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

loadTags();


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* RENDERS PROBLEMS */

const renderProblem = (data, query) => {
  probTitle.textContent = `${data.name} (${data.contestId}${data.index})`;

  let metaLine = query.is_ticked
    ? `Contest: ${data.contestId} • Problem: ${data.index}`
    : `Rating: ${data.rating} • Contest: ${data.contestId} • Problem: ${data.index}`;

  if (data.date) metaLine += ` • On: ${data.date}`;

  probMeta.textContent = metaLine;
}


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* RENDERS TAGS */

const renderTags = (tags, query) => {
  if (query.tag_check) {
    probTags.style.display = "none";
    probTags.textContent = "";
    return;
  }

  probTags.style.display = "block";

  if (!tags || tags.length === 0) {
    probTags.innerHTML = `<span class="tag unknown">Unknown tag</span>`;
    return;
  }

  probTags.innerHTML = tags.map(t => `<span class="tag">${t}</span>`).join(" ");
}


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* RENDERS BADGE */

const renderBadges = (type) => {
  contestBadges.innerHTML = "";

  if (!type) return;

  const badgeLabels = {
    div1: "Div. 1",
    div2: "Div. 2",
    div3: "Div. 3",
    div4: "Div. 4",
    educational: "Educational",
    rated: "Rated",
    unrated: "Unrated",
    other: "Other"
  };

  const span = document.createElement("span");
  span.className = `badge ${type}`;
  span.textContent = badgeLabels[type] || "Other";
  contestBadges.appendChild(span);
}


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* RENDERS SOLVED COUNT */

const renderSolvedCount = (count) => {
  probSolved.innerHTML = `
    <i class="fa-solid fa-user user-icon"></i> 
    Solved by ${Intl.NumberFormat("en-US").format(count)} users
  `;
}




/* ----------------------------------------------------------------------------------------- */


/* FETCH PROBLEMS */

const fetchRandom = async (query) => {
  const params = new URLSearchParams();

  params.set("handle", query.handle);
  if (query.tags && query.tags.length) params.set("tags", query.tags.join(","));
  params.set("min", query.min);
  params.set("max", query.max);
  params.set("match", "all");

  query.is_ticked = document.getElementById("is_ticked_checkbox").checked;
  query.tag_check = document.getElementById("tag_check_checkbox").checked;
  query.single_tag = document.getElementById("single_tag_checkbox").checked;

  params.set("single_tag", query.single_tag);

  setStatus(`Checking handle ${query.handle}…`);
  goBtn.disabled = true;
  againBtn.disabled = true;

  try {
    const res = await fetch(`/api/random-problem?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

    renderProblem(data, query);
    renderTags(data.tags, query);
    renderBadges(data.contestType);
    renderSolvedCount(data.solvedCount);

    probLink.href = data.url;
    probContestLink.href = `https://codeforces.com/contest/${data.contestId}`;

    resultCard.classList.remove("hidden");
    setStatus("");

  } catch (e) {
    resultCard.classList.add("hidden");

    if (/not found/i.test(e.message))
      setStatus("Handle not found on Codeforces.");
    else if (/No unsolved problems/i.test(e.message))
      setStatus("No unsolved problems found for this user and filters.");
    else
      setStatus(e.message || "Unknown error.");
  } finally {
    goBtn.disabled = false;
    againBtn.disabled = false;
  }
};


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* SUBMIT BUTTON FUNCIONALITY */

form.addEventListener("submit", ev => {
  ev.preventDefault();

  const handle = $("#handle").value.trim();

  if (!handle) { setStatus("Please enter a Codeforces handle."); return; }

  const min = parseInt($("#min").value, 10) || 800;
  const max = parseInt($("#max").value, 10) || 3500;

  if (min > max) { setStatus("Min rating must be <= max rating."); return; }

  const tags = getSelectedTags();

  lastQuery = { handle, min, max, tags };

  fetchRandom(lastQuery);
});


/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */


/* AGAIN BUTTON FUCNTIONALITY */

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


/* AVATAR */

let avatarDebounceTimer = null;

const loadAvatar = async (handle) => {
  avatarDiv.style.backgroundImage = "url('/assets/avatar-placeholder.png')";
  avatarDiv.style.opacity = "0.6";

  try {
    const res = await fetch(`/api/user-avatar?handle=${handle}`);
    const data = await res.json();

    if (data.avatarURL) {
      const img = new Image();

      img.onload = () => {
        avatarDiv.style.transition = "background-image 0.4s ease, opacity 0.4s ease";
        avatarDiv.style.backgroundImage = `url('${data.avatarURL}')`;
        avatarDiv.style.opacity = "1";
      };

      img.onerror = () => {
        avatarDiv.style.backgroundImage = "url('/default-avatar.png')";
        avatarDiv.style.opacity = "1";
      };

      img.src = data.avatarURL;
    } else {
      avatarDiv.style.backgroundImage = "url('/default-avatar.png')";
      avatarDiv.style.opacity = "1";
    }
  } catch (err) {
    avatarDiv.style.backgroundImage = "url('/default-avatar.png')";
    avatarDiv.style.opacity = "1";

    console.error("Failed to load avatar:", err);
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
  avatarDebounceTimer = setTimeout(() => {
    loadAvatar(handle);
  }, 250);
};

avatarDiv.addEventListener("click", () => {
  const handle = handleInput.value.trim();

  if (!handle) return;
  window.open(`https://codeforces.com/profile/${handle}`, "_blank");
});

handleInput.addEventListener("input", handleChange);

if (handleInput.value.trim()) {
  handleChange();
}


/* ----------------------------------------------------------------------------------------- */
