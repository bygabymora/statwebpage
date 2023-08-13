import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    lot: { type: String, required: true },
    expiration: { type: String, required: true },
    image: { type: String, required: true },
    reference: { type: String, required: true },
    description: { type: String, required: false },
    descriptionBulk: { type: String, required: false },
    price: { type: Number, default: 0, required: false },
    priceBulk: { type: Number, default: 0, required: false },
    each: { type: String, required: true },
    bulk: { type: String, required: true },
    countInStock: { type: Number, default: 0, required: true },
    countInStockBulk: { type: Number, default: 0, required: true },
    sentOverNight: { type: Boolean, default: false, required: true },
    notes: { type: String, required: false },
    includes: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
