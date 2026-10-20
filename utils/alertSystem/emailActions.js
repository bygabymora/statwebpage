import mongoose from "mongoose";
import db from "../db";
import WpUser from "../../models/WpUser";
import Customer from "../../models/Customer";
import User from "../../models/User";
import Product from "../../models/Product";
import Order from "../../models/Order";
import { messageManagement } from "./customers/messageManagement";
import { escapeHtml, escapeHtmlDeep } from "./escapeHtml";
import { isValidEmail, normalizeText } from "./sendTransactionalEmail";

// Server-only. Builds the emails the site sends on behalf of the browser
// (POST /api/emails/send-email). The browser only names the email and sends
// form data; the recipient, the sender and the content are decided here, so
// the endpoint can't be used to send arbitrary email from our domain.

export class EmailRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const ACCOUNTING_EMAIL = "accounting@statsurgicalsupply.com";

// Text typed by a visitor: trimmed, length-capped and HTML-escaped.
const text = (value, maxLength = 200) =>
  escapeHtml(normalizeText(String(value ?? "")).slice(0, maxLength));

const requireEmail = (value) => {
  const email = normalizeText(String(value ?? "")).toLowerCase();
  if (!isValidEmail(email)) {
    throw new EmailRequestError(400, "A valid email address is required");
  }
  return email;
};

const requireId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new EmailRequestError(400, `Invalid ${label}`);
  }
  return String(value);
};

const requireSignIn = (token) => {
  if (!token?._id) throw new EmailRequestError(401, "Sign in required");
};

// The staff member who manages this user's customer account; they sign and
// send that customer's emails.
export async function findAccountOwner(wpUser) {
  if (!wpUser?.customerId) return null;
  const customer = await Customer.findById(wpUser.customerId)
    .select("user")
    .lean();
  if (!customer?.user?.userId) return null;
  const owner = await User.findById(customer.user.userId).lean();
  if (!owner?.name || !owner?.email) return null;
  return {
    name: owner.name,
    email: owner.email,
    phone: owner.phone || "",
    charge: owner.charge || "",
  };
}

const findSignedInAccountOwner = async (token) => {
  if (!token?._id) return null;
  await db.connect(true);
  const wpUser = await WpUser.findById(token._id).select("customerId").lean();
  return findAccountOwner(wpUser);
};

// Each action returns { contact, message, accountOwner?, attachment?, bcc? }.
// `contact.email` is who receives the email; staff are BCC'd on every email
// (see sendTransactionalEmail).
const EMAIL_ACTIONS = {
  // Public forms: the visitor gets a confirmation at the address they typed.
  "Contact Us": async ({ body }) => {
    const contact = { name: text(body.name), email: requireEmail(body.email) };
    return {
      contact,
      message: messageManagement(
        contact,
        "Contact Us",
        text(body.message, 5000),
      ),
    };
  },

  "Newsletter Subscription": async ({ body }) => {
    const contact = { name: text(body.name), email: requireEmail(body.email) };
    return {
      contact,
      message: messageManagement(contact, "Newsletter Subscription"),
    };
  },

  "Product Wait List": async ({ body, token }) => {
    const contact = {
      name: text(body.name),
      email: requireEmail(body.email),
      companyName: text(body.companyName),
    };
    const productId = requireId(body.productId, "product");
    await db.connect(true);
    const product = await Product.findById(productId)
      .select("name manufacturer")
      .lean();
    if (!product) throw new EmailRequestError(404, "Product not found");
    const item = escapeHtmlDeep({
      name: product.name || "",
      manufacturer: product.manufacturer || "",
    });
    const accountOwner = await findSignedInAccountOwner(token);
    return {
      contact,
      message: messageManagement(
        contact,
        "Product Wait List",
        null,
        null,
        item,
      ),
      accountOwner,
    };
  },

  "Product Request": async ({ body, token }) => {
    const contact = {
      name: text(body.name),
      email: requireEmail(body.email),
      phone: text(body.phone, 50),
      uom: text(body.uom, 50),
    };
    const item = {
      searchedWord: text(body.searchedWord),
      manufacturer: text(body.manufacturer),
      quantity: text(body.quantity, 20),
    };
    const accountOwner = await findSignedInAccountOwner(token);
    return {
      contact,
      message: messageManagement(
        contact,
        "Product Request",
        text(body.message, 5000),
        null,
        item,
      ),
      accountOwner,
    };
  },

  "Product Manufacturer": async ({ body }) => {
    const contact = { name: text(body.name), email: requireEmail(body.email) };
    const item = {
      productName: text(body.productName),
      emailManufacturer: text(body.emailManufacturer),
    };
    return {
      contact,
      message: messageManagement(
        contact,
        "Product Manufacturer",
        null,
        null,
        item,
      ),
    };
  },

  // Signed-in customers: built from the database, sent to the account's own
  // address.
  "Order Confirmation": async ({ body, token }) => {
    requireSignIn(token);
    const orderId = requireId(body.orderId, "order");
    await db.connect(true);
    const order = await Order.findOne({
      _id: orderId,
      "wpUser.userId": token._id,
    }).lean();
    if (!order) throw new EmailRequestError(404, "Order not found");
    const wpUser = await WpUser.findById(token._id)
      .select("firstName email customerId")
      .lean();
    if (!wpUser) throw new EmailRequestError(404, "User not found");

    const contact = {
      name: text(wpUser.firstName),
      email: requireEmail(wpUser.email),
    };
    // Plain JSON first (ObjectIds and dates become strings), then escaped.
    const safeOrder = escapeHtmlDeep(JSON.parse(JSON.stringify(order)));
    const accountOwner = await findAccountOwner(wpUser);
    return {
      contact,
      message: messageManagement(
        contact,
        "Order Confirmation",
        null,
        {
          ...safeOrder,
          orderItems: safeOrder.orderItems || [],
          shippingPreferences: safeOrder.shippingPreferences || {},
        },
        null,
        accountOwner,
      ),
      accountOwner,
    };
  },

  // Sent to accounting with the certificate attached; the customer's account
  // owner gets a copy.
  "Exemption File Uploaded": async ({ body, token }) => {
    requireSignIn(token);
    const customerId = requireId(body.customerId, "customer");
    await db.connect(true);
    const wpUser = await WpUser.findById(token._id)
      .select("firstName lastName email customerId")
      .lean();
    if (!token.isAdmin && String(wpUser?.customerId) !== customerId) {
      throw new EmailRequestError(403, "Forbidden");
    }
    const customer = await Customer.findById(customerId)
      .select("companyName user")
      .lean();
    if (!customer) throw new EmailRequestError(404, "Customer not found");

    let orderDocNumber;
    if (body.orderId) {
      const order = await Order.findOne({
        _id: requireId(body.orderId, "order"),
        ...(token.isAdmin ? {} : { "wpUser.userId": token._id }),
      })
        .select("docNumber")
        .lean();
      orderDocNumber = order?.docNumber;
    }

    const fileName = normalizeText(String(body.attachment?.name ?? "")).slice(
      0,
      200,
    );
    const content = String(body.attachment?.content ?? "");
    if (!fileName || !content || !/^[A-Za-z0-9+/]+=*$/.test(content)) {
      throw new EmailRequestError(400, "Invalid attachment");
    }
    const attachment = {
      type: String(body.attachment?.type || "application/octet-stream"),
      name: fileName,
      content,
    };

    const item = escapeHtmlDeep({
      companyName: customer.companyName || "",
      orderDocNumber: orderDocNumber || "",
      uploadedByName:
        [wpUser?.firstName, wpUser?.lastName].filter(Boolean).join(" ") ||
        customer.companyName ||
        "",
      uploadedByEmail: wpUser?.email || "",
      fileName,
    });
    const contact = { name: "Accounting", email: ACCOUNTING_EMAIL };
    return {
      contact,
      message: messageManagement(
        contact,
        "Exemption File Uploaded",
        null,
        null,
        item,
      ),
      attachment,
      bcc: customer.user?.email,
    };
  },

  // Admins only: tells a customer their registration was approved. The admin
  // form may pass the name and email it shows (possibly edited, not yet
  // saved); otherwise the saved ones are used.
  "Registration approved": async ({ body, token }) => {
    if (!token?.isAdmin) throw new EmailRequestError(403, "Admins only");
    const userId = requireId(body.userId, "user");
    await db.connect(true);
    const wpUser = await WpUser.findById(userId)
      .select("firstName email customerId")
      .lean();
    if (!wpUser) throw new EmailRequestError(404, "User not found");

    const contact = {
      name: text(body.name || wpUser.firstName || "Customer"),
      email: requireEmail(body.email || wpUser.email),
    };
    const accountOwner = await findAccountOwner(wpUser);
    return {
      contact,
      message: messageManagement(
        contact,
        "Registration approved",
        null,
        null,
        null,
        accountOwner,
      ),
      accountOwner,
    };
  },
};

export const isEmailAction = (action) =>
  typeof action === "string" && Object.hasOwn(EMAIL_ACTIONS, action);

export const buildActionEmail = (action, { body, token }) =>
  EMAIL_ACTIONS[action]({ body, token });
