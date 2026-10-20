import bcryptjs from "bcryptjs";
import WpUser from "../../../models/WpUser";
import db from "../../../utils/db";
import { messageManagement } from "../../../utils/alertSystem/customers/messageManagement";
import { sendEmailMessage } from "../../../utils/alertSystem/sendEmailMessage";
import { escapeHtml } from "../../../utils/alertSystem/escapeHtml";
import { RATE_LIMITS, enforceRateLimit } from "../../../utils/rateLimit";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Open to anyone, so a limited number of attempts per visitor (IP).
  if (!(await enforceRateLimit(req, res, "signup", RATE_LIMITS.signup))) {
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

  // Registration summary to the new user (staff are BCC'd). A failed email
  // never fails the signup.
  try {
    const contact = {
      name: escapeHtml(`${user.firstName} ${user.lastName}`.trim()),
      email: user.email,
      companyName: escapeHtml(user.companyName || "Not provided"),
      companyEinCode: escapeHtml(user.companyEinCode || "Not provided"),
    };
    await sendEmailMessage(messageManagement(contact, "Register"), contact);
  } catch (emailError) {
    console.error("Failed to send registration email:", emailError);
  }

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
