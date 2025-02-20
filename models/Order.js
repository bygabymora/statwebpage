import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        price: { type: Number, required: true},
        wpPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        purchaseType: { type: String, required: true },
        image: { type: String, required: true },
        sentOverNight: { type: Boolean, default: false, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      company: { type: String, required: false },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      notes: { type: String, required: false },
    },
    billingAddress: {
      fullNameB: { type: String, required: false },
      companyB: { type: String, required: false },
      phoneB: { type: String, required: false },
      addressB: { type: String, required: false },
      stateB: { type: String, required: false },
      cityB: { type: String, required: false },
      postalCodeB: { type: String, required: false },
    },
    paymentMethod: { type: String, required: true },
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

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
