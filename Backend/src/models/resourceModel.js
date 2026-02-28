import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    media_type: {
      type: String,
      enum: ["pdf", "image", "video", "link"],
      set: (v) => v.trim(),
      required: true,
    },
    media_url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true, // Now required
      trim: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", ResourceSchema);
export default Resource;
