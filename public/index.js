const form = document.getElementById("form");
const userPass = document.getElementById("user-input-password");
const userName = document.getElementById("user-input-username");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    if (event.submitter.value === "login"){
        const response = await fetch("http://localhost:3000/login", {
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
        localStorage.setItem("user_name", result.user[0].user_name);
        localStorage.setItem("user_id", result.user[0].user_id);
        window.location.href = "/mainpage.html";
    } else {
        document.getElementById("log").innerText = "Invalid login";
    }
    
    }

    if (event.submitter.value === "register"){
    window.location.href = "/register.html";

    }
    
});

