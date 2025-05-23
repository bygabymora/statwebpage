import { getToken } from "next-auth/jwt";
import db from "../../../../../utils/db";
import User from "../../../../../models/User";

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send("Login required");
  }

  if (req.method === "GET") {
    return getHandler(req, res, user);
  } else {
    return res.status(400).send({ message: "Method not allowed" });
  }
};

const getHandler = async (req, res) => {
  await db.connect(true);

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.send(user);
};

export default handler;
