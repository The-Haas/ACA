const db = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

async function login(email, senha) {
    const client = await db.pool.connect();

    try {
        // busca cliente
        const cliente = await client.query(
            `SELECT id, email, senha FROM clientes WHERE email = $1`,
            [email]
        );

        if (cliente.rows.length > 0) {
            const user = cliente.rows[0];

            const senhaValida = await bcrypt.compare(senha, user.senha);

            if (!senhaValida) {
                return { success: false, message: "Email ou Senha inválida" };
            }

            const token = jwt.sign(
                { id: user.id, tipo: "cliente" },
                SECRET,
                { expiresIn: "1d" }
            );

            return { success: true, token };
        }

        // busca prestador
        const prestador = await client.query(
            `SELECT id, email, senha FROM prestadores WHERE email = $1`,
            [email]
        );

        if (prestador.rows.length > 0) {
            const user = prestador.rows[0];
            const senhaValida = await bcrypt.compare(senha, user.senha);

            if (!senhaValida) {
                return { success: false, message: "Email ou Senha inválida" };
            }

            const token = jwt.sign(
                { id: user.id, tipo: "prestador" },
                SECRET,
                { expiresIn: "1d" }
            );

            return { success: true, token };
        }

        return { success: false, message: "Usuário não encontrado" };

    } catch (error) {
        return { success: false, message: "Erro no login", error };
    } finally {
        client.release();
    }
}

module.exports = {
    login
};