const form = document.getElementById("form");
const tokenInput = document.getElementById("user-input-token");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 8;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

// TODO: remove this before going to production!!
const SECRET_TOKEN = "opensesame";

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (tokenInput.value === SECRET_TOKEN) {
        document.getElementById("vault-content").hidden = false;
        document.getElementById("result").innerText = "Access granted! You found the token in the source code.";

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
    } else {
        document.getElementById("result").innerText = "Wrong token. Hint: check the page source.";
    }
});
