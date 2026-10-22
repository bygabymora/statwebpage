import { getToken } from "next-auth/jwt";
const cloudinary = require('cloudinary').v2;

export default async function signature(req, res) {
  const user = await getToken({ req });
  if (!user || !user.isAdmin) {
    return res.status(401).send("admin signin required");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
    },
    process.env.CLOUDINARY_SECRET
  );

  res.statusCode = 200;
  // The key is not secret (it goes to Cloudinary with each upload), but it
  // lives in a sensitive server-only variable, so the browser gets it here.
  res.json({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY });
}
