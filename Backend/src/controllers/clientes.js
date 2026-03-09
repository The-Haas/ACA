const clienteService = require('../services/clientes');

async function postCliente(req, res) {
    const resultado = await clienteService.postCliente(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}


async function getClientes(req, res) {
    const resultado = await clienteService.getClientes();

    if (resultado.success) {
        res.status(200).json(resultado.clientes);
    } else {
        res.status(400).json(resultado);
    }
}


module.exports = {
    postCliente,
    getClientes
};
