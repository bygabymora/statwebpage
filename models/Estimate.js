import mongoose from "mongoose";
const estimateSchema = new mongoose.Schema(
  {
    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      name: { type: String, required: false },
      userQuickBooksId: { type: String, required: false },
    },
    warning: { type: String, required: false },
    invoice: {
      invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: false,
      },
      docNumber: { type: String, required: false },
      invoiceDate: { type: Date, required: false },
      quickbooksInvoiceId: { type: String, required: false },
      status: { type: String, required: false },
    },

    signedFile: {
      acceptedBy: {
        signature: { type: String, required: false },
        signer: { type: String, required: false },
        signatureDate: { type: Date, required: false },
        ip: { type: String, required: false },
      },
      approvedBy: {
        signature: { type: String, required: false },
        signer: { type: String, required: false },
        signatureDate: { type: Date, required: false },
        ip: { type: String, required: false },
      },
      fileId: { type: String, required: false },
      fileName: { type: String, required: false },
    },

    estimateItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        gtin: { type: String, required: false },
        approved: { type: Boolean, required: false },
        quantity: { type: Number, required: false },
        typeOfPurchase: { type: String, required: false },
        manufacturer: { type: String, required: false },
        name: { type: String, required: false },
        description: { type: String, required: false },
        slug: { type: String, required: false },
        baseCost: { type: Number, required: false },
        onThisScan: { type: Number, required: false },
        shipped: { type: Number, required: false },
        sentOverNight: { type: Boolean, required: false },
        noExpirationDate: { type: Boolean, required: false },
        designatedLots: [
          {
            gtin: { type: String, required: false },
            countInStock: { type: Number, required: false },
            quantity: { type: Number, required: false },
            expirationDate: { type: Date, required: false },
            lot: { type: String, required: false },
            purchasePrice: { type: Number, required: false },
            heldStock: { type: Number, required: false },
            headquarter: {
              _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Headquarters",
                required: false,
              },
              name: { type: String, required: false },
            },
          },
        ],
        lots: [
          {
            gtin: { type: String, required: false },
            countInStock: { type: Number, required: false },
            expirationDate: { type: Date, required: false },
            lot: { type: String, required: false },
            purchasePrice: { type: Number, required: false },
            heldStock: { type: Number, required: false },
            headquarter: {
              _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Headquarters",
                required: false,
              },
              name: { type: String, required: false },
            },
          },
        ],
        unitPrice: { type: Number, required: false },
        salePrice: { type: Number, required: false },
        minSalePrice: { type: Number, required: false },
        totalPrice: { type: Number, required: false },
        productSearchQuery: { type: String, required: false },
        quickBooksItemId: { type: String, required: false },
        quickBooksItemIdProduction: { type: String, required: false },
        quickBooksQuantityOnHandProduction: { type: Number, required: false },
        heldStock: { type: Number, required: false },
        customerPrice: { type: Number, required: false },
        countInStock: { type: Number, required: false },
        floatingStock: { type: Number, required: false },
        each: {
          countInStock: { type: Number, required: false },
          floatingStock: { type: Number, required: false },
          quickBooksItemId: { type: String, required: false },
          quickBooksItemIdProduction: { type: String, required: false },
          description: { type: String, required: false },
          gtin: { type: String, required: false },
          quickBooksQuantityOnHandProduction: { type: Number, required: false },
          customerPrice: { type: Number, required: false },
          heldStock: { type: Number, required: false },
          minSalePrice: { type: Number, required: false },
          lots: [
            {
              countInStock: { type: Number, required: false },
              expirationDate: { type: Date, required: false },
              lot: { type: String, required: false },
              purchasePrice: { type: Number, required: false },
              heldStock: { type: Number, required: false },
            },
          ],
        },
        box: {
          countInStock: { type: Number, required: false },
          floatingStock: { type: Number, required: false },
          quickBooksItemId: { type: String, required: false },
          quickBooksItemIdProduction: { type: String, required: false },
          description: { type: String, required: false },
          gtin: { type: String, required: false },
          quickBooksQuantityOnHandProduction: { type: Number, required: false },
          customerPrice: { type: Number, required: false },
          heldStock: { type: Number, required: false },
          minSalePrice: { type: Number, required: false },
          lots: [
            {
              countInStock: { type: Number, required: false },
              expirationDate: { type: Date, required: false },
              lot: { type: String, required: false },
              purchasePrice: { type: Number, required: false },
              heldStock: { type: Number, required: false },
            },
          ],
        },
        loose: {
          countInStock: { type: Number, required: false },
          floatingStock: { type: Number, required: false },
          quickBooksItemId: { type: String, required: false },
          quickBooksItemIdProduction: { type: String, required: false },
          description: { type: String, required: false },
          gtin: { type: String, required: false },
          quickBooksQuantityOnHandProduction: { type: Number, required: false },
          customerPrice: { type: Number, required: false },
          heldStock: { type: Number, required: false },
          minSalePrice: { type: Number, required: false },
          lots: [
            {
              countInStock: { type: Number, required: false },
              expirationDate: { type: Date, required: false },
              lot: { type: String, required: false },
              purchasePrice: { type: Number, required: false },
              heldStock: { type: Number, required: false },
            },
          ],
        },
      },
    ],
    shippingMethod: { type: String, required: false },
    otherShippingBilling: { type: String, required: false },
    shippingBilling: { type: String, required: false },
    customer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: false,
      },

      needFactCheck: { type: Boolean, required: false, default: false },
      arFactCheck: {
        payablesInfo: { type: Boolean, required: false, default: false },
        correctEmail: { type: Boolean, required: false, default: false },
        correctRemitToAddress: {
          type: Boolean,
          required: false,
          default: false,
        },
      },
      user: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        name: { type: String, required: false },
        email: { type: String, required: false },
        userQuickBooksId: { type: String, required: false },
      },
      billAddr: {
        address: { type: String, required: false },
        suiteNumber: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        state: { type: String, required: false },
        country: { type: String, required: false },
        quickBooksAddressId: { type: String, required: false },
      },
      location: {
        address: { type: String, required: false },
        suiteNumber: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        state: { type: String, required: false },
        country: { type: String, required: false },
        quickBooksAddressId: { type: String, required: false },
        attentionTo: { type: String, required: false },
      },
      defaultTerms: { type: String, required: false },
      phone: { type: String, required: false },
      email: { type: String, required: false },
      EIN: { type: String, required: false },
      companyName: { type: String, required: false },
      purchaseExecutiveName: { type: String, required: false },
      searchQuery: { type: String, required: false },
      quickBooksCustomerId: { type: String, required: false },
      quickBooksProductionCustomerId: { type: String, required: false },
      upsAccountNumber: { type: String, required: false },
      fedexAccountNumber: { type: String, required: false },
      creditLimit: { type: Number, required: false },
      buyer: {
        title: { type: String, required: false },
        role: { type: String, required: false },
        opOutEmail: { type: Boolean, required: false, default: false },
        name: { type: String, required: false },
        lastName: { type: String, required: false },
        email: { type: String, required: false },
        phone: { type: String, required: false },
        mobile: { type: String, required: false },
        ext: { type: String, required: false },
        mailChimpId: { type: String, required: false },
        mailChimpUniqueEmailId: { type: String, required: false },
        _id: { type: String, required: false },
      },
      purchaseExecutive: [
        {
          title: { type: String, required: false },
          role: { type: String, required: false },
          opOutEmail: { type: Boolean, required: false, default: false },
          name: { type: String, required: false },
          lastName: { type: String, required: false },
          email: { type: String, required: false },
          phone: { type: String, required: false },
          mobile: { type: String, required: false },
          ext: { type: String, required: false },
          mailChimpId: { type: String, required: false },
          mailChimpUniqueEmailId: { type: String, required: false },
        },
      ],
    },
    chat: {
      messages: [
        {
          sender: {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: false,
            },
            name: { type: String, required: false },
            userQuickBooksId: { type: String, required: false },
          },

          text: { type: String, required: false },
          timestamp: { type: Date, required: false },
        },
      ],
      readBy: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          },
          name: { type: String, required: false },
          userQuickBooksId: { type: String, required: false },
        },
      ],
      dueDate: { type: Date, required: false },
    },
    approved: { type: Boolean, required: false },
    poNumber: { type: String, required: false },
    status: { type: String, required: false },
    itemsPrice: { type: Number, required: false },
    itemsQuantity: { type: Number, required: false },
    totalPrice: { type: Number, required: false },
    amount: { type: Number, required: false },
    discount: { type: Number, required: false },
    discountPercentage: { type: Number, required: false },
    subtotal: { type: Number, required: false },
    quickBooksEstimateId: { type: String, required: false },
    quickBooksEstimateSyncToken: { type: String, required: false },
    createdInQuickbooks: { type: Boolean, required: false, default: false },
    docNumber: { type: String, required: false },
    paymentTerms: { type: String, required: false },
    onHoldTime: { type: Date, required: false },
    timerEnd: { type: Date, required: false, default: null },
    timePeriod: { type: Number, required: false, default: 24 },
    fileId: { type: String, required: false },
    fileName: { type: String, required: false },
    active: { type: Boolean, required: false, default: true },
    linkedWpOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Estimate =
  mongoose.models.Estimate || mongoose.model("Estimate", estimateSchema);

const estimateFields = [
  "user",
  "invoice",
  "estimateItems",
  "customer",
  "itemsPrice",
  "totalPrice",
  "amount",
  "discount",
  "subtotal",
  "quickBooksEstimateId",
  "quickBooksEstimateSyncToken",
  "createdInQuickbooks",
  "docNumber",
  "paymentTerms",
  "createdAt",
  "updatedAt",
  "_id",
];

export { estimateFields, Estimate };

export default Estimate;
