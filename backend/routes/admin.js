import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  username: {         // este es el que usas para login
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {          // almacenado encriptado con bcrypt
    type: String,
    required: true
  },
  rol: {
    type: String,
    default: "admin",  // puedes tener: admin, superadmin, moderador
  }
}, {
  timestamps: true
});

export default mongoose.model("Admin", AdminSchema);
