const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" });
        }

        req.user = user; // 🔥 aqui fica { id, tipo }
        next();
    });
}

function apenasCliente(req, res, next) {
    if (req.user.tipo !== 'cliente') {
        return res.status(403).json({ message: "Acesso permitido apenas para clientes" });
    }

    next();
}

function apenasPrestador(req, res, next) {
    if (req.user.tipo !== 'prestador') {
        return res.status(403).json({ message: "Acesso permitido apenas para prestadores" });
    }

    next();
}

module.exports = {
    autenticarToken,
    apenasCliente,
    apenasPrestador
};