import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    wpUser: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WpUser",
        required: true,
      },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
    },
    orderItems: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        price: { type: Number, required: true },
        wpPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        purchaseType: { type: String, required: true },
        image: { type: String, required: true },
        sentOverNight: { type: Boolean, default: false, required: true },
      },
    ],

    shippingAddress: {
      contactInfo: {
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        email: { type: String, required: false },
        secondEmail: { type: String, required: false },
      },
      companyName: { type: String, required: false },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      suiteNumber: { type: String, required: true },
      notes: { type: String, required: false },
    },
    billingAddress: {
      contactInfo: {
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        email: { type: String, required: false },
        secondEmail: { type: String, required: false },
      },
      companyName: { type: String, required: false },
      phone: { type: String, required: false },
      address: { type: String, required: false },
      state: { type: String, required: false },
      city: { type: String, required: false },
      postalCode: { type: String, required: false },
    },
    shippingPreferences: {
      shippingMethod: { type: String, required: true },
      carrier: { type: String, required: true },
      account: { type: String, required: true },
      shippingCost: { type: Number, required: true },
      paymentMethod: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    poNumber: { type: String, required: false },
    fileId: { type: String, required: false },
    fileName: { type: String, required: false },
    defaultTerm: { type: String, required: false },
    paymentResult: { id: String, status: String, email_address: String },
    itemsPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    isAtCostumers: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    discountAmount: { type: Number, required: true, default: 0 },
    trackNumber: { type: String, required: false },
    trackUrl: { type: String, required: false },
    atCostumersDate: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
