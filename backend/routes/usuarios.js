import express from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

const router = express.Router();

/* -----------------------------------------
   PING TEST
------------------------------------------ */
router.get("/ping", (req, res) => {
  res.send("pong");
});

/* -----------------------------------------
   REGISTRO
------------------------------------------ */
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const nombreExistente = await Usuario.findOne({ nombre });
    if (nombreExistente) {
      return res.status(400).json({ error: "El nombre ya está en uso" });
    }

    const emailExistente = await Usuario.findOne({ email });
    if (emailExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
    });

    await nuevoUsuario.save();

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error registrando usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* -----------------------------------------
   LOGIN
   Frontend debe mandar: { email, password }
------------------------------------------ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ error: "Email incorrecto" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
