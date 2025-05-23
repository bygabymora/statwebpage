import Searched from "../../../models/Searched";
import db from "../../../utils/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await db.connect(true);
      const searched = new Searched({
        searchedWord: req.body.searchedWord,
        name: req.body.name,
        quantity: req.body.quantity,
        manufacturer: req.body.manufacturer,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
      });
      const createdSearched = await searched.save();

      res
        .status(201)
        .send({ message: "Searched created", searched: createdSearched });
    } catch (error) {
      res.status(500).send({ message: "Error in creating searched", error });
    }
  } else {
    res.status(405).send({ message: "Method not allowed" });
  }
}
