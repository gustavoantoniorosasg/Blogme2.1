// backend/routes/publicaciones.js
import express from "express";
import Publicacion from "../models/Publicaciones.js";

const router = express.Router();

/* ============================================================
   📌 OBTENER TODAS LAS PUBLICACIONES (frontend usa esta)
============================================================ */
router.get("/", async (req, res) => {
  try {
    const publicaciones = await Publicacion.find().sort({ ts: -1 });
    res.json(publicaciones);
  } catch (err) {
    console.error("Error al obtener publicaciones:", err);
    res.status(500).json({ error: "Error al obtener publicaciones" });
  }
});

/* ============================================================
   📌 CREAR PUBLICACIÓN (POST /api/publicaciones)
============================================================ */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, titulo, contenido, imagen } = req.body;

    if (!usuarioId || !titulo || !contenido) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const nueva = new Publicacion({
      usuarioId,
      titulo,
      contenido,
      imagen: imagen || "",
      ts: Date.now()
    });

    await nueva.save();

    res.status(201).json({
      message: "Publicación creada correctamente",
      publicacion: nueva,
    });

  } catch (err) {
    console.error("Error al crear publicación:", err);
    res.status(500).json({ error: "Error al crear la publicación" });
  }
});

/* ============================================================
   📌 EDITAR PUBLICACIÓN (PUT /api/publicaciones/:id)
============================================================ */
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { titulo, contenido, imagen } = req.body;

    const updated = await Publicacion.findByIdAndUpdate(
      id,
      { titulo, contenido, imagen },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json({
      message: "Publicación actualizada",
      updated,
    });

  } catch (err) {
    console.error("Error al actualizar publicación:", err);
    res.status(500).json({ error: "Error al actualizar publicación" });
  }
});

/* ============================================================
   📌 ELIMINAR PUBLICACIÓN (DELETE /api/publicaciones/:id)
============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Publicacion.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json({
      message: "Publicación eliminada",
      deleted,
    });

  } catch (err) {
    console.error("Error al eliminar publicación:", err);
    res.status(500).json({ error: "Error al eliminar publicación" });
  }
});

/* ============================================================
   📌 REPORTES (POST /api/publicaciones/:id/report)
============================================================ */
router.post("/:id/report", async (req, res) => {
  try {
    const id = req.params.id;
    const { reason, reporter } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Debes enviar un motivo" });
    }

    await Publicacion.findByIdAndUpdate(id, {
      $push: { reports: { reason, reporter, ts: Date.now() } }
    });

    res.json({ message: "Reporte enviado correctamente" });

  } catch (err) {
    console.error("Error al enviar reporte:", err);
    res.status(500).json({ error: "Error al enviar el reporte" });
  }
});

/* ============================================================
   📌 PING — Para despertar tu backend en Render
============================================================ */
router.get("/ping", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

export default router;
