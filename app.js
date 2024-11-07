// app.js
const express = require('express');
const app = express();
const pool = require('./db');
app.use(express.json());
// Criar uma nova reserva
app.post('/reservas', async (req, res) => {
    try {
        const { cliente_id, vaga_id, data_reserva, data_inicio, data_fim, status } = req.body;
        const novaReserva = await pool.query(
            `INSERT INTO reservas (cliente_id, vaga_id, data_reserva, data_inicio, data_fim, status) 
       VALUES($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
            [cliente_id, vaga_id, data_reserva, data_inicio, data_fim, status]
        );
        res.json(novaReserva.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao criar a reserva' });
    }
});
// Listar todas as reservas
app.get('/reservas', async (req, res) => {
    try {
        const todasReservas = await pool.query("SELECT * FROM reservas");
        res.json(todasReservas.rows);
    } catch (err) {
        console.error(err.message);
    }
});
// Atualizar uma reserva
app.put('/reservas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente_id, vaga_id, data_reserva, data_inicio, data_fim, status } = req.body;
        const atualizarReserva = await pool.query(
            `UPDATE reservas 
       SET cliente_id = $1, vaga_id = $2, data_reserva = $3, 
           data_inicio = $4, data_fim = $5, status = $6 
       WHERE reserva_id = $7`,
            [cliente_id, vaga_id, data_reserva, data_inicio, data_fim, status, id]
        );
        if (atualizarReserva.rowCount > 0) {
            res.json("Reserva atualizada com sucesso!");
        } else {
            res.status(404).json({ message: "Reserva não encontrada" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erro ao atualizar a reserva" });
    }
});
// Deletar uma reserva
app.delete('/reservas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletarReserva = await pool.query("DELETE FROM reservas WHERE reserva_id = $1", [id]);
        if (deletarReserva.rowCount > 0) {
            res.json("Reserva deletada com sucesso!");
        } else {
            res.status(404).json({ message: "Reserva não encontrada" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erro ao deletar a reserva" });
    }
});
app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
});