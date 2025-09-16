// Check for login
const token = localStorage.getItem("accessToken");
const userName = localStorage.getItem("userName");

if (!token || !userName) {
    alert("You must be logged in to access this page.");
    window.location.href = "../account/login.html";
    throw new Error("Access denied. User not authenticated.");
}

/**
 * Initializes the header by removing login/signup links
 * and adding a logout link for authenticated users.
 * Clicking logout clears localStorage and redirects to login page.
 */
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

/**
 * Populates the profile page with user data.
 *
 * @param {Object} userProfile - Object containing user profile information.
 * @param {string} userProfile.name - Full name of the user.
 * @param {string} userProfile.username - Username/handle of the user.
 * @param {string} userProfile.email - Email address of the user.
 * @param {string} userProfile.location - Location of the user.
 * @param {string} userProfile.joined - Join date of the user.
 * @param {string} userProfile.bio - Biography or description of the user.
 * @param {string} userProfile.image - URL to the profile image.
 * @param {Object} userProfile.social - Social media links.
 * @param {string} userProfile.social.instagram - Instagram link.
 * @param {string} userProfile.social.facebook - Facebook link.
 * @param {string} userProfile.social.twitter - Twitter link.
 */
const loadUserProfile = (userProfile) => {
    document.getElementById("profileName").textContent = userProfile.name;
    document.getElementById("profileUsername").textContent = `@${userProfile.username}`;
    document.getElementById("profileBio").textContent = userProfile.bio;
    document.getElementById("profileEmail").textContent = userProfile.email;
    document.getElementById("profileLocation").textContent = userProfile.location;
    document.getElementById("profileJoined").textContent = userProfile.joined;

    const profileImg = document.getElementById("profileImage");
    profileImg.src = userProfile.image;
    profileImg.alt = userProfile.name;

    document.getElementById("profileInstagram").href = userProfile.social.instagram;
    document.getElementById("profileFacebook").href = userProfile.social.facebook;
    document.getElementById("profileTwitter").href = userProfile.social.twitter;
};

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initHeaderLinks();

    const userProfile = {
        name: "Ida Nøkland",
        username: "idanok",
        email: "idanoe0019511@stud.noroff.no",
        location: "Lyngdal, Norway",
        joined: "August 2025",
        bio: "Hi, I'm a 24-year-old student and proud mom of one wonderful daughter. I love staying active, working out, and exploring new ways to keep life exciting. On Lively, I share my thoughts, experiences, and everyday life updates — from personal reflections to adventures and moments that matter.",
        image: "../img/profile.jpeg",
        social: {
            instagram: "#",
            facebook: "#",
            twitter: "#"
        }
    };

    loadUserProfile(userProfile);
});
