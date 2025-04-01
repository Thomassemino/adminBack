const mongoose = require('mongoose');

const extraOrdinarioSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  concepto: {
    type: String,
    required: true
  },
  fechaEmision: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'cancelado'],
    default: 'pendiente'
  },
  idPago: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExtraOrdinario', extraOrdinarioSchema);
