import states from "../states.json";

export const TAX_TREATMENT = {
  TAXABLE: "T",
  EXEMPT: "E",
  UNCLASSIFIED: "unclassified",
};

// Freight/delivery classification used by states.json to decide if the
// shipping charge itself is taxed.
export const SHIPPING_TAX_CLASSIFICATION_CODE = "EUC-13010203-V1-00100000";

/**
 * Returns the states.json entry for a 2-letter state key, or null.
 */
export function getStateTaxProfile(stateKey) {
  if (!stateKey) return null;
  const key = String(stateKey).trim().toUpperCase();
  return states.find((state) => state.key === key) || null;
}

/**
 * Resolves how a single item is treated in the given state.
 * An item we cannot classify is reported as "unclassified" so the back office
 * reviews it rather than silently shipping it untaxed.
 */
export function resolveItemTaxTreatment(stateProfile, item) {
  if (!stateProfile || !stateProfile.agency) return TAX_TREATMENT.EXEMPT;
  if (item?.taxable === false) return TAX_TREATMENT.EXEMPT;

  // `value` holds the EUC code that keys states.json; `code` is a human label.
  const euc = item?.taxClassificationRef?.value;
  if (!euc) return TAX_TREATMENT.UNCLASSIFIED;

  const treatment = stateProfile.taxability?.[euc];
  if (treatment === TAX_TREATMENT.TAXABLE) return TAX_TREATMENT.TAXABLE;
  if (treatment === TAX_TREATMENT.EXEMPT) return TAX_TREATMENT.EXEMPT;
  return TAX_TREATMENT.UNCLASSIFIED;
}

/**
 * True when an item is expected to be taxed once the invoice is issued.
 * Unclassified items count because they are held for back-office review.
 */
export function isItemTaxPending(taxTreatment) {
  return (
    taxTreatment === TAX_TREATMENT.TAXABLE ||
    taxTreatment === TAX_TREATMENT.UNCLASSIFIED
  );
}

/**
 * How the shipping charge itself is treated in the given state.
 */
export function resolveShippingTaxTreatment(stateProfile) {
  return resolveItemTaxTreatment(stateProfile, {
    taxable: true,
    taxClassificationRef: { value: SHIPPING_TAX_CLASSIFICATION_CODE },
  });
}

/**
 * The invoice's tax total. Falls back to the per-line amounts because the
 * rolled-up `taxes.totalTaxAmount` is only written once the invoice is filed.
 */
export function getInvoiceTaxTotal(invoice) {
  if (!invoice) return 0;

  const reported = Number(invoice.taxes?.totalTaxAmount) || 0;
  if (reported > 0) return reported;

  const itemsTax = (invoice.invoiceItems || []).reduce(
    (sum, item) => sum + (Number(item.taxAmount) || 0),
    0,
  );
  const shippingTax = Number(invoice.shippingTax?.taxAmount) || 0;

  return Number((itemsTax + shippingTax).toFixed(2));
}

/**
 * Decides whether an order needs sales tax applied before it can be paid.
 * Only determines taxability -- the amount comes from the back-office invoice.
 */
export function determineOrderTaxStatus({
  orderItems = [],
  shippingAddress = {},
  customer = {},
} = {}) {
  const stateKey = shippingAddress?.state || "";
  const stateProfile = getStateTaxProfile(stateKey);
  const hasAgency = Boolean(stateProfile?.agency);
  const customerTaxable = customer?.taxable !== false;

  const items = orderItems.map((item) => ({
    productId: item?.productId,
    typeOfPurchase: item?.typeOfPurchase,
    taxTreatment:
      customerTaxable ?
        resolveItemTaxTreatment(stateProfile, item)
      : TAX_TREATMENT.EXEMPT,
  }));

  const taxableItemCount = items.filter(
    (item) => item.taxTreatment === TAX_TREATMENT.TAXABLE,
  ).length;
  const unclassifiedItemCount = items.filter(
    (item) => item.taxTreatment === TAX_TREATMENT.UNCLASSIFIED,
  ).length;

  return {
    pending:
      customerTaxable &&
      hasAgency &&
      taxableItemCount + unclassifiedItemCount > 0,
    state:
      stateProfile?.key || (stateKey ? String(stateKey).toUpperCase() : ""),
    hasAgency,
    customerTaxable,
    taxableItemCount,
    unclassifiedItemCount,
    shippingTaxTreatment:
      customerTaxable ?
        resolveShippingTaxTreatment(stateProfile)
      : TAX_TREATMENT.EXEMPT,
    items,
  };
}
