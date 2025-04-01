const Pago = require('../models/pagoSchema');
const Cliente = require('../models/clienteSchema');

// Obtener todos los pagos
const getPagos = async (req, res) => {
  try {
    const pagos = await Pago.find().populate('cliente', 'nombre email');
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener pagos por ID de cliente
const getPagosByCliente = async (req, res) => {
  try {
    const pagos = await Pago.find({ cliente: req.params.clienteId })
      .populate('cliente', 'nombre email')
      .sort({ fechaPago: -1 });
    
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar un nuevo pago manualmente
const registrarPago = async (req, res) => {
  try {
    const { clienteId, monto, metodo, descripcion, idTransaccion } = req.body;
    
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const nuevoPago = new Pago({
      cliente: clienteId,
      monto,
      metodo,
      descripcion,
      idTransaccion,
      estado: 'aprobado'
    });

    const pagoGuardado = await nuevoPago.save();

    // Actualizar estado del cliente
    cliente.estadoPagoActual = 'pagado';
    cliente.fechaUltimoPago = new Date();
    cliente.fechaProximoPago = new Date(new Date().setMonth(new Date().getMonth() + 1));
    await cliente.save();

    res.status(201).json(pagoGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar estado de un pago
const actualizarEstadoPago = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!['pendiente', 'aprobado', 'rechazado', 'reembolsado'].includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const pago = await Pago.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!pago) {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }

    // Si el pago cambia a aprobado, actualizar el estado del cliente
    if (estado === 'aprobado') {
      const cliente = await Cliente.findById(pago.cliente);
      if (cliente) {
        cliente.estadoPagoActual = 'pagado';
        cliente.fechaUltimoPago = pago.fechaPago;
        cliente.fechaProximoPago = new Date(new Date(pago.fechaPago).setMonth(new Date(pago.fechaPago).getMonth() + 1));
        await cliente.save();
      }
    }

    res.status(200).json(pago);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener historial de pagos con filtros
const getHistorialPagos = async (req, res) => {
  try {
    const { clienteId, desde, hasta, estado } = req.query;
    
    const filtro = {};
    
    if (clienteId) filtro.cliente = clienteId;
    if (estado) filtro.estado = estado;
    
    if (desde || hasta) {
      filtro.fechaPago = {};
      if (desde) filtro.fechaPago.$gte = new Date(desde);
      if (hasta) filtro.fechaPago.$lte = new Date(hasta);
    }
    
    const pagos = await Pago.find(filtro)
      .populate('cliente', 'nombre email programaAdquirido')
      .sort({ fechaPago: -1 });
    
    res.status(200).json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPagos,
  getPagosByCliente,
  registrarPago,
  actualizarEstadoPago,
  getHistorialPagos
};