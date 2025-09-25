import { setupLogoutLink } from "./usersHelpers.js";
setupLogoutLink();

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("accessToken");
    const apiKey = localStorage.getItem("noroffApiKey");
    const myUser = localStorage.getItem("userName");

    const usersGrid = document.getElementById("usersGrid");
    const errorMessage = document.getElementById("errorMessage");
    const searchInput = document.getElementById("searchUsers");

    if (!token || !apiKey || !myUser) {
        if (errorMessage)
            errorMessage.textContent =
                "Missing token, API key, or username. Please log in again.";
        return;
    }

    let allUsers = [];
    let myFollowing = [];

    // Styling helpers
    function setBtnToFollowing(btn) {
        btn.textContent = "Unfollow";
        btn.disabled = false;
        btn.classList.remove("bg-[#F28C8C]");
        btn.classList.add("bg-green-500");
    }

    function setBtnToNotFollowing(btn) {
        btn.textContent = "Follow";
        btn.disabled = false;
        btn.classList.remove("bg-green-500");
        btn.classList.add("bg-[#F28C8C]");
    }

    function setBtnLoading(btn, msg = "…") {
        btn._prevText = btn.textContent;
        btn.textContent = msg;
        btn.disabled = true;
    }

    // API helpers
    async function fetchMyFollowing() {
        try {
            const res = await fetch(
                `https://v2.api.noroff.dev/social/profiles/${myUser}?_following=true`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "X-Noroff-API-Key": apiKey,
                    },
                }
            );
            const data = await res.json();
            if (!res.ok) {
                console.warn("fetchMyFollowing failed:", data);
                myFollowing = [];
                return;
            }
            myFollowing = (data.data?.following || []).map((u) => u.name);
        } catch (err) {
            console.error("fetchMyFollowing error:", err);
            myFollowing = [];
        }
    }

    async function apiFollow(username) {
        const res = await fetch(
            `https://v2.api.noroff.dev/social/profiles/${username}/follow`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Noroff-API-Key": apiKey,
                },
            }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok)
            throw new Error(
                json?.errors?.[0]?.message || `Follow failed (${res.status})`
            );
        return json;
    }

    async function apiUnfollow(username) {
        const res = await fetch(
            `https://v2.api.noroff.dev/social/profiles/${username}/unfollow`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Noroff-API-Key": apiKey,
                },
            }
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok)
            throw new Error(
                json?.errors?.[0]?.message || `Unfollow failed (${res.status})`
            );
        return json;
    }

    /**
     * Fetch all users from the API and render them in the users grid.
     * Also fetches the current user's following list to set Follow/Unfollow buttons.
     * Updates the UI with an error message if the fetch fails.
     * @async
     * @returns {Promise<void>}
     */
    async function fetchUsers() {
        try {
            const res = await fetch("https://v2.api.noroff.dev/social/profiles", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Noroff-API-Key": apiKey,
                },
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data?.errors?.[0]?.message || `Failed to fetch users (${res.status})`
                );
            allUsers = data.data || [];
            await fetchMyFollowing();
            renderUsers(allUsers);
        } catch (err) {
            console.error("fetchUsers error:", err);
            if (errorMessage)
                errorMessage.textContent = `Error fetching users: ${err.message}`;
        }
    }


    // Rendering
    function renderUsers(users) {
        usersGrid.innerHTML = "";

        if (!users?.length) {
            usersGrid.innerHTML = `<p class="text-center text-gray-600 col-span-full">No users found.</p>`;
            return;
        }

        users.forEach((user) => {
            const card = document.createElement("div");
            card.className =
                "bg-white rounded-lg shadow-md p-4 flex flex-col justify-between";

            const left = document.createElement("div");
            left.className = "flex items-center gap-4 mb-4";

            const img = document.createElement("img");
            img.src = user.avatar?.url || "https://via.placeholder.com/80";
            img.alt = user.avatar?.alt || user.name;
            img.className = "w-16 h-16 rounded-full object-cover border";

            const info = document.createElement("div");
            const h2 = document.createElement("h2");
            h2.className = "font-bold text-lg text-[#455F7D]";
            h2.textContent = user.name;

            const p = document.createElement("p");
            p.className = "text-sm text-gray-600";
            p.textContent = `@${user.email}`;

            info.appendChild(h2);
            info.appendChild(p);
            left.appendChild(img);
            left.appendChild(info);

            const actions = document.createElement("div");
            actions.className = "flex gap-2 mt-auto";

            // view posts button
            const viewBtn = document.createElement("button");
            viewBtn.dataset.username = user.name;
            viewBtn.className =
                "viewPostsBtn bg-[#455F7D] hover:bg-[#374c62] text-white text-sm font-semibold py-1.5 px-3 rounded transition";
            viewBtn.textContent = "View Posts";
            actions.appendChild(viewBtn);

            // follow/unfollow button
            if (user.name !== myUser) {
                const isFollowing = myFollowing.includes(user.name);
                const followBtn = document.createElement("button");
                followBtn.dataset.username = user.name;
                followBtn.className = `followBtn text-white text-sm font-semibold py-1.5 px-3 rounded transition ${isFollowing ? "bg-green-500" : "bg-[#F28C8C]"
                    }`;
                followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
                actions.appendChild(followBtn);
            }

            card.appendChild(left);
            card.appendChild(actions);
            usersGrid.appendChild(card);
        });

        attachButtons();
    }

    // Button events
    function attachButtons() {
        // store username then redirect
        document.querySelectorAll(".viewPostsBtn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const username = btn.dataset.username;
                localStorage.setItem("selectedUser", username);
                window.location.href = "../social/user-posts.html";
            });
        });

        // follow/unfollow toggle
        document.querySelectorAll(".followBtn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const username = btn.dataset.username;
                const currentlyFollowing = myFollowing.includes(username);
                if (btn.disabled) return;

                try {
                    setBtnLoading(btn, "Saving…");
                    if (!currentlyFollowing) {
                        await apiFollow(username);
                        if (!myFollowing.includes(username)) myFollowing.push(username);
                        setBtnToFollowing(btn);
                    } else {
                        await apiUnfollow(username);
                        myFollowing = myFollowing.filter((u) => u !== username);
                        setBtnToNotFollowing(btn);
                    }
                } catch (err) {
                    btn.disabled = false;
                    btn.textContent = currentlyFollowing ? "Unfollow" : "Follow";
                    alert(err.message || "Action failed");
                }
            });
        });
    }

    // Search input
    if (searchInput) {
        searchInput.addEventListener("input", async (e) => {
            const q = e.target.value.trim();
            if (!q) return renderUsers(allUsers);
            try {
                const res = await fetch(
                    `https://v2.api.noroff.dev/social/profiles/search?q=${encodeURIComponent(
                        q
                    )}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "X-Noroff-API-Key": apiKey,
                        },
                    }
                );
                const data = await res.json();
                if (!res.ok)
                    throw new Error(
                        data?.errors?.[0]?.message || `Search failed (${res.status})`
                    );
                renderUsers(data.data || []);
            } catch (err) {
                console.error("searchProfiles error:", err);
                if (errorMessage)
                    errorMessage.textContent = `Search error: ${err.message}`;
            }
        });
    }

    // Initialize
    fetchUsers();
});
