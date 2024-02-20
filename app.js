const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// PostgreSQL Configuration
const pool = new Pool({
    connectionString: 'postgres://lc_users_user:2GHGiOpXHJpTZnwkqJ4FJj1lsdlvbSHN@dpg-cn8sdav109ks739qt9j0-a.singapore-postgres.render.com/lc_users',
    ssl: {
        rejectUnauthorized: false // Temporary solution to bypass SSL/TLS requirement (not recommended for production)
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const client = await pool.connect();
        
        // Check if email already exists
        const existingUser = await client.query('SELECT * FROM user WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            client.release();
            console.log("Email already exists");
            return res.status(400).send({ message: 'Email already exists' });
        }

        // If email does not exist, proceed with registration
        const result = await client.query('INSERT INTO user (email, password) VALUES ($1, $2)', [email, password]);
        client.release();
        console.log("User registered successfully!");
        res.redirect('/');
    } catch (error) {
        console.error("Error registering user:", error); // Log the specific error
        res.status(500).send(`Error registering user: ${error.message}`); // Send the error message to the client
    }
});



// Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
