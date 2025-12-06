// ===========================================================
// 🌐 login.js — Seguro y listo para producción
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {

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

  loginTab?.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm?.classList.add("active");
    registerForm?.classList.remove("active");
  });

  registerTab?.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm?.classList.add("active");
    loginForm?.classList.remove("active");
  });

  // ===========================================================
  // Validaciones
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
    const button = form?.querySelector("button[type='submit']");
    if (!button) return;
    button.disabled = state;
    button.innerText = state ? "Procesando..." : "Entrar / Registrarse";
  }

  // ===========================================================
  // LOGIN — Admin + Usuario
  // ===========================================================
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputCorreo = document.getElementById("login-correo");
    const inputPassword = document.getElementById("login-password");

    if (!inputCorreo || !inputPassword) return console.error("Inputs de login no encontrados");

    const correo = inputCorreo.value.trim();
    const password = inputPassword.value.trim();

    if (!correo || !password) {
      showToast("Completa todos los campos", "warn");
      toggleFormLoading(loginForm, false);
      return;
    }

    toggleFormLoading(loginForm, true);

    try {
      // 🔹 LOGIN NORMAL
      const userResp = await fetch(`${API_USUARIOS}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo, password }),
      });

      const data = await userResp.json();

      if (!userResp.ok) {
        showToast(data.error || "Credenciales incorrectas", "error");
        toggleFormLoading(loginForm, false);
        return;
      }

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
  // REGISTRO — Usuarios
  // ===========================================================
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputNombre = registerForm.querySelector("#reg-username");
    const inputCorreo = registerForm.querySelector("#reg-correo");
    const inputPassword = registerForm.querySelector("#reg-password");

    if (!inputNombre || !inputCorreo || !inputPassword) {
      console.error("Inputs de registro no encontrados");
      return;
    }

    const nombre = inputNombre.value.trim();
    const email = inputCorreo.value.trim();
    const password = inputPassword.value.trim();

    if (!nombre || !email || !password) {
      showToast("Completa todos los campos", "warn");
      toggleFormLoading(registerForm, false);
      return;
    }

    if (!validarNombre(nombre)) {
      showToast("El nombre mínimo debe tener 3 caracteres", "warn");
      toggleFormLoading(registerForm, false);
      return;
    }

    if (!validarCorreo(email)) {
      showToast("Correo inválido", "warn");
      toggleFormLoading(registerForm, false);
      return;
    }

    if (!validarPassword(password)) {
      showToast("La contraseña debe tener mínimo 6 caracteres", "warn");
      toggleFormLoading(registerForm, false);
      return;
    }

    toggleFormLoading(registerForm, true);

    try {
      const resp = await fetch(`${API_USUARIOS}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await resp.json();

      if (!resp.ok) {
        showToast(data.error || data.msg || "Error en el registro", "error");
        toggleFormLoading(registerForm, false);
        return;
      }

      showToast("Cuenta creada con éxito 🎉", "success");
      setTimeout(() => loginTab?.click(), 600);

    } catch (err) {
      console.error(err);
      showToast("Error al conectar con el servidor", "error");
    }

    toggleFormLoading(registerForm, false);
  });

});
