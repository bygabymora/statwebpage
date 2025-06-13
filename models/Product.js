import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    manufacturer: { type: String, required: false },
    slug: { type: String, required: false, unique: true },
    gtin: { type: String, required: false },
    image: { type: String, required: false },
    sentOverNight: { type: Boolean, default: false, required: false },
    isInClearance: { type: Boolean, default: false, required: false },
    hotProduct: { type: Boolean, default: false, required: false },
    protected: { type: Boolean, default: false, required: false },
    approved: { type: Boolean, default: false, required: false },
    createdInQuickbooks: { type: Boolean, default: false, required: false },
    reversed: { type: Boolean, default: false, required: false },
    active: { type: Boolean, default: true, required: false },
    noExpirationDate: { type: Boolean, default: false, required: false },
    quickBooksManufacturerIdProduction: { type: String, required: false },
    quickBooksManufacturerId: { type: String, required: false },
    callForPrice: { type: Boolean, default: false, required: false },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    each: {
      description: { type: String, required: false },
      price: { type: Number, default: 0, required: false },
      wpPrice: { type: Number, default: 0, required: false },
      customerPrice: { type: Number, default: 0, required: false },
      minSalePrice: { type: Number, default: 0, required: false },
      countInStock: { type: Number, default: 0, required: false },
      clearanceCountInStock: { type: Number, default: 0, required: false },
      floatingStock: { type: Number, default: 0, required: false },
      parLevel: { type: Number, default: 0, required: false },
      heldStock: { type: Number, default: 0, required: false },
      soldStock: { type: Number, default: 0, required: false },
      quantityBought: { type: Number, default: 0, required: false },
      clearanceQuantityBought: { type: Number, default: 0, required: false },
      quantitySold: { type: Number, default: 0, required: false },
      noExpirationDate: { type: Boolean, default: false, required: false },
      clearanceQuantitySold: { type: Number, default: 0, required: false },
      volume: { type: Number, default: 0, required: false },
      weight: { type: Number, default: 0, required: false },
      margin: { type: Number, default: 35, required: false },
      quickBooksItemId: { type: String, required: false },
      quickBooksItemIdProduction: { type: String, required: false },
      quickBooksSyncToken: { type: String, required: false },
      quickBooksSyncTokenProduction: { type: String, required: false },
      quickBooksQuantityOnHandProduction: {
        type: Number,
        default: 0,
        required: false,
      },
      gtin: { type: String, required: false },
      lots: [
        {
          receiptOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReceiptOrder",
            required: false,
          },

          headquarter: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Headquarters",
              required: false,
            },
            name: { type: String, required: false },
          },
          noExpirationDate: { type: Boolean, default: false, required: false },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          heldStock: { type: Number, default: 0, required: false },
          soldStock: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          dateOutWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          shippingPrice: { type: Number, default: 0, required: false },
          invoices: [
            {
              invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                required: false,
              },
            },
          ],
        },
      ],
      lotsInClearance: [
        {
          receiptOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReceiptOrder",
            required: false,
          },
          headquarter: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Headquarters",
              required: false,
            },
            name: { type: String, required: false },
          },
          noExpirationDate: { type: Boolean, default: false, required: false },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          dateOutWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          invoices: [
            {
              invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                required: false,
              },
            },
          ],
        },
      ],
    },

    box: {
      description: { type: String, required: false },
      price: { type: Number, default: 0, required: false },
      wpPrice: { type: Number, default: 0, required: false },
      countInStock: { type: Number, default: 0, required: false },
      customerPrice: { type: Number, default: 0, required: false },
      minSalePrice: { type: Number, default: 0, required: false },
      clearanceCountInStock: { type: Number, default: 0, required: false },
      floatingStock: { type: Number, default: 0, required: false },
      parLevel: { type: Number, default: 0, required: false },
      heldStock: { type: Number, default: 0, required: false },
      soldStock: { type: Number, default: 0, required: false },
      quantityBought: { type: Number, default: 0, required: false },
      clearanceQuantityBought: { type: Number, default: 0, required: false },
      quantitySold: { type: Number, default: 0, required: false },
      noExpirationDate: { type: Boolean, default: false, required: false },
      clearanceQuantitySold: { type: Number, default: 0, required: false },
      volume: { type: Number, default: 0, required: false },
      weight: { type: Number, default: 0, required: false },
      margin: { type: Number, default: 35, required: false },
      quickBooksItemId: { type: String, required: false },
      quickBooksItemIdProduction: { type: String, required: false },
      quickBooksSyncToken: { type: String, required: false },
      quickBooksSyncTokenProduction: { type: String, required: false },
      quickBooksQuantityOnHandProduction: {
        type: Number,
        default: 0,
        required: false,
      },
      gtin: { type: String, required: false },
      eachCount: { type: Number, default: 0, required: false },
      lots: [
        {
          receiptOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReceiptOrder",
            required: false,
          },
          invoices: [
            {
              invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                required: false,
              },
            },
          ],

          headquarter: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Headquarters",
              required: false,
            },
            name: { type: String, required: false },
          },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          shippingPrice: { type: Number, default: 0, required: false },
          heldStock: { type: Number, default: 0, required: false },
          soldStock: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          dateOutWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          isInClearance: { type: Boolean, default: false, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
        },
      ],
      lotsInClearance: [
        {
          receiptOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReceiptOrder",
            required: false,
          },
          invoices: [
            {
              invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                required: false,
              },
            },
          ],
          headquarter: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Headquarters",
              required: false,
            },
            name: { type: String, required: false },
          },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          dateOutWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
        },
      ],
    },

    loose: {
      description: { type: String, required: false },
      price: { type: Number, default: 0, required: false },
      wpPrice: { type: Number, default: 0, required: false },
      countInStock: { type: Number, default: 0, required: false },
      customerPrice: { type: Number, default: 0, required: false },
      minSalePrice: { type: Number, default: 0, required: false },
      clearanceCountInStock: { type: Number, default: 0, required: false },
      floatingStock: { type: Number, default: 0, required: false },
      parLevel: { type: Number, default: 0, required: false },
      heldStock: { type: Number, default: 0, required: false },
      soldStock: { type: Number, default: 0, required: false },
      quantityBought: { type: Number, default: 0, required: false },
      clearanceQuantityBought: { type: Number, default: 0, required: false },
      quantitySold: { type: Number, default: 0, required: false },
      clearanceQuantitySold: { type: Number, default: 0, required: false },
      volume: { type: Number, default: 0, required: false },
      weight: { type: Number, default: 0, required: false },
      margin: { type: Number, default: 35, required: false },
      quickBooksItemId: { type: String, required: false },
      quickBooksItemIdProduction: { type: String, required: false },
      quickBooksSyncToken: { type: String, required: false },
      quickBooksSyncTokenProduction: { type: String, required: false },
      noExpirationDate: { type: Boolean, default: false, required: false },
      quickBooksQuantityOnHandProduction: {
        type: Number,
        default: 0,
        required: false,
      },
      lots: [
        {
          receiptOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReceiptOrder",
            required: false,
          },
          invoices: [
            {
              invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                required: false,
              },
            },
          ],

          headquarter: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Headquarters",
              required: false,
            },
            name: { type: String, required: false },
          },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          shippingPrice: { type: Number, default: 0, required: false },
          heldStock: { type: Number, default: 0, required: false },
          soldStock: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          dateOutWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
        },
      ],
      lotsInClearance: [
        {
          receiptOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReceiptOrder",
            required: false,
          },
          invoices: [
            {
              invoiceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invoice",
                required: false,
              },
            },
          ],
          headquarter: {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Headquarters",
              required: false,
            },
            name: { type: String, required: false },
          },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          dateOutWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
        },
      ],
    },

    purchases: [
      {
        purchaseId: { type: String, required: false },
        purchaseDocNumber: { type: String, required: false },
        purchaseQuantity: { type: Number, default: 0, required: false },
        typeOfPurchase: { type: String, required: false },
        purchasePrice: { type: Number, default: 0, required: false },
        purchaseDate: { type: String, required: false },
        lastUpdated: { type: String, required: false },
      },
    ],
    receiptOrders: [
      {
        receiptOrderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ReceiptOrder",
          required: false,
        },
        receiptOrderDate: { type: Date, required: false },
      },
    ],

    returns: [
      {
        returnId: { type: String, required: false },
        purchaseId: { type: String, required: false },
        batchId: { type: String, required: false },
        purchasePrice: { type: Number, default: 0, required: false },
        typeOfPurchase: { type: String, required: false },
        returnQuantity: { type: Number, default: 0, required: false },
        returnDate: { type: String, required: false },
      },
    ],
    bills: [
      {
        billId: { type: String, required: false },
        purchaseId: { type: String, required: false },
        batchId: { type: String, required: false },
        purchasePrice: { type: Number, default: 0, required: false },
        typeOfPurchase: { type: String, required: false },
        billQuantity: { type: Number, default: 0, required: false },
        billDate: { type: String, required: false },
      },
    ],
    estimates: [
      {
        estimateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ReceiptOrder",
          required: false,
        },
        estimateDate: { type: Date, required: false },
      },
    ],
    invoices: [
      {
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Invoice",
          required: false,
        },
        invoiceDate: { type: Date, required: false },
      },
    ],
    stockModifications: [
      {
        modificationId: { type: String, required: false },
        quantity: { type: Number, default: 0, required: false },
        type: { type: String, required: false },
        date: { type: String, required: false },
        reason: { type: String, required: false },
      },
    ],

    notes: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

const productFields = [
  "name",
  "manufacturer",
  "slug",
  "gtin",
  "image",
  "sentOverNight",
  "isInClearance",
  "approved",
  "createdInQuickbooks",
  "each",
  "box",
  "loose",
  "clearance",
  "buyers",
  "purchases",
  "receiptOrders",
  "returns",
  "bills",
  "sales",
  "stockModifications",
  "notes",
  "createdAt",
  "updatedAt",
  "_id",
];

export { Product, productFields };
export default Product;
