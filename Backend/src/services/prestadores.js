const db = require('../config');
const bcrypt = require('bcrypt');

async function postPrestador(dados) {

    let {
        cnpj,
        razao_social,
        nome_fantasia,
        email,
        senha,
        telefone,
        categorias_guincho = [],
        categorias_servico = []
    } = dados;

    try {

        // limpa CNPJ (remove máscara)
        const cnpjLimpo = cnpj.replace(/\D/g, '');

        // REGEX
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]).{8,}$/;

        // valida CNPJ REAL
        if (!cnpj || !validarCNPJ(cnpj)) {
            return {
                success: false,
                message: 'CNPJ inválido.'
            };
        }

        // valida razão social
        if (!razao_social || razao_social.length < 3) {
            return {
                success: false,
                message: 'Razão social inválida.'
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

        // valida senha
        if (!senha || !regexSenha.test(senha)) {
            return {
                success: false,
                message: 'Senha fraca. Deve conter 8 caracteres, 1 maiúscula, 1 número e 1 especial.'
            };
        }

        // valida categorias
        if (!Array.isArray(categorias_guincho) || categorias_guincho.length === 0) {
            return {
                success: false,
                message: 'Informe ao menos uma categoria de guincho.'
            };
        }

        if (!Array.isArray(categorias_servico) || categorias_servico.length === 0) {
            return {
                success: false,
                message: 'Informe ao menos uma categoria de serviço.'
            };
        }

        // 🔎 verifica duplicidade
        const check = await db.query(
            `SELECT email, cnpj, telefone
             FROM prestadores
             WHERE email = $1 OR cnpj = $2 OR telefone = $3`,
            [email, cnpjLimpo, telefone]
        );

        if (check.rows.length > 0) {

            const prestador = check.rows[0];

            if (prestador.email === email) {
                return { success: false, message: 'Email já está em uso.' };
            }

            if (prestador.cnpj === cnpjLimpo) {
                return { success: false, message: 'CNPJ já está cadastrado.' };
            }

            if (prestador.telefone === telefone) {
                return { success: false, message: 'Telefone já está cadastrado.' };
            }
        }

        // 🔐 hash senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 🧾 insert prestador
        const result = await db.query(
            `INSERT INTO prestadores
            (cnpj, razao_social, nome_fantasia, email, senha, telefone)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
            [
                cnpjLimpo,
                razao_social,
                nome_fantasia,
                email.toLowerCase(),
                hashedPassword,
                telefone
            ]
        );

        const idPrestador = result.rows[0].id;

        // 🚚 insert guinchos
        for (const idCategoria of categorias_guincho) {
            await db.query(
                `INSERT INTO prestador_guinchos (id_prestador, id_categoria_guincho)
                 VALUES ($1, $2)`,
                [idPrestador, idCategoria]
            );
        }

        // 🛠️ insert serviços
        for (const idCategoria of categorias_servico) {
            await db.query(
                `INSERT INTO prestador_servicos (id_prestador, id_categoria_servico)
                 VALUES ($1, $2)`,
                [idPrestador, idCategoria]
            );
        }

        return {
            success: true,
            message: 'Prestador criado com sucesso.',
            id_prestador: idPrestador
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: 'Erro ao cadastrar prestador.',
            error: error.message
        };
    }
}


// ✅ FUNÇÃO DE VALIDAÇÃO REAL DE CNPJ
function validarCNPJ(cnpj) {

    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14) return false;

    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);

    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);

    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado != digitos.charAt(1)) return false;

    return true;
}

async function getPrestador() {
    try {

        const result = await db.query(`
            SELECT 
                p.id,
                p.cnpj,
                p.razao_social,
                p.nome_fantasia,
                p.email,
                p.telefone,

                COALESCE(
                    ARRAY_AGG(DISTINCT cg.nome) 
                    FILTER (WHERE cg.id IS NOT NULL), '{}'
                ) AS categorias_guincho,

                COALESCE(
                    ARRAY_AGG(DISTINCT cs.nome) 
                    FILTER (WHERE cs.id IS NOT NULL), '{}'
                ) AS categorias_servico

            FROM prestadores p

            LEFT JOIN prestador_guinchos pg 
                ON pg.id_prestador = p.id

            LEFT JOIN categoria_guincho cg
                ON cg.id = pg.id_categoria_guincho

            LEFT JOIN prestador_servicos ps 
                ON ps.id_prestador = p.id

            LEFT JOIN categoria_servicos cs  -- ✅ AQUI ESTÁ A CORREÇÃO
                ON cs.id = ps.id_categoria_servico

            GROUP BY p.id
            ORDER BY p.id ASC
        `);

        return {
            success: true,
            prestadores: result.rows
        };

    } catch (error) {

        console.error('Erro ao buscar prestadores:', error);

        return {
            success: false,
            message: 'Erro ao buscar prestadores.',
            error: error.message
        };
    }
}

async function getPrestadorById(id) {
    try {

        const result = await db.query(`
            SELECT 
                p.id,
                p.cnpj,
                p.razao_social,
                p.nome_fantasia,
                p.email,
                p.telefone,

                COALESCE(
                    ARRAY_AGG(DISTINCT cg.nome) 
                    FILTER (WHERE cg.id IS NOT NULL), '{}'
                ) AS categorias_guincho,

                COALESCE(
                    ARRAY_AGG(DISTINCT cs.nome) 
                    FILTER (WHERE cs.id IS NOT NULL), '{}'
                ) AS categorias_servico

            FROM prestadores p

            LEFT JOIN prestador_guinchos pg 
                ON pg.id_prestador = p.id

            LEFT JOIN categoria_guincho cg
                ON cg.id = pg.id_categoria_guincho

            LEFT JOIN prestador_servicos ps 
                ON ps.id_prestador = p.id

            LEFT JOIN categoria_servicos cs  -- ✅ corrigido
                ON cs.id = ps.id_categoria_servico

            WHERE p.id = $1
            GROUP BY p.id
        `, [id]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: 'Prestador não encontrado.'
            };
        }

        return {
            success: true,
            prestador: result.rows[0]
        };

    } catch (error) {

        console.error('Erro ao buscar prestador:', error);

        return {
            success: false,
            message: 'Erro ao buscar prestador.',
            error: error.message
        };
    }
}

async function putPrestador(id, dados) {

    let {
        cnpj,
        razao_social,
        nome_fantasia,
        email,
        telefone
    } = dados;

    try {

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

        const cnpjLimpo = cnpj.replace(/\D/g, '');
        const emailNormalizado = email.toLowerCase();

        // valida razão social
        if (!razao_social || razao_social.length < 3) {
            return {
                success: false,
                message: 'Razão social inválida.'
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

        // valida CNPJ
        if (!cnpj || !validarCNPJ(cnpj)) {
            return {
                success: false,
                message: 'CNPJ inválido.'
            };
        }

        // verifica se existe
        const prestadorCheck = await db.query(
            'SELECT id FROM prestadores WHERE id = $1',
            [id]
        );

        if (prestadorCheck.rows.length === 0) {
            return {
                success: false,
                message: 'Prestador não encontrado.'
            };
        }

        // 🔎 DUPLICIDADE (igual ao cliente)
        const duplicadoCheck = await db.query(
            `SELECT id, email, cnpj, telefone
             FROM prestadores
             WHERE (email = $1 OR cnpj = $2 OR telefone = $3)
             AND id != $4`,
            [emailNormalizado, cnpjLimpo, telefone, id]
        );

        if (duplicadoCheck.rows.length > 0) {

            const prestador = duplicadoCheck.rows[0];

            if (prestador.email === emailNormalizado) {
                return {
                    success: false,
                    message: "Email já está em uso."
                };
            }

            if (prestador.cnpj === cnpjLimpo) {
                return {
                    success: false,
                    message: "CNPJ já cadastrado."
                };
            }

            if (prestador.telefone === telefone) {
                return {
                    success: false,
                    message: "Telefone já cadastrado."
                };
            }
        }

        // ✏️ UPDATE
        const result = await db.query(
            `UPDATE prestadores
             SET cnpj = $1,
                 razao_social = $2,
                 nome_fantasia = $3,
                 email = $4,
                 telefone = $5
             WHERE id = $6
             RETURNING id, cnpj, razao_social, nome_fantasia, email, telefone`,
            [
                cnpjLimpo,
                razao_social,
                nome_fantasia,
                emailNormalizado,
                telefone,
                id
            ]
        );

        return {
            success: true,
            message: 'Prestador atualizado com sucesso.',
            prestador: result.rows[0]
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: 'Erro ao atualizar prestador.',
            error: error.message
        };
    }
}

async function deletePrestador(id) {

    try {

        // verifica se existe
        const check = await db.query(
            'SELECT id FROM prestadores WHERE id = $1',
            [id]
        );

        if (check.rows.length === 0) {
            return {
                success: false,
                message: 'Prestador não encontrado.'
            };
        }

        // ⚠️ exemplo de validação (caso tenha serviços vinculados futuramente)
        // const vinculo = await db.query(
        //     'SELECT id FROM servicos WHERE id_prestador = $1 LIMIT 1',
        //     [id]
        // );

        // if (vinculo.rows.length > 0) {
        //     return {
        //         success: false,
        //         message: 'Não é possível excluir. Prestador possui serviços vinculados.'
        //     };
        // }

        // 🧹 remove vínculos primeiro (boa prática)
        await db.query(
            'DELETE FROM prestador_guinchos WHERE id_prestador = $1',
            [id]
        );

        await db.query(
            'DELETE FROM prestador_servicos WHERE id_prestador = $1',
            [id]
        );

        // 🗑️ deleta prestador
        await db.query(
            'DELETE FROM prestadores WHERE id = $1',
            [id]
        );

        return {
            success: true,
            message: 'Prestador deletado com sucesso.'
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            message: 'Erro ao deletar prestador.',
            error: error.message
        };
    }
}

module.exports = {
    postPrestador,
    getPrestador,
    getPrestadorById,
    putPrestador,
    deletePrestador
};