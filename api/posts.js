// posts.js
import { buildUserPostCard, renderEmptyState } from './postHelpers.js';

// Get login info from localStorage
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");

if (!token || !userName) {
    alert("You must be logged in to access this page.");
    window.location.href = "../account/login.html";
    throw new Error("Access denied. User not authenticated.");
}

// Ensure the user has a social profile
async function ensureProfileExists() {
  try {
    const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${userName}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      // Profile already exists
      return;
    }

    // If profile not found, create one
    await fetch(`https://v2.api.noroff.dev/social/profiles/${userName}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        avatar: {
          url: "https://via.placeholder.com/150",
          alt: `${userName}'s avatar`
        }
      })
    });

    console.log("✅ Created social profile for", userName);
  } catch (err) {
    console.error("Failed to ensure profile:", err);
  }
}

// Initialize DOM actions
document.addEventListener("DOMContentLoaded", async () => {
    initHeaderLinks();
    initCreateButton();
    initViewUsersButton();
    initSearch();

    await ensureProfileExists(); // 🔥 NEW: make sure profile exists

    fetchPublicPosts();
    fetchPrivatePosts();
});

// Header 
const initHeaderLinks = () => {
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
        window.location.href = "../account/login.html";
    });

    if (headerRight) headerRight.appendChild(logoutLink);
};

// create post button
const initCreateButton = () => {
    const createBtn = document.getElementById("createPostBtn");
    if (!createBtn) return;

    createBtn.setAttribute("aria-label", "Create a new blog post");
    createBtn.setAttribute("title", "New Post");
    createBtn.addEventListener("click", () => window.location.href = "../post/create.html");
};

// view users button
const initViewUsersButton = () => {
    const viewUsersBtn = document.getElementById('viewUsersBtn');
    if (!viewUsersBtn) return;

    viewUsersBtn.addEventListener("click", () => window.location.href = "../social/users.html");
};

// search bar
const initSearch = () => {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", e => {
      const query = e.target.value.toLowerCase();
      const filtered = (window.allPosts || []).filter(post =>
          post.title.toLowerCase().includes(query) ||
          post.body?.toLowerCase().includes(query)
      );

      const postGrid = document.getElementById("postGrid");
      postGrid.innerHTML = "";

      if (!filtered.length) {
          postGrid.innerHTML = "<p>No posts found.</p>";
          return;
      }

      filtered.forEach(post => postGrid.appendChild(buildUserPostCard(post)));
  });
};

// fetch posts
const fetchPublicPosts = async () => {
    try {
        const res = await fetch("https://v2.api.noroff.dev/blog/posts/idanok");
        const { data: posts } = await res.json();

        if (posts?.length) {
            window.allPosts = posts;
            renderPosts(posts);
        } else {
            renderEmptyState("No public posts found.");
        }
    } catch (err) {
        console.error("Failed to fetch public posts:", err);
        renderEmptyState("Unable to load public posts.");
    }
};

const fetchPrivatePosts = async () => {
  const postGrid = document.getElementById("postGrid");
  try {
      const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}`, {
          headers: { Authorization: `Bearer ${token}` }
      });

      const { data: posts } = await res.json();

      if (!posts?.length) return;

      posts
          .sort((a, b) => new Date(b.created) - new Date(a.created))
          .slice(0, 12)
          .forEach(post => postGrid.appendChild(buildUserPostCard(post)));
  } catch (err) {
      console.error("Failed to fetch private posts:", err);
      postGrid.innerHTML = "<p>Error loading your posts.</p>";
  }
};

// render posts 
const renderPosts = posts => {
    const postGrid = document.getElementById("postGrid");
    postGrid.innerHTML = "";

    if (!posts.length) {
        renderEmptyState("No blog posts found.");
        return;
    }

    posts.forEach(post => postGrid.appendChild(buildUserPostCard(post)));
};

