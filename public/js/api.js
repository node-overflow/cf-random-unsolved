/* ----------------------------------------------------------------------------------------- */

/* FETCH TAGS */

export const fetchTagsAPI = async () => {
    const res = await fetch("/api/tags");
    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* FETCH RANDOM PROBLEM */

export const fetchRandomAPI = async (params) => {
    return await fetch(`/api/random-problem?${params.toString()}`);
};

/* ----------------------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------------------- */

/* FETCH AVATAR */

export const fetchAvatarAPI = async (handle) => {
    const res = await fetch(`/api/user-avatar?handle=${encodeURIComponent(handle)}`);
    if (!res.ok) throw new Error("Failed avatar fetch");
    return fetch(`/api/user-avatar?handle=${encodeURIComponent(handle)}`);;
};

/* ----------------------------------------------------------------------------------------- */