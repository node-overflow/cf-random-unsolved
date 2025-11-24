/* ----------------------------------------------------------------------------------------- */

/* VARIABLES */
const $ = sel => document.querySelector(sel);

const probTitle = $("#probTitle");
const probMeta = $("#probMeta");
const probTags = $("#probTags");
const probSolved = $("#probSolved");
const contestBadges = $("#contestBadges");
const statusBox = $("#status");

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* SET STATUS WHILE FETCHING PROBLEMS */

export const setStatus = msg => {
    statusBox.textContent = msg || "";
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* RENDER PROBLEMS */

export const renderProblem = (data, query) => {
    probTitle.textContent = `${data.name} (${data.contestId}${data.index})`;

    let meta = query.is_ticked
        ? `Contest: ${data.contestId} • Problem: ${data.index}`
        : `Rating: ${data.rating} • Contest: ${data.contestId} • Problem: ${data.index}`;

    if (data.date) meta += ` • On: ${data.date}`;

    probMeta.textContent = meta;
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* RENDER TAGS */

export const renderTags = (tags, query) => {
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
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* RENDER CONTEST BADGES */
export const renderBadges = (type) => {
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
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* RENDER SOLVED COUNT */
export const renderSolvedCount = (count) => {
    probSolved.innerHTML = `
    <i class="fa-solid fa-user user-icon"></i>
    Solved by ${Intl.NumberFormat("en-US").format(count)} users
  `;
};

/* ----------------------------------------------------------------------------------------- */
