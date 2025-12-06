// ===========================================================
// 🌐 Variables globales desde config.js
// ===========================================================


// ===========================================================
// 🔵 SISTEMA DE TOAST NOTIFICACIONES
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

// Toast estilos dinámicos
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
function validarNombre(nombre) {
  return nombre.length >= 3;
}


// ===========================================================
// Loader para evitar doble clic
// ===========================================================
function toggleFormLoading(form, state) {
  const button = form.querySelector("button[type='submit']");
  button.disabled = state;
  button.innerText = state ? "Procesando..." : "Entrar / Registrarse";
}


// ===========================================================
// LOGIN — Ahora pide NOMBRE y contraseña
// ===========================================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("login-username").value.trim();
  const password = loginForm.querySelector('input[type="password"]').value.trim();

  if (!nombre || !password) 
    return showToast("Completa todos los campos", "warn");

  if (!validarNombre(nombre))
    return showToast("El nombre mínimo debe tener 3 caracteres", "warn");

  toggleFormLoading(loginForm, true);

  try {
    // 🔹 ADMIN LOGIN POR NOMBRE
    const adminResp = await fetch(`${API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, password }),
    });

    if (adminResp.ok) {
      const data = await adminResp.json();
      localStorage.setItem("usuarioActivo", JSON.stringify(data.admin));
      localStorage.setItem("adminSession", "true");
      showToast(`Bienvenido administrador`, "success");

      return setTimeout(() => {
        window.location.href = "admin.html";
      }, 1200);
    }

    // 🔹 USUARIO LOGIN NORMAL
    const userResp = await fetch(`${API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, password }),
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

  toggleFormLoading(loginForm, false);
});



// ===========================================================
// REGISTRO REAL de usuarios
// ===========================================================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-correo").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!nombre || !email || !password)
    return showToast("Completa todos los campos", "warn");

  if (!validarNombre(nombre))
    return showToast("El nombre debe tener mínimo 3 caracteres", "warn");

  if (!validarCorreo(email))
    return showToast("Correo inválido", "warn");

  if (!validarPassword(password))
    return showToast("La contraseña debe tener mínimo 6 caracteres", "warn");

  toggleFormLoading(registerForm, true);

  try {
    const resp = await fetch(`${API_USUARIOS}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });

    let data = {};
    try { data = await resp.json(); } catch {}

    if (!resp.ok) {
      return showToast(
        data.msg || data.error || "Error en el registro",
        "error"
      );
    }

    showToast("Cuenta creada con éxito 🎉", "success");
    setTimeout(() => loginTab.click(), 600);

  } catch (error) {
    console.error(error);
    showToast("Error al conectar con el servidor", "error");
  }

  toggleFormLoading(registerForm, false);
});
