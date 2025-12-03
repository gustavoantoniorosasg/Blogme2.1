router.get("/ping", (req, res) => res.json({ ok: true }));
import express from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

const router = express.Router();

/* ===========================================================
   🌐 Ping — despierta backend (Render boot)
   GET /api/usuarios/ping
=========================================================== */
router.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "API usuarios activa 🟢" });
});

/* ===========================================================
   ✅ Registrar usuario
   POST /api/usuarios/registrar
=========================================================== */
router.post("/registrar", async (req, res) => {
  try {
    const { username, correo, password } = req.body;

    if (!username || !correo || !password) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const usuarioExistente = await Usuario.findOne({
      $or: [{ correo }, { username }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        msg: "Correo o usuario ya registrado"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      username,
      correo,
      password: hash,
      rol: "usuario",     // aseguramos rol por defecto
      avatar: "",
      bio: ""
    });

    res.json({
      msg: "Usuario registrado con éxito",
      usuario: {
        id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        correo: nuevoUsuario.correo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
});

/* ===========================================================
   ✅ Login de usuario
   POST /api/usuarios/login
=========================================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    res.json({
      msg: "Login correcto",
      usuario: {
        id: usuario._id,
        username: usuario.username,
        rol: usuario.rol,
        avatar: usuario.avatar,
        bio: usuario.bio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
});

/* ===========================================================
   📌 Lista de usuarios (solo admin)
   GET /api/usuarios/lista
=========================================================== */
router.get("/lista", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
});

/* ===========================================================
   ❌ Eliminar usuario (solo admin)
   DELETE /api/usuarios/:id
=========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ msg: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error eliminando usuario" });
  }
});

export default router;
