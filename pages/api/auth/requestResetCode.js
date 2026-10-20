import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";
import crypto from "crypto";
import { messageManagement } from "../../../utils/alertSystem/customers/messageManagement";
import { sendEmailMessage } from "../../../utils/alertSystem/sendEmailMessage";
import { escapeHtml } from "../../../utils/alertSystem/escapeHtml";
import { RATE_LIMITS, enforceRateLimit } from "../../../utils/rateLimit";

// Signs the reset email.
const RESET_EMAIL_SENDER = {
  name: "Sofía Gómez",
  email: "sofi@statsurgicalsupply.com",
  charge: "IT Assistant",
  phone: "8132520727",
};

// Same reply whether or not the account exists, so this endpoint can't be
// used to find out which emails are registered.
const GENERIC_RESPONSE = {
  message: "If we find your email, a reset code has been sent to it.",
};

// generate a random 10-character code; letters and digits only, so it
// survives the reset link's URL and the email HTML unescaped
function generateResetCode(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return code;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Limited per visitor (IP) and per address, whether or not it exists.
  if (
    !(await enforceRateLimit(
      req,
      res,
      "passwordReset:ip",
      RATE_LIMITS.passwordResetPerIp,
    )) ||
    !(await enforceRateLimit(
      req,
      res,
      "passwordReset:email",
      RATE_LIMITS.passwordResetPerEmail,
      email.trim().toLowerCase(),
    ))
  ) {
    return;
  }

  try {
    await db.connect();

    // look up the user
    const user = await WpUser.findOne({ email: email.trim() });
    if (!user) {
      return res.status(200).json(GENERIC_RESPONSE);
    }

    // generate code & expiration (10 minutes)
    const code = generateResetCode(10);
    const expireDate = new Date(Date.now() + 10 * 60 * 1000);

    // save into the user document
    user.resetCode = { code, expireDate };
    await user.save();

    // The code only ever leaves the server inside this email, so it goes
    // to the account's address alone: no staff copies of a working link.
    const contact = { name: escapeHtml(user.firstName), email: user.email };
    const emailMessage = messageManagement(
      contact,
      "Forgot Password",
      code,
      null,
      null,
      RESET_EMAIL_SENDER,
    );
    await sendEmailMessage(emailMessage, contact, RESET_EMAIL_SENDER, {
      copyStaff: false,
    });

    return res.status(200).json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("requestResetCode error:", err);
    return res
      .status(500)
      .json({ message: "Internal error, please try again later" });
  }
}
