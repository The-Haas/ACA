const db = require('../config');

// CREATE
async function postCategoriaGuincho(dados) {

    const { nome } = dados;

    try {

        if (!nome || nome.trim().length < 2) {
            return {
                success: false,
                message: "Nome da categoria inválido."
            };
        }

        // verifica duplicidade (mesmo não tendo UNIQUE, boa prática)
        const existe = await db.query(
            `SELECT id FROM categoria_guincho WHERE nome = $1`,
            [nome]
        );

        if (existe.rows.length > 0) {
            return {
                success: false,
                message: "Categoria já cadastrada."
            };
        }

        const result = await db.query(
            `INSERT INTO categoria_guincho (nome)
             VALUES ($1)
             RETURNING id, nome`,
            [nome]
        );

        return {
            success: true,
            message: "Categoria de guincho criada com sucesso",
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao criar categoria de guincho",
            error: error.message
        };
    }
}

// GET ALL
async function getCategoriasGuincho() {

    try {

        const result = await db.query(`
            SELECT id, nome
            FROM categoria_guincho
            ORDER BY id ASC
        `);

        return {
            success: true,
            categorias: result.rows
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar categorias de guincho",
            error: error.message
        };
    }
}

// GET BY ID
async function getCategoriaGuinchoById(id) {

    try {

        const result = await db.query(`
            SELECT id, nome
            FROM categoria_guincho
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Categoria de guincho não encontrada"
            };
        }

        return {
            success: true,
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar categoria de guincho",
            error: error.message
        };
    }
}

// UPDATE
async function putCategoriaGuincho(id, dados) {

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
            `SELECT id FROM categoria_guincho WHERE id = $1`,
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
            `SELECT id FROM categoria_guincho 
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
            `UPDATE categoria_guincho
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
            message: "Erro ao atualizar categoria de guincho",
            error: error.message
        };
    }
}

// DELETE
async function deleteCategoriaGuincho(id) {

    try {

        // verifica se existe
        const existe = await db.query(
            `SELECT id FROM categoria_guincho WHERE id = $1`,
            [id]
        );

        if (existe.rows.length === 0) {
            return {
                success: false,
                message: "Categoria não encontrada"
            };
        }

        // 🔒 (opcional) validar vínculo futuro com guinchos
        // se tiver tabela tipo "guinchos", você pode validar aqui

        await db.query(
            `DELETE FROM categoria_guincho WHERE id = $1`,
            [id]
        );

        return {
            success: true,
            message: "Categoria de guincho deletada com sucesso"
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao deletar categoria de guincho",
            error: error.message
        };
    }
}

module.exports = {
    postCategoriaGuincho,
    getCategoriasGuincho,
    getCategoriaGuinchoById,
    putCategoriaGuincho,
    deleteCategoriaGuincho
};