// backend/models/Usuario.js
import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },

  email: {
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

// Fuerza la colección "usuarios"
export default mongoose.model("Usuario", UsuarioSchema, "usuarios");
