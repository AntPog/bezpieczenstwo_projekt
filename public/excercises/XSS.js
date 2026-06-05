const form = document.getElementById("form");
const givenQuery = document.getElementById("user-input-query");
const showResult = document.getElementById("result");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 6;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

window.completeTask = async function() {
    const responseCheck = await fetch("http://localhost:3000/checkSuccessExcercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id,
            ex_id: EX_ID
        })
    });

    const resultCheck = await responseCheck.json();

    if (resultCheck.length > 0) {
        showResult.innerHTML += `<br>Task already completed.`;
        return;
    }

    await fetch("http://localhost:3000/successExcercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id,
            ex_id: EX_ID
        })
    });

    showResult.innerHTML += `<br><span style="color: green;">Congratulations! Point granted.</span>`;
};

form.addEventListener("submit", (event) => {
    event.preventDefault();
    showResult.innerHTML = `You searched for: ${givenQuery.value}`;
});