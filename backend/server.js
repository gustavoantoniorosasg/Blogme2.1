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

// ===============================
//      MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
//      CORS CONFIG
// ===============================
const allowedOrigins = [
  "https://blogme2-1.vercel.app",
  "https://blogme2-1-bqhl.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

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

// ===============================
//  CONEXIÓN MONGODB
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

// Crear admin por defecto si no existe
const crearAdminPorDefecto = async () => {
  try {
    const existeAdmin = await Admin.findOne({ nombre: "admin" });
    if (existeAdmin) return console.log("⚙️ Admin ya existe");

    const hashedPassword = await bcrypt.hash("123456", 10);

    await Admin.create({
      nombre: "admin",
      email: "admin@blogme.com",
      password: hashedPassword,
      rol: "admin",
    });

    console.log("👑 Admin creado automáticamente → admin / 123456");
  } catch (err) {
    console.error("❌ Error creando admin:", err.message);
  }
};

conectarDB();

// ===============================
//        RUTAS API
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 API BlogMe funcionando correctamente");
});

app.use("/api/usuarios", usuarios);
app.use("/api/admin", adminRoutes);
app.use("/api/publicaciones", publicacionesRoutes);

// ===============================
//      RUTA 404
// ===============================
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

// ===============================
//      SERVIDOR ACTIVO
// ===============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🔥 Backend activo en puerto http://localhost:${PORT}`)
);
