const veiculoController = require('../controllers/veiculos');

module.exports = (app) => {

    app.post('/veiculos', veiculoController.postVeiculo);
    app.get('/veiculos', veiculoController.getVeiculos);
    app.put('/veiculos/:id', veiculoController.putVeiculo);
    app.delete('/veiculos/:id', veiculoController.deleteVeiculo);
    app.get('/veiculos/:id', veiculoController.getVeiculoById);

};