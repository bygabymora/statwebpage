import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    checkoutSessionId: { type: String },
    wpUser: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WpUser",
        required: false,
      },
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      email: { type: String, required: false },
    },
    orderItems: [
      {
        name: { type: String, required: false },
        productId: { type: String, required: false },
        slug: { type: String, required: false },
        price: { type: Number, required: false },
        wpPrice: { type: Number, required: false },
        quantity: { type: Number, required: false },
        typeOfPurchase: { type: String, required: false },
        image: { type: String, required: false },
        sentOverNight: { type: Boolean, default: false, required: false },
        quickBooksItemIdProduction: {
          type: String,
          required: false,
        },
        unitPrice: { type: Number, required: false },
        _id: {
          type: String,
          required: false,
        },
      },
    ],
    docNumber: { type: String, required: false },
    shippingAddress: {
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
      suiteNumber: { type: String, required: false },
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
      shippingMethod: { type: String, required: false },
      carrier: { type: String, required: false },
      account: { type: String, required: false },
      shippingCost: { type: Number, required: false },
      paymentMethod: { type: String, required: false },
    },
    paymentMethod: { type: String, required: false },
    poNumber: { type: String, required: false },
    fileId: { type: String, required: false },
    fileName: { type: String, required: false },
    defaultTerm: { type: String, required: false },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      amount: { type: Number },
      currency: { type: String },
      email_address: { type: String },
      payment_method: { type: String },
      receipt_url: { type: String },
      charge_id: { type: String },
      created: { type: Number },
      paymentId: { type: String },
    },
    itemsPrice: { type: Number, required: false },
    totalPrice: { type: Number, required: false },
    isPaid: { type: Boolean, required: false, default: false },
    paymentId: { type: String, required: false },
    isDelivered: { type: Boolean, required: false, default: false },
    isAtCostumers: { type: Boolean, required: false, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    discountAmount: { type: Number, required: false, default: 0 },
    trackNumber: { type: String, required: false },
    trackUrl: { type: String, required: false },
    status: { type: String, required: false },
    atCostumersDate: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
