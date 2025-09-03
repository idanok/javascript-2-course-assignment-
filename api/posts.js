// Check for login
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");

if (!token || !userName) {
    alert("You must be logged in to access this page.");
    window.location.href = "/account/login.html";
    throw new Error("Access denied. User not authenticated.");
}

document.addEventListener("DOMContentLoaded", () => {
    initHeaderLinks();
    initCreateButton();
    fetchPublicPosts();
    fetchPrivatePosts();
    initSearch();
});

// Replace login/signup with logout in header
function initHeaderLinks() {
    const headerRight = document.getElementById("headerRight");
    ["loginLink", "signUpLink", "divider"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Log Out";
    logoutLink.title = "Log out";
    logoutLink.setAttribute("aria-label", "Log out and return to login page");

    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        window.location.href = "/account/login.html";
    });

    if (headerRight) headerRight.appendChild(logoutLink);
}

// New Post button setup
function initCreateButton() {
    const createBtn = document.getElementById("createPostBtn");
    if (createBtn) {
        createBtn.setAttribute("aria-label", "Create a new blog post");
        createBtn.setAttribute("title", "New Post");
        createBtn.addEventListener("click", () => {
            window.location.href = "../post/create.html";
        });
    }
}

// Render multiple posts (public view)
function renderPosts(posts) {
    const postGrid = document.getElementById("postGrid");
    postGrid.innerHTML = "";

    if (!posts.length) {
        renderEmptyState("No blog posts found.");
        return;
    }

    posts.forEach(post => {
        const a = document.createElement("a");
        a.href = `post/view.html?id=${post.id}`;
        a.className = "post-thumb";
        a.setAttribute("aria-label", `View post titled ${post.title}`);
        a.setAttribute("title", `View post: ${post.title}`);
        a.innerHTML = `
            <img 
                src="${post.media?.url || 'https://via.placeholder.com/300x200'}" 
                alt="${post.media?.alt || post.title}" 
                width="300" height="400" 
                loading="lazy" />
            <h3>${post.title}</h3>
            <p>${post.body?.slice(0, 80)}...</p>
        `;
        postGrid.appendChild(a);
    });
}

// Message for empty post list
function renderEmptyState(message) {
    document.getElementById("postGrid").innerHTML = `<p>${message}</p>`;
}

// Set dynamic meta description for SEO
function injectMeta(post) {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = `Latest post: ${post.title} — ${post.body?.slice(0, 120).replace(/[\n\r]+/g, " ")}...`;
    document.head.appendChild(meta);
}

// Public posts for search and display
async function fetchPublicPosts() {
    try {
        const response = await fetch("https://v2.api.noroff.dev/blog/posts/idaNokk");
        const { data: posts } = await response.json();

        if (posts?.length) {
            injectMeta(posts[0]);
            window.allPosts = posts;
            renderPosts(posts);
        } else {
            renderEmptyState("No public posts found.");
        }
    } catch (error) {
        console.error("Failed to fetch public posts:", error);
        renderEmptyState("Unable to load public posts.");
    }
}

// Search handler
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = (window.allPosts || []).filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.body?.toLowerCase().includes(query)
        );
        renderPosts(filtered);
    });
}

// Private posts with edit/view options
async function fetchPrivatePosts() {
    const postGrid = document.getElementById("postGrid");

    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const { data: posts } = await response.json();

        if (!posts?.length) {
            postGrid.innerHTML = "<p>No posts found.</p>";
            return;
        }

        const latestPosts = posts
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .slice(0, 12);

        postGrid.innerHTML = "";
        latestPosts.forEach(post => {
            postGrid.appendChild(buildUserPostCard(post));
        });
    } catch (error) {
        console.error("Failed to fetch user posts:", error);
        postGrid.innerHTML = "<p>Error loading your posts.</p>";
    }
}

// Build a user post card with edit/view buttons
function buildUserPostCard(post) {
    const div = document.createElement("div");
    div.className = "post-thumb";
    div.innerHTML = `
        <img 
            src="${post.media?.url || 'https://via.placeholder.com/300x200'}" 
            alt="${post.media?.alt || post.title}" 
            width="300" height="200"
            loading="lazy"
            style="object-fit: cover; width: 100%; height: auto;" 
        />
        <h3>${post.title}</h3>
        <p>${post.body?.slice(0, 80)}...</p>
        <div class="thumb-buttons">
            <a href="../post/view.html?id=${post.id}" class="btn-view" title="View post: ${post.title}" aria-label="View post titled ${post.title}">View</a>
            <a href="../post/edit.html?id=${post.id}" class="btn-edit" title="Edit post: ${post.title}" aria-label="Edit post titled ${post.title}">Edit</a>
        </div>
    `;
    return div;
}