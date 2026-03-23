const prestadorService = require('../services/prestadores');

async function postPrestador(req, res) {

    const resultado = await prestadorService.postPrestador(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function getPrestador(req, res) {

    const resultado = await prestadorService.getPrestador(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function getPrestadorById(req, res) {

    const resultado = await prestadorService.getPrestadorById(req.params.id);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function putPrestador(req, res) {

    const resultado = await prestadorService.putPrestador(
        req.params.id,
        req.body
    );

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function deletePrestador(req, res) {

    const resultado = await prestadorService.deletePrestador(req.params.id);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    postPrestador,
    getPrestador,
    getPrestadorById,
    putPrestador,
    deletePrestador
};