import { buildUserPostCard, renderEmptyState } from './postHelpers.js';

// Get login info + API key from localStorage
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const apiKey = localStorage.getItem("noroffApiKey");

if (!token || !userName) {
  alert("You must be logged in to access this page.");
  window.location.href = "../account/login.html";
  throw new Error("Access denied. User not authenticated.");
}

// Ensure the user has a social profile
async function ensureProfileExists() {
  try {
    const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${userName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      console.log("✅ Profile already exists for", userName);
      return;
    }

    if (res.status === 404) {
      // profile not found, create it
      const createRes = await fetch(`https://v2.api.noroff.dev/social/profiles/${userName}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          avatar: {
            url: "https://via.placeholder.com/150",
            alt: `${userName}'s avatar`
          }
        })
      });

      if (!createRes.ok) throw new Error("Failed to create profile");
      console.log("✅ Created social profile for", userName);
    } else {
      throw new Error(`Error fetching profile: ${res.status}`);
    }
  } catch (err) {
    console.error("Failed to ensure profile:", err);
  }
}

ensureProfileExists();

// Initialize DOM actions
document.addEventListener("DOMContentLoaded", async () => {
  initHeaderLinks();
  initCreateButton();
  initViewUsersButton();
  initSearch();

  await ensureProfileExists();

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

// fetch public posts
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

// fetch private posts
const fetchPrivatePosts = async () => {
  const postGrid = document.getElementById("postGrid");
  try {
    const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey
      }
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

