const form = document.getElementById("form");
const searchInput = document.getElementById("user-input-search");
const resultsBody = document.getElementById("results-body");
const showResult = document.getElementById("result");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 3;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    resultsBody.innerHTML = "";

    const response = await fetch("http://localhost:3000/searchUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: searchInput.value })
    });

    const result = await response.json();

    if (result.error) {
        showResult.innerHTML = `Error: ${result.error}`;
        return;
    }

    result.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${row.user_id}</td><td>${row.user_name}</td>`;
        resultsBody.appendChild(tr);
    });

    // success: UNION injection dumped password column (passwords in DB are 'pass' / 'passs')
    const leaked = result.some(row => row.user_name === "pass" || row.user_name === "passs");

    if (leaked) {
        showResult.innerHTML = "You extracted password data! SQL injection successful!";

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
