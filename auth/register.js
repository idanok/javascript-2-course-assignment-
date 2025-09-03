// Get references to the registration form and its input fields
const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Set accessible labels
function setAria(el, label, title) {
  if (el) {
    el.setAttribute("aria-label", label);
    el.setAttribute("title", title);
  }
}

// Navigate to a given URL
function redirectTo(url) {
  window.location.href = url;
}

// Header links
setupLink("homeLink", "Go to homepage", "Home", "../index.html");
setupLink("loginLink", "Go to login page", "Login", "login.html");
setupLink("signUpLink", "Reload registration page", "Register", "register.html", true);

// Validate input fields
function validateRegistrationInputs() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    alert("All fields are required.");
    return null;
  }

  if (!email.endsWith("@stud.noroff.no")) {
    alert("Please use a valid stud.noroff.no email.");
    return null;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return null;
  }

  return { name, email, password };
}

// Send registration request
async function registerUser(userData) {
  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || "Registration failed.");
    }

    alert("Registration successful! You can now log in.");
    redirectTo("login.html");
  } catch (error) {
    console.error("Registration error:", error);
    alert("Registration failed: " + error.message);
  }
}

// Apply ARIA labels
setAria(nameInput, "Username", "Enter your desired username");
setAria(emailInput, "Email address", "Use your stud.noroff.no email");
setAria(passwordInput, "Password", "Create a password");

// Handle form submission
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userData = validateRegistrationInputs();
    if (userData) {
      await registerUser(userData);
    }
  });
}

// Set up links with accessibility and optional reload
function setupLink(id, label, title, href, reloadIfSame = false) {
  const link = document.getElementById(id);
  if (!link) return;

  setAria(link, label, title);
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (reloadIfSame && window.location.pathname.endsWith(href)) {
      window.location.reload();
    } else {
      redirectTo(href);
    }
  });
}
