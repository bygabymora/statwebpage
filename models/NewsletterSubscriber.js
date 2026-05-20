import mongoose from "mongoose";

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    source: { type: String, required: false, trim: true, default: "footer" },
    status: {
      type: String,
      required: false,
      trim: true,
      default: "subscribed",
    },
    mailchimpMemberId: { type: String, required: false, trim: true },
    lastSyncedAt: { type: Date, required: false },
    subscribedAt: { type: Date, required: false, default: Date.now },
    metadata: {
      type: {
        page: { type: String, required: false, trim: true },
        referrer: { type: String, required: false, trim: true },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

newsletterSubscriberSchema.index({ email: 1 }, { unique: true });

const NewsletterSubscriber =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);

export default NewsletterSubscriber;
