import mongoose from "mongoose";

const PublicacionSchema = new mongoose.Schema({
  author: { type: String, required: true },
  authorAvatar: { type: String, default: "" },
  content: { type: String, required: true },
  img: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  likedByMe: { type: Boolean, default: false },
  ts: { type: Date, default: Date.now }
});

export default mongoose.model("Publicacion", PublicacionSchema, "publicaciones");