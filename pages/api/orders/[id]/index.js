// /api/orders/:id
import { getToken } from "next-auth/jwt";
import Order from "../../../../models/Order";
import db from "../../../../utils/db";
import Estimate from "../../../../models/Estimate";
import Invoice from "../../../../models/Invoice";
import User from "../../../../models/User";
import Product from "../../../../models/Product";

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
    if (order.status === "Completed") {
      estimate = await Estimate.findOne({ linkedWpOrderId: id });
      if (estimate) {
        accountOwner = await User.findById(estimate.customer?.user?.userId);
        if (accountOwner) {
          accountOwner = {
            name: accountOwner.name,
            email: accountOwner.email,
            phone: accountOwner.phone,
          };
        }
      }
      if (estimate && estimate.invoice?.invoiceId) {
        // 5. Load the invoice
        invoice = await Invoice.findById(estimate.invoice?.invoiceId);
        if (invoice) {
          // 6. Update totalPrice
          order.totalPrice = invoice.totalPrice;
          order.itemsPrice = invoice.itemsPrice;
          // 7. Rebuild orderItems by enriching each invoice item
          order.orderItems = await Promise.all(
            invoice.invoiceItems.map(async (item) => {
              // fetch the product to get its image (etc.)
              const prod = await Product.findById(item.productId);

              return {
                // core invoice fields
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
              };
            })
          );

          // 8. Save the updated order
          await order.save();
        }
      }
    }

    res.status(200).send({ order, estimate, invoice, accountOwner });
  } catch (error) {
    console.error("Error in /api/orders/[id]:", error);

    res.status(500).send("Internal Server Error");
  }
};

export default handler;
