const form = document.getElementById("form");
const idInput = document.getElementById("user-input-id");
const profileDiv = document.getElementById("profile");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 7;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const requestedId = idInput.value;

    const response = await fetch(`http://localhost:3000/getUser?user_id=${requestedId}`);
    const result = await response.json();

    if (!result) {
        profileDiv.innerHTML = "User not found.";
        return;
    }

    profileDiv.innerHTML = `
        <p><b>User ID:</b> ${result.user_id}</p>
        <p><b>Username:</b> ${result.user_name}</p>
        <p><b>Password:</b> ${result.password}</p>
    `;

    // success: viewed a different user's data
    if (String(result.user_id) !== String(user_id)) {
        document.getElementById("result").innerText = "IDOR successful! You accessed another user's data.";

        const responseCheck = await fetch("http://localhost:3000/checkSuccessExcercise", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, ex_id: EX_ID })
        });
        const resultCheck = await responseCheck.json();
        if (resultCheck.length > 0) return;

        await fetch("http://localhost:3000/successExcercise", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, ex_id: EX_ID })
        });
    }
});
