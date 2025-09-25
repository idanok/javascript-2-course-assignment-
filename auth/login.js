import { loginUser } from './auth.js';

/** @type {HTMLFormElement | null} */
const form = document.getElementById("loginForm");
/** @type {HTMLInputElement | null} */
const emailInput = document.getElementById("email");
/** @type {HTMLInputElement | null} */
const passwordInput = document.getElementById("password");
/** @type {HTMLElement | null} */
const errorMessage = document.getElementById("errorMessage");

function showError(message) {
  if (errorMessage) errorMessage.textContent = message;
}

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

function redirectTo(url) {
  window.location.href = url;
}

/**
 * Save token with timestamp to manage expiry
 * @param {string} token
 * @param {string} userName
 */
function saveToken(token, userName) {
  localStorage.setItem("accessToken", token);
  localStorage.setItem("userName", userName);
  localStorage.setItem("tokenIssuedAt", Date.now().toString());

  // Save your Noroff API key here
  localStorage.setItem("noroffApiKey", "9bf57d38-6cd1-4262-8347-12fa9c21a579");
}

/**
 * Check if token is still valid (15 min)
 * @returns {boolean}
 */
export function isTokenValid() {
  const token = localStorage.getItem("accessToken");
  const issuedAt = parseInt(localStorage.getItem("tokenIssuedAt") || "0");
  const expiresIn = 15 * 60 * 1000; // 15 minutes
  if (!token) return false;
  return (Date.now() - issuedAt) < expiresIn;
}

// Handle form submit
if (form) {
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

      // Save token & username right here
      saveToken(data.data.accessToken, data.data.name);

      alert("Login successful!");
      redirectTo("../social/posts.html");
    } catch (error) {
      console.error("Login error:", error);
      showError(error.message || "An unexpected error occurred.");
    }
  });
}
