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

    if (result.success) {
        const responsePoints = await fetch("http://localhost:3000/registerPoints", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: result.user_id
            })
        });

        const resultPoints = await responsePoints.json();

        if (resultPoints.success) {

            localStorage.setItem("user_name", userName.value);
            localStorage.setItem("user_id", result.user_id);

            window.location.href = "/mainpage.html";
        }
    }





});