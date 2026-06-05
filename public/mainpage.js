
const button  = document.getElementById("excercises");

async function loadUsers() {
    const response = await fetch("http://localhost:3000/leaderboard");
    const users = await response.json();

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; 
    console.log(users);

    users.forEach(user => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.user_name}</td>
            <td>${user.points}</td>
        `;

        tbody.appendChild(row);
    });
}

loadUsers();

const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

document.getElementById("reset-btn").addEventListener("click", async () => {
    if (!confirm("Reset the database to its initial state? All progress and registered users will be lost.")) return;

    const res = await fetch("http://localhost:3000/resetDB", { method: "POST" });
    const result = await res.json();

    if (result.success) {
        localStorage.clear();
        alert("Database reset. You will be logged out.");
        window.location.href = "/";
    } else {
        alert("Reset failed: " + result.error);
    }
});

