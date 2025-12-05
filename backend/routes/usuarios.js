import express from "express";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* ==========================================
   📌 REGISTRO — POST /api/usuarios/registro
========================================== */
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password, avatar } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "El correo ya existe" });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({
      nombre,
      email,
      password: passwordEncriptada,
      avatar: avatar || "https://i.imgur.com/2ZzK8K7.png"
    });

    await nuevo.save();

    res.json({ message: "Usuario registrado", usuario: nuevo });

  } catch (err) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

/* ==========================================
   📌 LOGIN — POST /api/usuarios/login
========================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ error: "No existe el usuario" });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) return res.status(403).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Login correcto",
      usuario
    });

  } catch (err) {
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
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

/* ==========================================
   📌 EDITAR PERFIL — PUT /api/usuarios/:id
========================================== */
router.put("/:id", async (req, res) => {
  try {
    const data = req.body;

    // impedir que se cambie password directamente
    delete data.password;

    const actualizado = await Usuario.findByIdAndUpdate(req.params.id, data, {
      new: true
    }).select("-password");

    if (!actualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado", usuario: actualizado });

  } catch (err) {
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

/* ==========================================
   📌 DESPERTAR RENDER — GET /api/usuarios/ping
========================================== */
router.get("/ping", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

export default router;
