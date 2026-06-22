const db = require('../config');

async function criarOrdemServico(dados) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const {
            id_usuario,
            id_veiculo,
            id_tipo_localizacao,
            localizacao,
            local_entrega,
            observacao_cliente,
            itens
        } = dados;

        // 🔴 validar cliente
        const cliente = await client.query(
            'SELECT id FROM clientes WHERE id = $1',
            [id_usuario]
        );

        if (cliente.rowCount === 0) {
            await client.query('ROLLBACK');
            return { success: false, message: 'Cliente não encontrado' };
        }

        // 🔴 validar veículo
        const veiculo = await client.query(
            'SELECT id_veiculo FROM veiculos WHERE id_veiculo = $1',
            [id_veiculo]
        );

        if (veiculo.rowCount === 0) {
            await client.query('ROLLBACK');
            return { success: false, message: 'Veículo não encontrado' };
        }

        // 🔴 validar se veículo pertence ao cliente
        const possui = await client.query(
            `SELECT * FROM cliente_veiculo 
             WHERE id_cliente = $1 AND id_veiculo = $2`,
            [id_usuario, id_veiculo]
        );

        if (possui.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                success: false,
                message: 'Veículo não pertence ao cliente'
            };
        }

        // 🔴 validar tipo localização
        const tipo = await client.query(
            'SELECT id FROM tipos_localizacao WHERE id = $1',
            [id_tipo_localizacao]
        );

        if (tipo.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                success: false,
                message: 'Tipo de localização inválido'
            };
        }

        // 🔴 validar itens
        if (!itens || itens.length === 0) {
            await client.query('ROLLBACK');
            return {
                success: false,
                message: 'Informe ao menos um serviço'
            };
        }

        for (let item of itens) {
            const categoria = await client.query(
                'SELECT id FROM categoria_servicos WHERE id = $1',
                [item]
            );

            if (categoria.rowCount === 0) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    message: `Categoria de serviço inválida: ${item}`
                };
            }
        }

        // 🟢 criar OS (status=1 aberta, sem prestador vinculado)
        const os = await client.query(
            `INSERT INTO ordem_servico
            (descricao, valor, localizacao, local_entrega, id_usuario, id_veiculo, observacao_cliente, id_tipo_localizacao, id_status)
            VALUES ($1, 0, $2, $3, $4, $5, $6, $7, 1)
            RETURNING id, localizacao, observacao_cliente, id_status`,
            [
                'Ordem de serviço',
                localizacao,
                local_entrega || null,
                id_usuario,
                id_veiculo,
                observacao_cliente || null,
                id_tipo_localizacao
            ]
        );

        const id_os = os.rows[0].id;

        // 🟢 inserir itens
        for (let item of itens) {
            await client.query(
                `INSERT INTO ordem_servico_itens
                (id_ordem_servico, id_categoria_servico)
                VALUES ($1, $2)`,
                [id_os, item]
            );
        }

        await client.query('COMMIT');

        return {
            success: true,
            data: { id: id_os, status: 'Pendente' }
        };

    } catch (err) {
        await client.query('ROLLBACK');
        return { success: false, error: err.message };
    } finally {
        client.release();
    }
}

async function listarOrdensAbertasPrestador(id_prestador) {
    const client = await db.pool.connect();

    try {
        // valida prestador existe
        const prestador = await client.query(
            'SELECT id FROM prestadores WHERE id = $1',
            [id_prestador]
        );

        if (prestador.rowCount === 0) {
            return { success: false, message: 'Prestador não encontrado' };
        }

        // 🟢 busca OS com id_status = 1 (aberta, sem prestador) cujos itens
        // sejam TODOS atendidos pelas categorias de serviço do prestador
        const ordens = await client.query(
            `SELECT
                os.id,
                os.descricao,
                os.valor,
                os.localizacao,
                os.local_entrega,
                os.observacao_cliente,

                c.nome AS cliente,
                c.telefone AS cliente_telefone,

                v.descricao AS veiculo,

                tl.nome AS tipo_localizacao,
                st.nome AS status,

                COALESCE(
                    json_agg(cs.nome) FILTER (WHERE cs.nome IS NOT NULL),
                    '[]'
                ) AS servicos

             FROM ordem_servico os
             JOIN clientes c ON c.id = os.id_usuario
             JOIN veiculos v ON v.id_veiculo = os.id_veiculo
             JOIN tipos_localizacao tl ON tl.id = os.id_tipo_localizacao
             JOIN status_servico st ON st.id = os.id_status
             LEFT JOIN ordem_servico_itens oi ON oi.id_ordem_servico = os.id
             LEFT JOIN categoria_servicos cs ON cs.id = oi.id_categoria_servico

             WHERE os.id_status = 1
               AND NOT EXISTS (
                    SELECT 1
                    FROM ordem_servico_itens oi2
                    WHERE oi2.id_ordem_servico = os.id
                      AND NOT EXISTS (
                            SELECT 1
                            FROM prestador_servicos ps
                            WHERE ps.id_prestador = $1
                              AND ps.id_categoria_servico = oi2.id_categoria_servico
                      )
               )

             GROUP BY os.id, c.nome, c.telefone, v.descricao, tl.nome, st.nome
             ORDER BY os.id DESC`,
            [id_prestador]
        );

        return {
            success: true,
            data: ordens.rows
        };

    } catch (err) {
        return { success: false, error: err.message };
    } finally {
        client.release();
    }
}

async function aceitarOrdemServico(id_os, id_prestador) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        //  validar prestador existe
        const prestador = await client.query(
            'SELECT id FROM prestadores WHERE id = $1',
            [id_prestador]
        );

        if (prestador.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                success: false,
                message: 'Prestador não encontrado'
            };
        }

        // pegar serviços da OS
        const servicosOS = await client.query(
            `SELECT id_categoria_servico
             FROM ordem_servico_itens
             WHERE id_ordem_servico = $1`,
            [id_os]
        );

        if (servicosOS.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                success: false,
                message: 'OS sem serviços vinculados'
            };
        }

        // validar se prestador atende TODOS os serviços
        for (let servico of servicosOS.rows) {
            const atende = await client.query(
                `SELECT 1
                 FROM prestador_servicos
                 WHERE id_prestador = $1
                   AND id_categoria_servico = $2`,
                [id_prestador, servico.id_categoria_servico]
            );

            if (atende.rowCount === 0) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    message: `Prestador não atende o serviço ${servico.id_categoria_servico}`
                };
            }
        }

        // aceitar OS
        const result = await client.query(
            `UPDATE ordem_servico
             SET id_prestador = $1,
                 id_status = 2
             WHERE id = $2 AND id_status = 1
             RETURNING *`,
            [id_prestador, id_os]
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return {
                success: false,
                message: 'OS não encontrada ou já aceita'
            };
        }

        await client.query('COMMIT');

        return {
            success: true,
            data: result.rows[0]
        };

    } catch (err) {
        await client.query('ROLLBACK');
        return { success: false, error: err.message };
    } finally {
        client.release();
    }
}

async function finalizarOrdemServico(id_os, avaliacao) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // finalizar OS
        const os = await client.query(
            `UPDATE ordem_servico
             SET id_status = 3
             WHERE id = $1
             RETURNING *`,
            [id_os]
        );

        if (os.rowCount === 0) {
            await client.query('ROLLBACK');
            return { success: false, message: 'OS não encontrada' };
        }

        // se tiver avaliação
        if (avaliacao) {
            const {
                estrelas,
                comentario,
                id_avaliador,
                id_avaliado,
                tipo_avaliador
            } = avaliacao;

            await client.query(
                `INSERT INTO avaliacoes
                (estrelas, comentario, id_servico, id_avaliador, id_avaliado, tipo_avaliador)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    estrelas,
                    comentario || null,
                    id_os,
                    id_avaliador,
                    id_avaliado,
                    tipo_avaliador
                ]
            );
        }

        await client.query('COMMIT');

        return {
            success: true,
            data: os.rows[0]
        };

    } catch (err) {
        await client.query('ROLLBACK');
        return { success: false, error: err.message };
    } finally {
        client.release();
    }
}

async function buscarOsAtivaCliente(id_usuario) {
    try {
        const result = await db.query(
            `SELECT
                os.id,
                os.localizacao,
                os.observacao_cliente,
                os.id_status,
                st.nome AS status,
                cs_itens.nome AS servico,
                p.nome_fantasia AS prestador_nome,
                p.telefone AS prestador_telefone,
                tl.nome AS tipo_localizacao
             FROM ordem_servico os
             JOIN status_servico st ON st.id = os.id_status
             JOIN tipos_localizacao tl ON tl.id = os.id_tipo_localizacao
             LEFT JOIN ordem_servico_itens oi ON oi.id_ordem_servico = os.id
             LEFT JOIN categoria_servicos cs_itens ON cs_itens.id = oi.id_categoria_servico
             LEFT JOIN prestadores p ON p.id = os.id_prestador
             WHERE os.id_usuario = $1
               AND os.id_status IN (1, 2)
             ORDER BY os.id DESC
             LIMIT 1`,
            [id_usuario]
        );

        if (result.rows.length === 0) {
            return { success: true, data: null };
        }

        return { success: true, data: result.rows[0] };

    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = {
    criarOrdemServico,
    listarOrdensAbertasPrestador,
    aceitarOrdemServico,
    finalizarOrdemServico,
    buscarOsAtivaCliente
};