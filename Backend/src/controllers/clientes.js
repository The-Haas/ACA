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

async function putCliente(req, res) {

    const { id } = req.params;

    const resultado = await clienteService.putCliente(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function deleteCliente(req, res) {

    const { id } = req.params;

    const resultado = await clienteService.deleteCliente(id);

    if (resultado.success) {
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}


module.exports = {
    postCliente,
    getClientes,
    putCliente,
    deleteCliente
};
