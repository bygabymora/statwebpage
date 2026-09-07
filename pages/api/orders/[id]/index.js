// /api/orders/:id
import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import db from "../../../../utils/db";
import Estimate from "../../../../models/Estimate";
import Invoice from "../../../../models/Invoice";
import User from "../../../../models/User";
import Product from "../../../../models/Product";
import WpUser from "../../../../models/WpUser";
import Customer from "../../../../models/Customer";
import {
  determineOrderTaxStatus,
  getInvoiceTaxTotal,
} from "../../../../utils/functions/salesTax";

const handler = async (req, res) => {
  const wpUsers = await getToken({ req });
  if (!wpUsers) {
    return res.status(401).send("signin required");
  }

  const { id } = req.query;

  await db.connect(true);

  try {
    const order = await Order.findById(id);
    let estimate = null;
    let invoice = null;
    let accountOwner = null;
    if (!order) {
      return res.status(404).send("Order not found");
    }
    if (
      !wpUsers.isAdmin &&
      String(order.wpUser?.userId) !== String(wpUsers._id)
    ) {
      return res.status(403).send("Forbidden");
    }
    if (order.status === "Completed") {
      estimate =
        (order.estimateId ? await Estimate.findById(order.estimateId) : null) ||
        (await Estimate.findOne({ linkedWpOrderId: id }));

      if (estimate) {
        // The estimate -> invoice back-reference is not always written, so fall
        // back to the invoice's own link to the estimate.
        invoice =
          (estimate.invoice?.invoiceId ?
            await Invoice.findById(estimate.invoice.invoiceId)
          : null) || (await Invoice.findOne({ estimate: estimate._id }));
      }

      // The invoice carries its own order link, so it can be found even when
      // the estimate cannot.
      if (!invoice) {
        invoice = await Invoice.findOne({ linkedWpOrderId: id });
      }
      if (invoice && !estimate && invoice.estimate) {
        estimate = await Estimate.findById(invoice.estimate);
      }

      // Resolved after both lookups so the rep is still found when the estimate
      // only turns up via the invoice.
      const accountOwnerId =
        estimate?.customer?.user?.userId || invoice?.customer?.user?.userId;
      if (accountOwnerId) {
        const ownerUser = await User.findById(accountOwnerId);
        if (ownerUser) {
          accountOwner = {
            name: ownerUser.name,
            email: ownerUser.email,
            phone: ownerUser.phone,
          };
        }
      }

      if (invoice) {
        order.totalPrice = invoice.totalPrice;
        order.itemsPrice = invoice.itemsPrice;

        order.orderItems = await Promise.all(
          invoice.invoiceItems.map(async (item) => {
            const prod = await Product.findById(item.productId);

            return {
              name: item.name,
              productId: item.productId,
              price: item.unitPrice,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              _id: item._id,
              image: prod?.image || "",
              typeOfPurchase: item.typeOfPurchase,
              sentOverNight: item.sentOverNight,
              quickBooksItemIdProduction: item.quickBooksItemIdProduction,
              taxable: item.taxed,
              taxClassificationRef: item.taxClassificationRef,
            };
          }),
        );

        // The invoice is the authority on tax, so the hold is released here.
        order.taxPrice = getInvoiceTaxTotal(invoice);
        order.tax.pending = false;
        order.tax.resolvedAt = new Date();

        await order.save();
      }
    }

    // The rep belongs to the customer, so resolve it even for orders that have
    // no estimate yet.
    if (!accountOwner) {
      const buyer = await WpUser.findById(order.wpUser?.userId)
        .select("customerId")
        .lean();
      const buyerCustomer =
        buyer?.customerId ?
          await Customer.findById(buyer.customerId).select("user").lean()
        : null;

      if (buyerCustomer?.user?.userId) {
        const ownerUser = await User.findById(buyerCustomer.user.userId);
        if (ownerUser) {
          accountOwner = {
            name: ownerUser.name,
            email: ownerUser.email,
            phone: ownerUser.phone,
          };
        }
      }
    }

    // Until an invoice exists the tax is only a prediction, so re-derive it from
    // current product and customer data instead of trusting what was stored.
    if (!invoice && order.tax?.determinedAt) {
      const wpUser = await WpUser.findById(order.wpUser?.userId)
        .select("customerId")
        .lean();
      const customer =
        wpUser?.customerId ?
          await Customer.findById(wpUser.customerId).select("taxable").lean()
        : null;

      const products = await Product.find({
        _id: {
          $in: order.orderItems.map((it) => it.productId).filter(Boolean),
        },
      })
        .select("taxable taxClassificationRef")
        .lean();

      const itemsForTax = order.orderItems.map((item) => {
        const prod = products.find(
          (p) => String(p._id) === String(item.productId),
        );
        return {
          taxable: prod ? prod.taxable !== false : item.taxable !== false,
          taxClassificationRef:
            prod?.taxClassificationRef ?? item.taxClassificationRef,
        };
      });

      const taxStatus = determineOrderTaxStatus({
        orderItems: itemsForTax,
        shippingAddress: order.shippingAddress,
        customer,
      });

      order.orderItems.forEach((item, index) => {
        item.taxable = itemsForTax[index].taxable;
        item.taxClassificationRef = itemsForTax[index].taxClassificationRef;
        item.taxTreatment = taxStatus.items[index]?.taxTreatment;
      });

      order.tax.pending = taxStatus.pending;
      order.tax.state = taxStatus.state;
      order.tax.hasAgency = taxStatus.hasAgency;
      order.tax.customerTaxable = taxStatus.customerTaxable;
      order.tax.taxableItemCount = taxStatus.taxableItemCount;
      order.tax.unclassifiedItemCount = taxStatus.unclassifiedItemCount;
      order.tax.shippingTaxTreatment = taxStatus.shippingTaxTreatment;
      order.tax.determinedAt = new Date();

      await order.save();
    }

    res.status(200).send({ order, estimate, invoice, accountOwner });
  } catch (error) {
    console.error("Error in /api/orders/[id]:", error);

    res.status(500).send("Internal Server Error");
  }
};

export default handler;
