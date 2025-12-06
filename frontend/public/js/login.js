// ===========================================================
// 🌐 Variables globales desde config.js
// ===========================================================

// ===========================================================
// 🔵 SISTEMA DE TOAST
// ===========================================================
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

// Toast estilos
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
#toast.show { visibility: visible; opacity: 1; }
#toast.success { background: #28a745d9; }
#toast.error { background: #dc3545d9; }
#toast.warn { background: #ffc107d9; color: #222; }
`;
document.head.appendChild(style);


// ===========================================================
// 🔄 Cambiar entre login y registro 
// ===========================================================
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


// ===========================================================
// VALIDACIONES
// ===========================================================
function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}
function validarPassword(pass) {
  return pass.length >= 6;
}


// ===========================================================
// LOGIN — Admin + Usuario
// ===========================================================
// LOGIN — Admin + Usuario
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-correo").value.trim();
  const password = loginForm.querySelector('input[type="password"]').value.trim();

  if (!email || !password) return showToast("Completa todos los campos", "warn");
  if (!validarCorreo(email)) return showToast("Correo inválido", "warn");

  try {
    // ADMIN LOGIN
    const adminResp = await fetch(`${API_ADMIN}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (adminResp.ok) {
      const data = await adminResp.json();
      localStorage.setItem("usuarioActivo", JSON.stringify(data.admin));
      localStorage.setItem("adminSession", "true");
      showToast(`Bienvenido administrador`, "success");
      return setTimeout(() => (window.location.href = "admin.html"), 1200);
    }

    // USUARIO LOGIN
    const userResp = await fetch(`${API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await userResp.json();

    if (!userResp.ok)
      return showToast(data.error || "Credenciales incorrectas", "error");

    localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));
    showToast(`Bienvenido ${data.usuario.nombre}`, "success");
    setTimeout(() => (window.location.href = "publicaciones.html"), 900);

  } catch (err) {
    console.error(err);
    showToast("No se pudo conectar al servidor", "error");
  }
});



// ===========================================================
// REGISTRO REAL
// ===========================================================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-correo").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!nombre || !email || !password) return showToast("Completa todos los campos", "warn");
  if (!validarCorreo(email)) return showToast("Correo inválido", "warn");
  if (!validarPassword(password)) return showToast("La contraseña debe tener mínimo 6 caracteres", "warn");

  try {
    fetch(`${API_USUARIOS}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, email, password }),
    });

    const data = await resp.json();

    if (!resp.ok) return showToast(data.msg || "Error en el registro", "error");

    showToast("Cuenta creada con éxito", "success");
    setTimeout(() => loginTab.click(), 600);

  } catch (error) {
    console.error(error);
    showToast("Error al conectar con el servidor", "error");
  }
});
