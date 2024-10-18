const express = require('express');
const axios = require('axios');
const sql = require('mssql');

const app = express();

// Middleware para analisar JSON no corpo da requisição
app.use(express.json());

// Configuração da conexão com o banco de dados SQL
const dbConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true // Mude para 'false' em produção
    }
};

// URLs das APIs
const AZURE_FUNCTION_URL = 'https://7n2b14zsc7.execute-api.us-east-2.amazonaws.com/lambda';
const MICROSERVICE_URL = 'https://crud-croud.internal.wonderfulsmoke-a37fd7b3.australiaeast.azurecontainerapps.io';

// Conectar ao banco de dados
const connectToDb = async () => {
    try {
        await sql.connect(dbConfig);
        console.log('Conectado ao banco de dados');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
};

// Rota para lidar com requisições de reservas
app.get('/api/reservas', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM reservas`;
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        res.status(500).json({ error: 'Erro ao buscar reservas' });
    }
});

// Rota do BFF para agregar dados de microsserviço e Azure Function
app.get('/api/bff', async (req, res) => {
    try {
        // Requisição para o microsserviço
        const microserviceResponse = await axios.get(`${MICROSERVICE_URL}/reservas`);

        // Requisição para a Azure Function
        const azureFunctionResponse = await axios.get(AZURE_FUNCTION_URL);

        // Resposta agregada para o frontend
        const responseData = {
            reservas: microserviceResponse.data,
            functionData: azureFunctionResponse.data
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Erro no BFF:', error);
        res.status(500).json({ error: 'Erro ao agregar dados do BFF' });
    }
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BFF rodando na porta ${PORT}`);
    connectToDb();  // Conectar ao banco de dados quando iniciar o servidor
});
