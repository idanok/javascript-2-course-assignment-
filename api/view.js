// When the DOM is fully loaded, retrieve the post container, post ID from the URL, and the username from localStorage (fallback to "idaNokk" if not found)
document.addEventListener("DOMContentLoaded", () => {
    const postContainer = document.getElementById("postContainer");
    const postId = new URLSearchParams(window.location.search).get("id");
    const userName = localStorage.getItem("userName") || "idaNokk";

    // Ensure post ID is present in the URL
    if (!postId) {
        postContainer.innerHTML = "<p>Post ID not found in the URL.</p>";
        return;
    }

    loadPost(postId, userName, postContainer);
});

// Fetch and display a single blog post
async function loadPost(postId, userName, container) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`);
        const { data: post } = await response.json();

        if (!response.ok || !post) throw new Error("Failed to load the post.");

        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${post.id}`;
        injectMetaDescription(post);

        container.innerHTML = `
            <article class="post-detail">
                <h1>${sanitize(post.title)}</h1>
                <img src="${sanitize(post.media?.url || 'https://via.placeholder.com/800x400')}"
                alt="${sanitize(post.media?.alt || 'Image for ' + post.title)}"
                style="width: 100%; max-width: 800px; border-radius: 12px; margin: 1rem 0;" />

                <div class="share-container">
                    <button id="shareButton" aria-label="Copy share link to clipboard" title="Copy link to share this post">🔗 Share</button>
                    <span id="shareStatus" aria-live="polite"></span>
                </div>

                <p class="post-body" style="white-space: pre-line;">${sanitize(post.body)}</p>

                <a href="../post/index.html" class="back-link" aria-label="Go back to post listing" title="Back to all posts">← Back to posts</a>
            </article>
        `;

        setupShareButton(shareUrl);
    } catch (error) {
        console.error("Error loading post:", error);
        container.innerHTML = "<p>Unable to load post. Please try again later.</p>";
    }
}

// Add a dynamic meta description to the page head
function injectMetaDescription(post) {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = post.body?.slice(0, 150).replace(/[\n\r]+/g, " ") || "Read detailed posts about our outdoor clothing from KidGear Outdoors.";
    document.head.appendChild(meta);
}

// Enable "copy to clipboard" share functionality
function setupShareButton(link) {
    const shareButton = document.getElementById("shareButton");
    const shareStatus = document.getElementById("shareStatus");

    if (!shareButton || !shareStatus) return;

    shareButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(link);
            shareStatus.textContent = "Link copied!";
        } catch {
            shareStatus.textContent = "Failed to copy link.";
        }

        setTimeout(() => {
            shareStatus.textContent = "";
        }, 3000);
    });
}

// Basic sanitization to prevent XSS
function sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}
