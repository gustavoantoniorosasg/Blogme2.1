import express from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

const router = express.Router();

/* -----------------------------------------
   PING (para probar conexión)
------------------------------------------ */
router.get("/ping", (req, res) => {
  res.send("pong");
});

/* -----------------------------------------
   REGISTRO DE USUARIO  (coincide con frontend)
   Frontend manda: { username, correo, password }
------------------------------------------ */
router.post("/registro", async (req, res) => {
  try {
    const { username, correo, password } = req.body;

    if (!username || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // Verificar si el username ya existe
    const nombreExistente = await Usuario.findOne({ username });
    if (nombreExistente) {
      return res.status(400).json({ error: "El nombre ya está en uso" });
    }

    // Verificar si el correo ya existe
    const emailExistente = await Usuario.findOne({ correo });
    if (emailExistente) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      username,
      correo,
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
   Frontend manda: { username, password }
------------------------------------------ */
router.post("/login", async (req, res) => {
  try {
    const { username, nombre, password } = req.body;

    // Soporte a ambos nombres (compatibilidad antigua)
    const userSearch = username || nombre;

    if (!userSearch || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ username: userSearch });

    if (!usuario) {
      return res.status(400).json({ error: "Nombre incorrecto" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario._id,
        username: usuario.username,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
