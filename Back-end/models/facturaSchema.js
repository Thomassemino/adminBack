const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  pago: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago',
    required: true
  },
  numeroFactura: {
    type: String,
    required: true,
    unique: true
  },
  fechaEmision: {
    type: Date,
    default: Date.now
  },
  montoTotal: {
    type: Number,
    required: true
  },
  conceptos: [{
    descripcion: String,
    monto: Number
  }],
  estado: {
    type: String,
    enum: ['emitida', 'anulada'],
    default: 'emitida'
  },
  urlFactura: {
    type: String
  }
}, {
  timestamps: true
});

// Generar número de factura automáticamente
facturaSchema.pre('save', async function(next) {
  if (!this.numeroFactura) {
    const ultimaFactura = await this.constructor.findOne().sort({ createdAt: -1 });
    const numero = ultimaFactura ? parseInt(ultimaFactura.numeroFactura.split('-')[1]) + 1 : 1;
    this.numeroFactura = `FACT-${numero.toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Factura', facturaSchema);