/* ===========================================================
   🌐 CONFIG GLOBAL DE BLOGME
   Funciona en Vercel (frontend) + Render (backend)
=========================================================== */

// Detecta si frontend está online (Vercel)
const IS_VERCEL = window.location.hostname.includes("vercel.app");

// 🔹 Si carga desde Vercel = usar backend Render.
// 🔹 Si es local = usar localhost backend.
window.API_BASE_URL = IS_VERCEL
  ? "https://blogme2-1.onrender.com"
  : "http://localhost:3000";

// 🔥 Asegura que existe globalmente
console.log("🌍 API apuntando a:", window.API_BASE_URL);

// Rutas API correctas
window.API_ADMIN = `${window.API_BASE_URL}/api/admin`;
window.API_USUARIOS = `${window.API_BASE_URL}/api/usuarios`;
window.API_PUBLICACIONES = `${window.API_BASE_URL}/api/publicaciones`;

// Despertar backend en Render
window.wakeBackend = async function () {
  try {
    await fetch(`${window.API_BASE_URL}/api/ping`, { method: "GET" });
  } catch {}
};

window.getUser = function () {
  const raw = localStorage.getItem("usuarioActivo");
  if (!raw) return null;

  try { return JSON.parse(raw); }
  catch { return null; }
};

window.logout = function () {
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("adminSession");
  window.location.href = "login.html";
};
