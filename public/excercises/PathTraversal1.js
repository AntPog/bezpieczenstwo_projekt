const form = document.getElementById("form");
const fileInput = document.getElementById("user-input-file");
const fileContent = document.getElementById("file-content");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 9;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const filename = fileInput.value;

    const response = await fetch(`http://localhost:3000/readNote?file=${encodeURIComponent(filename)}`);
    const result = await response.json();

    if (result.error) {
        fileContent.textContent = `Error: ${result.error}`;
        return;
    }

    fileContent.textContent = result.content;

    // success: content contains data from outside the notes directory
    const leaked = result.content.includes("s3cr3t") || result.content.includes("require") || result.content.includes("password:");
    if (leaked) {
        document.getElementById("result").innerText = "Path traversal successful! You read a file outside the notes directory.";

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
