require('dotenv').config(); // Carregar variáveis de ambiente
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors'); // Adicionando CORS
const app = express();
const port = process.env.PORT || 3000; // Porta definida via variável de ambiente

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Limite de conexões no pool
    queueLimit: 0
});

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsing de JSON
app.use(express.json());

// Middleware para log de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Rota para buscar todas as amostras (samples)
app.get('/samples', (req, res) => {
    const query = 'SELECT * FROM inspection_items';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar os dados:', err);
            return res.status(500).send('Erro ao buscar os dados.');
        }
        res.json(results);
    });
});

// Rota para adicionar uma nova amostra
app.post('/samples', (req, res) => {
    const newSample = req.body;

    if (!newSample || Object.keys(newSample).length === 0) {
        return res.status(400).send('Dados inválidos.');
    }

    const query = `INSERT INTO inspection_items (inputData, inspectionLot, plantNumber, location, material, description, quantity, samplePlan, status, iqcCollaborator, finishTime) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    pool.query(query, [
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
            return res.status(500).send('Erro ao adicionar amostra.');
        }
        res.status(201).send('Amostra adicionada com sucesso!');
    });
});

// Rota para deletar uma amostra por ID
app.delete('/samples/:id', (req, res) => {
    const sampleId = req.params.id;
    const query = 'DELETE FROM inspection_items WHERE id = ?';

    pool.query(query, [sampleId], (err, result) => {
        if (err) {
            console.error('Erro ao deletar amostra:', err);
            return res.status(500).send('Erro ao deletar a amostra.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Amostra não encontrada.');
        }
        res.send('Amostra deletada com sucesso!');
    });
});

// Rota para atualizar uma amostra por ID
app.put('/samples/:id', (req, res) => {
    const sampleId = req.params.id;
    const updatedSample = req.body;

    if (!updatedSample || Object.keys(updatedSample).length === 0) {
        return res.status(400).send('Dados inválidos.');
    }

    const query = `UPDATE inspection_items SET 
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

    pool.query(query, [
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
            return res.status(500).send('Erro ao atualizar amostra.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Amostra não encontrada.');
        }
        res.send('Amostra atualizada com sucesso!');
    });
});

// Finalizar pool ao encerrar a aplicação
process.on('SIGINT', () => {
    pool.end((err) => {
        if (err) {
            console.error('Erro ao encerrar pool de conexões:', err);
        } else {
            console.log('Conexão ao MySQL encerrada.');
        }
        process.exit();
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});