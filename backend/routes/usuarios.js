// backend/routes/usuarios.js
import express from "express";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

const router = express.Router();

// ==========================
//       PRUEBA SERVER
// ==========================
router.get("/ping", (req, res) => {
  res.send("pong");
});

// ==========================
//       REGISTRO
// ==========================
router.post("/registrar", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ error: "Correo ya registrado" });
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = new Usuario({
      nombre,
      correo,
      password: hash,
      avatar: "",
      bio: ""
    });

    await usuario.save();

    res.json({ mensaje: "Usuario registrado", usuario });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al registrar" });
  }
});

// ==========================
//       LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login correcto",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        avatar: usuario.avatar,
        bio: usuario.bio
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en login" });
  }
});

// ==========================
//     ACTUALIZAR PERFIL
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = {
      nombre: req.body.nombre,
      bio: req.body.bio,
      avatar: req.body.avatar
    };

    const actualizado = await Usuario.findByIdAndUpdate(id, data, { new: true });

    res.json({ mensaje: "Perfil actualizado", usuario: actualizado });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

export default router;
