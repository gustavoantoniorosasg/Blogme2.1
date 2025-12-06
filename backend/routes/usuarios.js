// ===========================================================
// 🌐 usuarios.js — API de usuarios
// ===========================================================
import express from "express";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* ==========================================
   📌 DESPERTAR RENDER — GET /api/usuarios/ping
========================================== */
router.get("/ping", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

/* ==========================================
   📌 REGISTRO — POST /api/usuarios/registro
========================================== */
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password, avatar } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // Verificar si ya existe el email
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "El correo ya existe" });
    }

    // Encriptar contraseña
    const passwordEncriptada = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const nuevo = new Usuario({
      nombre,
      email,
      password: passwordEncriptada,
      avatar: avatar || "https://i.imgur.com/2ZzK8K7.png"
    });

    await nuevo.save();

    // ✅ Responder correctamente al frontend
    res.status(201).json({ message: "Usuario registrado con éxito", usuario: nuevo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

/* ==========================================
   📌 LOGIN — POST /api/usuarios/login
========================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ error: "No existe el usuario" });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) return res.status(403).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Login correcto",
      usuario
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en login" });
  }
});

/* ==========================================
   📌 OBTENER PERFIL POR ID — GET /api/usuarios/:id
========================================== */
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

/* ==========================================
   📌 EDITAR PERFIL — PUT /api/usuarios/:id
========================================== */
router.put("/:id", async (req, res) => {
  try {
    const data = req.body;

    // Evitar sobrescribir la contraseña directamente
    delete data.password;

    const actualizado = await Usuario.findByIdAndUpdate(req.params.id, data, {
      new: true
    }).select("-password");

    if (!actualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado", usuario: actualizado });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

export default router;
