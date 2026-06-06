const user_id = localStorage.getItem("user_id");
const EX_ID = 14; 

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const announcement = document.getElementById("announcement").value;
    const preview = document.getElementById("announcement-preview");
    const result = document.getElementById("result");

    preview.innerHTML = `
        <section>
            <h3>Important announcement</h3>
            <div>${announcement}</div>
        </section>
    `;

    if (announcement.includes("<form") || announcement.includes("<input")) {
        result.innerText = "FLAG{html_injection_3}";

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