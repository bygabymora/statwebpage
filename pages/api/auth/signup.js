import bcryptjs from "bcryptjs";
import WpUser from "../../../models/WpUser";
import db from "../../../utils/db";

async function handler(req, res) {
  if (req.method !== "POST") {
    return;
  }
  const { firstName, lastName, email, password, companyEinCode, companyName } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 5
  ) {
    res.status(422).json({
      message: "Validation error",
    });
    return;
  }

  await db.connect();

  const existingUser = await WpUser.findOne({ email: email });
  if (existingUser) {
    res.status(422).json({ message: "User exists already!" });
    await db.disconnect();
    return;
  }

  const newUser = new WpUser({
    lastName,
    firstName,
    email,
    password: bcryptjs.hashSync(password),
    isAdmin: false,
    companyName,
    companyEinCode,
    active: true,
    approved: false,
    restricted: false,
  });

  const user = await newUser.save();
  await db.disconnect();
  res.status(201).send({
    message: "Created user!",
    _id: user._id,
    lastName: user.lastName,
    firstName: user.firstName,
    email: user.email,
    isAdmin: user.isAdmin,
    companyName: user.companyName,
    companyEinCode: user.companyEinCode,
  });
}

export default handler;
