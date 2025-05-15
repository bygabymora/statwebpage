import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true, index: true },
    userQuickBooksId: { type: String, required: false },
    phone: { type: String, required: false },
    charge: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);
const userFields = [
  "name",
  "email",
  "phone",
  "address",
  "password",
  "charge",
  "dateOfBirth",
  "startDate",
  "isAdmin",
  "isSeller",
  "isBuyer",
  "isWarehouse",
  "isFinance",
  "isMaster",
  "createdAt",
  "updatedAt",
  "_id",
];

export { User, userFields };
export default User;
