import db from "../../../utils/db";
import WpUser from "../../../models/WpUser";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, code, and newPassword are required" });
  }

  try {
    await db.connect();

    const user = await WpUser.findOne({ email: email.trim() });
    if (!user || !user.resetCode) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    const { code: savedCode, expireDate } = user.resetCode;
    if (savedCode !== code) {
      return res.status(400).json({ message: "Reset code is incorrect" });
    }
    if (new Date() > new Date(expireDate)) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear resetCode
    user.password = hashedPassword;
    user.resetCode = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Your password has been reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error, please try again later" });
  }
}
