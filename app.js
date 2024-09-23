const express = require('express');
const mysql = require('mysql');
//const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
//app.use(cors());  // Allow requests from any origin

// Create MySQL connection
const db = mysql.createConnection({
    host: '15.229.8.24',  // Your EC2 instance IP or domain
    user: 'seda',         // MySQL user
    password: 'Seda@2024',  // MySQL password
    database: 'inspection_db' // Database name
    //port: 3306, //porta MySql
    //connectTimeout: 10000 // 10 segundos de timeout
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

// Endpoint to update the status of an inspection item, including finishTime handling
app.post('/update-status/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // Query to get the current status of the item
    const getStatusSql = 'SELECT status FROM inspection_items WHERE id = ?';
    db.query(getStatusSql, [id], (err, result) => {
        if (err) {
            console.error('Error fetching status:', err.message);
            return res.status(500).json({ error: 'Error fetching status' });
        }

        const currentStatus = result[0].status;

        // Define valid transitions
        const validTransitions = {
            'Pending': ['In Progress', 'Rejected'],
            'In Progress': ['Completed'],
            'Completed': [],
            'Rejected': []
        };

        // Check if the new status is valid
        if (!validTransitions[currentStatus].includes(status)) {
            return res.status(400).json({ error: `Invalid status transition from ${currentStatus} to ${status}` });
        }

        // Set finishTime if the new status is Completed or Rejected
        let finishTime = null;
        if (status === 'Completed' || status === 'Rejected') {
            finishTime = new Date(); // Set finishTime to current date/time
        }

        // Update the status and finishTime in the database
        const updateStatusSql = 'UPDATE inspection_items SET status = ?, finishTime = ? WHERE id = ?';
        db.query(updateStatusSql, [status, finishTime, id], (err, result) => {
            if (err) {
                console.error('Error updating status:', err.message);
                return res.status(500).json({ error: 'Error updating status' });
            }

            res.send('Status and finishTime updated successfully');
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
