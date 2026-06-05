const form = document.getElementById("form");
const givenComment = document.getElementById("user-input-comment");
const table = document.getElementById("comments_body");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 4;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

async function getComments() {
    const response = await fetch("http://localhost:3000/getComments");
    const comments = await response.json();

    comments.forEach(comment => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><h3>${comment.user_name}</h3> <h4>${comment.comment}</h4></td>
        `;
        table.appendChild(row);
    })
}

getComments();


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const comment = givenComment.value;
    if (!comment) return;

    await fetch("http://localhost:3000/postComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, comment })
    });

    givenComment.value = "";
    table.innerHTML = "";
    await getComments();

    if (comment.includes("<") && comment.includes(">")) {
        const showResult = document.getElementById("result");
        showResult.innerHTML = "HTML injection successful!";

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
})