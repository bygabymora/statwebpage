import { beforeEach, describe, expect, test, vi } from "vitest";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/emails/send-email";
import mailchimp from "@mailchimp/mailchimp_transactional";
import { getToken } from "next-auth/jwt";
import WpUser from "../../../models/WpUser";
import Customer from "../../../models/Customer";
import User from "../../../models/User";
import Product from "../../../models/Product";
import Order from "../../../models/Order";
import RateLimit from "../../../models/RateLimit";

vi.mock("@mailchimp/mailchimp_transactional", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }));
vi.mock("../../../utils/db", () => ({
  default: { connect: vi.fn(), disconnect: vi.fn() },
}));
vi.mock("../../../models/WpUser", () => ({ default: { findById: vi.fn() } }));
vi.mock("../../../models/Customer", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("../../../models/User", () => ({ default: { findById: vi.fn() } }));
vi.mock("../../../models/Product", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("../../../models/Order", () => ({ default: { findOne: vi.fn() } }));
// In-memory attempt counters (see utils/rateLimit.js).
vi.mock("../../../models/RateLimit", () => {
  const counters = new Map();
  return {
    default: {
      counters,
      findOneAndUpdate: vi.fn(({ key }) => ({
        lean: async () => {
          counters.set(key, (counters.get(key) || 0) + 1);
          return { key, count: counters.get(key) };
        },
      })),
    },
  };
});

// Mongoose-style query: supports `.select(...).lean()` and `.lean()`.
const query = (result) => ({
  select: () => query(result),
  lean: async () => result,
});

const STAFF = ["gaby@statsurgicalsupply.com", "sofi@statsurgicalsupply.com"];
const USER_ID = "507f1f77bcf86cd799439011";
const CUSTOMER_ID = "507f1f77bcf86cd799439022";
const OWNER_ID = "507f1f77bcf86cd799439033";
const ORDER_ID = "507f1f77bcf86cd799439044";
const PRODUCT_ID = "507f1f77bcf86cd799439055";

const wpUser = {
  _id: USER_ID,
  firstName: "Ana",
  lastName: "Diaz",
  email: "ana@clinic.com",
  customerId: CUSTOMER_ID,
};
const owner = {
  _id: OWNER_ID,
  name: "Rep Rivera",
  email: "rep@statsurgicalsupply.com",
  phone: "8135550100",
  charge: "Sales",
};

const post = async (body, headers = {}) => {
  const { req, res } = createMocks({ method: "POST", body, headers });
  await handler(req, res);
  return res;
};

// The one message handed to Mailchimp, with its recipients split out.
const sentMessage = () => {
  expect(sendMock).toHaveBeenCalledTimes(1);
  const { message } = sendMock.mock.calls[0][0];
  return {
    ...message,
    toEmail: message.to.find((r) => r.type === "to").email,
    bcc: message.to.filter((r) => r.type === "bcc").map((r) => r.email),
  };
};

const sendMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  RateLimit.counters.clear();
  process.env.MAILCHIMP_TRANSACTIONAL_API_KEY = "test-key";
  sendMock.mockResolvedValue([{ status: "sent" }]);
  mailchimp.mockReturnValue({ messages: { send: sendMock } });
  getToken.mockResolvedValue(null);
  WpUser.findById.mockReturnValue(query(wpUser));
  Customer.findById.mockReturnValue(
    query({
      _id: CUSTOMER_ID,
      companyName: "Clinic & Co",
      user: { userId: OWNER_ID, email: owner.email },
    }),
  );
  User.findById.mockReturnValue(query(owner));
});

describe("/api/emails/send-email: what it accepts", () => {
  test("rejects the old free-form payload (any recipient, any HTML)", async () => {
    const res = await post({
      toEmail: "victim@example.com",
      fromEmail: "ceo@statsurgicalsupply.com",
      subject: "Urgent",
      htmlContent: "<a href='https://phish.example'>Log in</a>",
    });

    expect(res.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test.each(["Forgot Password", "Unsubscribe", "constructor", "__proto__"])(
    "rejects %s (not a browser-requestable email)",
    async (action) => {
      const res = await post({ action, email: "victim@example.com" });
      expect(res.statusCode).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    },
  );

  test("rejects GET", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });
});

describe("public forms", () => {
  test("Contact Us goes to the visitor, from sales@, with their text escaped", async () => {
    const res = await post({
      action: "Contact Us",
      name: "<b>Eve</b>",
      email: " Visitor@Example.com ",
      message: "<a href='https://phish.example'>click</a>",
      // ignored: the browser can't choose these any more
      fromEmail: "ceo@statsurgicalsupply.com",
      htmlContent: "<h1>hi</h1>",
    });

    expect(res.statusCode).toBe(200);
    const sent = sentMessage();
    expect(sent.toEmail).toBe("visitor@example.com");
    expect(sent.from_email).toBe("sales@statsurgicalsupply.com");
    expect(sent.bcc).toEqual(
      expect.arrayContaining([...STAFF, "sales@statsurgicalsupply.com"]),
    );
    expect(sent.html).not.toContain("<a href='https://phish.example'>");
    expect(sent.html).toContain(
      "&lt;a href=&#39;https://phish.example&#39;&gt;click&lt;/a&gt;",
    );
    expect(sent.subject).toBe("&lt;b&gt;Eve&lt;/b&gt;, Thank You for Contacting Us!");
    expect(sent.html).not.toContain("<h1>hi</h1>");
  });

  test("rejects an invalid email address", async () => {
    const res = await post({ action: "Contact Us", name: "A", email: "nope" });
    expect(res.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("Product Wait List names the product from the database", async () => {
    Product.findById.mockReturnValue(
      query({ name: "Stapler 3000", manufacturer: "Acme" }),
    );

    const res = await post({
      action: "Product Wait List",
      name: "Ana",
      email: "ana@clinic.com",
      productId: PRODUCT_ID,
      // ignored: the product details come from the database
      item: { name: "<img src=x>" },
    });

    expect(res.statusCode).toBe(200);
    expect(Product.findById).toHaveBeenCalledWith(PRODUCT_ID);
    const sent = sentMessage();
    expect(sent.html).toContain("Stapler 3000 by Acme");
    expect(sent.html).not.toContain("<img src=x>");
  });

  test("Product Wait List is signed by the account owner when signed in", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });
    Product.findById.mockReturnValue(
      query({ name: "Stapler 3000", manufacturer: "Acme" }),
    );

    await post({
      action: "Product Wait List",
      name: "Ana",
      email: "ana@clinic.com",
      productId: PRODUCT_ID,
    });

    const sent = sentMessage();
    expect(sent.from_email).toBe(owner.email);
    expect(sent.html).toContain("Rep Rivera");
  });

  test("Product Wait List needs a real product", async () => {
    Product.findById.mockReturnValue(query(null));
    const res = await post({
      action: "Product Wait List",
      name: "Ana",
      email: "ana@clinic.com",
      productId: PRODUCT_ID,
    });
    expect(res.statusCode).toBe(404);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("Product Request includes the requested reference", async () => {
    const res = await post({
      action: "Product Request",
      name: "Ana",
      email: "ana@clinic.com",
      phone: "8135550199",
      searchedWord: "REF-123",
      manufacturer: "Acme",
      quantity: 4,
      uom: "Box",
      message: "Need it Monday",
    });

    expect(res.statusCode).toBe(200);
    const sent = sentMessage();
    expect(sent.html).toContain("Reference: REF-123");
    expect(sent.html).toContain("Quantity: 4");
    expect(sent.html).toContain("Need it Monday");
  });

  test("Product Manufacturer builds its email (arguments in the right order)", async () => {
    const res = await post({
      action: "Product Manufacturer",
      name: "Ana",
      email: "ana@clinic.com",
      productName: "Retractor",
      emailManufacturer: "Acme",
    });

    expect(res.statusCode).toBe(200);
    const sent = sentMessage();
    expect(sent.subject).toBe("Your Product Request Has Been Received");
    expect(sent.html).toContain("Retractor");
  });
});

describe("Order Confirmation", () => {
  const order = {
    _id: ORDER_ID,
    docNumber: "1042",
    totalPrice: 250,
    paymentMethod: "PO Number",
    tax: { pending: true, state: "GA" },
    shippingPreferences: { shippingMethod: "Ground", carrier: "UPS" },
    orderItems: [{ quantity: 2, name: "Gauze <pad>", totalPrice: 250 }],
  };

  test("needs a signed-in user", async () => {
    const res = await post({ action: "Order Confirmation", orderId: ORDER_ID });
    expect(res.statusCode).toBe(401);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("only for the signed-in user's own order", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });
    Order.findOne.mockReturnValue(query(null));

    const res = await post({ action: "Order Confirmation", orderId: ORDER_ID });

    expect(Order.findOne).toHaveBeenCalledWith({
      _id: ORDER_ID,
      "wpUser.userId": USER_ID,
    });
    expect(res.statusCode).toBe(404);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("goes to the account's own address, from the account owner", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });
    Order.findOne.mockReturnValue(query(order));

    const res = await post({
      action: "Order Confirmation",
      orderId: ORDER_ID,
      email: "someone-else@example.com", // ignored
    });

    expect(res.statusCode).toBe(200);
    const sent = sentMessage();
    expect(sent.toEmail).toBe("ana@clinic.com");
    expect(sent.from_email).toBe(owner.email);
    expect(sent.html).toContain("1042");
    expect(sent.html).toContain("GA sales tax");
    expect(sent.html).toContain("Gauze &lt;pad&gt;");
  });
});

describe("Exemption File Uploaded", () => {
  const attachment = {
    type: "application/pdf",
    name: "TEC_Clinic_26-10-20.pdf",
    content: "JVBERi0xLjQK",
  };

  test("needs a signed-in user", async () => {
    const res = await post({
      action: "Exemption File Uploaded",
      customerId: CUSTOMER_ID,
      attachment,
    });
    expect(res.statusCode).toBe(401);
  });

  test("only for the user's own customer account", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });
    const res = await post({
      action: "Exemption File Uploaded",
      customerId: "507f1f77bcf86cd799439099",
      attachment,
    });
    expect(res.statusCode).toBe(403);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("goes to accounting with the file, copying the account owner", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });

    const res = await post({
      action: "Exemption File Uploaded",
      customerId: CUSTOMER_ID,
      attachment,
    });

    expect(res.statusCode).toBe(200);
    const sent = sentMessage();
    expect(sent.toEmail).toBe("accounting@statsurgicalsupply.com");
    expect(sent.bcc).toContain(owner.email);
    expect(sent.attachments).toEqual([attachment]);
    expect(sent.html).toContain("Clinic &amp; Co");
    expect(sent.html).toContain("Ana Diaz (ana@clinic.com)");
  });

  test("rejects an attachment that isn't base64", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });
    const res = await post({
      action: "Exemption File Uploaded",
      customerId: CUSTOMER_ID,
      attachment: { ...attachment, content: "<html>" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Registration approved", () => {
  test("admins only", async () => {
    getToken.mockResolvedValue({ _id: USER_ID, isAdmin: false });
    const res = await post({ action: "Registration approved", userId: USER_ID });
    expect(res.statusCode).toBe(403);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("sends to the address the admin form shows, signed by the account owner", async () => {
    getToken.mockResolvedValue({ _id: "admin", isAdmin: true });

    const res = await post({
      action: "Registration approved",
      userId: USER_ID,
      email: "ana.new@clinic.com",
    });

    expect(res.statusCode).toBe(200);
    const sent = sentMessage();
    expect(sent.toEmail).toBe("ana.new@clinic.com");
    expect(sent.from_email).toBe(owner.email);
  });
});

describe("attempt limits per visitor (IP)", () => {
  const contactUs = {
    action: "Contact Us",
    name: "Ana",
    email: "ana@clinic.com",
    message: "Hello",
  };
  const fromIp = (ip) => ({ "x-real-ip": ip });

  test("the form stays open, but the 6th Contact Us in an hour is refused", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await post(contactUs, fromIp("203.0.113.7"))).statusCode).toBe(
        200,
      );
    }

    const res = await post(contactUs, fromIp("203.0.113.7"));

    expect(res.statusCode).toBe(429);
    expect(Number(res.getHeader("Retry-After"))).toBeGreaterThan(0);
    expect(JSON.parse(res._getData()).message).toMatch(
      /^Too many attempts\. Please try again in \d+ minutes?\.$/,
    );
    expect(sendMock).toHaveBeenCalledTimes(5);
  });

  test("other visitors aren't affected", async () => {
    for (let i = 0; i < 6; i++) await post(contactUs, fromIp("203.0.113.7"));

    expect((await post(contactUs, fromIp("198.51.100.4"))).statusCode).toBe(
      200,
    );
  });

  test("each form has its own count", async () => {
    for (let i = 0; i < 6; i++) await post(contactUs, fromIp("203.0.113.7"));

    const res = await post(
      { action: "Newsletter Subscription", name: "Ana", email: "a@b.co" },
      fromIp("203.0.113.7"),
    );
    expect(res.statusCode).toBe(200);
  });

  test("signed-in emails aren't counted (sign-in and ownership limit them)", async () => {
    getToken.mockResolvedValue({ _id: USER_ID });
    Order.findOne.mockReturnValue(
      query({ _id: ORDER_ID, orderItems: [], shippingPreferences: {} }),
    );

    await post(
      { action: "Order Confirmation", orderId: ORDER_ID },
      fromIp("203.0.113.7"),
    );

    expect(RateLimit.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

test("reports a provider rejection as a failure", async () => {
  sendMock.mockResolvedValue([{ status: "rejected", reject_reason: "spam" }]);
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  const res = await post({
    action: "Newsletter Subscription",
    name: "Ana",
    email: "ana@clinic.com",
  });

  expect(res.statusCode).toBe(500);
  consoleError.mockRestore();
});
