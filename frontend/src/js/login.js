import { API_ADMIN, API_USUARIOS } from "./config.js";

/* ============================================================
   🔄 Wakeup prevent (Render cold boot)
============================================================ */
(async () => {
  try {
    await fetch(`${API_USUARIOS}/ping`);
  } catch (e) {
    console.log("Backend cold, waking...");
  }
})();

/* ============================================================
   🔔 Toast UI
============================================================ */
function showToast(msg, type = "info") {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.className = `show ${type}`;
  toast.innerText = msg;

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2400);
}

// Inject toast style
(() => {
  if (document.getElementById("toast-style")) return;
  const style = document.createElement("style");
  style.id = "toast-style";
  style.innerHTML = `
    #toast {
      visibility: hidden;
      min-width: 260px;
      background: rgba(0,0,0,0.78);
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 14px;
      position: fixed;
      left: 50%;
      bottom: 35px;
      transform: translateX(-50%);
      font-size: 15px;
      opacity: 0;
      transition: opacity .4s ease-in-out;
      z-index: 9999;
    }
    #toast.show { visibility: visible; opacity: 1; }
    #toast.success { background: #28a745d9; }
    #toast.error { background: #dc3545d9; }
    #toast.warn { background: #ffc107d9; color: #222; }
  `;
  document.head.appendChild(style);
})();


// ============================================================
// 🪟 Tab handler
// ============================================================
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
});


// ============================================================
// ✍ VALIDACIONES
// ============================================================
const validarUsuario = u => /^[a-zA-Z0-9_]{3,20}$/.test(u);
const validarCorreo = c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
const validarPassword = p => p.length >= 6;


// ============================================================
// 🔐 LOGIN
// ============================================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = loginForm.querySelector('input[type="text"]').value.trim();
  const password = loginForm.querySelector('input[type="password"]').value.trim();

  if (!username || !password) return showToast("Completa todos los campos", "warn");
  if (!validarUsuario(username)) return showToast("Usuario inválido", "warn");

  try {

    /* ===== ADMIN Login try ===== */
    const adminResp = await fetch(`${API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (adminResp.ok) {
      const data = await adminResp.json();
      localStorage.setItem("usuarioActivo", JSON.stringify(data.admin));
      localStorage.setItem("adminSession", "true");
      showToast(`Bienvenido administrador: ${data.admin.username}`, "success");
      return setTimeout(() => window.location.href = "admin.html", 900);
    }

    /* ===== Usuario normal ===== */
    const userResp = await fetch(`${API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await userResp.json();

    if (!userResp.ok)
      return showToast(data.msg || "Credenciales incorrectas", "error");

    localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));

    showToast(`Bienvenido ${data.usuario.username}`, "success");
    setTimeout(() => window.location.href = "publicaciones.html", 900);

  } catch (err) {
    console.error("Error:", err);
    showToast("⚠ Servidor dormido. Intenta nuevamente.", "error");

    // Retry wakeup
    setTimeout(() => location.reload(), 4500);
  }
});


// ============================================================
// 🆕 REGISTRO
// ============================================================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("reg-username").value.trim();
  const correo = document.getElementById("reg-correo").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!username || !correo || !password) return showToast("Completa todos los campos", "warn");
  if (!validarUsuario(username)) return showToast("Usuario inválido (solo letras, números y _)", "warn");
  if (!validarCorreo(correo)) return showToast("Correo no válido", "warn");
  if (!validarPassword(password)) return showToast("Mínimo 6 caracteres", "warn");

  try {
    const resp = await fetch(`${API_USUARIOS}/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, correo, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return showToast(
        data.msg || (resp.status === 409 ? "Usuario ya existe" : "Error en el registro"),
        "error"
      );
    }

    showToast("Cuenta creada con éxito 🎉", "success");

    // Limpia campos
    registerForm.reset();

    // Cambia a login
    setTimeout(() => loginTab.click(), 600);

  } catch (error) {
    console.error("Error:", error);
    showToast("Servidor no disponible", "error");
  }
});
