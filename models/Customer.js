import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
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
    companyName: { type: String, required: false },
    aka: { type: String, required: false },
    location: {
      address: { type: String, required: false },
      suiteNumber: { type: String, required: false },
      city: { type: String, required: false },
      postalCode: { type: String, required: false },
      state: { type: String, required: false },
      country: { type: String, required: false },
      quickBooksAddressId: { type: String, required: false },
    },
    blacklisted: { type: Boolean, required: false, default: false },
    billAddr: {
      address: { type: String, required: false },
      suiteNumber: { type: String, required: false },
      city: { type: String, required: false },
      postalCode: { type: String, required: false },
      state: { type: String, required: false },
      country: { type: String, required: false },
      quickBooksAddressId: { type: String, required: false },
    },
    idn: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IdnGpo",
        required: false,
      },
      name: { type: String, required: false },
    },
    partnerIdn: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IdnGpo",
        required: false,
      },
      name: { type: String, required: false },
    },
    gpo: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IdnGpo",
        required: false,
      },
      name: { type: String, required: false },
    },
    // Lets a buyer's other locations/facilities roll up to the account they
    // primarily purchase through, mirroring IdnGpo's parentOrganizationId.
    parentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    parentAccountName: { type: String, required: false },
    // Denormalized so list/card views can tell whether an account has any
    // linked child accounts without a query per row -- kept in sync whenever
    // a customer's parentAccountId changes (see syncHasChildAccountsFlag).
    hasChildAccounts: { type: Boolean, required: false, default: false },
    creditLimit: { type: Number, required: false },
    facilityType: [{ name: { type: String, required: false } }],
    leadStage: { type: String, required: false },
    mailChimpId: { type: String, required: false },
    mailChimpUniqueEmailId: { type: String, required: false },
    opOutEmail: { type: Boolean, required: false, default: false },
    notes: { type: String, required: false },
    accountNotes: [
      {
        value: { type: String, required: false },
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },
      },
    ],
    upsAccountNumber: { type: String, required: false },
    fedexAccountNumber: { type: String, required: false },
    billInvoice: { type: Boolean, required: false, default: false },
    sameAsBilling: { type: Boolean, required: false, default: false },
    sameAsShipping: { type: Boolean, required: false, default: false },
    email: { type: String, required: false },
    secondEmail: { type: String, required: false },
    arFactCheck: {
      payablesInfo: { type: Boolean, required: false, default: false },
      correctEmail: { type: Boolean, required: false, default: false },
      correctRemitToAddress: { type: Boolean, required: false, default: false },
      taxExemptionStatusRegistered: {
        type: Boolean,
        required: false,
        default: false,
      },
      idnStatusRegistered: { type: Boolean, required: false, default: false },
    },
    exemptionFileId: { type: String, required: false },
    exemptionFileName: { type: String, required: false },
    taxable: { type: Boolean, required: false, default: true },
    defaultTaxCodeRef: { type: String, required: false },
    taxExemptionReasonId: { type: String, required: false },
    exemptionFileExpirationDate: { type: Date, required: false },
    category: {
      name: { type: String, required: false },
      subcategory: [
        {
          name: { type: String, required: false },
        },
      ],
    },
    contactDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: ["Monday", "Thursday"],
    },
    followUpChat: {
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
    active: { type: Boolean, required: false, default: true },
    status: { type: String, required: false, default: "Normal" },
    phone: { type: String, required: false },
    ext: { type: String, required: false },
    fax: { type: String, required: false },
    other: { type: String, required: false },
    website: { type: String, required: false },
    EIN: { type: String, required: false, unique: false },
    quickBooksCustomerId: { type: String, required: false },
    quickBooksSyncToken: { type: String, required: false },
    quickBooksProductionCustomerId: { type: String, required: false },
    quickBooksProductionSyncToken: { type: String, required: false },
    createdInQuickbooks: { type: Boolean, required: false, default: false },
    defaultTerm: { type: String, required: false, default: "Net. 30" },
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
        contactDays: {
          type: [String],
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          default: ["Monday", "Thursday"],
        },
        principalPurchaseExecutive: {
          type: Boolean,
          required: false,
          default: false,
        },
        createdBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          },
          name: { type: String, required: false },
          userQuickBooksId: { type: String, required: false },
        },
      },
    ],
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        quickBooksItemIdProduction: { type: String, required: false },
        name: { type: String, required: false },
        manufacturer: { type: String, required: false },
        typeOfPurchase: { type: String, required: false },
        purchasePrice: { type: Number, required: false },
        quantity: { type: Number, required: false },
        date: { type: String, required: false },
        hotProduct: { type: Boolean, required: false, default: false },
      },
    ],
    wishlist: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        name: { type: String, required: false },
        manufacturer: { type: String, required: false },
        typeOfPurchase: { type: String, required: false },
        minPurchasePrice: { type: Number, required: false },
        maxPurchasePrice: { type: Number, required: false },
        minQuantity: { type: Number, required: false },
        maxQuantity: { type: Number, required: false },
        frequency: { type: String, required: false },
        date: { type: String, required: false },
        addedAt: { type: Date, required: false },
        hotProduct: { type: Boolean, required: false, default: false },
        productSearchQuery: { type: String, required: false },
      },
    ],
    emails: [
      {
        emailType: { type: String, required: false },
        email: { type: String, required: false },
        emailItems: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
              required: false,
            },
            name: { type: String, required: false },
            manufacturer: { type: String, required: false },
            typeOfPurchase: { type: String, required: false },
            offerPrice: { type: Number, required: false },
            quantity: { type: Number, required: false },
            date: { type: String, required: false },
            hotProduct: { type: Boolean, required: false, default: false },
          },
        ],
      },
    ],
    transactions: [
      {
        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        docNumber: { type: String, required: false },
        status: { type: String, required: false },
        amount: { type: Number, required: false },
        type: { type: String, required: false },
        date: { type: Date, required: false },
        notes: { type: String, required: false },
      },
    ],
    history: [
      {
        user: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          },
          name: { type: String, required: false },
          charge: { type: String, required: false },
          email: { type: String, required: false },
        },
        rep: {
          title: { type: String, required: false },
          role: { type: String, required: false },
          name: { type: String, required: false },
          lastName: { type: String, required: false },
          email: { type: String, required: false },
          phone: { type: String, required: false },
          mobile: { type: String, required: false },
        },
        type: { type: String, required: false },
        manuallyLogged: { type: Boolean, required: false, default: false },
        message: { type: String, required: false },
        notes: { type: String, required: false },
        date: { type: Date, required: false },
        lastUpdatedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          },
          name: { type: String, required: false },
          userQuickBooksId: { type: String, required: false },
        },
        createdBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          },
          name: { type: String, required: false },
          userQuickBooksId: { type: String, required: false },
        },
        assignedTo: [
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
        task: {
          taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: false,
          },
          action: { type: String, required: false },
          purchaseExecutive: {
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
          tags: [{ type: String, required: false }],
          priority: { type: String, required: false },
          dueDate: { type: Date, required: false },
          type: { type: String, required: false },
          name: { type: String, required: false },
          description: { type: String, required: false },
          notes: { type: String, required: false },
          status: { type: String, required: false },
          createdAt: { type: Date, required: false },
          updatedAt: { type: Date, required: false },
          duration: {
            qty: { type: Number, required: false },
            unit: { type: String, required: false },
          },
        },
        // Email thread fields (type === "EmailThread")
        emailThreadId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EmailThread",
          required: false,
        },
        gmailThreadId: { type: String, required: false },
        subject: { type: String, required: false },
        snippet: { type: String, required: false },
        participants: [{ type: String }],
        messageCount: { type: Number, required: false, default: 0 },
        readBy: [
          {
            userId: { type: mongoose.Schema.Types.ObjectId, required: false },
            isUnread: { type: Boolean, required: false, default: false },
            name: { type: String, required: false },
            viewedAt: { type: Date, required: false },
          },
        ],
      },
    ],
    specialProducts: [
      {
        _id: { type: String, required: false },
        productId: { type: String, required: false },
        productSearchQuery: { type: String, required: false },
        name: { type: String, required: false },
        manufacturer: { type: String, required: false },
        typeOfPurchase: { type: String, required: false },
        specialPrice: { type: Number, required: false },
        each: {
          price: { type: Number, required: false },
          countInStock: { type: Number, required: false },
          floatingStock: { type: Number, required: false },
          quickBooksItemId: { type: String, required: false },
          description: { type: String, required: false },
          gtin: { type: String, required: false },
          quickBooksItemIdProduction: { type: String, required: false },
          customerPrice: { type: Number, required: false },
          minSalePrice: { type: Number, required: false },
          heldStock: { type: Number, required: false },
        },
        box: {
          price: { type: Number, required: false },
          countInStock: { type: Number, required: false },
          floatingStock: { type: Number, required: false },
          description: { type: String, required: false },
          quickBooksItemId: { type: String, required: false },
          gtin: { type: String, required: false },
          quickBooksItemIdProduction: { type: String, required: false },
          customerPrice: { type: Number, required: false },
          minSalePrice: { type: Number, required: false },
          heldStock: { type: Number, required: false },
        },
        loose: {
          price: { type: Number, required: false },
          countInStock: { type: Number, required: false },
          floatingStock: { type: Number, required: false },
          description: { type: String, required: false },
          quickBooksItemId: { type: String, required: false },
          gtin: { type: String, required: false },
          quickBooksItemIdProduction: { type: String, required: false },
          customerPrice: { type: Number, required: false },
          minSalePrice: { type: Number, required: false },
          heldStock: { type: Number, required: false },
        },
        createdAt: { type: Date, required: false },
        updatedAt: { type: Date, required: false },
      },
    ],
    // Pipeline/CRM tracking fields
    pipelinePosition: { type: Number, required: false, default: 0 },
    pipelineStageChangedAt: { type: Date, required: false },
    pipelineHistory: [
      {
        fromStage: { type: String, required: false },
        toStage: { type: String, required: false },
        changedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          },
          name: { type: String, required: false },
        },
        changedAt: { type: Date, required: false, default: Date.now },
        notes: { type: String, required: false },
      },
    ],
  },
  {
    timestamps: true,
  },
);
customerSchema.index({ companyName: "text", notes: "text", aka: "text" });
customerSchema.index({ "user.userId": 1, leadStage: 1 }); // For lead stage follow-up queries
customerSchema.index({ "user.userId": 1, leadStage: 1, pipelinePosition: 1 }); // For pipeline queries
customerSchema.index({ status: 1 }); // For status filtering (Normal, Road Blocked, etc.)
customerSchema.index({ "user.userId": 1, status: 1 }); // For user + status queries
customerSchema.index({ "idn.id": 1 });
customerSchema.index({ "partnerIdn.id": 1 });
customerSchema.index({ "gpo.id": 1 });
customerSchema.index({ parentAccountId: 1 });

/**
 * ATLAS SEARCH INDEX: "default"
 * Configured in MongoDB Atlas for text search on:
 * - companyName (my_ngram analyzer, 2-15 char edge grams, lowercase)
 * - aka (my_ngram analyzer)
 * - email (my_ngram analyzer)
 * - finalName (my_ngram analyzer)
 * - phone, mobile (my_ngram analyzer)
 * - notes (my_ngram analyzer)
 * - purchaseExecutive.name, purchaseExecutive.email (my_ngram analyzer)
 *
 * Use $search aggregation stage for case-insensitive text matching
 * Example:
 *   Customer.aggregate([
 *     { $search: {
 *       index: "default",
 *       text: { query: "company name", path: "companyName" }
 *     }}
 *   ])
 */

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

const customerFields = [
  "companyName",
  "location.address",
  "location.city",
  "location.postalCode",
  "location.state",
  "location.country",
  "location.quickBooksAddressId",
  "billAddr.address",
  "billAddr.city",
  "billAddr.postalCode",
  "billAddr.state",
  "billAddr.country",
  "billAddr.quickBooksAddressId",
  "email",
  "phone",
  "website",
  "EIN",
  "quickBooksCustomerId",
  "quickBooksSyncToken",
  "createdInQuickbooks",
  "purchaseExecutive",
  "products",
  "specialProducts",
  "createdAt",
  "updatedAt",
  "_id",
];

export { Customer, customerFields };
export default Customer;
