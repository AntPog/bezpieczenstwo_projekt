const form = document.getElementById("form");
const givenID = document.getElementById("user-input-user_id");
const showResult = document.getElementById("result");
const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
const EX_ID = 1;

document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;



form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let flag = false;

    const response = await fetch("http://localhost:3000/getSQL1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: givenID.value
        })
    });

    const result = await response.json();
    console.log(result);

    switch(result.length){

        case 1:
            showResult.innerHTML = `Your points: ${result[0].points}`;

            break;

        case 0:
            showResult.innerHTML = `Your points: 0`;
            break;

        default:
            let resultString = "";
            result.forEach(element => {
                resultString = resultString + `Your points: ${element.points} `;
            });
            showResult.innerHTML = resultString;
            flag = true;
    }

    if (flag){

        const responseCheck = await fetch("http://localhost:3000/checkSuccessExcercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id,
            ex_id : EX_ID
        })
    });
        const resultCheck = await responseCheck.json();

        if (resultCheck.length > 0){
            return
        }
        const success = await fetch("http://localhost:3000/successExcercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id,
            ex_id : EX_ID
        })
        });

    }

})