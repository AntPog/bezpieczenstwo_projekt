document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const ip = document.getElementById("ip").value;

    const response = await fetch("/ping", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ip })
    });

    const data = await response.json();

    document.getElementById("result").textContent = data.output;
});