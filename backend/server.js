// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Modelos
import Admin from "./models/Admin.js";

// Rutas
import usuarios from "./routes/usuarios.js";
import adminRoutes from "./routes/admin.js";
import publicacionesRoutes from "./routes/publicaciones.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Conexión MongoDB usando .env
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Atlas conectado correctamente");

    await crearAdminPorDefecto();
  } catch (error) {
    console.error("❌ Error conectando MongoDB:", error.message);
    process.exit(1);
  }
};

// 🔹 Crear Admin por defecto
const crearAdminPorDefecto = async () => {
  try {
    const existeAdmin = await Admin.findOne({ username: "admin" });
    if (existeAdmin) return console.log("⚙️ Admin ya existe");

    const hashedPassword = await bcrypt.hash("12345", 10);

    await Admin.create({
      username: "admin",
      correo: "admin@blogme.com",
      password: hashedPassword,
      rol: "admin",
    });

    console.log("👑 Admin creado automáticamente → admin / 12345");
  } catch (err) {
    console.error("❌ Error creando admin:", err.message);
  }
};

// Conectar BD
conectarDB();

// Rutas API
app.get("/", (req, res) =>
  res.send("🚀 API BlogMe funcionando correctamente")
);

app.use("/api/usuarios", usuarios);
app.use("/api/admin", adminRoutes);
app.use("/api/publicaciones", publicacionesRoutes);

// Ruta NO encontrada
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

// Servidor activo
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🔥 Backend activo en puerto http://localhost:${PORT}`)
);
