console.log("🌍 API apuntando a:", window.API_USUARIOS);

// ===========================================================
// 🔔 TOAST SYSTEM
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
  }, 2500);
}

// Toast visuals
const toastStyle = document.createElement("style");
toastStyle.innerHTML = `
#toast {
  visibility: hidden;
  min-width: 240px;
  background: rgba(0,0,0,0.80);
  color: white;
  text-align: center;
  border-radius: 6px;
  padding: 12px;
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  font-size: 14px;
  opacity: 0;
  transition: opacity .3s;
  z-index: 9999;
}
#toast.show { visibility: visible; opacity: 1; }
#toast.success { background: #28a745cc; }
#toast.error { background: #dc3545cc; }
#toast.warn { background: #ffc107cc; color: #000; }
`;
document.head.appendChild(toastStyle);


// ===========================================================
// 🔄 CAMBIO LOGIN / REGISTRO
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
// ✨ VALIDACIONES
// ===========================================================
function validarPassword(pass) {
  return pass.length >= 6;
}


// ===========================================================
// 🔐 LOGIN — POR NOMBRE
// ===========================================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("login-nombre").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!nombre || !password)
    return showToast("Completa todos los campos", "warn");

  if (!validarPassword(password))
    return showToast("Contraseña inválida", "warn");

  try {
    // 1️⃣ Intento login de administrador
    const adminResp = await fetch(`${window.API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, password })
    });

    if (adminResp.ok) {
      const data = await adminResp.json();
      localStorage.setItem("usuarioActivo", JSON.stringify(data.admin));
      localStorage.setItem("adminSession", "true");

      showToast(`Bienvenido administrador 👑`, "success");

      return setTimeout(() => {
        window.location.href = "/admin-panel.html";
      }, 800);
    }

    // 2️⃣ Si no es admin, login normal
    const respUser = await fetch(`${window.API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, password })
    });

    const data = await respUser.json();

    if (!respUser.ok)
      return showToast(data.error || "Credenciales incorrectas", "error");

    localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));
    localStorage.removeItem("adminSession");

    showToast(`Bienvenido ${data.usuario.nombre} 👋`, "success");

    setTimeout(() => {
      window.location.href = "/publicaciones.html";
    }, 700);

  } catch (error) {
    console.error(error);
    showToast("No se pudo conectar con el servidor", "error");
  }
});


// ===========================================================
// 📝 REGISTRO USUARIOS
// ===========================================================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("reg-username").value.trim();
  const correo = document.getElementById("reg-correo").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!nombre || !correo || !password)
    return showToast("Completa todos los campos", "warn");

  if (!validarPassword(password))
    return showToast("La contraseña debe tener mínimo 6 caracteres", "warn");

  try {
    const resp = await fetch(`${window.API_USUARIOS}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombre, correo, password })
    });

    const data = await resp.json();

    if (!resp.ok)
      return showToast(data.error || "Error al registrarse", "error");

    showToast("Cuenta creada con éxito 🎉", "success");

    setTimeout(() => {
      loginTab.click();
    }, 600);

  } catch (error) {
    console.error(error);
    showToast("Error al conectar con el servidor", "error");
  }
});
