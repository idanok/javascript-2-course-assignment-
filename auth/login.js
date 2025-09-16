// login.js
import { loginUser } from './auth.js';

// Get login info from localStorage
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");
/**
 * @type {HTMLFormElement | null}
 */
const form = document.getElementById("loginForm");
/**
 * @type {HTMLInputElement | null}
 */
const emailInput = document.getElementById("email");
/**
 * @type {HTMLInputElement | null}
 */
const passwordInput = document.getElementById("password");
/**
 * @type {HTMLElement | null}
 */
const errorMessage = document.getElementById("errorMessage");

/**
 * Displays an error message in the errorMessage element.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    if (errorMessage) errorMessage.textContent = message;
}

/**
 * Validates the email and password inputs.
 * @returns {{ email: string, password: string } | null} - Returns an object with email and password if valid, otherwise null.
 */
function validateInputs() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showError("Both email and password are required.");
        return null;
    }

    if (!email.endsWith("@stud.noroff.no")) {
        showError("Please use your stud.noroff.no email.");
        return null;
    }

    return { email, password };
}

/**
 * Redirects the user to the specified URL.
 * @param {string} url - The URL to redirect to.
 */
function redirectTo(url) {
    window.location.href = url;
}

if (form) {
    /**
     * Handles form submission for login.
     * @param {Event} e - The form submit event.
     */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showError("");
        const credentials = validateInputs();
        if (!credentials) return;

        try {
            /**
             * @type {{ data: { accessToken: string, name: string } }}
             */
            const data = await loginUser(credentials.email, credentials.password);

            // Store both accessToken and userName
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("userName", data.data.name);

            alert("Login successful!");
            redirectTo("../social/posts.html");
        } catch (error) {
            console.error("Login error:", error);
            showError(error.message || "An unexpected error occurred.");
        }
    });
}
