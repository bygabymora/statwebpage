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
    active: { type: Boolean, default: true, required: false },
    noExpirationDate: { type: Boolean, default: false, required: false },
    quickBooksManufacturerIdProduction: { type: String, required: false },
    quickBooksManufacturerId: { type: String, required: false },
    callForPrice: { type: Boolean, default: false, required: false },
    onlyEaches: { type: Boolean, default: false, required: false },
    keywords: {
      type: [String],
      default: [],
      index: true,
      required: false,
    },
    information: {
      type: String,
      required: false,
      default: "",
    },
    taxClassificationRef: {
      value: { type: String, required: false },
      name: { type: String, required: false },
      code: { type: String, required: false },
    },
    taxable: { type: Boolean, default: true, required: false },
    categories: {
      type: [String],
      default: [],
      required: false,
    },
    spiffs: [
      {
        spiff: { type: Number, required: false },
        startDate: { type: Date, required: false },
        endDate: { type: Date, required: false },
      },
    ],

    each: {
      description: { type: String, required: false },
      floatingStockPOs: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Purchase",
            required: false,
          },
          docNumber: { type: String, required: false },
        },
      ],
      price: { type: Number, default: 0, required: false },
      wpPrice: { type: Number, default: 0, required: false },
      customerPrice: { type: Number, default: 0, required: false },
      minSalePrice: { type: Number, default: 0, required: false },
      countInStock: { type: Number, default: 0, required: false },
      promoPrice: { type: Number, default: 0, required: false },
      clearanceCountInStock: { type: Number, default: 0, required: false },
      floatingStock: { type: Number, default: 0, required: false },
      parLevel: { type: Number, default: 0, required: false },
      heldStock: { type: Number, default: 0, required: false },
      soldStock: { type: Number, default: 0, required: false },
      quantityBought: { type: Number, default: 0, required: false },
      quantitySold: { type: Number, default: 0, required: false },
      noExpirationDate: { type: Boolean, default: false, required: false },
      volume: { type: Number, default: 0, required: false },
      weight: { type: Number, default: 0, required: false },
      margin: { type: Number, default: 35, required: false },
      quickBooksItemId: { type: String, required: false },
      quickBooksItemIdProduction: { type: String, required: false },
      quickBooksSyncToken: { type: String, required: false },
      quickBooksSyncTokenProduction: { type: String, required: false },
      gtin: { type: String, required: false },
      lots: [
        {
          lotId: { type: String, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          heldStock: { type: Number, default: 0, required: false },
          soldStock: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          shippingPrice: { type: Number, default: 0, required: false },
        },
      ],
    },

    box: {
      floatingStockPOs: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Purchase",
            required: false,
          },
          docNumber: { type: String, required: false },
        },
      ],

      promoPrice: { type: Number, default: 0, required: false },
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
      quantitySold: { type: Number, default: 0, required: false },
      noExpirationDate: { type: Boolean, default: false, required: false },
      volume: { type: Number, default: 0, required: false },
      weight: { type: Number, default: 0, required: false },
      margin: { type: Number, default: 35, required: false },
      quickBooksItemId: { type: String, required: false },
      quickBooksItemIdProduction: { type: String, required: false },
      quickBooksSyncToken: { type: String, required: false },
      quickBooksSyncTokenProduction: { type: String, required: false },

      gtin: { type: String, required: false },
      eachCount: { type: Number, default: 0, required: false },
      lots: [
        {
          lotId: { type: String, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          heldStock: { type: Number, default: 0, required: false },
          soldStock: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          shippingPrice: { type: Number, default: 0, required: false },
        },
      ],
    },

    loose: {
      floatingStockPOs: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Purchase",
            required: false,
          },
          docNumber: { type: String, required: false },
        },
      ],
      description: { type: String, required: false },

      promoPrice: { type: Number, default: 0, required: false },
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
      quantitySold: { type: Number, default: 0, required: false },
      volume: { type: Number, default: 0, required: false },
      weight: { type: Number, default: 0, required: false },
      margin: { type: Number, default: 35, required: false },
      quickBooksItemId: { type: String, required: false },
      quickBooksItemIdProduction: { type: String, required: false },
      quickBooksSyncToken: { type: String, required: false },
      quickBooksSyncTokenProduction: { type: String, required: false },
      noExpirationDate: { type: Boolean, default: false, required: false },

      lots: [
        {
          lotId: { type: String, required: false },
          noExpirationDate: { type: Boolean, default: false, required: false },
          lot: { type: String, required: false },
          expirationDate: { type: String, required: false },
          countInStock: { type: Number, default: 0, required: false },
          heldStock: { type: Number, default: 0, required: false },
          soldStock: { type: Number, default: 0, required: false },
          dateInWarehouse: { type: String, required: false },
          salePrice: { type: Number, default: 0, required: false },
          purchasePrice: { type: Number, default: 0, required: false },
          shippingPrice: { type: Number, default: 0, required: false },
        },
      ],
    },

    vendors: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          required: false,
        },
        purchaseOrders: [
          {
            purchaseOrderId: { type: String, required: false },
          },
        ],
        companyName: { type: String, required: false },
        each: {
          quantity: { type: Number, default: 0, required: false },
        },
        box: {
          quantity: { type: Number, default: 0, required: false },
        },
        loose: {
          quantity: { type: Number, default: 0, required: false },
        },
      },
    ],
    customers: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
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
        each: {
          quantity: { type: Number, default: 0, required: false },
        },
        box: {
          quantity: { type: Number, default: 0, required: false },
        },
        loose: {
          quantity: { type: Number, default: 0, required: false },
        },
      },
    ],

    purchases: [
      {
        purchaseId: { type: String, required: false },
        purchaseQuantity: { type: Number, default: 0, required: false },
        purchaseType: { type: String, required: false },
        purchasePrice: { type: Number, default: 0, required: false },
        purchaseDate: { type: String, required: false },
      },
    ],
    receiptOrders: [
      {
        receiptOrderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ReceiptOrder",
          required: false,
        },
      },
    ],

    returns: [
      {
        returnId: { type: String, required: false },
        purchaseId: { type: String, required: false },
        batchId: { type: String, required: false },
        purchasePrice: { type: Number, default: 0, required: false },
        purchaseType: { type: String, required: false },
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
        purchaseType: { type: String, required: false },
        billQuantity: { type: Number, default: 0, required: false },
        billDate: { type: String, required: false },
      },
    ],

    notes: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
productSchema.index({ name: 1 }); // For product name lookups
productSchema.index({ "each.countInStock": 1 }); // For stock queries
productSchema.index({ "box.countInStock": 1 }); // For stock queries
productSchema.index({ "loose.countInStock": 1 }); // For stock queries
productSchema.index({ protected: 1 }); // For protected product filtering
productSchema.index({ active: 1 }); // For active product filtering
productSchema.index({ manufacturer: 1 }); // For manufacturer queries

/**
 * ATLAS SEARCH INDEX: "default"
 * Configured in MongoDB Atlas for text search on:
 * - name (my_ngram analyzer, 2-8 char edge grams, lowercase)
 * - manufacturer (my_ngram analyzer)
 *
 * Use $search aggregation stage for case-insensitive text matching
 * Example:
 *   Product.aggregate([
 *     { $search: {
 *       index: "default",
 *       text: { query: "product name", path: "name", fuzzy: { maxEdits: 1 } }
 *     }}
 *   ])
 */

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
  "vendors",
  "purchases",
  "receiptOrders",
  "returns",
  "bills",
  "notes",
  "createdAt",
  "updatedAt",
  "_id",
];

export { Product, productFields };
export default Product;
