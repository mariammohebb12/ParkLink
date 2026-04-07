const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  session_id: { type: Schema.Types.ObjectId, ref: 'Parkingsession', required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'card-mock' }, // 'card-mock', 'stripe', etc
  card_last4: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
