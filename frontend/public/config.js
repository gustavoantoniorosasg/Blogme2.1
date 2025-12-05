/* ===========================================================
   🌐 CONFIG GLOBAL DE BLOGME
   Funciona en producción (Render) y en desarrollo (localhost)
=========================================================== */

// Detecta si estás en Render o local
const IS_RENDER = window.location.hostname.includes("onrender.com");

// URL BASE automática
window.API_BASE_URL = window.location.hostname.includes("vercel.app")
  ? "https://blogme2-1.onrender.com"
  : "http://localhost:3000";


// Rutas API correctas
window.API_ADMIN = `${window.API_BASE_URL}/api/admin`;
window.API_USUARIOS = `${window.API_BASE_URL}/api/usuarios`;
window.API_PUBLICACIONES = `${window.API_BASE_URL}/api/publicaciones`;

// Para despertar backend en Render
window.wakeBackend = async function () {
  try {
    await fetch(`${window.API_BASE_URL}/api/ping`, { method: "GET" });
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
  window.location.href = "login.html";
};
