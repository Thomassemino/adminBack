const express = require('express');
const router = express.Router();
const {
  generarFactura,
  getFacturasByCliente,
  anularFactura,
  getFacturas
} = require('../controllers/facturaController');

router.route('/').get(getFacturas);
router.post('/pago/:pagoId', generarFactura);
router.get('/cliente/:clienteId', getFacturasByCliente);
router.put('/:id/anular', anularFactura);

module.exports = router;