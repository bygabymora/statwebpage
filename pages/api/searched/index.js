import Searched from "../../../models/Searched";
import db from "../../../utils/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await db.connect(true);

      const searchedWord =
        typeof req.body?.searchedWord === "string" ?
          req.body.searchedWord.trim()
        : "";
      const name =
        typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const manufacturer =
        typeof req.body?.manufacturer === "string" ?
          req.body.manufacturer.trim()
        : "";
      const email =
        typeof req.body?.email === "string" ? req.body.email.trim() : "";
      const phone =
        typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
      const message =
        typeof req.body?.message === "string" ? req.body.message.trim() : "";
      const uom = typeof req.body?.uom === "string" ? req.body.uom.trim() : "";

      if (!searchedWord) {
        return res.status(400).send({ message: "searchedWord is required" });
      }

      const rawQuantity = req.body?.quantity;
      let quantity;
      if (
        rawQuantity !== undefined &&
        rawQuantity !== null &&
        String(rawQuantity).trim() !== ""
      ) {
        const parsedQuantity = Number(rawQuantity);
        if (!Number.isFinite(parsedQuantity)) {
          return res
            .status(400)
            .send({ message: "quantity must be a valid number" });
        }
        quantity = parsedQuantity;
      }

      const searched = new Searched({
        searchedWord,
        name: name || "raw-search",
        quantity,
        manufacturer: manufacturer || "raw-search",
        email: email || "raw-search",
        phone,
        message,
        uom,
      });
      const createdSearched = await searched.save();

      res
        .status(201)
        .send({ message: "Searched created", searched: createdSearched });
    } catch (error) {
      if (error?.name === "ValidationError") {
        return res.status(400).send({
          message: "Invalid searched payload",
          error: error.message,
        });
      }

      console.error("Error creating searched entry:", error);
      res.status(500).send({
        message: "Error in creating searched",
        error: error?.message || "Unknown server error",
      });
    }
  } else {
    res.status(405).send({ message: "Method not allowed" });
  }
}
