const express = require("express");
const mariadb = require("mariadb");

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


app.post("/getSQL1", async (req, res) => {
    const { user_id } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();

        const rows = await conn.query(`
            SELECT user_id, SUM(points) as points from excercisesPoints WHERE user_id = ${user_id} GROUP BY user_id
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

        const rows = await conn.query(`
            INSERT INTO excercisesPoints ( user_id, ex_id, points ) VALUES ( ?, ?, 1 )
        `, [user_id, ex_id]);

        res.json(rows);
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

        const rows = await conn.query(`
            SELECT * FROM excercisesPoints WHERE user_id = ${user_id} AND ex_id = ${ex_id}
        `, [user_id, ex_id]);

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


app.listen(3000, () => {
    console.log("Server running on port 3000");
});