const ordemServicoController = require('../controllers/ordemServico.js');

const { autenticarToken, apenasCliente, apenasPrestador } = require('../middlewares/authMiddleware');

module.exports = (app) => {

    app.post('/ordemServico', autenticarToken, apenasCliente, ordemServicoController.criarOrdemServico);
    app.get('/ordemServico/ativa', autenticarToken, apenasCliente, ordemServicoController.buscarOsAtivaCliente);
    app.get('/ordemServico/abertas', autenticarToken, apenasPrestador, ordemServicoController.listarOrdensAbertasPrestador);
    app.patch('/ordemServico/:id/aceitar', autenticarToken, apenasPrestador, ordemServicoController.aceitarOrdemServico);
    app.patch('/ordemServico/:id/finalizar', autenticarToken, apenasCliente, ordemServicoController.finalizarOrdemServico);

};