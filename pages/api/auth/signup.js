import bcryptjs from "bcryptjs";
import WpUser from "../../../models/WpUser";
import db from "../../../utils/db";

async function handler(req, res) {
  if (req.method !== "POST") {
    return;
  }
  const {
    firstName,
    lastName,
    email,
    password,
    companyEinCode,
    companyName,
    phoneNumber,
  } = req.body;

  const normalizedCompanyEinCode = String(companyEinCode || "").trim();
  const normalizedPhoneNumber = String(phoneNumber || "").trim();

  const isOnlyDigits = (value) => /^\d+$/.test(value);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !email.includes("@") ||
    !password ||
    password.trim().length < 5 ||
    !normalizedPhoneNumber
  ) {
    res.status(422).json({
      message: "Validation error",
    });
    return;
  }

  if (
    !isOnlyDigits(normalizedCompanyEinCode) ||
    !isOnlyDigits(normalizedPhoneNumber)
  ) {
    res.status(422).json({
      message: "Company EIN and Phone Number must contain numbers only",
    });
    return;
  }

  await db.connect(true);

  const existingUser = await WpUser.findOne({ email: email });
  if (existingUser) {
    res.status(422).json({ message: "User exists already!" });

    return;
  }

  const newUser = new WpUser({
    lastName,
    firstName,
    email,
    password: bcryptjs.hashSync(password),
    isAdmin: false,
    companyName,
    companyEinCode: normalizedCompanyEinCode,
    phoneNumber: normalizedPhoneNumber,
    active: true,
    approved: false,
    restricted: false,
  });

  const user = await newUser.save();

  res.status(201).send({
    message: "Created user!",
    _id: user._id,
    lastName: user.lastName,
    firstName: user.firstName,
    email: user.email,
    isAdmin: user.isAdmin,
    companyName: user.companyName,
    companyEinCode: user.companyEinCode,
    phoneNumber: user.phoneNumber,
  });
}

export default handler;
