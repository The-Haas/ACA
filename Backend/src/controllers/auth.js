const authService = require('../services/auth');

async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            success: false,
            message: "Email e senha são obrigatórios"
        });
    }

    const result = await authService.login(email, senha);

    if (!result.success) {
        return res.status(401).json(result);
    }

    return res.status(200).json(result);
}

module.exports = {
    login
};