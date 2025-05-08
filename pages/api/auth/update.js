import bcryptjs from "bcryptjs";
import WpUser from "../../../models/WpUser";
import db from "../../../utils/db";
import { getToken } from "next-auth/jwt";

async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const user = await getToken({ req });
  if (!user) {
    return res.status(401).send({ message: "signin required" });
  }

  const { firstName, lastName, email, password } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !email.includes("@") ||
    (password && password.trim().length < 5)
  ) {
    res.status(422).json({
      message: "Validation error",
    });
    return;
  }

  await db.connect();
  const toUpdateUser = await WpUser.findById(user._id);
  toUpdateUser.firstName = firstName;
  toUpdateUser.lastName = lastName;
  toUpdateUser.email = email;

  if (password) {
    toUpdateUser.password = bcryptjs.hashSync(password);
  }

  await toUpdateUser.save();
  await db.disconnect();
  res.send({
    message: "User updated",
  });
}

export default handler;
