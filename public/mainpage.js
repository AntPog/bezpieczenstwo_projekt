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
console.log(user);

document.getElementById("username").innerText = `Hello ${user}`;