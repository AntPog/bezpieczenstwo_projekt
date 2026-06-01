const form = document.getElementById("form");
const userPass = document.getElementById("user-input-password");
const userName = document.getElementById("user-input-username");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    

    const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: userName.value,
            password: userPass.value
        })
    });

    const result = await response.json();

    document.getElementById("log").innerText =
        result.success ? "Logged in" : "Invalid login";
});