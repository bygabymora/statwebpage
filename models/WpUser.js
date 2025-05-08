import mongoose from "mongoose";

const wpUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    companyName: { type: String, required: false },
    companyEinCode: { type: String, required: false },
    active: { type: Boolean, required: true, default: true },
    approved: { type: Boolean, required: true, default: false },
    restricted: { type: Boolean, required: true, default: false },
    customerId: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const WpUser = mongoose.models.WpUser || mongoose.model("WpUser", wpUserSchema);

export default WpUser;
