const categoriaServicoController = require('../controllers/categoriaServico');

module.exports = (app) => {
    app.post('/categoriaservico', categoriaServicoController.postCategoriaServico);
    app.get('/categoriaservico', categoriaServicoController.getCategoriasServico);
    app.put('/categoriaservico/:id', categoriaServicoController.putCategoriaServico);
    app.delete('/categoriaservico/:id', categoriaServicoController.deleteCategoriaServico);
    app.get('/categoriaservico/:id', categoriaServicoController.getCategoriaServicoById);
};
