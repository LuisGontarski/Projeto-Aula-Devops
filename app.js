const express = require('express');
const axios = require('axios');
const db = require('./db'); // Importar a conexão com o banco de dados
const app = express();

// Middleware para analisar JSON no corpo da requisição
app.use(express.json());

// URL da Azure Function e Microsserviço
const AZURE_FUNCTION_URL = 'https://7n2b14zsc7.execute-api.us-east-2.amazonaws.com/lambda';
const MICROSERVICE_URL = 'https://crud-croud.internal.wonderfulsmoke-a37fd7b3.australiaeast.azurecontainerapps.io';

// Rota para lidar com requisições de reservas
app.get('/api/reservas', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM reservas'); // Usar a conexão do db.js
        res.json(result.rows); // Use result.rows para obter os dados
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar reservas' });
    }
});

// Rota do BFF para fazer requisições para o microsserviço e Azure Function
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
});
