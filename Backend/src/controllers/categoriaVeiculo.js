const categoriaService = require('../services/categoriaVeiculo');

// CREATE
async function postCategoria(req, res) {

    const resultado = await categoriaService.postCategoria(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}   

// GET ALL
async function getCategorias(req, res) {

    const resultado = await categoriaService.getCategorias();

    if (resultado.success) {
        res.status(200).json(resultado.categorias);
    } else {
        res.status(400).json(resultado);
    }
}

// GET BY ID
async function getCategoriaById(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.getCategoriaById(id);

    if (resultado.success) {
        res.status(200).json(resultado.categoria);
    } else {

        if (resultado.message === "Categoria não encontrada") {
            res.status(404).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    }
}

// UPDATE
async function putCategoria(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.putCategoria(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

// DELETE
async function deleteCategoria(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.deleteCategoria(id);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    postCategoria,
    getCategorias,
    getCategoriaById,
    putCategoria,
    deleteCategoria
};