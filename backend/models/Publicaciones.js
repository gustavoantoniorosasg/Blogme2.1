import mongoose from "mongoose";

const PublicacionSchema = new mongoose.Schema({
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  authorAvatar: { type: String, required: true },
  content: { type: String, required: true },
  imgs: { type: [String], default: [] },
  ts: { type: Number, default: Date.now },
  reports: {
    type: [
      {
        reason: String,
        reporter: String,
        ts: Number
      }
    ],
    default: []
  }
});

export default mongoose.model("Publicacion", PublicacionSchema);
