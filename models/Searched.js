import mongoose from 'mongoose';

const searchedSchema = new mongoose.Schema(
  {
    searchedWord: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: false },
    manufacturer: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    message: { type: String, required: false },
  },

  {
    timestamps: true,
  }
);

const Searched =
  mongoose.models.Searched || mongoose.model('Searched', searchedSchema);
export default Searched;
