const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    itineraryId: { type: String, required: true },
    groupSize: { type: Number, required: true },
    travelDate: { type: String, required: true },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
