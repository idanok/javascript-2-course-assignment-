// Get references to the login form, input fields, and the error message container
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

// Set accessibility attributes
function setAriaAttributes(el, label, title) {
    if (el) {
        el.setAttribute("aria-label", label);
        el.setAttribute("title", title);
    }
}

// Display error messages
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

// Redirect to a given page
function redirectTo(url) {
    window.location.href = url;
}

// Header links
setupLink("loginLink", "Reload login page", "Login", "/account/login.html", true);
setupLink("signUpLink", "Go to registration page", "Register", "register.html");
setupLink("homeLink", "Go to homepage", "Home", "../index.html");


// Validate user input
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

// Handle login request
async function handleLogin(email, password) {
    try {
        const response = await fetch("https://v2.api.noroff.dev/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || "Login failed.");
        }

        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("userName", data.data.name);

        alert("Login successful!");
        redirectTo("../social/posts.html");
    } catch (error) {
        console.error("Login error:", error);
        showError(error.message || "An unexpected error occurred.");
    }
}

// Apply ARIA labels
setAriaAttributes(form, "User login form", "Login form");
setAriaAttributes(emailInput, "Email address", "Enter your Noroff email");
setAriaAttributes(passwordInput, "Password", "Enter your password");

// Handle form submission
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showError("");
        const credentials = validateInputs();
        if (credentials) {
            await handleLogin(credentials.email, credentials.password);
        }
    });
}

// Set up navigation links
function setupLink(id, label, title, targetUrl, reloadIfSame = false) {
    const link = document.getElementById(id);
    if (!link) return;

    setAriaAttributes(link, label, title);

    link.addEventListener("click", (e) => {
        e.preventDefault();
        if (reloadIfSame && window.location.pathname.endsWith(targetUrl)) {
            window.location.reload();
        } else {
            redirectTo(targetUrl);
        }
    });
}
