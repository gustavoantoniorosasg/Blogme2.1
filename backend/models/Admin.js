// ✅ backend/models/Admin.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    default: "admin",
  },
});

// 👇 Forzar a que use exactamente la colección "administradores"
export default mongoose.model("Admin", AdminSchema, "administradores");