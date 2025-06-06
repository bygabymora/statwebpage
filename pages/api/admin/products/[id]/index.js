import { getToken } from "next-auth/jwt";
import Product from "../../../../../models/Product";
import db from "../../../../../utils/db";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).send("signin required");
  }

  if (req.method === "GET") {
    return getHandler(req, res, user);
  } else if (req.method === "PUT") {
    return putHandler(req, res, user);
  } else if (req.method === "DELETE") {
    return deleteHandler(req, res, user);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};
const getHandler = async (req, res) => {
  await db.connect(true);
  const product = await Product.findById(req.query.id);

  res.send(product);
};
const putHandler = async (req, res) => {
  await db.connect(true);
  const product = await Product.findById(req.query.id);
  if (product) {
    product.name = req.body.name;
    product.manufacturer = req.body.manufacturer;
    product.name = req.body.name;
    product.lot = req.body.lot;
    product.expiration = req.body.expiration;
    product.image = req.body.image;
    product.reference = req.body.reference;
    product.description = req.body.description;
    product.descriptionBox = req.body.descriptionBox;
    product.price = req.body.price;
    product.priceBox = req.body.priceBox;
    product.each = req.body.each;
    product.box = req.body.box;
    product.countInStock = req.body.countInStock;
    product.countInStockBox = req.body.countInStockBox;
    product.sentOverNight = req.body.sentOverNight;
    product.isInClearance = req.body.isInClearance;
    product.descriptionClearance = req.body.descriptionClearance;
    product.countInStockClearance = req.body.countInStockClearance;
    product.priceClearance = req.body.priceClearance;
    product.notes = req.body.notes;
    product.includes = req.body.includes;
    await product.save();

    res.send({ message: "Product updated successfully" });
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};
const deleteHandler = async (req, res) => {
  await db.connect(true);
  const product = await Product.findById(req.query.id);

  if (product) {
    await Product.findByIdAndDelete(req.query.id);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};

export default handler;
