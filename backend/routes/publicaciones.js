import express from "express";
import Publicacion from "../models/Publicaciones.js";

const router = express.Router();

/* ============================================================
   📌 OBTENER TODAS LAS PUBLICACIONES
   Incluye avatar, usuario, imagen y fecha ordenados por fecha
===============================================================*/
router.get("/", async (req, res) => {
  try {
    const publicaciones = await Publicacion.find().sort({ ts: -1 });
    res.json(publicaciones);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener publicaciones" });
  }
});

/* ============================================================
   📌 CREAR PUBLICACIÓN
   Acepta: author, authorId, authorAvatar, content, img
===============================================================*/
router.post("/", async (req, res) => {
  try {

    const { author, authorId, authorAvatar, content, img } = req.body;

    if (!author || !authorId || !authorAvatar || !content) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const nueva = new Publicacion({
      author,
      authorId,
      authorAvatar,
      content,
      img: img || null
    });

    await nueva.save();

    res.status(201).json({
      message: "Publicación creada correctamente",
      publicacion: nueva,
    });

  } catch (err) {
    res.status(500).json({ error: "Error al crear la publicación" });
  }
});

export default router;
