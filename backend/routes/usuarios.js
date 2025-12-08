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
    const { username, correo, password, avatar } = req.body;

    if (!username || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // Verificar si ya existe el correo
    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ error: "El correo ya existe" });
    }

    // Encriptar contraseña
    const passwordEncriptada = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const nuevo = new Usuario({
      username,
      correo,
      password: passwordEncriptada,
      avatar: avatar || "https://api.dicebear.com/9.x/thumbs/svg?seed=user",
    });

    await nuevo.save();

    res.status(201).json({
      message: "Usuario registrado con éxito",
      usuario: nuevo,
    });

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
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario)
      return res.status(404).json({ error: "No existe el usuario" });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide)
      return res.status(403).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Login correcto",
      usuario: {
        id: usuario._id,
        username: usuario.username,
        correo: usuario.correo,
        avatar: usuario.avatar,
      },
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
    delete data.password;

    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    ).select("-password");

    if (!actualizado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Perfil actualizado",
      usuario: actualizado,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

export default router;
