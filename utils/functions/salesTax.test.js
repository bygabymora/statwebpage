import {
  SHIPPING_TAX_CLASSIFICATION_CODE,
  TAX_TREATMENT,
  determineOrderTaxStatus,
  getInvoiceTaxTotal,
  getStateTaxProfile,
  isItemTaxPending,
  resolveItemTaxTreatment,
  resolveShippingTaxTreatment,
} from "./salesTax";

const TAXABLE_CODE = "EUC-06130102-V1-00040000";
const EXEMPT_CODE = "EUC-06090102-V1-00040000";

const item = (overrides = {}) => ({
  productId: "p1",
  typeOfPurchase: "Each",
  taxable: true,
  taxClassificationRef: { value: TAXABLE_CODE },
  ...overrides,
});

describe("getStateTaxProfile", () => {
  it("finds a state by key, case-insensitively", () => {
    expect(getStateTaxProfile("az").key).toBe("AZ");
  });

  it("returns null for unknown or empty keys", () => {
    expect(getStateTaxProfile("ZZ")).toBeNull();
    expect(getStateTaxProfile("")).toBeNull();
  });
});

describe("resolveItemTaxTreatment", () => {
  const az = getStateTaxProfile("AZ");

  it("marks a T-coded item as taxable in an agency state", () => {
    expect(resolveItemTaxTreatment(az, item())).toBe(TAX_TREATMENT.TAXABLE);
  });

  it("marks an E-coded item as exempt", () => {
    expect(
      resolveItemTaxTreatment(
        az,
        item({ taxClassificationRef: { value: EXEMPT_CODE } }),
      ),
    ).toBe(TAX_TREATMENT.EXEMPT);
  });

  it("reads the EUC from `value`, ignoring the human label in `code`", () => {
    const njProduct = item({
      taxClassificationRef: {
        value: EXEMPT_CODE,
        name: "Medical & health related items > Prosthetic devices > With a prescription",
        code: "Prosthetic/Implant",
      },
    });

    expect(resolveItemTaxTreatment(getStateTaxProfile("NJ"), njProduct)).toBe(
      TAX_TREATMENT.EXEMPT,
    );
  });

  it("honors a product flagged as not taxable", () => {
    expect(resolveItemTaxTreatment(az, item({ taxable: false }))).toBe(
      TAX_TREATMENT.EXEMPT,
    );
  });

  it("reports a missing classification code as unclassified", () => {
    expect(
      resolveItemTaxTreatment(az, item({ taxClassificationRef: {} })),
    ).toBe(TAX_TREATMENT.UNCLASSIFIED);
  });

  it("reports a code absent from the state map as unclassified", () => {
    expect(
      resolveItemTaxTreatment(
        az,
        item({ taxClassificationRef: { value: "EUC-UNKNOWN" } }),
      ),
    ).toBe(TAX_TREATMENT.UNCLASSIFIED);
  });

  it("treats every item as exempt in a non-agency state", () => {
    expect(resolveItemTaxTreatment(getStateTaxProfile("AL"), item())).toBe(
      TAX_TREATMENT.EXEMPT,
    );
  });
});

describe("isItemTaxPending", () => {
  it("flags taxable and unclassified items only", () => {
    expect(isItemTaxPending(TAX_TREATMENT.TAXABLE)).toBe(true);
    expect(isItemTaxPending(TAX_TREATMENT.UNCLASSIFIED)).toBe(true);
    expect(isItemTaxPending(TAX_TREATMENT.EXEMPT)).toBe(false);
    expect(isItemTaxPending(undefined)).toBe(false);
  });
});

describe("resolveShippingTaxTreatment", () => {
  it("uses the freight classification code for the state", () => {
    // AZ maps EUC-13010203-V1-00100000 to "E", AK to "T".
    expect(resolveShippingTaxTreatment(getStateTaxProfile("AZ"))).toBe(
      TAX_TREATMENT.EXEMPT,
    );
    expect(
      getStateTaxProfile("AK").taxability[SHIPPING_TAX_CLASSIFICATION_CODE],
    ).toBe("T");
  });

  it("is exempt when the state has no agency", () => {
    expect(resolveShippingTaxTreatment(getStateTaxProfile("AL"))).toBe(
      TAX_TREATMENT.EXEMPT,
    );
  });
});

describe("getInvoiceTaxTotal", () => {
  it("uses the rolled-up total when present", () => {
    expect(
      getInvoiceTaxTotal({
        taxes: { totalTaxAmount: 12.34 },
        invoiceItems: [{ taxAmount: 99 }],
      }),
    ).toBe(12.34);
  });

  it("falls back to per-line amounts plus shipping tax", () => {
    expect(
      getInvoiceTaxTotal({
        taxes: {},
        invoiceItems: [{ taxAmount: 5.25 }, { taxAmount: 1.1 }, {}],
        shippingTax: { taxAmount: 0.65 },
      }),
    ).toBe(7);
  });

  it("ignores the `taxed` flag when an amount is present", () => {
    expect(
      getInvoiceTaxTotal({ invoiceItems: [{ taxed: false, taxAmount: 3 }] }),
    ).toBe(3);
  });

  it("returns 0 for a missing invoice or no tax", () => {
    expect(getInvoiceTaxTotal(null)).toBe(0);
    expect(getInvoiceTaxTotal({ invoiceItems: [] })).toBe(0);
  });
});

describe("determineOrderTaxStatus", () => {
  it("flags an order shipping to an agency state with a taxable item", () => {
    const result = determineOrderTaxStatus({
      orderItems: [item()],
      shippingAddress: { state: "AZ" },
      customer: { taxable: true },
    });

    expect(result.pending).toBe(true);
    expect(result.state).toBe("AZ");
    expect(result.hasAgency).toBe(true);
    expect(result.taxableItemCount).toBe(1);
    expect(result.unclassifiedItemCount).toBe(0);
  });

  it("does not flag a non-agency state", () => {
    const result = determineOrderTaxStatus({
      orderItems: [item()],
      shippingAddress: { state: "AL" },
      customer: { taxable: true },
    });

    expect(result.pending).toBe(false);
    expect(result.hasAgency).toBe(false);
  });

  it("does not flag a tax-exempt customer", () => {
    const result = determineOrderTaxStatus({
      orderItems: [item()],
      shippingAddress: { state: "AZ" },
      customer: { taxable: false },
    });

    expect(result.pending).toBe(false);
    expect(result.customerTaxable).toBe(false);
    expect(result.items[0].taxTreatment).toBe(TAX_TREATMENT.EXEMPT);
  });

  it("flags unclassified items so the back office reviews them", () => {
    const result = determineOrderTaxStatus({
      orderItems: [item({ taxClassificationRef: {} })],
      shippingAddress: { state: "AZ" },
      customer: { taxable: true },
    });

    expect(result.pending).toBe(true);
    expect(result.taxableItemCount).toBe(0);
    expect(result.unclassifiedItemCount).toBe(1);
  });

  it("does not flag an order whose items are all exempt in the state", () => {
    const result = determineOrderTaxStatus({
      orderItems: [item({ taxClassificationRef: { value: EXEMPT_CODE } })],
      shippingAddress: { state: "AZ" },
      customer: { taxable: true },
    });

    expect(result.pending).toBe(false);
  });

  it("does not flag when the shipping state is not set yet", () => {
    const result = determineOrderTaxStatus({
      orderItems: [item()],
      shippingAddress: {},
      customer: {},
    });

    expect(result.pending).toBe(false);
    expect(result.state).toBe("");
  });

  it("handles being called with no arguments", () => {
    expect(determineOrderTaxStatus().pending).toBe(false);
  });
});
