const express = require('express');
const router = express.Router();
const {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  actualizarPlanesCliente
} = require('../controllers/clienteController');

router.route('/').get(getClientes).post(createCliente);
router.route('/:id').get(getClienteById).put(updateCliente).delete(deleteCliente);
router.route('/:id/planes').put(actualizarPlanesCliente);

module.exports = router;