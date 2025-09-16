// api/view.js
import { sanitize, injectMetaDescription, setupShareButton, initHeaderLinks } from './viewHelpers.js';

// Access check
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const postId = new URLSearchParams(window.location.search).get("id");

if (!token || !userName || !postId) {
    alert("You must be logged in and have a valid post ID to view.");
    location.href = "../account/login.html";
}

/**
 * Fetches a single blog post by user and post ID, and populates the page content.
 *
 * @async
 * @param {string} postId - The unique ID of the post to load.
 * @param {string} userName - The username of the post author.
 * @throws Will log an error and display an error message in the DOM if the post cannot be loaded.
 */
async function loadPost(postId, userName) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`);
        const { data: post } = await response.json();

        if (!response.ok || !post) throw new Error("Failed to load the post.");

        document.getElementById("postTitle").textContent = sanitize(post.title);
        document.getElementById("postBody").textContent = sanitize(post.body);

        const img = document.getElementById("postImage");
        img.src = sanitize(post.media?.url || "https://via.placeholder.com/800x400");
        img.alt = sanitize(post.media?.alt || post.title);

        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${post.id}`;
        setupShareButton(shareUrl);

        injectMetaDescription(post);

    } catch (error) {
        console.error(error);
        document.getElementById("postTitle").textContent = "Unable to load post.";
        document.getElementById("postBody").textContent = "";
    }
}


// DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initHeaderLinks();
    loadPost(postId, userName);
});
