const mongoose = require('mongoose');

const cartEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itineraryId: { type: String, required: true },
    groupSize: { type: Number, required: true, min: 1 },
    travelDate: { type: String, required: true },
  },
  { timestamps: true }
);

cartEntrySchema.index({ userId: 1, itineraryId: 1 }, { unique: true });

module.exports = mongoose.model('CartEntry', cartEntrySchema);
