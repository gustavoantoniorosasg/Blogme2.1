import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  descripcion: { type: String, default: "" },
  fechaRegistro: { type: Date, default: Date.now }
});

export default mongoose.model("Usuario", UsuarioSchema);
