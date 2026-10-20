import mongoose from "mongoose";

// One counter per (limit, client, time window); see utils/rateLimit.js.
// MongoDB deletes each document once its window has ended (TTL index).
const rateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    // No default: the counter is created by the first `$inc`.
    count: { type: Number },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false },
);

const RateLimit =
  mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);
export default RateLimit;
