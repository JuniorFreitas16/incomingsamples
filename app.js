const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: '13.56.236.2',
    user: 'seda',
    password: 'seda2024',
    database: 'inspection_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

app.get('/items', (req, res) => {
    const sql = 'SELECT * FROM inspection_items';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/add-item', (req, res) => {
    const item = req.body;
    const sql = 'INSERT INTO inspection_items SET ?';
    db.query(sql, item, (err, result) => {
        if (err) throw err;
        res.send('Item added...');
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
