import { createMocks } from "node-mocks-http";
import handler from "./search"; // The API handler
import db from "../../utils/db";
import Product from "../../models/Product";
import WpUser from "../../models/WpUser";
import { getToken } from "next-auth/jwt";

// Mock dependencies
jest.mock("../../utils/db", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
}));
jest.mock("../../models/Product");
jest.mock("../../models/WpUser");
jest.mock("next-auth/jwt");

describe("/api/search", () => {
  let mockProducts;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock product data
    mockProducts = [
      {
        _id: "1",
        name: "Active Protected Product",
        active: true,
        protected: true,
        each: { countInStock: 10, wpPrice: 5 },
        box: { countInStock: 5, wpPrice: 20 },
        slug: "active-protected-product",
        manufacturer: "TestManu",
        toObject: function () {
          return this;
        }, // For lean()
      },
      {
        _id: "2",
        name: "Inactive Protected Product",
        active: false, // Should still be returned due to previous subtask
        protected: true,
        each: { countInStock: 8, wpPrice: 6 },
        box: { countInStock: 3, wpPrice: 22 },
        slug: "inactive-protected-product",
        manufacturer: "TestManu",
        toObject: function () {
          return this;
        },
      },
      {
        _id: "3",
        name: "Active Non-Protected Product",
        active: true,
        protected: false,
        each: { countInStock: 12, wpPrice: 7 },
        box: { countInStock: 6, wpPrice: 25 },
        slug: "active-non-protected-product",
        manufacturer: "TestManu",
        toObject: function () {
          return this;
        },
      },
      {
        _id: "4",
        name: "Inactive Non-Protected Product",
        active: false, // Should still be returned
        protected: false,
        each: { countInStock: 0, wpPrice: 0 }, // No stock, no price
        box: { countInStock: 0, wpPrice: 0 },
        slug: "inactive-non-protected-product",
        manufacturer: "TestManu",
        toObject: function () {
          return this;
        },
      },
    ];

    // Mock Product.find().lean() to return a copy of mockProducts
    Product.find = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnThis(), // Allow chaining .limit()
      lean: jest.fn().mockResolvedValue(mockProducts.map((p) => ({ ...p }))), // Return a copy
    });
    Product.findById = jest.fn().mockReturnValue({
      lean: jest.fn().mockImplementation((id) => {
        const product = mockProducts.find((p) => p._id === id);
        return Promise.resolve(product ? { ...product } : null);
      }),
    });
  });

  // Test Scenario 1: All products returned for restricted users
  test("should return all products for restricted users, regardless of active status", async () => {
    getToken.mockResolvedValue({ _id: "restrictedUserId" });
    WpUser.findById = jest.fn().mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ _id: "restrictedUserId", restricted: true }),
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { keyword: "" }, // No keyword, fetch all
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData.length).toBe(mockProducts.length);
    // Check if all original product names are present
    mockProducts.forEach((mp) => {
      expect(responseData.some((rp) => rp.name === mp.name)).toBe(true);
    });
  });

  // Test Scenario 2: countInStock adjustment for protected products (restricted user)
  test("should adjust countInStock to 0 for protected products for restricted users", async () => {
    getToken.mockResolvedValue({ _id: "restrictedUserId" });
    WpUser.findById = jest.fn().mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ _id: "restrictedUserId", restricted: true }),
    });

    // Ensure Product.find().lean() returns products with quantities
    Product.find.mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockProducts.map((p) => ({ ...p }))),
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { keyword: "" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());

    const protectedProduct1 = responseData.find((p) => p._id === "1"); // Active Protected
    const protectedProduct2 = responseData.find((p) => p._id === "2"); // Inactive Protected

    expect(protectedProduct1.each.countInStock).toBe(0);
    expect(protectedProduct1.box.countInStock).toBe(0);
    expect(protectedProduct2.each.countInStock).toBe(0);
    expect(protectedProduct2.box.countInStock).toBe(0);
  });

  // Test Scenario 3: countInStock unchanged for non-protected products (restricted user)
  test("should not change countInStock for non-protected products for restricted users", async () => {
    getToken.mockResolvedValue({ _id: "restrictedUserId" });
    WpUser.findById = jest.fn().mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ _id: "restrictedUserId", restricted: true }),
    });

    Product.find.mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockProducts.map((p) => ({ ...p }))),
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { keyword: "" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    const nonProtectedProduct = responseData.find((p) => p._id === "3"); // Active Non-Protected

    // Compare with original mock data
    const originalNonProtectedProduct = mockProducts.find((p) => p._id === "3");
    expect(nonProtectedProduct.each.countInStock).toBe(
      originalNonProtectedProduct.each.countInStock
    );
    expect(nonProtectedProduct.box.countInStock).toBe(
      originalNonProtectedProduct.box.countInStock
    );
  });

  // Test Scenario 4: countInStock unchanged (non-restricted user)
  test("should not change countInStock for any product for non-restricted users", async () => {
    getToken.mockResolvedValue({ _id: "nonRestrictedUserId" });
    WpUser.findById = jest.fn().mockReturnValue({
      lean: jest
        .fn()
        .mockResolvedValue({ _id: "nonRestrictedUserId", restricted: false }), // Non-restricted user
    });

    Product.find.mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockProducts.map((p) => ({ ...p }))),
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { keyword: "" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());

    // Check all products, their quantities should match the original mockProducts
    responseData.forEach((rp) => {
      const originalProduct = mockProducts.find((mp) => mp._id === rp._id);
      if (rp.each) {
        expect(rp.each.countInStock).toBe(originalProduct.each.countInStock);
      }
      if (rp.box) {
        expect(rp.box.countInStock).toBe(originalProduct.box.countInStock);
      }
    });
  });

  test("should return 405 if method is not GET", async () => {
    const { req, res } = createMocks({
      method: "POST", // Invalid method
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData()).message).toBe("Method Not Allowed");
  });

  test("should handle database errors gracefully", async () => {
    getToken.mockResolvedValue(null); // No user
    db.connect.mockRejectedValueOnce(new Error("DB Connection Error")); // Simulate DB error

    const { req, res } = createMocks({
      method: "GET",
      query: { keyword: "" },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).message).toBe("Internal Server Error");
    expect(JSON.parse(res._getData()).error).toBe("DB Connection Error");
  });

  // Add more tests for keyword search, exact ID lookup etc. if time permits
  // For now, focusing on the scenarios outlined in the subtask.
});
