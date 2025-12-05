/* ===========================================================
   🌐 CONFIG BLOGME — Producción y Local
=========================================================== */

// Detecta si estás en un dominio de producción (Vercel o Render)
const HOST = window.location.hostname;
const IS_PRODUCTION =
  HOST.includes("vercel.app") || HOST.includes("onrender.com");

// URL automática
window.API_BASE_URL = IS_PRODUCTION
  ? "https://blogme2-1.onrender.com"
  : "http://localhost:3000";

// Endpoints API globales
window.API_ADMIN = `${API_BASE_URL}/api/admin`;
window.API_USUARIOS = `${API_BASE_URL}/api/usuarios`;
window.API_PUBLICACIONES = `${API_BASE_URL}/api/publicaciones`;

// Ping para despertar backend
window.wakeBackend = async function () {
  try {
    await fetch(`${API_BASE_URL}/api/ping`);
  } catch (e) {}
};

/* ===========================================================
   🟦 Obtener usuario actual
=========================================================== */
window.getUser = function () {
  const raw = localStorage.getItem("usuarioActivo");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/* ===========================================================
   🟥 Cerrar sesión
=========================================================== */
window.logout = function () {
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("adminSession");
  window.location.href = "/pages/login.html"; // <-- Ruta correcta en deploy
};
