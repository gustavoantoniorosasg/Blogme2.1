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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS FIJO Y FUNCIONANDO PARA VERCEL
app.use(cors({
  origin: [
    "https://blogme2-1.vercel.app",  
    "https://blogme2-1-bqhl.vercel.app", 
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// habilitar preflight
app.options("*", cors());

// headers globales
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://blogme2-1.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  next();
});

// 🔹 Conexión MongoDB
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

conectarDB();

// Rutas API
app.get("/", (req, res) =>
  res.send("🚀 API BlogMe funcionando correctamente")
);

app.use("/api/usuarios", require("./routes/usuarios"));
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
