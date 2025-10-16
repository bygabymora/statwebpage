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
    approvalEmailSent: { type: Boolean, required: false, default: false },
    avatarUrl: { type: String, required: false },
    preferredLocale: { type: String, required: false },
    resetCode: {
      code: { type: String, required: false },
      expireDate: { type: Date, required: false },
    },
    cart: [
      {
        productId: { type: String, required: false },
        price: { type: Number, required: false },
        wpPrice: { type: Number, required: false },
        quantity: { type: Number, required: false },
        typeOfPurchase: { type: String, required: false },
        unitPrice: { type: Number, required: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WpUser = mongoose.models.WpUser || mongoose.model("WpUser", wpUserSchema);

export default WpUser;
