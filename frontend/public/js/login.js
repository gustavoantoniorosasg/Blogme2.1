console.log("📌 login.js cargado correctamente");

// ==============================
//  URLs correctas del backend
// ==============================
const API_BASE = "https://blogme2-1.onrender.com/api";
const API_USUARIOS = `${API_BASE}/usuarios`;
const API_ADMIN = `${API_BASE}/admin`;

// ==============================
//  SELECTORES UI
// ==============================
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMsg = document.getElementById("login-msg");
const registerMsg = document.getElementById("register-msg");

const loginCorreo = document.getElementById("login-correo");
const loginPassword = document.getElementById("login-password");

const regUsername = document.getElementById("reg-username");
const regCorreo = document.getElementById("reg-correo");
const regPassword = document.getElementById("reg-password");

// ==============================
//  LOGIN
// ==============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginCorreo.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    loginMsg.textContent = "⚠️ Completa tus datos";
    return;
  }

  loginMsg.textContent = "⏳ Validando...";

  // 🔹 payload correcto
  const payload = { email, password };

  try {
    // 👉 PRIMER INTENTO login usuario
    let res = await fetch(`${API_USUARIOS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      let data = await res.json();
      loginMsg.textContent = "✔ Bienvenido 🎉";
      console.log("Usuario logueado:", data);
      return;
    }

    // 👉 SEGUNDO INTENTO login admin
    res = await fetch(`${API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      let data = await res.json();
      loginMsg.textContent = "👑 Bienvenido admin";
      console.log("Admin logueado:", data);
      return;
    }

    loginMsg.textContent = "❌ Usuario o contraseña incorrectos";

  } catch (err) {
    console.error(err);
    loginMsg.textContent = "⚠ Error de conexión";
  }
});

// ==============================
//  REGISTRO
// ==============================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = regUsername.value.trim(); // 🔥 nombre correcto
  const email = regCorreo.value.trim();
  const password = regPassword.value.trim();

  if (!nombre || !email || !password) {
    registerMsg.textContent = "⚠️ Completa todos los campos";
    return;
  }

  registerMsg.textContent = "⏳ Registrando...";

  // 🔹 payload correcto que espera el backend
  const payload = { nombre, email, password };

  try {
    const res = await fetch(`${API_USUARIOS}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      registerMsg.textContent = "⚠ " + (data.error || "Error al registrar");
      return;
    }

    registerMsg.textContent = "✔ Registro exitoso 🎉";
    console.log("Usuario creado:", data);

  } catch (err) {
    console.error(err);
    registerMsg.textContent = "⚠ Error de conexión";
  }
});
