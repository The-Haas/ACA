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

async function getPrestadoresPorCategoria(req, res) {

    const { id_categoria } = req.params;

    const resultado = await prestadorService.getPrestadoresPorCategoria(id_categoria);

    if (resultado.success) {
        res.status(200).json(resultado);
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

async function patchPrestador(req, res) {

    const resultado = await prestadorService.patchPrestador(
        req.params.id,
        req.body
    );

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}


module.exports = {
    postPrestador,
    getPrestador,
    getPrestadoresPorCategoria,
    getPrestadorById,
    putPrestador,
    deletePrestador,
    patchPrestador
};