// Retrieve credentials
const token = localStorage.getItem("accessToken");
const apiKey = localStorage.getItem("noroffApiKey");
const userName = localStorage.getItem("userName");

// Redirect if not logged in
if (!token || !userName) {
    alert("You must be logged in to access this page.");
    window.location.href = "../account/login.html";
    throw new Error("Access denied. User not authenticated.");
}

// Initialize header links
function initHeaderLinks() {
    const headerRight = document.getElementById("headerRight");
    if (!headerRight) return;
    headerRight.innerHTML = "";

    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Log Out";
    logoutLink.className = "hover:underline font-semibold";
    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("noroffApiKey");
        window.location.href = "../account/login.html";
    });

    headerRight.appendChild(logoutLink);
}

// Simple URL validation
function isValidUrl(string) {
    try {
        return Boolean(new URL(string));
    } catch {
        return false;
    }
}

// Fetch current profile
async function fetchProfile() {
    try {
        const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${userName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Noroff-API-Key": apiKey
            }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data?.errors?.[0]?.message || "Failed to fetch profile");
        return data.data;
    } catch (err) {
        console.error("Fetch profile error:", err);
        alert(`Error fetching profile: ${err.message}`);
        throw err;
    }
}

// Render profile
function renderProfile(profile) {
    document.getElementById("profileName").textContent = profile.name;
    document.getElementById("profileUsername").textContent = `@${profile.name}`;
    document.getElementById("profileBio").textContent = profile.bio || "";
    document.getElementById("profileEmail").textContent = profile.email;
    document.getElementById("profileJoined").textContent = new Date(profile.created).toLocaleDateString();
    const imgEl = document.getElementById("profileImage");
    imgEl.src = profile.avatar?.url || "https://via.placeholder.com/150";
    imgEl.alt = profile.avatar?.alt || profile.name;

    // Prefill edit form
    document.getElementById("bio").value = profile.bio || "";
    document.getElementById("avatarUrl").value = profile.avatar?.url || "";
}

// Update profile
async function updateProfile(update) {
    try {
        const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${userName}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Noroff-API-Key": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(update)
        });

        const data = await res.json();
        console.log("Update response:", data);

        if (!res.ok) throw new Error(data?.errors?.[0]?.message || "Failed to update profile");

        alert("Profile updated successfully!");
        renderProfile(data.data);
    } catch (err) {
        console.error("Update profile error:", err);
        alert(`Error updating profile: ${err.message}`);
    }
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    initHeaderLinks();

    // Load profile
    try {
        const profile = await fetchProfile();
        renderProfile(profile);
    } catch (err) {
        console.error(err);
    }

    // Handle edit form
    const form = document.getElementById("editProfileForm");
    form?.addEventListener("submit", async e => {
        e.preventDefault();

        const bio = document.getElementById("bio")?.value.trim();
        const avatarUrl = document.getElementById("avatarUrl")?.value.trim();

        const update = {};
        if (bio) update.bio = bio;
        if (avatarUrl) {
            if (!isValidUrl(avatarUrl)) return alert("Avatar URL must be a valid URL");
            update.avatar = { url: avatarUrl, alt: `Avatar for ${userName}` };
        }

        if (!Object.keys(update).length) return alert("Please provide at least one field to update");

        await updateProfile(update);
    });
});
