const veiculoController = require('../controllers/veiculos');
const { autenticarToken, apenasCliente } = require('../middlewares/authMiddleware');

module.exports = (app) => {

    app.post('/veiculos', autenticarToken, apenasCliente, veiculoController.postVeiculo);
    app.get('/veiculos', autenticarToken, apenasCliente, veiculoController.getVeiculos);
    app.put('/veiculos/:id', autenticarToken, apenasCliente, veiculoController.putVeiculo);
    app.delete('/veiculos/:id', autenticarToken, apenasCliente, veiculoController.deleteVeiculo);
    app.get('/veiculos/meus', autenticarToken, apenasCliente, veiculoController.getMeusVeiculos);
    app.get('/veiculos/:id', autenticarToken, apenasCliente, veiculoController.getVeiculoById);
    app.patch('/veiculos/:id', autenticarToken, apenasCliente, veiculoController.patchVeiculo);
    

};