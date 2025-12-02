// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ✅ Modelos y rutas
import Admin from "./models/Admin.js";
import usuarios from "./routes/usuarios.js";
import publicaciones from "./routes/publicaciones.js";
import adminRoutes from "./routes/admin.js";
import publicacionesRoutes from "./routes/publicaciones.js";

const app = express();


// 🔧 Middlewares
app.use(cors());
app.use(express.json());

// ✅ Conexión a MongoDB + creación del admin por defecto
const conectarDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Melanie:firstkhao@cluster0.ff0e89f.mongodb.net/blogme",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("✅ Conectado correctamente a MongoDB Atlas");
    await crearAdminPorDefecto();
  } catch (error) {
    console.error("❌ Error conectando a MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

// 👑 Crear administrador por defecto si no existe
const crearAdminPorDefecto = async () => {
  try {
    const existeAdmin = await Admin.findOne({ username: "admin" });
    if (existeAdmin) {
      console.log("⚙️ Administrador ya existente en la base de datos");
      return;
    }

    const hashedPassword = await bcrypt.hash("12345", 10);
    await Admin.create({
      username: "admin",
      correo: "admin@blogme.com",
      password: hashedPassword,
      rol: "admin",
    });

    console.log("👑 Administrador creado automáticamente");
    console.log("Usuario: admin | Contraseña: 12345");
  } catch (err) {
    console.error("❌ Error al crear el administrador:", err.message);
  }
};

// ✅ Conectar base de datos
conectarDB();

// ✅ Rutas principales
app.get("/", (req, res) => {
  res.send("🚀 API de BlogMe funcionando correctamente");
});
app.use("/api/usuarios", usuarios);
app.use("/api/publicaciones", publicaciones);
app.use("/api/admin", adminRoutes);
app.use("/api/publicaciones", publicacionesRoutes);


// ✅ Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ msg: "Ruta no encontrada" });
});

// ✅ Iniciar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend en ejecución: http://localhost:${PORT}`);
});
