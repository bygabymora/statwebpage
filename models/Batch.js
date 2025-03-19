import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    slug: { type: String, required: true },
    lot: { type: String, required: true },
    expiration: { type: String, required: true },
    reference: { type: String, required: false, unique: true },
    countInStock: { type: Number, default: 0, required: true },
    countInStockBox: { type: Number, default: 0, required: true },
    countInStockClearance: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

export default Batch;
