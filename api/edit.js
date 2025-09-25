import { sanitize, setupLogoutLink, setupAccessibility } from './editHelpers.js';

// Access check
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const postId = new URLSearchParams(window.location.search).get("id");

if (!token || !userName || !postId) {
    alert("You must be logged in and have a valid post ID to edit.");
    location.href = "../account/login.html";
}

/**
 * Load existing post data into the edit form
 * @async
 * @returns {Promise<void>}
 */
async function loadPost() {
    try {
        const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`);
        const { data } = await res.json();

        if (!res.ok || !data) throw new Error("Failed to fetch post.");

        document.getElementById("title").value = data.title || "";
        document.getElementById("body").value = data.body || "";
        document.getElementById("imageUrl").value = data.media?.url || "";
        document.getElementById("imageAlt").value = data.media?.alt || "";
    } catch (err) {
        document.getElementById("errorMessage").textContent = err.message;
    }
}

// Handle edit form submission
function setupFormSubmit() {
    const form = document.getElementById("editPostForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorMsg = document.getElementById("errorMessage");
        errorMsg.textContent = "";

        const postData = {
            title: document.getElementById("title").value.trim(),
            body: document.getElementById("body").value.trim(),
            media: {
                url: document.getElementById("imageUrl").value.trim(),
                alt: document.getElementById("imageAlt").value.trim(),
            },
        };

        try {
            const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(postData),
            });

            if (!res.ok) {
                const { errors } = await res.json();
                throw new Error(errors?.[0]?.message || "Failed to update post.");
            }

            alert("Post updated!");
            location.href = `../post/view.html?id=${postId}`;
        } catch (err) {
            errorMsg.textContent = err.message;
        }
    });
}

// Handle delete post
function setupDeleteButton() {
    const deleteBtn = document.getElementById("deletePostBtn");
    if (!deleteBtn) return;

    deleteBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to delete post.");
            alert("Post deleted!");
            location.href = "../social/posts.html";
        } catch (err) {
            document.getElementById("errorMessage").textContent = err.message;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupLogoutLink();      
    setupAccessibility();  
    loadPost();        
    setupFormSubmit();   
    setupDeleteButton();   
});
