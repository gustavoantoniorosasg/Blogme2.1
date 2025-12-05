// ===========================================================
// REGISTRO REAL DE USUARIO (usa config.js global)
// ===========================================================

// Variables globales creadas por config.js
// API_USUARIOS ya existe, no lo vuelvas a declarar

const registerForm = document.getElementById("register-form");
const registerMsg = document.getElementById("register-msg");
const regUsername = document.getElementById("reg-username");
const regCorreo = document.getElementById("reg-correo");
const regPassword = document.getElementById("reg-password");

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarMsg(el, msg, tipo = "error") {
  el.textContent = msg;
  el.style.color = tipo === "ok" ? "#00c851" : "#ff4444";

  setTimeout(() => (el.textContent = ""), 3000);
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = regUsername.value.trim();
  const correo = regCorreo.value.trim();
  const password = regPassword.value.trim();

  if (!username || !correo || !password)
    return mostrarMsg(registerMsg, "Todos los campos son obligatorios");

  if (!validarEmail(correo))
    return mostrarMsg(registerMsg, "Correo inválido");

  if (password.length < 6)
    return mostrarMsg(registerMsg, "La contraseña debe tener al menos 6 caracteres");

  try {
    fetch(`${API_USUARIOS}/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: username, email: correo, password }),
    });

    const data = await resp.json();

    if (!resp.ok)
      return mostrarMsg(registerMsg, data.msg || "Error en el registro");

    mostrarMsg(registerMsg, "Cuenta creada correctamente ✔", "ok");

    setTimeout(() => {
      document.getElementById("login-tab").click();
      registerForm.reset();
    }, 1500);

  } catch (error) {
    console.error(error);
    mostrarMsg(registerMsg, "Error al conectar con el servidor");
  }
});
