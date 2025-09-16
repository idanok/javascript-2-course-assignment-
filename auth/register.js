// Import functions from auth.js module
import { registerUser, setAria, redirectTo } from './auth.js';

// Get references to form and input fields
const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Set ARIA labels for accessibility
setAria(nameInput, "Username", "Enter your desired username");
setAria(emailInput, "Email address", "Use your stud.noroff.no email");
setAria(passwordInput, "Password", "Create a password");

/**
 * Validate registration form inputs
 * @returns {Object|null} Returns object with name, email, password or null if invalid
 */
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

async function handleFormSubmit(e) {
  e.preventDefault();
  const userData = validateRegistrationInputs();
  if (!userData) return;

  try {
    const data = await registerUser(userData);

    // Immediately create the social profile
    await fetch(`https://v2.api.noroff.dev/social/profiles/${data.data.name}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${data.data.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        avatar: { url: "https://via.placeholder.com/150", alt: `${data.data.name}'s avatar` }
      })
    });

    // Store login info
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("userName", data.data.name);

    alert("Registration successful! You are now logged in.");
    redirectTo("posts.html");

  } catch (error) {
    alert("Registration failed: " + error.message);
  }
}


// Attach the handler to form submission
if (form) {
  form.addEventListener("submit", handleFormSubmit);
}

