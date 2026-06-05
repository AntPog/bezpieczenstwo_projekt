const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 5;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

// Access check is done client-side — is this secure?
const isAdmin = localStorage.getItem("is_admin") === "true";

if (!isAdmin) {
    document.getElementById("access-denied").hidden = false;
} else {
    document.getElementById("access-denied").hidden = true;
    document.getElementById("admin-panel").hidden = false;
    loadAdminData();
}

async function loadAdminData() {
    const response = await fetch("http://localhost:3000/adminData");
    const users = await response.json();

    const tbody = document.getElementById("users-body");
    users.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${u.user_id}</td><td>${u.user_name}</td><td>${u.password}</td>`;
        tbody.appendChild(tr);
    });

    document.getElementById("result").innerText = "Admin panel unlocked!";

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
