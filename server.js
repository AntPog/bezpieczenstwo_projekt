const express = require("express");
const mariadb = require("mariadb");

const app = express();

app.use(express.json());
app.use(express.static("public"));

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

        const rows = await conn.query(
            "INSERT INTO users ( user_id, user_name, password ) VALUES( '2', ? , ? )",
            [username, password]
        );

        res.json({
            success: rows.length > 0
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
            SELECT u.user_name, p.points
            FROM users u
            INNER JOIN points p ON u.user_id = p.user_id
            ORDER BY p.points DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});