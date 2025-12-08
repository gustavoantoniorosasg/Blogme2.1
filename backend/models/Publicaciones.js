import mongoose from "mongoose";

const PublicacionSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  contenido: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    default: ""
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  ts: {
    type: Date,
    default: Date.now
  }
});

// fuerza a usar colección "publicaciones"
export default mongoose.model("Publicacion", PublicacionSchema, "publicaciones");
