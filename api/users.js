// users.js
import { protectPage, setupLogoutLink } from "./usersHelpers.js";

// ✅ Block page if not logged in
protectPage();

// ✅ Replace header links with logout if logged in
setupLogoutLink();

// DOMContentLoaded ensures DOM elements exist
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");

  const usersGrid = document.getElementById("usersGrid");
  const errorMessage = document.getElementById("errorMessage");
  const searchInput = document.getElementById("searchUsers");

  let allUsers = [];

  // ------------------------
  // Fetch all users
  // ------------------------
  async function fetchUsers() {
    try {
      const res = await fetch("https://v2.api.noroff.dev/social/profiles", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch users. Status: ${res.status}`);
      }

      const { data: users } = await res.json();
      allUsers = users; // save for search filter
      renderUsers(users);
    } catch (err) {
      console.error("Fetch error:", err);
      if (errorMessage) errorMessage.textContent = `Error fetching users: ${err.message}`;
    }
  }

  // ------------------------
  // Render user cards
  // ------------------------
  function renderUsers(users) {
    if (!usersGrid) return;

    usersGrid.innerHTML = "";

    if (!users.length) {
      usersGrid.innerHTML = `<p class="col-span-full text-center text-gray-600">No users found.</p>`;
      return;
    }

    users.forEach(user => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-md p-4 flex flex-col justify-between";

      card.innerHTML = `
        <div class="flex items-center gap-4 mb-4">
          <img src="${user.avatar?.url || "https://via.placeholder.com/80"}" 
               alt="${user.avatar?.alt || user.name}" 
               class="w-16 h-16 rounded-full object-cover border" />
          <div>
            <h2 class="font-bold text-lg text-[#455F7D]">${user.name}</h2>
            <p class="text-sm text-gray-600">@${user.email}</p>
          </div>
        </div>
        <div class="flex gap-2 mt-auto">
          <a href="../social/profile.html?name=${user.name}"
             class="bg-[#455F7D] hover:bg-[#374c62] text-white text-sm font-semibold py-1.5 px-3 rounded transition">
             View Profile
          </a>
          <button data-user="${user.name}" 
             class="followBtn bg-[#F28C8C] hover:bg-[#e06b6b] text-white text-sm font-semibold py-1.5 px-3 rounded transition">
             Follow
          </button>
        </div>
      `;

      usersGrid.appendChild(card);
    });

    setupFollowButtons();
  }

  // ------------------------
  // Setup follow buttons
  // ------------------------
  function setupFollowButtons() {
    const buttons = document.querySelectorAll(".followBtn");

    buttons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const targetUser = btn.dataset.user;

        try {
          const res = await fetch(`https://v2.api.noroff.dev/social/profiles/${targetUser}/follow`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Failed to follow user.");

          btn.textContent = "Following";
          btn.disabled = true;
          btn.classList.replace("bg-[#F28C8C]", "bg-green-500");
        } catch (err) {
          console.error(err);
          if (errorMessage) errorMessage.textContent = err.message;
        }
      });
    });
  }

  // ------------------------
  // Search filter
  // ------------------------
  function filterUsers(query) {
    const filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    renderUsers(filtered);
  }

  // ------------------------
  // Event listeners
  // ------------------------
  if (searchInput) {
    searchInput.addEventListener("input", e => filterUsers(e.target.value));
  }

  // Initial fetch
  fetchUsers();
});
