const db = require('../config');

// CREATE
async function postCategoriaServico(dados) {

    const { nome } = dados;

    try {

        if (!nome || nome.trim().length < 2) {
            return {
                success: false,
                message: "Nome da categoria inválido."
            };
        }

        // verifica duplicidade
        const existe = await db.query(
            `SELECT id FROM categoria_servicos WHERE nome = $1`,
            [nome]
        );

        if (existe.rows.length > 0) {
            return {
                success: false,
                message: "Categoria já cadastrada."
            };
        }

        const result = await db.query(
            `INSERT INTO categoria_servicos (nome)
             VALUES ($1)
             RETURNING id, nome`,
            [nome]
        );

        return {
            success: true,
            message: "Categoria de serviço criada com sucesso",
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao criar categoria de serviço",
            error: error.message
        };
    }
}

// GET ALL
async function getCategoriasServico() {

    try {

        const result = await db.query(`
            SELECT id, nome
            FROM categoria_servicos
            ORDER BY id ASC
        `);

        return {
            success: true,
            categorias: result.rows
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar categorias de serviço",
            error: error.message
        };
    }
}

// GET BY ID
async function getCategoriaServicoById(id) {

    try {

        const result = await db.query(`
            SELECT id, nome
            FROM categoria_servicos
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Categoria de serviço não encontrada"
            };
        }

        return {
            success: true,
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar categoria de serviço",
            error: error.message
        };
    }
}

// UPDATE
async function putCategoriaServico(id, dados) {

    const { nome } = dados;

    try {

        if (!nome || nome.trim().length < 2) {
            return {
                success: false,
                message: "Nome inválido."
            };
        }

        // verifica se existe
        const existe = await db.query(
            `SELECT id FROM categoria_servicos WHERE id = $1`,
            [id]
        );

        if (existe.rows.length === 0) {
            return {
                success: false,
                message: "Categoria não encontrada"
            };
        }

        // verifica duplicidade
        const duplicado = await db.query(
            `SELECT id FROM categoria_servicos 
             WHERE nome = $1 AND id <> $2`,
            [nome, id]
        );

        if (duplicado.rows.length > 0) {
            return {
                success: false,
                message: "Já existe uma categoria com esse nome"
            };
        }

        const result = await db.query(
            `UPDATE categoria_servicos
             SET nome = $1
             WHERE id = $2
             RETURNING id, nome`,
            [nome, id]
        );

        return {
            success: true,
            message: "Categoria atualizada com sucesso",
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao atualizar categoria de serviço",
            error: error.message
        };
    }
}

// DELETE
async function deleteCategoriaServico(id) {

    try {

        const existe = await db.query(
            `SELECT id FROM categoria_servicos WHERE id = $1`,
            [id]
        );

        if (existe.rows.length === 0) {
            return {
                success: false,
                message: "Categoria não encontrada"
            };
        }

        await db.query(
            `DELETE FROM categoria_servicos WHERE id = $1`,
            [id]
        );

        return {
            success: true,
            message: "Categoria de serviço deletada com sucesso"
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao deletar categoria de serviço",
            error: error.message
        };
    }
}

module.exports = {
    postCategoriaServico,
    getCategoriasServico,
    getCategoriaServicoById,
    putCategoriaServico,
    deleteCategoriaServico
};