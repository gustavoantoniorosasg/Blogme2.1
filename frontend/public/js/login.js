console.log("📌 login.js activo");

// ============================
// 🔥 Despertar backend
// ============================
fetch("https://blogme2-1.onrender.com/api/usuarios/ping")
  .then(() => console.log("⚡ Backend activo"))
  .catch(() => console.warn("⚠ Backend no respondió ping"));

// ============================
// URLs API
// ============================
const API_BASE = "https://blogme2-1.onrender.com/api";
const API_USUARIOS = `${API_BASE}/usuarios`;
const API_ADMIN = `${API_BASE}/admin`;

// ============================
// Formularios
// ============================
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMsg = document.getElementById("login-msg");
const registerMsg = document.getElementById("register-msg");

// ============================
// LOGIN
// ============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-correo").value.trim();
  const password = document.getElementById("login-password").value.trim();

  loginMsg.textContent = "⏳ Validando...";

  const payload = { email, password };

  try {
    // 🔹 primer intento: usuario normal
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

    // 🔹 segundo intento: admin
    res = await fetch(`${API_ADMIN}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      let data = await res.json();
      loginMsg.textContent = "👑 Bienvenido administrador";
      console.log("Admin logueado:", data);
      return;
    }

    loginMsg.textContent = "❌ Credenciales incorrectas";

  } catch (err) {
    console.error(err);
    loginMsg.textContent = "⚠ Error de conexión";
  }
});

// ============================
// REGISTRO
// ============================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("reg-username").value.trim(); // 🔥 corregido
  const email = document.getElementById("reg-correo").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  registerMsg.textContent = "⏳ Registrando...";

  const payload = { nombre, email, password }; // 🔥 correcto

  try {
    const res = await fetch(`${API_USUARIOS}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      registerMsg.textContent = `⚠ ${data.error || "Error al registrar"}`;
      return;
    }

    registerMsg.textContent = "✔ Registro exitoso 🎉";
    console.log("Usuario creado:", data);

  } catch (err) {
    console.error(err);
    registerMsg.textContent = "⚠ Error de conexión";
  }
});
