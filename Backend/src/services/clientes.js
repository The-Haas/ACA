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

async function getClienteById(id) {
    try {

        const result = await db.query(`
            SELECT 
                id,
                nome,
                cpf,
                email,
                telefone
            FROM clientes
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: 'Cliente não encontrado.'
            };
        }

        return {
            success: true,
            cliente: result.rows[0]
        };

    } catch (error) {

        console.error('Erro ao buscar cliente por ID:', error);

        return {
            success: false,
            message: 'Erro ao buscar cliente.',
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

async function patchCliente(id, dados) {

    try {

        const regexNome = /^[A-Za-zÀ-ÿ\s]{3,}$/;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]).{8,}$/;


        const atual = await db.query(
            'SELECT * FROM clientes WHERE id = $1',
            [id]
        );

        if (atual.rows.length === 0) {
            return {
                success: false,
                message: 'Cliente não encontrado.'
            };
        }

        const clienteAtual = atual.rows[0];


        const nome = dados.nome ?? clienteAtual.nome;
        const email = dados.email ?? clienteAtual.email;
        const telefone = dados.telefone ?? clienteAtual.telefone;
        const cpf = dados.cpf ?? clienteAtual.cpf;
        let senha = dados.senha;

        const emailNormalizado = email.trim().toLowerCase();
        const cpfLimpo = cpf.replace(/\D/g, '');


        if (dados.nome && !regexNome.test(nome)) {
            return { success: false, message: 'Nome inválido.' };
        }

        if (dados.email && !regexEmail.test(emailNormalizado)) {
            return { success: false, message: 'Email inválido.' };
        }

        if (dados.telefone && !regexTelefone.test(telefone)) {
            return { success: false, message: 'Telefone inválido.' };
        }

        if (dados.cpf && !validarCPF(cpfLimpo)) {
            return { success: false, message: 'CPF inválido.' };
        }

        if (dados.senha && !regexSenha.test(senha)) {
            return {
                success: false,
                message: 'Senha deve ter 8 caracteres, 1 maiúscula, 1 número e 1 especial.'
            };
        }


        const duplicadoCheck = await db.query(
            `SELECT id, email, cpf, telefone
             FROM clientes
             WHERE (email = $1 OR cpf = $2 OR telefone = $3)
             AND id != $4`,
            [emailNormalizado, cpfLimpo, telefone, id]
        );

        if (duplicadoCheck.rows.length > 0) {

            const c = duplicadoCheck.rows[0];

            if (dados.email && c.email === emailNormalizado) {
                return { success: false, message: "Email já está em uso." };
            }

            if (dados.cpf && c.cpf === cpfLimpo) {
                return { success: false, message: "CPF já está cadastrado." };
            }

            if (dados.telefone && c.telefone === telefone) {
                return { success: false, message: "Telefone já está cadastrado." };
            }
        }


        let senhaFinal = clienteAtual.senha;

        if (dados.senha) {
            senhaFinal = await bcrypt.hash(senha, 10);
        }


        const result = await db.query(
            `UPDATE clientes
             SET nome = $1,
                 email = $2,
                 telefone = $3,
                 cpf = $4,
                 senha = $5
             WHERE id = $6
             RETURNING id, nome, email, telefone, cpf`,
            [
                nome,
                emailNormalizado,
                telefone,
                cpfLimpo,
                senhaFinal,
                id
            ]
        );

        return {
            success: true,
            message: 'Cliente atualizado parcialmente com sucesso.',
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
    deleteCliente,
    getClienteById,
    patchCliente
};