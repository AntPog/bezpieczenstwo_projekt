const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 6;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

// Override alert before rendering user input — if XSS fires, this catches it
window.alert = function() {
    markSuccess();
};

async function markSuccess() {
    document.getElementById("result").innerText = "XSS successful! JavaScript executed!";

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

// Reflect URL param into the page via innerHTML — intentionally vulnerable
const params = new URLSearchParams(window.location.search);
const query = params.get("q") || "";
if (query) {
    document.getElementById("output").innerHTML = `Search results for: <b>${query}</b>`;
}
