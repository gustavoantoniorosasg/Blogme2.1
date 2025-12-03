// 🌐 URL base real del backend desplegado en Render
export const API_BASE_URL = "https://blogme2-1.onrender.com";

// 🔁 Endpoints backend
export const API_ADMIN = `${API_BASE_URL}/api/admin`;
export const API_USUARIOS = `${API_BASE_URL}/api/usuarios`;
export const API_PUBLICACIONES = `${API_BASE_URL}/api/publicaciones`;

// 🟢 Auto-ping para despertar Render al entrar en la app
export async function wakeBackend() {
  try {
    await fetch(`${API_USUARIOS}/ping`, { method: "GET" });
  } catch (_) { }
}
