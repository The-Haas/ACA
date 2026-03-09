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

        // Regex validações
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

        // Verifica duplicidade
        const check = await db.query(
            `SELECT email, cpf, telefone
             FROM clientes
             WHERE email = $1 OR cpf = $2 OR telefone = $3`,
            [email, cpf, telefone]
        );

        if (check.rows.length > 0) {

            const cliente = check.rows[0];

            if (cliente.email === email) {
                return {
                    success: false,
                    message: 'Email já está em uso.'
                };
            }

            if (cliente.cpf === cpf) {
                return {
                    success: false,
                    message: 'CPF já está cadastrado.'
                };
            }

            if (cliente.telefone === telefone) {
                return {
                    success: false,
                    message: 'Telefone já está cadastrado.'
                };
            }
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

async function putCliente(id, dados) {

    let {
        nome,
        email,
        telefone,
        cpf
    } = dados;

    try {

        const regexNome = /^[A-Za-zÀ-ÿ\s]{3,}$/;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

        // valida nome
        if (!nome || !regexNome.test(nome)) {
            return {
                success: false,
                message: 'Nome inválido.'
            };
        }

        // valida email
        if (!email || !regexEmail.test(email)) {
            return {
                success: false,
                message: 'Email inválido.'
            };
        }

        // valida telefone
        if (!telefone || !regexTelefone.test(telefone)) {
            return {
                success: false,
                message: 'Telefone inválido.'
            };
        }

        // valida CPF
        if (!cpf || !validarCPF(cpf)) {
            return {
                success: false,
                message: 'CPF inválido.'
            };
        }

        // verifica se cliente existe
        const clienteCheck = await db.query(
            'SELECT id FROM clientes WHERE id = $1',
            [id]
        );

        if (clienteCheck.rows.length === 0) {
            return {
                success: false,
                message: 'Cliente não encontrado.'
            };
        }

        // 🔎 verifica duplicidade de email, cpf ou telefone
        const duplicadoCheck = await db.query(
            `SELECT id, email, cpf, telefone
             FROM clientes
             WHERE (email = $1 OR cpf = $2 OR telefone = $3)
             AND id != $4`,
            [email, cpf, telefone, id]
        );

        if (duplicadoCheck.rows.length > 0) {

            const cliente = duplicadoCheck.rows[0];

            if (cliente.email === email) {
                return {
                    success: false,
                    message: "Email já está em uso."
                };
            }

            if (cliente.cpf === cpf) {
                return {
                    success: false,
                    message: "CPF já está cadastrado."
                };
            }

            if (cliente.telefone === telefone) {
                return {
                    success: false,
                    message: "Telefone já está cadastrado."
                };
            }
        }

        const result = await db.query(
            `UPDATE clientes
             SET nome = $1,
                 email = $2,
                 telefone = $3,
                 cpf = $4
             WHERE id = $5
             RETURNING id, nome, email, telefone, cpf`,
            [
                nome,
                email.toLowerCase(),
                telefone,
                cpf,
                id
            ]
        );

        return {
            success: true,
            message: 'Cliente atualizado com sucesso.',
            cliente: result.rows[0]
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: 'Erro ao atualizar cliente.',
            error: error.message
        };
    }
}


async function deleteCliente(id) {

    try {

        const result = await db.query(
            `DELETE FROM clientes
            WHERE id = $1
            RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Cliente não encontrado."
            };
        }

        return {
            success: true,
            message: "Cliente deletado com sucesso."
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: "Erro ao deletar cliente.",
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
    getClientes,
    putCliente,
    deleteCliente
};