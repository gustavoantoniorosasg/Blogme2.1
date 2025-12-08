// backend/models/Usuario.js
import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  correo: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  avatar: {
    type: String,
    default: "https://api.dicebear.com/9.x/thumbs/svg?seed=user"
  },

  rol: {
    type: String,
    default: "usuario"
  },

  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// 👇 fuerza a usar colección "usuarios"
export default mongoose.model("Usuario", UsuarioSchema, "usuarios");
