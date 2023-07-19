import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    manufacturer: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    lot: { type: String, required: true },
    expiration: { type: String, required: true },
    image: { type: String, required: true },
    reference: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0, required: true },
    size: { type: String, required: true },
    countInStock: { type: Number, default: 0, required: true },
    notes: { type: String, required: true },
    includes: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
