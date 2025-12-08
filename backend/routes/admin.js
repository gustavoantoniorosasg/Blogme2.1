import express from "express";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import Usuario from "../models/Usuario.js";
import Publicacion from "../models/Publicaciones.js";

const router = express.Router();

/* ============================================================
   🔐 LOGIN DE ADMINISTRADOR
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { nombre, password } = req.body;

    if (!nombre || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const admin = await Admin.findOne({ nombre });

    if (!admin) {
      return res.status(404).json({ error: "Administrador no encontrado" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      message: "Inicio de sesión exitoso",
      admin: {
        id: admin._id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
      },
    });
  } catch (err) {
    console.error("Error al iniciar sesión de admin:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

/* ============================================================
   👥 OBTENER TODOS LOS USUARIOS
============================================================ */
router.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, "nombre email rol").lean();
    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

/* ============================================================
   📰 OBTENER TODAS LAS PUBLICACIONES
============================================================ */
router.get("/publicaciones", async (req, res) => {
  try {
    const publicaciones = await Publicacion.find().sort({ ts: -1 }).lean();
    res.json(publicaciones);
  } catch (err) {
    console.error("Error al obtener publicaciones:", err);
    res.status(500).json({ error: "Error al obtener publicaciones" });
  }
});

/* ============================================================
   🗑️ ELIMINAR USUARIO
============================================================ */
router.delete("/usuarios/:id", async (req, res) => {
  try {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

/* ============================================================
   🗑️ ELIMINAR PUBLICACIÓN
============================================================ */
router.delete("/publicaciones/:id", async (req, res) => {
  try {
    const eliminado = await Publicacion.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ error: "Publicación no encontrada" });

    res.json({ message: "Publicación eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar publicación:", err);
    res.status(500).json({ error: "Error al eliminar publicación" });
  }
});

export default router;
