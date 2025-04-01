const Cliente = require('../models/clienteSchema');
const { PreApproval } = require('mercadopago');
const mercadopago = require('../config/mercadopago');

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un cliente por ID
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo cliente con planes personalizados
const createCliente = async (req, res) => {
  try {
    const { nombre, email, telefono, programaAdquirido, planesDisponibles } = req.body;
    
    // Verificar que se proporcionen planes
    if (!planesDisponibles || !Array.isArray(planesDisponibles) || planesDisponibles.length === 0) {
      return res.status(400).json({ mensaje: 'Debe proporcionar al menos un plan disponible' });
    }

    // Validar cada plan
    for (const plan of planesDisponibles) {
      if (!plan.tipo || !plan.precio || plan.precio <= 0) {
        return res.status(400).json({ mensaje: 'Todos los planes deben tener tipo y precio válido' });
      }
    }

    const nuevoCliente = new Cliente({
      nombre,
      email,
      telefono,
      programaAdquirido,
      planesDisponibles
    });

    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un cliente
const updateCliente = async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!clienteActualizado) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.status(200).json(clienteActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un cliente
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar planes disponibles para un cliente
const actualizarPlanesCliente = async (req, res) => {
  try {
    const { planesDisponibles } = req.body;
    
    if (!planesDisponibles || !Array.isArray(planesDisponibles) || planesDisponibles.length === 0) {
      return res.status(400).json({ mensaje: 'Debe proporcionar al menos un plan válido' });
    }

    // Validar cada plan
    for (const plan of planesDisponibles) {
      if (!plan.tipo || !plan.precio || plan.precio <= 0) {
        return res.status(400).json({ mensaje: 'Todos los planes deben tener tipo y precio válido' });
      }
    }

    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { planesDisponibles },
      { new: true, runValidators: true }
    );

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.status(200).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  actualizarPlanesCliente
};