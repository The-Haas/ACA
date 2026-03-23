const categoriaService = require('../services/categoriaServico');

// CREATE
async function postCategoriaServico(req, res) {

    const resultado = await categoriaService.postCategoriaServico(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

// GET ALL
async function getCategoriasServico(req, res) {

    const resultado = await categoriaService.getCategoriasServico();

    if (resultado.success) {
        res.status(200).json(resultado.categorias);
    } else {
        res.status(400).json(resultado);
    }
}

// GET BY ID
async function getCategoriaServicoById(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.getCategoriaServicoById(id);

    if (resultado.success) {
        res.status(200).json(resultado.categoria);
    } else {

        if (resultado.message === "Categoria de serviço não encontrada") {
            res.status(404).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    }
}

// UPDATE
async function putCategoriaServico(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.putCategoriaServico(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

// DELETE
async function deleteCategoriaServico(req, res) {

    const { id } = req.params;

    const resultado = await categoriaService.deleteCategoriaServico(id);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    postCategoriaServico,
    getCategoriasServico,
    getCategoriaServicoById,
    putCategoriaServico,
    deleteCategoriaServico
};