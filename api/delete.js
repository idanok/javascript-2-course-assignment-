// Handles the deletion of the current post after user confirmation
function setupDeleteButton() {
    const btn = document.getElementById("deletePostBtn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`https://v2.api.noroff.dev/blog/posts/${userName}/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const { errors } = await res.json();
                throw new Error(errors?.[0]?.message || "Failed to delete post.");
            }

            alert("Post deleted.");
            location.href = "../social/posts.html";
        } catch (err) {
            document.getElementById("errorMessage").textContent = err.message;
        }
    });
}