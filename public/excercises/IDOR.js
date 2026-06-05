const form = document.getElementById("form");
const givenID = document.getElementById("user-input-target_id");
const showResult = document.getElementById("result");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 7;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let flag = false;

    const response = await fetch("http://localhost:3000/getProfile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            target_id: givenID.value
        })
    });

    const result = await response.json();

    if (result.length > 0) {
        const profile = result[0];
        showResult.innerHTML = `Profile found: <b>${profile.user_name}</b> <br> Secret data: ${profile.secret_data}`;

        if (profile.user_id === 1 && user_id != 1) {
            flag = true;
            showResult.innerHTML += `<br><br><span style="color: green;">Admin profile breached!</span>`;
        }
    } else {
        showResult.innerHTML = `User profile not found.`;
    }

    if (flag) {
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
    }
});