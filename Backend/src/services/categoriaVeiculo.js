const db = require('../config');

// CREATE
async function postCategoria(dados) {

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
            `SELECT id FROM categoria_veiculo WHERE nome = $1`,
            [nome]
        );

        if (existe.rows.length > 0) {
            return {
                success: false,
                message: "Categoria já cadastrada."
            };
        }

        const result = await db.query(
            `INSERT INTO categoria_veiculo (nome)
             VALUES ($1)
             RETURNING id, nome`,
            [nome]
        );

        return {
            success: true,
            message: "Categoria criada com sucesso",
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao criar categoria",
            error: error.message
        };
    }
}

// GET ALL
async function getCategorias() {

    try {

        const result = await db.query(`
            SELECT id, nome
            FROM categoria_veiculo
            ORDER BY id ASC
        `);

        return {
            success: true,
            categorias: result.rows
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar categorias",
            error: error.message
        };
    }
}

// GET BY ID
async function getCategoriaById(id) {

    try {

        const result = await db.query(`
            SELECT id, nome
            FROM categoria_veiculo
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Categoria não encontrada"
            };
        }

        return {
            success: true,
            categoria: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar categoria",
            error: error.message
        };
    }
}

// UPDATE
async function putCategoria(id, dados) {

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
            `SELECT id FROM categoria_veiculo WHERE id = $1`,
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
            `SELECT id FROM categoria_veiculo 
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
            `UPDATE categoria_veiculo
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
            message: "Erro ao atualizar categoria",
            error: error.message
        };
    }
}

// DELETE
async function deleteCategoria(id) {

    try {

        // verifica se existe
        const existe = await db.query(
            `SELECT id FROM categoria_veiculo WHERE id = $1`,
            [id]
        );

        if (existe.rows.length === 0) {
            return {
                success: false,
                message: "Categoria não encontrada"
            };
        }

        // 🔒 valida se está sendo usada em veículos
        const vinculada = await db.query(
            `SELECT id_veiculo 
             FROM veiculos 
             WHERE id_categoria = $1`,
            [id]
        );

        if (vinculada.rows.length > 0) {
            return {
                success: false,
                message: "Não é possível excluir, existem veículos vinculados a essa categoria"
            };
        }

        await db.query(
            `DELETE FROM categoria_veiculo WHERE id = $1`,
            [id]
        );

        return {
            success: true,
            message: "Categoria deletada com sucesso"
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao deletar categoria",
            error: error.message
        };
    }
}

module.exports = {
    postCategoria,
    getCategorias,
    getCategoriaById,
    putCategoria,
    deleteCategoria
};