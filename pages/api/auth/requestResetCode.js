import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";
import crypto from "crypto";

// generate a random 10-character code
function generateResetCode(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
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
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    await db.connect();

    // look up the user
    const user = await WpUser.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate code & expiration (10 minutes)
    const code = generateResetCode(10);
    const expireDate = new Date(Date.now() + 10 * 60 * 1000);

    // save into the user document
    user.resetCode = { code, expireDate };
    await user.save();

    // return the code plus user info
    return res.status(200).json({
      resetCode: code,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("requestResetCode error:", err);
    return res
      .status(500)
      .json({ message: "Internal error, please try again later" });
  }
}
