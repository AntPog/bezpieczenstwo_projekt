const form = document.getElementById("form");
const givenComment = document.getElementById("user-input-comment");
const table = document.getElementById("comments_body");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 2;

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


})