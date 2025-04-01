const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  fechaPago: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado', 'reembolsado'],
    default: 'pendiente'
  },
  idTransaccion: {
    type: String,
    required: true
  },
  metodo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  facturaGenerada: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pago', pagoSchema);