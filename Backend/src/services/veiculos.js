const db = require('../config');

async function postVeiculo(dados) {

    const {
        renavam,
        placa,
        id_categoria,
        descricao,
        cor,
        id_cliente
    } = dados;

    const client = await db.pool.connect();

    try {

        // Verificar RENAVAM duplicado
        const renavamExiste = await client.query(
            `SELECT id_veiculo FROM veiculos WHERE renavam = $1`,
            [renavam]
        );

        if (renavamExiste.rows.length > 0) {
            return {
                success: false,
                message: "RENAVAM já cadastrado."
            };
        }

        // Verificar PLACA duplicada (se tiver UNIQUE)
        const placaExiste = await client.query(
            `SELECT id_veiculo FROM veiculos WHERE placa = $1`,
            [placa]
        );

        if (placaExiste.rows.length > 0) {
            return {
                success: false,
                message: "Placa já cadastrada."
            };
        }

        // Verificar se cliente existe
        const clienteExiste = await client.query(
            `SELECT id FROM clientes WHERE id = $1`,
            [id_cliente]
        );

        if (clienteExiste.rows.length === 0) {
            return {
                success: false,
                message: "Cliente não encontrado."
            };
        }

        await client.query('BEGIN');

        const veiculo = await client.query(
            `INSERT INTO veiculos
            (renavam, placa, id_categoria, descricao, cor)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING id_veiculo`,
            [renavam, placa, id_categoria, descricao, cor]
        );

        const idVeiculo = veiculo.rows[0].id_veiculo;

        await client.query(
            `INSERT INTO cliente_veiculo
            (id_cliente, id_veiculo)
            VALUES ($1,$2)`,
            [id_cliente, idVeiculo]
        );

        await client.query('COMMIT');

        return {
            success: true,
            message: "Veículo cadastrado com sucesso",
            id_veiculo: idVeiculo
        };

    } catch (error) {

        await client.query('ROLLBACK');

        return {
            success: false,
            message: "Erro ao cadastrar veículo.",
            error: error.message
        };

    } finally {

        client.release();
    }
}

async function getVeiculos() {

    try {

        const result = await db.query(`
        SELECT 
        v.id_veiculo,
        v.renavam,
        v.placa,
        v.descricao,
        v.cor,
        v.id_categoria,
        cat.nome AS categoria,

        c.id AS id_cliente,
        c.nome,
        c.email,
        c.telefone

        FROM veiculos v

        JOIN cliente_veiculo cv 
            ON cv.id_veiculo = v.id_veiculo

        JOIN clientes c 
            ON c.id = cv.id_cliente

        JOIN categoria_veiculo cat
            ON cat.id = v.id_categoria;
        `);

        return {
            success: true,
            data: result.rows
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar veículos",
            error: error.message
        };
    }
}

async function getVeiculoById(id_veiculo) {

    try {

        const result = await db.query(`
        SELECT 
            v.id_veiculo,
            v.renavam,
            v.placa,
            v.descricao,
            v.cor,
            v.id_categoria,
            cat.nome AS categoria,

            c.id AS id_cliente,
            c.nome,
            c.email,
            c.telefone

        FROM veiculos v

        JOIN cliente_veiculo cv 
            ON cv.id_veiculo = v.id_veiculo

        JOIN clientes c 
            ON c.id = cv.id_cliente

        JOIN categoria_veiculo cat
            ON cat.id = v.id_categoria

        WHERE v.id_veiculo = $1
        `, [id_veiculo]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Veículo não encontrado"
            };
        }

        return {
            success: true,
            veiculo: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Erro ao buscar veículo",
            error: error.message
        };
    }
}

async function putVeiculo(id_veiculo, dados) {

    const {
        renavam,
        placa,
        id_categoria,
        descricao,
        cor
    } = dados;

    const client = await db.pool.connect();

    try {

        await client.query('BEGIN');

        // verifica se veículo existe
        const veiculoExiste = await client.query(
            `SELECT id_veiculo FROM veiculos WHERE id_veiculo = $1`,
            [id_veiculo]
        );

        if (veiculoExiste.rows.length === 0) {
            return {
                success: false,
                message: "Veículo não encontrado"
            };
        }

        // valida categoria
        const categoriaExiste = await client.query(
            `SELECT id FROM categoria_veiculo WHERE id = $1`,
            [id_categoria]
        );

        if (categoriaExiste.rows.length === 0) {
            return {
                success: false,
                message: "Categoria de veículo inválida"
            };
        }

        // valida placa duplicada
        const placaExiste = await client.query(
            `SELECT id_veiculo FROM veiculos 
             WHERE placa = $1 AND id_veiculo <> $2`,
            [placa, id_veiculo]
        );

        if (placaExiste.rows.length > 0) {
            return {
                success: false,
                message: "Placa já cadastrada em outro veículo"
            };
        }

        // valida renavam duplicado
        const renavamExiste = await client.query(
            `SELECT id_veiculo FROM veiculos 
             WHERE renavam = $1 AND id_veiculo <> $2`,
            [renavam, id_veiculo]
        );

        if (renavamExiste.rows.length > 0) {
            return {
                success: false,
                message: "Renavam já cadastrado em outro veículo"
            };
        }

        // atualiza veículo
        await client.query(
            `UPDATE veiculos
             SET renavam = $1,
                 placa = $2,
                 id_categoria = $3,
                 descricao = $4,
                 cor = $5
             WHERE id_veiculo = $6`,
            [renavam, placa, id_categoria, descricao, cor, id_veiculo]
        );

        await client.query('COMMIT');

        return {
            success: true,
            message: "Veículo atualizado com sucesso"
        };

    } catch (error) {

        await client.query('ROLLBACK');

        return {
            success: false,
            message: "Erro ao atualizar veículo",
            error: error.message
        };

    } finally {

        client.release();
    }
}

async function deleteVeiculo(id_veiculo) {

    const client = await db.pool.connect();

    try {

        await client.query('BEGIN');

        // verifica se veículo existe
        const veiculoExiste = await client.query(
            `SELECT id_veiculo 
             FROM veiculos 
             WHERE id_veiculo = $1`,
            [id_veiculo]
        );

        if (veiculoExiste.rows.length === 0) {

            await client.query('ROLLBACK');

            return {
                success: false,
                message: "Veículo não encontrado"
            };
        }

        // verifica se possui serviços vinculados
        const servicosVinculados = await client.query(
            `SELECT id 
             FROM servicos 
             WHERE id_veiculo = $1`,
            [id_veiculo]
        );

        if (servicosVinculados.rows.length > 0) {

            await client.query('ROLLBACK');

            return {
                success: false,
                message: "Não é possível excluir o veículo pois existem serviços vinculados a ele"
            };
        }

        // remove relação cliente_veiculo
        await client.query(
            `DELETE FROM cliente_veiculo
             WHERE id_veiculo = $1`,
            [id_veiculo]
        );

        // remove veículo
        await client.query(
            `DELETE FROM veiculos
             WHERE id_veiculo = $1`,
            [id_veiculo]
        );

        await client.query('COMMIT');

        return {
            success: true,
            message: "Veículo removido com sucesso"
        };

    } catch (error) {

        await client.query('ROLLBACK');

        return {
            success: false,
            message: "Erro ao deletar veículo",
            error: error.message
        };

    } finally {

        client.release();
    }
}

module.exports = {
    postVeiculo,
    getVeiculos,
    putVeiculo,
    deleteVeiculo,
    getVeiculoById

};