/* ===========================================================
   🌐 CONFIG GLOBAL DE BLOGME
=========================================================== */

window.API = "https://blogme2-1.onrender.com/api";
window.API_USUARIOS = `${window.API}/usuarios`;

// ---- DESPIERTA RENDER ----
fetch(`${window.API_USUARIOS}/ping`).catch(() => {});

// Detecta si frontend está en Vercel
const IS_VERCEL = window.location.hostname.includes("vercel.app");

// Base URL según origen
window.API_BASE_URL = IS_VERCEL
  ? "https://blogme2-1.onrender.com"
  : "http://localhost:3000";

console.log("🌍 API apuntando a:", window.API_BASE_URL);

// Rutas API globales
window.API_ADMIN = `${window.API_BASE_URL}/api/admin`;
window.API_USUARIOS = `${window.API_BASE_URL}/api/usuarios`;
window.API_PUBLICACIONES = `${window.API_BASE_URL}/api/publicaciones`;

window.wakeBackend = async function () {
  try { await fetch(`${window.API_BASE_URL}/api/usuarios/ping`); }
  catch {}
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
