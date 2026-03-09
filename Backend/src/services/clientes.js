const db = require('../config');
const bcrypt = require('bcrypt');

async function postCliente(dados) {

    const {
        nome,
        email,
        senha,
        telefone,
        cpf
    } = dados;

    try {

        // Regex validações - nome, email, telefone e senha
        const regexNome = /^[A-Za-zÀ-ÿ\s]{3,}$/;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]).{8,}$/;

        // Valida nome
        if (!nome || !regexNome.test(nome)) {
            return {
                success: false,
                message: 'Nome inválido.'
            };
        }

        // Valida email
        if (!email || !regexEmail.test(email)) {
            return {
                success: false,
                message: 'Email inválido.'
            };
        }

        // Valida telefone
        if (!telefone || !regexTelefone.test(telefone)) {
            return {
                success: false,
                message: 'Telefone inválido.'
            };
        }

        // Valida CPF
        if (!cpf || !validarCPF(cpf)) {
            return {
                success: false,
                message: 'CPF inválido.'
            };
        }

        // Valida senha
        if (!senha || !regexSenha.test(senha)) {
            return {
                success: false,
                message: 'A senha deve ter pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial.'
            };
        }

        // Verifica se email já existe
        const emailCheck = await db.query(
            'SELECT id FROM clientes WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return {
                success: false,
                message: 'Email já está em uso.'
            };
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Insert no banco
        const result = await db.query(
            `INSERT INTO clientes
            (nome, cpf, email, telefone, senha)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [
                nome,
                cpf,
                email,
                telefone,
                hashedPassword
            ]
        );

        return {
            success: true,
            message: 'Cliente criado com sucesso.',
            id_cliente: result.rows[0].id
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: 'Erro ao cadastrar cliente.',
            error: error.message
        };
    }
}

async function getClientes() {
    try {

        const result = await db.query(`
            SELECT 
                id,
                nome,
                cpf,
                email,
                telefone
            FROM clientes
            ORDER BY id ASC
        `);

        return {
            success: true,
            clientes: result.rows
        };

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);

        return {
            success: false,
            message: 'Erro ao buscar clientes.',
            error: error.message
        };
    }
}

// Função para validar CPF usada na função postCliente
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11)
        resto = 0;

    if (resto !== parseInt(cpf.substring(9, 10)))
        return false;

    soma = 0;

    for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11)
        resto = 0;

    if (resto !== parseInt(cpf.substring(10, 11)))
        return false;

    return true;
}

module.exports = {
    postCliente,
    getClientes
};