// backend/routes/usuarios.js
import express from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

const router = express.Router();

/* ============================================================
   🔑 LOGIN DE USUARIO (por email o nombre)
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, nombre, password } = req.body;

    if ((!email && !nombre) || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    let usuario = null;

    if (email) usuario = await Usuario.findOne({ email });
    if (!usuario && nombre) usuario = await Usuario.findOne({ nombre });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const passOK = await bcrypt.compare(password, usuario.password);
    if (!passOK) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    console.error("Error login usuario:", err);
    res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
});

/* ============================================================
   📝 REGISTRO DE USUARIO
============================================================ */
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan datos" });

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ error: "El correo ya está registrado" });

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await Usuario.create({
      nombre,
      email,
      password: hashed,
    });

    res.json({
      message: "Usuario creado",
      usuario: {
        id: nuevo._id,
        nombre: nuevo.nombre,
        email: nuevo.email,
        rol: nuevo.rol
      },
    });
  } catch (err) {
    console.error("Error registro usuario:", err);
    res.status(500).json({ error: "No se pudo crear usuario" });
  }
});

export default router;
