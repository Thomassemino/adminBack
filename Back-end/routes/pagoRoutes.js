const express = require('express');
const router = express.Router();
const {
  getPagos,
  getPagosByCliente,
  registrarPago,
  actualizarEstadoPago,
  getHistorialPagos
} = require('../controllers/pagoController');

router.route('/').get(getPagos).post(registrarPago);
router.route('/:id').put(actualizarEstadoPago);
router.get('/cliente/:clienteId', getPagosByCliente);
router.get('/historial', getHistorialPagos);

module.exports = router;