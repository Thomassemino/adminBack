const mongoose = require('mongoose');

// Schema para planes personalizados
const planClienteSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    required: true, 
    enum: ['basico', 'avanzado', 'pro'] 
  },
  precio: { 
    type: Number, 
    required: true 
  },
  descripcion: { 
    type: String 
  }
}, { _id: false });

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  programaAdquirido: { 
    type: String, 
    required: true, 
    enum: ['odontoCare', 'cleanOrg', 'distributionAdmin'] 
  },
  fechaInicio: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    required: true, 
    enum: ['activo', 'inactivo', 'suspendido'], 
    default: 'inactivo' 
  },
  // Planes disponibles para este cliente específico
  planesDisponibles: [planClienteSchema],
  // Plan actual suscrito
  planActual: {
    tipo: { 
      type: String, 
      enum: ['basico', 'avanzado', 'pro'] 
    },
    precio: { 
      type: Number
    },
    fechaActivacion: {
      type: Date
    }
  },
  gastoRealMensual: { type: Number, required: true, default: 0 },
  cobrosExtraordinarios: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ExtraOrdinario' 
  }],
  // Campos adicionales para manejar suscripciones
  suscripcionId: { type: String },
  estadoPagoActual: { 
    type: String, 
    enum: ['pendiente', 'pagado', 'vencido'], 
    default: 'pendiente' 
  },
  fechaProximoPago: { type: Date },
  fechaUltimoPago: { type: Date },
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Cliente', clienteSchema);