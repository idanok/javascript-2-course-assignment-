// Sanitize a string to prevent XSS attacks
export const sanitize = str => {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
};

// Inject a meta description into the document head for SEO
export const injectMetaDescription = post => {
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = post.body?.slice(0, 150).replace(/[\n\r]+/g, " ") || "Read personal posts on Lifely.";
    document.head.appendChild(meta);
};

/**
 * Setup the share button to copy the post link to clipboard.
 * Updates status text on success or failure.
 *
 * @param {string} link - The URL to copy when the button is clicked.
 */
export const setupShareButton = link => {
    const btn = document.getElementById("shareButton");
    const status = document.getElementById("shareStatus");
    if (!btn || !status) return;

    btn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(link);
            status.textContent = "Link copied!";
        } catch {
            status.textContent = "Failed to copy link.";
        }
        setTimeout(() => status.textContent = "", 3000);
    });
};

// Initialize the logout link in the header, replacing login/signup
export const initHeaderLinks = () => {
    const headerRight = document.getElementById("headerRight");
    if (!headerRight) return;
    headerRight.innerHTML = "";

    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.textContent = "Log Out";
    logoutLink.title = "Log out";
    logoutLink.setAttribute("aria-label", "Log out and return to login page");
    logoutLink.classList.add("hover:underline", "font-semibold");

    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        window.location.href = "../account/login.html";
    });

    headerRight.appendChild(logoutLink);
};
