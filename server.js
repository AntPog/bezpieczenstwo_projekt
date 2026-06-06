const express = require("express");
const mariadb = require("mariadb");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use((req, res, next) => {
    const payload = JSON.stringify(req.body || {}).toLowerCase();
    
    if (payload.includes("drop ") || payload.includes("truncate ") || payload.includes("delete ")) {
        return res.status(403).json({ error: "Blocked suspicious operation." });
    }
    
    next();
});

const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "projekt"
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            "SELECT * FROM users WHERE user_name = ? AND password = ?",
            [username, password]
        );

        res.json({
            success: rows.length > 0,
            user: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    let conn;

    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            "INSERT INTO users ( user_name, password ) VALUES( ? , ? )",
            [username, password]
        );
        console.log(result.affectedRows);
        console.log(result.insertId);
        res.json({
            success: result.affectedRows > 0,
            user_id: Number(result.insertId)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }


});


app.post("/registerPoints", async (req, res) => {
    const { user_id } = req.body;

    let conn;

    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            "INSERT INTO points ( user_id, points ) VALUES( ? , ? )",
            [user_id, 0]
        );

        res.json({
            success: result.affectedRows > 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }


});


app.get("/leaderboard", async (req, res) => {

    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT u.user_name, SUM( p.points ) as points
            FROM users u
            INNER JOIN excercisesPoints p ON u.user_id = p.user_id
            group by u.user_name
            ORDER BY points DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get("/getExcerciseTypes", async (req, res) => {

    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT * from excerciseTypes
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get("/getComments", async (req, res) => {

    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT u.user_name, c.comment from users u inner join comments c on u.user_id = c.user_id
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/getExcerciseByType", async (req, res) => {
    const { ex_type, user_id } = req.body;

    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT
                e.ex_title,
                COALESCE(u.points, 0) AS points
            FROM excercises e
            LEFT JOIN excercisesPoints u
                ON e.ex_id = u.ex_id
            AND u.user_id = ?
            WHERE e.ex_type = ?
        `, [user_id, ex_type]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});


function hasDangerousSQL(input) {
    return /\b(DROP|TRUNCATE|CREATE|ALTER)\b/i.test(String(input));
}

app.post("/getSQL1", async (req, res) => {
    const { user_id } = req.body;

    if (hasDangerousSQL(user_id)) {
        return res.status(400).json({ error: "Dangerous SQL operation blocked." });
    }

    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT user_id, user_name FROM users WHERE user_id = ${user_id}
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/successExcercise", async (req, res) => {
    const { user_id, ex_id } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

        await conn.query(
            "INSERT INTO excercisesPoints ( user_id, ex_id, points ) VALUES ( ?, ?, 1 )",
            [user_id, ex_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/checkSuccessExcercise", async (req, res) => {
    const { user_id, ex_id } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            "SELECT * FROM excercisesPoints WHERE user_id = ? AND ex_id = ?",
            [user_id, ex_id]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/getProfile", async (req, res) => {
    const { target_id } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            "SELECT user_id, user_name, password as secret_data FROM users WHERE user_id = ?", 
            [target_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get("/showUsers", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT user_id, user_name FROM users");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/postComment", async (req, res) => {
    const { user_id, comment } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            INSERT INTO comments (user_id, comment) VALUES (? ,? )
        `, [user_id, comment]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/updateUsername", async (req, res) => {
    const { user_id, new_username } = req.body;

    if (hasDangerousSQL(new_username) || hasDangerousSQL(user_id)) {
        return res.status(400).json({ error: "Dangerous SQL operation blocked." });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(`
            UPDATE users SET user_name = '${new_username}' WHERE user_id = ${user_id}
        `);
        res.json({ affectedRows: Number(result.affectedRows) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/searchUsers", async (req, res) => {
    const { search } = req.body;

    if (hasDangerousSQL(search)) {
        return res.status(400).json({ error: "Dangerous SQL operation blocked." });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`
            SELECT user_id, user_name FROM users WHERE user_name LIKE '%${search}%'
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/postComment", async (req, res) => {
    const { user_id, comment } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            "INSERT INTO comments (user_id, comment) VALUES (?, ?)",
            [user_id, comment]
        );
        res.json({ success: result.affectedRows > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get("/adminData", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT user_id, user_name, password FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get("/getUser", async (req, res) => {
    const { user_id } = req.query;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(
            "SELECT user_id, user_name, password FROM users WHERE user_id = ?",
            [user_id]
        );
        res.json(rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.get("/readNote", (req, res) => {
    const { file } = req.query;
    const filePath = path.join(__dirname, "public", "notes", file);
    try {
        const content = fs.readFileSync(filePath, "utf8");
        res.json({ content });
    } catch (err) {
        res.status(404).json({ error: "File not found" });
    }
});

app.post("/resetDB", async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        await conn.query("UPDATE users SET user_name = 'admin', password = 'SuperSecretPassword2137' WHERE user_id = 1");
        await conn.query("UPDATE users SET user_name = 'user2', password = 'pass' WHERE user_id = 2");
        await conn.query("UPDATE users SET user_name = 'user3', password = 'pass' WHERE user_id = 3");
        await conn.query("DELETE FROM users WHERE user_id > 3");
        await conn.query("ALTER TABLE users AUTO_INCREMENT = 4");
        await conn.query("DELETE FROM excercisesPoints");
        await conn.query("DELETE FROM comments");
        await conn.query("ALTER TABLE comments AUTO_INCREMENT = 3");
        await conn.query(
            "INSERT INTO comments (user_id, comment) VALUES (1, 'This site is soooo cool :)'), (2, 'idk seems a bit boring')"
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.post("/ping", async (req, res) => {

    const { ip } = req.body;

    exec(`ping -c 1 ${ip}`, (err, stdout, stderr) => {

        let output = err ? (stderr || err.message) : stdout;

        if (ip.includes("whoami")) {
            output += "\n\nFLAG{command_injection_user}";
        }

        if (ip.includes("admin_creds.txt")) {
            output += "\n\nFLAG{command_injection_creds}";
        }

        if (
            ip.includes(" ls") ||
            ip.endsWith(";ls") ||
            ip.includes("find .")
        ) {
            output += "\n\nFLAG{command_injection_listing}";
        }

        res.json({
            output
        });

    });
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});

