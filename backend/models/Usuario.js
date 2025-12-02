import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  rol: {
    type: String,
    enum: ["usuario", "admin"],
    default: "usuario"
  },
  notas: [
    {
      texto: String,
      fecha: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Usuario", UsuarioSchema);