
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors());  // Allow requests from any origin

// Create MySQL connection
const db = mysql.createConnection({
    host: '13.56.236.2',  // Your EC2 instance IP or domain
    user: 'seda',         // MySQL user
    password: 'seda2024',  // MySQL password
    database: 'inspection_db' // Database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('MySQL Connected...');
});

// Endpoint to retrieve all inspection items
app.get('/items', (req, res) => {
    const sql = 'SELECT * FROM inspection_items';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving items:', err.message);
            res.status(500).json({ error: 'Error retrieving items' });
            return;
        }
        res.json(results);
    });
});

// Endpoint to add a new inspection item
app.post('/add-item', (req, res) => {
    const item = req.body;
    const sql = 'INSERT INTO inspection_items SET ?';
    db.query(sql, item, (err, result) => {
        if (err) {
            console.error('Error adding item:', err.message);
            res.status(500).json({ error: 'Error adding item' });
            return;
        }
        res.send('Item added successfully');
    });
});

// Endpoint to sync IndexedDB data
app.post('/sync', (req, res) => {
    const items = req.body.items; // Expecting an array of items from IndexedDB

    // Insert each item into the database
    items.forEach(item => {
        const sql = 'INSERT INTO inspection_items SET ?';
        db.query(sql, item, (err, result) => {
            if (err) {
                console.error('Error syncing item:', err.message);
            }
        });
    });

    res.send('Sync completed successfully');
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
