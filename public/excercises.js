const form = document.getElementById("excercises");

const tabsmenu = document.getElementById("tab-menu");
const tabscontent = document.getElementById("tab-content");

const user = localStorage.getItem("user_name");
const user_id = localStorage.getItem("user_id");
document.getElementById("username").innerText = `Hello ${user} (ID: ${user_id})`;

async function loadExc(type, table){
    const user_id = localStorage.getItem("user_id");
    const response = await fetch("http://localhost:3000/getExcerciseByType", {
         method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ex_type: Number(type),
            user_id: Number(user_id)
        })
    });
    const exs = await response.json();
    console.log(exs);
    const tbody = document.createElement("tbody");

    exs.forEach( excercise => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="/excercises/${excercise.ex_title.replace(/\s/g, '')}.html" class="normal-link">${excercise.ex_title}</a></td>
            <td>${excercise.points}</td>
        `;
        tbody.appendChild(row);



    })
    table.appendChild(tbody);


}


async function loadExTypes() {
    const response = await fetch("http://localhost:3000/getExcerciseTypes");
    const types = await response.json();

    console.log(types);        

    types.forEach(type => {

        const table_header = document.createElement("tr");
        const table_column1 = document.createElement("th");
        const table_column2 = document.createElement("th");
        table_column1.innerHTML = "Excercise";
        table_column2.innerHTML = "Points";
        table_header.appendChild( table_column1);
        table_header.appendChild(table_column2);
        const row_content = document.createElement("div");
        const row = document.createElement("button");

        const table = document.createElement("table");

        row.textContent = type.type;
        row.className = "tab";
        row.dataset.tab = type.type.toLowerCase();

        row_content.textContent = type.type;
        row_content.id = `content_${type.type.toLowerCase()}`;
        row_content.className = "tab-content";
        row_content.hidden = true;

        loadExc(type.type_id, table);


        table.appendChild( table_header );
        row_content.appendChild(table);

        row.addEventListener("click", () => {
            const tabId = row.dataset.tab;

            document.querySelectorAll(".tab-content").forEach(panel => {
                panel.hidden = true;
            });

            document.getElementById(`content_${tabId}`).hidden = false;
        });

        tabscontent.appendChild(row_content);
        tabsmenu.appendChild(row);
    });
}

loadExTypes();



