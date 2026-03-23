const categoriaVeiculoController = require('../controllers/categoriaVeiculo');

module.exports = (app) => {
    app.post('/categoriaVeiculo', categoriaVeiculoController.postCategoria);
    app.get('/categoriaVeiculo', categoriaVeiculoController.getCategorias);
    app.put('/categoriaVeiculo/:id', categoriaVeiculoController.putCategoria);
    app.delete('/categoriaVeiculo/:id', categoriaVeiculoController.deleteCategoria);
    app.get('/categoriaVeiculo/:id', categoriaVeiculoController.getCategoriaById);
};
