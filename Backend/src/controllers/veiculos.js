const veiculoService = require('../services/veiculos');

async function postVeiculo(req, res) {

    try {

        const dados = req.body;

        const resultado = await veiculoService.postVeiculo(dados);

        if (!resultado.success) {
            return res.status(400).json(resultado);
        }

        return res.status(201).json(resultado);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Erro interno no servidor."
        });
    }
}

async function getVeiculos(req, res) {

    const result = await veiculoService.getVeiculos();

    if (!result.success) {
        return res.status(400).json(result);
    }

    return res.status(200).json(result);
}

async function putVeiculo(req, res) {

    const { id } = req.params;

    const result = await veiculoService.putVeiculo(id, req.body);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

async function deleteVeiculo(req, res) {

    const { id } = req.params;

    const result = await veiculoService.deleteVeiculo(id);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json(result);
}

async function getVeiculoById(req, res) {

    const { id } = req.params;

    const resultado = await veiculoService.getVeiculoById(id);

    if (resultado.success) {
        res.status(200).json(resultado.veiculo);
    } else {

        if (resultado.message === "Veículo não encontrado") {
            res.status(404).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    }
}

module.exports = {
    postVeiculo,
    getVeiculos,
    putVeiculo,
    deleteVeiculo,
    getVeiculoById
};