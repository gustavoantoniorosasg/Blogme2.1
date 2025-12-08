document.addEventListener("DOMContentLoaded", () => {

  console.log("🌍 API USUARIOS:", window.API_USUARIOS);

  // ===========================================================
  // 🔔 SISTEMA DE TOAST
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

  // estilos toast
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
  // 🔄 Cambio de formulario LOGIN ⟷ REGISTRO
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
// 🔐 LOGIN (CORREGIDO PARA EMAIL + PASSWORD)
// ===========================================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById("login-nombre");  // mismo input pero ahora será email
  const passInput = document.getElementById("login-password");

  if (!emailInput || !passInput) {
    return showToast("Error en el formulario, recarga la página", "error");
  }

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) return showToast("Completa todos los campos", "warn");

  if (!validarPassword(password)) return showToast("Contraseña inválida", "warn");

  try {
    // 1️⃣ Intentar login admin — AHORA CON EMAIL
    const adminResp = await fetch(`${window.API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (adminResp.ok) {
      const data = await adminResp.json();
      localStorage.setItem("usuarioActivo", JSON.stringify(data.admin));
      localStorage.setItem("adminSession", "true");

      showToast("Bienvenido administrador 👑", "success");

      return setTimeout(() => {
        window.location.href = "/admin-panel.html";
      }, 800);
    }

    // 2️⃣ Login usuario normal — AHORA CON EMAIL
    const userResp = await fetch(`${window.API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await userResp.json();

    if (!userResp.ok) {
      return showToast(data.error || "Credenciales incorrectas", "error");
    }

    localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));
    localStorage.removeItem("adminSession");

    showToast(`Bienvenido ${data.usuario.nombre} 👋`, "success");

    setTimeout(() => {
      window.location.href = "/publicaciones.html";
    }, 800);

  } catch (error) {
    console.error("⚠️ Error en login:", error);
    showToast("No se pudo conectar con el servidor", "error");
  }
});

  // ===========================================================
  // 📝 REGISTRO
  // ===========================================================
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("reg-nombre").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!nombre || !email || !password)
      return showToast("Completa todos los campos", "warn");

    if (!validarPassword(password))
      return showToast("La contraseña debe tener mínimo 6 caracteres", "warn");

    try {
      const resp = await fetch(`${window.API_USUARIOS}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await resp.json();

      if (!resp.ok) return showToast(data.error || "Error al registrarse", "error");

      showToast("Cuenta creada con éxito 🎉", "success");

      setTimeout(() => loginTab.click(), 600);

    } catch (error) {
      console.error(error);
      showToast("Error al conectar con el servidor", "error");
    }
  });

});
