// Stock actually held for pending orders/estimates isn't available to sell;
// callers should treat countInStock as gross and subtract heldStock to get
// what's truly available to a customer.
export const getAvailableStock = (variant) => {
  if (!variant) return 0;
  const countInStock = Number(variant.countInStock) || 0;
  const heldStock = Number(variant.heldStock) || 0;
  return Math.max(0, countInStock - heldStock);
};

// Returns a shallow copy of the variant with countInStock reduced by heldStock.
export const withAvailableStock = (variant) => {
  if (!variant) return variant;
  return { ...variant, countInStock: getAvailableStock(variant) };
};
