const clientesRoute = require('./clientes');
const veiculosRoute = require('./veiculos');
const categoriaVeiculoRoute = require('./categoriaVeiculo');
const categoriaGuinchoRoute = require('./categoriaGuincho');

module.exports = (app) => {
    clientesRoute(app);
    veiculosRoute(app);
    categoriaVeiculoRoute(app);
    categoriaGuinchoRoute(app);
}