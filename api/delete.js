/**
 * Sets up the delete button functionality for a blog post.
 * When the button is clicked, it asks for confirmation and attempts to delete the post via the API.
 * If deletion is successful, the user is redirected to the posts page.
 * If an error occurs, it is displayed in the error message container.
 *
 * @param {string} userName - The username of the post owner.
 * @param {string} postId - The ID of the post to delete.
 * @param {string} token - The authentication token for the API.
 */
function setupDeleteButton(userName, postId, token) {
    const btn = document.getElementById("deletePostBtn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        // Confirm before deleting
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            // Send DELETE request to API
            const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            // Handle errors
            if (!res.ok) {
                const { errors } = await res.json();
                throw new Error(errors?.[0]?.message || "Failed to delete post.");
            }

            alert("Post deleted.");
            location.href = "../social/posts.html";
        } catch (err) {
            // Show error message in DOM
            document.getElementById("errorMessage").textContent = err.message;
        }
    });
}
