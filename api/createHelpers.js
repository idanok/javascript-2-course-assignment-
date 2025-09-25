// Redirects user to login page if not authenticated
export function protectPage() {
    const token = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName");

    if (!token || !userName) {
        alert("You must be logged in to create a post.");
        window.location.href = "/account/login.html";
    }
}

// Replaces header content with a Log Out link for logged-in users
export function setupLogoutLink() {
    const headerRight = document.getElementById("headerRight");
    if (!headerRight) return;

    headerRight.innerHTML = "";

    const logout = document.createElement("a");
    logout.href = "#";
    logout.textContent = "Log Out";
    logout.setAttribute("aria-label", "Log out and return to login page");
    logout.setAttribute("title", "Log out");

    logout.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        window.location.href = "/account/login.html";
    });

    headerRight.appendChild(logout);
}

// Sets accessibility attributes on a given element
export function setAria(el, label, title) {
    if (el) {
        el.setAttribute("aria-label", label);
        el.setAttribute("title", title);
    }
}

// Basic input validation for post creation
export function validatePostInput(title, body) {
    if (!title || !body) {
        alert("Title and content are required.");
        return false;
    }
    return true;
}

// Sends POST request to API to create a new blog post
export async function createPost(postData, userName, token) {
    try {
        const response = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || "Failed to create post.");
        }

        alert("Post created successfully!");
        window.location.href = "../social/posts.html"; // redirect to posts
    } catch (error) {
        console.error("Error creating post:", error);
        document.getElementById("errorMessage").textContent = error.message;
    }
}

// Validate URL (basic check)
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Attach submit event listener to form
export function setupCreatePostForm() {
    const form = document.getElementById("createPostForm");
    if (!form) return;

    const titleInput = document.getElementById("title");
    const bodyInput = document.getElementById("body");
    const imageUrlInput = document.getElementById("imageUrl");
    const imageAltInput = document.getElementById("imageAlt");
    const errorMessage = document.getElementById("errorMessage");

    // Accessibility labels
    setAria(titleInput, "Post title", "Enter the title of your post");
    setAria(bodyInput, "Post content", "Enter the content of your post");
    setAria(imageUrlInput, "Image URL", "Optional: URL of the image");
    setAria(imageAltInput, "Image alt text", "Optional: Description for accessibility");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMessage.textContent = "";

        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        let imageUrl = imageUrlInput.value.trim();
        const imageAlt = imageAltInput.value.trim() || title;

        if (!validatePostInput(title, body)) return;

        // Only send media if URL is valid
        const media = isValidUrl(imageUrl) ? { url: imageUrl, alt: imageAlt } : null;

        // Fallback image if URL is invalid or empty
        if (!media) {
            imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
        }

        const postData = {
            title,
            body,
            media: media || { url: imageUrl, alt: imageAlt },
        };

        const token = localStorage.getItem("accessToken");
        const userName = localStorage.getItem("userName");

        await createPost(postData, userName, token);
    });
}
