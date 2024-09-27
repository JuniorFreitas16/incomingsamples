require('dotenv').config(); // Para usar variáveis de ambiente
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 3000;

// Conectar ao MySQL usando variáveis de ambiente
const connection = mysql.createConnection({
    host: process.env.DB_HOST || '18.231.225.95',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qmlot_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao MySQL');
});

// Middleware para parsing de JSON
app.use(express.json());

// Rota para buscar todas as amostras (samples)
app.get('/api/samples', (req, res) => {
    const query = 'SELECT * FROM samples';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar os dados:', err);
            res.status(500).send('Erro ao buscar os dados.');
        } else {
            res.json(results);
        }
    });
});

// Rota para adicionar uma nova amostra
app.post('/api/samples', (req, res) => {
    const newSample = req.body;

    if (!newSample || Object.keys(newSample).length === 0) {
        return res.status(400).send('Dados inválidos.');
    }

    const query = `INSERT INTO samples (inputData, inspectionLot, plantNumber, location, material, description, quantity, samplePlan, status, iqcCollaborator, finishTime) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [
        newSample.inputData, 
        newSample.inspectionLot, 
        newSample.plantNumber, 
        newSample.location, 
        newSample.material, 
        newSample.description, 
        newSample.quantity, 
        newSample.samplePlan, 
        newSample.status, 
        newSample.iqcCollaborator, 
        newSample.finishTime
    ], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar amostra:', err);
            res.status(500).send('Erro ao adicionar amostra.');
        } else {
            res.status(201).send('Amostra adicionada com sucesso!');
        }
    });
});

// Rota para deletar uma amostra por ID
app.delete('/api/samples/:id', (req, res) => {
    const sampleId = req.params.id;
    const query = 'DELETE FROM samples WHERE id = ?';

    connection.query(query, [sampleId], (err, result) => {
        if (err) {
            console.error('Erro ao deletar amostra:', err);
            res.status(500).send('Erro ao deletar a amostra.');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Amostra não encontrada.');
        } else {
            res.send('Amostra deletada com sucesso!');
        }
    });
});

// Rota para atualizar uma amostra por ID
app.put('/api/samples/:id', (req, res) => {
    const sampleId = req.params.id;
    const updatedSample = req.body;

    if (!updatedSample || Object.keys(updatedSample).length === 0) {
        return res.status(400).send('Dados inválidos.');
    }

    const query = `UPDATE samples SET 
        inputData = ?, 
        inspectionLot = ?, 
        plantNumber = ?, 
        location = ?, 
        material = ?, 
        description = ?, 
        quantity = ?, 
        samplePlan = ?, 
        status = ?, 
        iqcCollaborator = ?, 
        finishTime = ? 
        WHERE id = ?`;

    connection.query(query, [
        updatedSample.inputData, 
        updatedSample.inspectionLot, 
        updatedSample.plantNumber, 
        updatedSample.location, 
        updatedSample.material, 
        updatedSample.description, 
        updatedSample.quantity, 
        updatedSample.samplePlan, 
        updatedSample.status, 
        updatedSample.iqcCollaborator, 
        updatedSample.finishTime,
        sampleId
    ], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar amostra:', err);
            res.status(500).send('Erro ao atualizar amostra.');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Amostra não encontrada.');
        } else {
            res.send('Amostra atualizada com sucesso!');
        }
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
