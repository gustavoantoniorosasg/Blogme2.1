import { API_ADMIN, API_USUARIOS } from "./config.js";

// ===== Wakeup API (Render cold boot) =====
fetch("https://blogme2-1.onrender.com").catch(()=>{});


// ===== Toast UI =====
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
  }, 2800);
}

// Toast styles
const style = document.createElement("style");
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

#toast.show {
  visibility: visible;
  opacity: 1;
}

#toast.success { background: #28a745d9; }
#toast.error { background: #dc3545d9; }
#toast.warn { background: #ffc107d9; color: #222; }
`;
document.head.appendChild(style);

// Tabs switching
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

// Helpers
function validarUsuario(usuario) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(usuario);
}

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarPassword(pass) {
  return pass.length >= 6;
}

// ===== Login =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = loginForm.querySelector('input[type="text"]').value.trim();
  const password = loginForm.querySelector('input[type="password"]').value.trim();

  if (!username || !password) {
    showToast("Completa todos los campos", "warn");
    return;
  }

  if (!validarUsuario(username)) {
    showToast("Usuario inválido", "warn");
    return;
  }

  try {
    // Intento admin
    const adminResp = await fetch(`${API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (adminResp.ok) {
      const data = await adminResp.json();
      localStorage.setItem("usuarioActivo", JSON.stringify(data.admin));
      localStorage.setItem("adminSession", "true");

      showToast(`Bienvenido administrador: ${data.admin.username}`, "success");
      setTimeout(() => window.location.href = "admin.html", 900);
      return;
    }

    // Intento usuario normal
    const userResp = await fetch(`${API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await userResp.json();

    if (!userResp.ok) {
      showToast(data.msg || "Credenciales incorrectas", "error");
      return;
    }

    localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));
    showToast(`Bienvenido ${data.usuario.username}`, "success");
    setTimeout(() => window.location.href = "publicaciones.html", 900);

  } catch (err) {
    console.error("Error:", err);
    showToast("⚠ Servidor no disponible, intenta en 5s", "error");
  }
});

// ===== Registro =====
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("reg-username").value.trim();
  const correo = document.getElementById("reg-correo").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!username || !correo || !password) {
    showToast("Completa todos los campos", "warn");
    return;
  }

  if (!validarUsuario(username)) {
    showToast("Usuario inválido (solo letras, números y _)", "warn");
    return;
  }

  if (!validarCorreo(correo)) {
    showToast("Correo no válido", "warn");
    return;
  }

  if (!validarPassword(password)) {
    showToast("Minimo 6 caracteres", "warn");
    return;
  }

  try {
    const resp = await fetch(`${API_USUARIOS}/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, correo, password }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      showToast(data.msg || "Error en el registro", "error");
      return;
    }

    showToast("Cuenta creada con éxito", "success");
    setTimeout(() => loginTab.click(), 600);

  } catch (error) {
    console.error("Error:", error);
    showToast("Servidor no disponible", "error");
  }
});
