// Get necessary data from localStorage and URL
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
const postId = new URLSearchParams(window.location.search).get("id");

// Block access if user is not logged in or post ID is missing
if (!token || !userName || !postId) {
    alert("You must be logged in and have a valid post ID to edit.");
    location.href = "../account/login.html";
}

// Setup event listeners after the DOM has loaded
document.addEventListener("DOMContentLoaded", () => {
    setupLogoutLink();
    setupAccessibility();
    loadPost();
    setupFormSubmit();
    setupDeleteButton(); // assumed to be defined elsewhere
});

// Set accessible labels and titles
function setAria(id, label, title) {
    const el = document.getElementById(id);
    if (el) {
        el.setAttribute("aria-label", label);
        el.setAttribute("title", title);
    }
}

function setupAccessibility() {
    setAria("title", "Post title", "Edit the title");
    setAria("body", "Post content", "Edit the content");
    setAria("imageUrl", "Image URL", "Update image URL");
    setAria("imageAlt", "Image description", "Update image description");
}

// Load existing post data into the form
async function loadPost() {
    try {
        const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`);
        const { data } = await res.json();

        if (!res.ok) throw new Error("Failed to fetch post.");

        document.getElementById("title").value = data.title || "";
        document.getElementById("body").value = data.body || "";
        document.getElementById("imageUrl").value = data.media?.url || "";
        document.getElementById("imageAlt").value = data.media?.alt || "";
    } catch (err) {
        document.getElementById("errorMessage").textContent = err.message;
    }
}

// Handle form submission and update the post
function setupFormSubmit() {
    const form = document.getElementById("editPostForm");
    form?.addEventListener("submit", async (e) => {
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

// Replace login/signup with a logout link
function setupLogoutLink() {
    const headerRight = document.getElementById("headerRight");
    document.getElementById("loginLink")?.remove();
    document.getElementById("signUpLink")?.remove();
    document.getElementById("divider")?.remove();

    const logout = document.createElement("a");
    logout.href = "#";
    logout.textContent = "Log Out";
    logout.setAttribute("aria-label", "Log out and return to login page");
    logout.setAttribute("title", "Log out");
    logout.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        location.href = "../account/login.html";
    });

    headerRight?.appendChild(logout);
}
