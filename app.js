require('dotenv').config(); // Carregar variáveis de ambiente
const express = require('express');
const cors = require('cors'); // Adicionando CORS
const { Sequelize, DataTypes } = require('sequelize'); // Importando Sequelize
const app = express();
const port = process.env.PORT || 3000;

// Configuração do Sequelize com MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Definir modelo para a tabela inspection_items (Samples)
const Sample = sequelize.define('Sample', {
    inputData: {
        type: DataTypes.DATE,
        allowNull: false
    },
    inspectionLot: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    plantNumber: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    material: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    samplePlan: {
        type: DataTypes.STRING(100)
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    iqcCollaborator: {
        type: DataTypes.STRING(100)
    },
    finishTime: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'inspection_items', // Nome da tabela no banco de dados
    timestamps: false // Se sua tabela não tem createdAt/updatedAt
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

// Testar a conexão ao banco de dados
sequelize.authenticate()
    .then(() => {
        console.log('Conexão ao banco de dados foi estabelecida com sucesso.');
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });

// if using synchronous loading, will be called once the DOM is ready
turnstile.ready(function () {
  turnstile.render("#example-container", {
    sitekey: "<0x4AAAAAAAv2d62QqYjjeUNcmy9jsv9S2Nw>",
    callback: function (token) {
      console.log(`Challenge Success ${token}`);
    },
  });
});


// Sincronizar o modelo com o banco de dados
sequelize.sync();

// Rota para buscar todas as amostras (samples)
app.get('/samples', async (req, res) => {
    try {
        const samples = await Sample.findAll();
        res.json(samples);
    } catch (err) {
        console.error('Erro ao buscar os dados:', err);
        res.status(500).send('Erro ao buscar os dados.');
    }
});

// Rota para adicionar uma nova amostra
app.post('/samples', async (req, res) => {
    try {
        const newSample = req.body;
        if (!newSample || Object.keys(newSample).length === 0) {
            return res.status(400).send('Dados inválidos.');
        }

        const sample = await Sample.create(newSample);
        res.status(201).send('Amostra adicionada com sucesso!');
    } catch (err) {
        console.error('Erro ao adicionar amostra:', err);
        res.status(500).send('Erro ao adicionar amostra.');
    }
});

// Rota para deletar uma amostra por ID
app.delete('/samples/:id', async (req, res) => {
    try {
        const sampleId = req.params.id;
        const result = await Sample.destroy({ where: { id: sampleId } });

        if (result === 0) {
            return res.status(404).send('Amostra não encontrada.');
        }
        res.send('Amostra deletada com sucesso!');
    } catch (err) {
        console.error('Erro ao deletar amostra:', err);
        res.status(500).send('Erro ao deletar a amostra.');
    }
});

// Rota para atualizar uma amostra por ID
app.put('/samples/:id', async (req, res) => {
    try {
        const sampleId = req.params.id;
        const updatedSample = req.body;

        if (!updatedSample || Object.keys(updatedSample).length === 0) {
            return res.status(400).send('Dados inválidos.');
        }

        const result = await Sample.update(updatedSample, { where: { id: sampleId } });

        if (result[0] === 0) {
            return res.status(404).send('Amostra não encontrada.');
        }
        res.send('Amostra atualizada com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar amostra:', err);
        res.status(500).send('Erro ao atualizar amostra.');
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://52.67.36.220:${port}`);
});
