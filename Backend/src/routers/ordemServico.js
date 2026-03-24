const ordemServicoController = require('../controllers/ordemServico.js');

module.exports = (app) => {

    app.post('/ordemServico', ordemServicoController.criarOrdemServico);
    app.patch('/ordemServico/:id/aceitar', ordemServicoController.aceitarOrdemServico);
    app.patch('/ordemServico/:id/finalizar', ordemServicoController.finalizarOrdemServico);

};