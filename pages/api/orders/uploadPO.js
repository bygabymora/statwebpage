import { google } from "googleapis";
import multer from "multer";
import fs from "fs";
import { getToken } from "next-auth/jwt";
import db from "../../../utils/db";
import Order from "../../../models/Order";

// Multer temp storage
const upload = multer({ dest: "/tmp" });

// Disable Next’s bodyParser so Multer can run
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
  // 1) Connect to DB
  try {
    await db.connect(true);
  } catch (err) {
    return res
      .status(503)
      .json({ message: "DB connection failed", error: err.message });
  }

  // 2) Check auth
  const token = await getToken({ req });
  if (!token) return res.status(401).send("Signin required");

  // 3) Route methods
  if (req.method === "POST") return postHandler(req, res);
  if (req.method === "GET") return getHandler(req, res);
  return res.status(405).json({ message: "Method not allowed" });
};

const postHandler = async (req, res) => {
  try {
    // A) Parse file + fields
    await new Promise((resolve, reject) =>
      upload.single("file")(req, res, (err) => (err ? reject(err) : resolve()))
    );

    // B) Upload to Drive
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
    const fileId = driveRes.data.id;

    // C) Parse order JSON
    let orderData = {};
    if (req.body.order) {
      try {
        orderData = JSON.parse(req.body.order);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid JSON in `order` field" });
      }
    }

    let order = null;
    // D) If updating existing
    if (orderData._id) {
      order = await Order.findById(orderData._id);
      if (order) {
        order.fileId = fileId;
        order.fileName = originalname;
        await order.save();
      }
    }

    // E) If no existing order found → create new with next docNumber
    if (!order) {
      // 1) Find highest numeric docNumber
      const [last] = await Order.aggregate([
        { $project: { docNumber: 1, num: { $toInt: "$docNumber" } } },
        { $sort: { num: -1 } },
        { $limit: 1 },
      ]);

      const lastNumber = last?.num ?? 0;
      const nextDocNumber = (lastNumber + 1).toString();

      // 2) Create
      order = new Order({
        ...orderData,
        fileId,
        fileName: originalname,
        docNumber: nextDocNumber,
      });
      await order.save();
    }

    // F) Cleanup & respond
    fs.unlinkSync(tmpPath);
    return res
      .status(200)
      .json({ message: "File uploaded & order saved", order });
  } catch (err) {
    console.error("POST /api/orders/uploadPO error:", err);
    return res
      .status(500)
      .json({ message: "Upload failed", error: err.message });
  }
};

const getHandler = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) return res.status(400).json({ message: "fileId is required" });

    const client = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: client });

    // Fetch metadata
    const meta = await drive.files.get({ fileId, fields: "name, mimeType" });
    const { name: fileName, mimeType } = meta.data;

    // Stream file back
    const streamRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    streamRes.data.pipe(res).on("error", (err) => {
      console.error("Drive download error:", err);
      res.status(500).end();
    });
  } catch (err) {
    console.error("GET /api/orders/uploadPO error:", err);
    res.status(500).json({ message: "Download failed", error: err.message });
  }
};

export default handler;
