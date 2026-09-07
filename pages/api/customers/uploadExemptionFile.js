import { google } from "googleapis";
import multer from "multer";
import fs from "fs";
import { getToken } from "next-auth/jwt";
import db from "../../../utils/db";
import Customer from "../../../models/Customer";

// Multer temp storage
const upload = multer({ dest: "/tmp" });

// Disable Next's bodyParser so Multer can run
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "50mb",
  },
};

// Service account auth for Drive
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const handler = async (req, res) => {
  try {
    await db.connect(true);
  } catch (err) {
    return res
      .status(503)
      .json({ message: "DB connection failed", error: err.message });
  }

  const token = await getToken({ req });
  if (!token) return res.status(401).send("Signin required");

  if (req.method === "POST") return postHandler(req, res);
  return res.status(405).json({ message: "Method not allowed" });
};

const postHandler = async (req, res) => {
  try {
    await new Promise((resolve, reject) =>
      upload.single("file")(req, res, (err) =>
        err ? reject(err) : resolve(),
      ),
    );

    const { customerId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    if (!customerId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Missing customerId" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Customer not found" });
    }

    const client = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: client });
    const { originalname, mimetype, path: tmpPath } = req.file;
    const driveRes = await drive.files.create({
      resource: {
        name: originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: { mimeType: mimetype, body: fs.createReadStream(tmpPath) },
      fields: "id",
    });

    customer.exemptionFileId = driveRes.data.id;
    customer.exemptionFileName = originalname;
    await customer.save();

    fs.unlinkSync(tmpPath);
    return res
      .status(200)
      .json({ message: "Exemption file uploaded", customer });
  } catch (err) {
    console.error("POST /api/customers/uploadExemptionFile error:", err);
    return res
      .status(500)
      .json({ message: "Upload failed", error: err.message });
  }
};

export default handler;
