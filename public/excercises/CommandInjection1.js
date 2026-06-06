const user_id = localStorage.getItem("user_id");
const EX_ID = 10;

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const ip = document.getElementById("ip").value;

    const response = await fetch("/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip })
    });

    const data = await response.json();
    document.getElementById("result").textContent = data.output;

    if (data.output && data.output.includes("FLAG{command_injection_user}")) {
        const responseCheck = await fetch("/checkSuccessExcercise", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, ex_id: EX_ID })
        });
        const resultCheck = await responseCheck.json();
        if (resultCheck.length > 0) return;

        await fetch("/successExcercise", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, ex_id: EX_ID })
        });
    }
});
