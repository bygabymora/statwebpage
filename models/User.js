import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true, index: true },
    isAdmin: { type: Boolean, required: false, default: false },
    isSeller: { type: Boolean, required: false, default: false },
    isBuyer: { type: Boolean, required: false, default: false },
    isWarehouse: { type: Boolean, required: false, default: false },
    isWarehouseReceiving: { type: Boolean, required: false, default: false },
    isWarehouseShipping: { type: Boolean, required: false, default: false },
    isFinance: { type: Boolean, required: false, default: false },
    isMaster: { type: Boolean, required: false, default: false },
    isDev: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
