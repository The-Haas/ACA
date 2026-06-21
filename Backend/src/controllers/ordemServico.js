const service = require('../services/ordemServico.js');

async function criarOrdemServico(req, res) {
  const dados = {
    ...req.body,
    id_usuario: req.user.id
  }

  const result = await service.criarOrdemServico(dados)

  res.status(result.success ? 201 : 400).json(result)
}

async function listarOrdensAbertasPrestador(req, res) {
    const id_prestador = req.user.id;

    const result = await service.listarOrdensAbertasPrestador(id_prestador);
    res.status(result.success ? 200 : 400).json(result);
}

async function aceitarOrdemServico(req, res) {
    const { id } = req.params;
    const { id_prestador } = req.body;

    const result = await service.aceitarOrdemServico(id, id_prestador);
    res.status(result.success ? 200 : 400).json(result);
}

async function finalizarOrdemServico(req, res) {
    const { id } = req.params;
    const { avaliacao } = req.body;

    const result = await service.finalizarOrdemServico(id, avaliacao);
    res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    criarOrdemServico,
    listarOrdensAbertasPrestador,
    aceitarOrdemServico,
    finalizarOrdemServico
};