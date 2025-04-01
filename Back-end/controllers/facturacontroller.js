const Factura = require('../models/facturaSchema');
const Pago = require('../models/pagoSchema');
const Cliente = require('../models/clienteSchema');

// Generar factura a partir de un pago
const generarFactura = async (req, res) => {
  try {
    const { pagoId } = req.params;
    
    // Verificar si el pago existe y está aprobado
    const pago = await Pago.findById(pagoId);
    if (!pago) {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }
    
    if (pago.estado !== 'aprobado') {
      return res.status(400).json({ mensaje: 'Solo se pueden generar facturas para pagos aprobados' });
    }
    
    if (pago.facturaGenerada) {
      return res.status(400).json({ mensaje: 'Ya existe una factura para este pago' });
    }
    
    // Obtener información del cliente
    const cliente = await Cliente.findById(pago.cliente);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    
    // Crear la factura
    const nuevaFactura = new Factura({
      cliente: cliente._id,
      pago: pago._id,
      montoTotal: pago.monto,
      conceptos: [{
        descripcion: `Suscripción mensual - ${cliente.programaAdquirido}`,
        monto: pago.monto
      }]
    });
    
    const facturaGuardada = await nuevaFactura.save();
    
    // Actualizar el pago para indicar que tiene factura
    pago.facturaGenerada = true;
    await pago.save();
    
    // Aquí se podría implementar la generación del PDF de la factura y asignar la URL
    
    res.status(201).json(facturaGuardada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener facturas por cliente
const getFacturasByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    const facturas = await Factura.find({ cliente: clienteId })
      .populate('cliente', 'nombre email')
      .populate('pago', 'fechaPago monto metodo')
      .sort({ fechaEmision: -1 });
    
    res.status(200).json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Anular una factura
const anularFactura = async (req, res) => {
  try {
    const { id } = req.params;
    
    const factura = await Factura.findById(id);
    if (!factura) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }
    
    if (factura.estado === 'anulada') {
      return res.status(400).json({ mensaje: 'La factura ya está anulada' });
    }
    
    factura.estado = 'anulada';
    await factura.save();
    
    res.status(200).json({ mensaje: 'Factura anulada correctamente', factura });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las facturas con filtros
const getFacturas = async (req, res) => {
  try {
    const { desde, hasta, estado } = req.query;
    
    const filtro = {};
    
    if (estado) filtro.estado = estado;
    
    if (desde || hasta) {
      filtro.fechaEmision = {};
      if (desde) filtro.fechaEmision.$gte = new Date(desde);
      if (hasta) filtro.fechaEmision.$lte = new Date(hasta);
    }
    
    const facturas = await Factura.find(filtro)
      .populate('cliente', 'nombre email')
      .populate('pago', 'fechaPago monto metodo')
      .sort({ fechaEmision: -1 });
    
    res.status(200).json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generarFactura,
  getFacturasByCliente,
  anularFactura,
  getFacturas
};