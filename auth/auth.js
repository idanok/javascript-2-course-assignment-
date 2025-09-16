// auth.js
export async function loginUser(email, password) {
    try {
        const response = await fetch("https://v2.api.noroff.dev/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0]?.message || "Login failed.");
        }

        return data; // data.data.accessToken & data.data.name
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}


/**
 * Registers a new user using the Noroff API.
 */
export async function registerUser(userData) {
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || "Registration failed.");
    }

    return data;
}
