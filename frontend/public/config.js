/* ===========================================================
   🌐 CONFIG GLOBAL DE BLOGME
   Funciona en producción (Render) y en desarrollo (localhost)
=========================================================== */

// Detecta si estás en Render o local
const IS_RENDER = window.location.hostname.includes("onrender.com");

// URL BASE automática (pero puedes fijarla si quieres)
window.API_BASE_URL = IS_RENDER
  ? "https://blogme2-1.onrender.com"
  : "http://localhost:3000";

// Rutas para todos los módulos del frontend
window.API_ADMIN = `${API_BASE_URL}/api/admin`;
window.API_USUARIOS = `${API_BASE_URL}/api/usuarios`;
window.API_PUBLICACIONES = `${API_BASE_URL}/api/publicaciones`;

// Para despertar backend en Render
window.wakeBackend = async function () {
  try {
    await fetch(`${API_USUARIOS}/ping`, { method: "GET" });
  } catch (e) {}
};

/* ===========================================================
   🟦 Función global para obtener usuario actual
   Evita duplicar código en varios archivos
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
   🟥 Función global para cerrar sesión
=========================================================== */
window.logout = function () {
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("adminSession");
  window.location.href = "login.html";
};
