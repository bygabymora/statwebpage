import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    imageUrl: { type: String, required: true },
    videoUrl: { type: String },
    hasVideo: { type: Boolean, default: false },
    videoType: { type: String, enum: ["mp4", "webm", "youtube", "vimeo"] },
    author: { type: String, required: true },
    sources: [
      {
        title: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const News = mongoose.models.News || mongoose.model("News", newsSchema);

export default News;
