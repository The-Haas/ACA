const categoriaService = require('../services/categoriaGuincho');

// CREATE
async function postCategoriaGuincho(req, res) {

    const resultado = await categoriaService.postCategoriaGuincho(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

// GET ALL
async function getCategoriasGuincho(req, res) {

    const resultado = await categoriaService.getCategoriasGuincho();

    if (resultado.success) {
        res.status(200).json(resultado.categorias);
    } else {
        res.status(400).json(resultado);
    }
}

// GET BY ID
async function getCategoriaGuinchoById(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.getCategoriaGuinchoById(id);

    if (resultado.success) {
        res.status(200).json(resultado.categoria);
    } else {

        if (resultado.message === "Categoria de guincho não encontrada") {
            res.status(404).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    }
}

// UPDATE
async function putCategoriaGuincho(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.putCategoriaGuincho(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

// DELETE
async function deleteCategoriaGuincho(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.deleteCategoriaGuincho(id);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    postCategoriaGuincho,
    getCategoriasGuincho,
    getCategoriaGuinchoById,
    putCategoriaGuincho,
    deleteCategoriaGuincho
};