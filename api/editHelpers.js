/**
 * Sanitize string to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export const sanitize = str => {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
};

// Set ARIA label and title for an element
export const setAria = (id, label, title) => {
    const el = document.getElementById(id);
    if (el) {
        el.setAttribute("aria-label", label);
        el.setAttribute("title", title);
    }
};

// Setup logout link in header
export const setupLogoutLink = () => {
    const headerRight = document.getElementById("headerRight");
    if (!headerRight) return;

    ["loginLink", "signUpLink", "divider"].forEach(id => {
        document.getElementById(id)?.remove();
    });

    const logout = document.createElement("a");
    logout.href = "#";
    logout.textContent = "Log Out";
    logout.classList.add("hover:underline", "font-semibold");
    logout.setAttribute("aria-label", "Log out and return to login page");
    logout.setAttribute("title", "Log out");

    logout.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        location.href = "../account/login.html";
    });

    headerRight.appendChild(logout);
};

// Setup accessibility for form inputs
export const setupAccessibility = () => {
    setAria("title", "Post title", "Edit the title");
    setAria("body", "Post content", "Edit the content");
    setAria("imageUrl", "Image URL", "Update image URL");
    setAria("imageAlt", "Image description", "Update image description");
};

