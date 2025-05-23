import { getToken } from "next-auth/jwt";
import db from "../../../utils/db";
import moment from "moment";
import Estimate from "../../../models/Estimate";
import Product from "../../../models/Product";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  const token = await getToken({ req });

  if (!token) {
    return res.status(401).send("Signin required");
  }

  await db.connect(true);

  try {
    const currentDate = moment().format("YYMMDD");
    const randomNumber = Math.floor(Math.random() * 90) + 10;
    const estimateDocNumber = "E" + currentDate + "-" + randomNumber;

    const { estimateItems, timePeriod, ...rest } = req.body;

    const currentTime = new Date();
    const onHoldTime = currentTime;
    const timerEnd = new Date(
      currentTime.getTime() + timePeriod * 60 * 60 * 1000
    );

    const newEstimate = new Estimate({
      ...rest,
      estimateItems,
      docNumber: estimateDocNumber,
      status: "On Hold",
      timePeriod,
      onHoldTime,
      timerEnd,
    });

    const savedEstimate = await newEstimate.save();

    if (Array.isArray(estimateItems)) {
      for (const item of estimateItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          product[item.typeOfPurchase].heldStock += item.quantity;
          await product.save();
        }
      }
    }

    return res.status(200).send({
      message: "Estimate created and hold applied",
      estimate: savedEstimate,
    });
  } catch (error) {
    console.error("Error creating/updating estimate:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export default handler;
