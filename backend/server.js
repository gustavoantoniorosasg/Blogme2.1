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

// 🔥 CORS CORRECTO PARA PRODUCCIÓN 🔥
app.use(cors({
  origin: [
    "https://blogme2-1-bqhl.vercel.app", // ⚠️ Reemplaza con tu URL real si es distinta
    "https://blogme2-1-bqhl.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔹 habilitar cookies/sesión si fuese necesario
app.set("trust proxy", 1);

app.use(express.json());

// ===============================
// 🔌 Conexión MongoDB Atlas
// ===============================
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

// ===============================
// 👑 Crear Admin por defecto
// ===============================
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

// conectar BD
conectarDB();

// ===============================
// 📌 Rutas API reales
// ===============================
app.get("/api/usuarios/ping", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) =>
  res.send("🚀 API BlogMe funcionando correctamente")
);

app.use("/api/usuarios", usuarios);
app.use("/api/admin", adminRoutes);
app.use("/api/publicaciones", publicacionesRoutes);

// ===============================
// ❌ Ruta NO encontrada
// ===============================
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

// ===============================
// 🚀 Servidor escuchando
// ===============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🔥 Backend activo en puerto http://localhost:${PORT}`)
);
