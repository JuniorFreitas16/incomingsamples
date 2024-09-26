const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');

const app = express();
app.use(bodyParser.json());
app.use(helmet());
const corsOptions = {
    origin: 'https://juniorfreitas16.github.io',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'seda',
    password: 'Seda@2024',
    database: 'inspection_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1);
    }
    console.log('MySQL Connected...');
});

// Endpoint para recuperar todos os itens de inspeção
app.get('/items', (req, res) => {
    const sql = 'SELECT * FROM inspection_items';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving items:', err.message);
            return res.status(500).json({ error: 'Error retrieving items' });
        }
        res.json(results);
    });
});

// Endpoint para adicionar um novo item de inspeção
app.post('/add-item', [
    body('inputData').notEmpty().withMessage('Data e Hora de Envio é obrigatório.'),
    body('inspectionLot').notEmpty().withMessage('Inspection Lot é obrigatório.'),
    body('plantNumber').notEmpty().withMessage('Número da Planta é obrigatório.'),
    body('location').notEmpty().withMessage('Locação é obrigatório.'),
    body('material').notEmpty().withMessage('Material é obrigatório.'),
    body('description').notEmpty().withMessage('Descrição é obrigatória.'),
    body('quantity').isNumeric().withMessage('Quantidade do Lote deve ser um número.'),
    body('samplePlan').optional().isNumeric().withMessage('Plano de Amostra deve ser um número.'),
    body('status').notEmpty().withMessage('Status é obrigatório.'),
    body('iqcCollaborator').notEmpty().withMessage('Colaborador IQC é obrigatório.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const item = req.body;
    const sql = 'INSERT INTO inspection_items SET ?';
    db.query(sql, item, (err, result) => {
        if (err) {
            console.error('Error adding item:', err.message);
            return res.status(500).json({ error: 'Error adding item' });
        }
        res.status(201).send('Item added successfully');
    });
});

// Endpoint para atualizar um item de inspeção
app.put('/update-item/:id', [
    body('status').optional().notEmpty().withMessage('Status não pode estar vazio.'),
    body('finishTime').optional().isISO8601().withMessage('FinishTime deve ser uma data válida.')
], (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const sql = 'UPDATE inspection_items SET ? WHERE id = ?';
    db.query(sql, [req.body, id], (err, result) => {
        if (err) {
            console.error('Error updating item:', err.message);
            return res.status(500).json({ error: 'Error updating item' });
        }
        res.send('Item updated successfully');
    });
});

// Endpoint para sincronizar dados do IndexedDB
/*app.post('/sync', (req, res) => {
    const items = req.body.items;
    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items must be an array' });
    }

    const errors = [];
    items.forEach(item => {
        const sql = 'INSERT INTO inspection_items SET ?';
        db.query(sql, item, (err) => {
            if (err) {
                console.error('Error syncing item:', err.message);
                errors.push({ item, error: err.message });
            }
        });
    });

    if (errors.length) {
        return res.status(500).json({ error: 'Some items failed to sync', details: errors });
    }

    res.send('Sync completed successfully');
});*/

// Inicie o servidor
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
