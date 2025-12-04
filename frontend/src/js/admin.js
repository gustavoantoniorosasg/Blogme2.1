// ===============================
// 🔧 CONFIG: Backend real Render
// ===============================
const API_BASE = "https://blogme2-1.onrender.com";

const API_ADMIN = `${API_BASE}/api/admin`;
const API_USERS = `${API_BASE}/api/usuarios`;
const API_POSTS = `${API_BASE}/api/publicaciones`;

// 🔁 Despertar Render automáticamente
(async () => {
  try {
    await fetch(`${API_USERS}/ping`, { method: "GET" });
  } catch (_) {}
})();

// ===============================
// 🛡️ Protección de acceso
// ===============================
if (!localStorage.getItem("adminSession")) {
  alert("Acceso denegado. Inicia sesión como administrador.");
  window.location.href = "login.html";
}

// ===============================
// 🔘 Cerrar sesión
// ===============================
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("adminSession");
  window.location.href = "login.html";
});

// ===============================
// 📌 Tablas dinámicas
// ===============================
const userTable = document.querySelector("#usersTable tbody");
const postTable = document.querySelector("#postsTable tbody");

// ===============================
// 🔍 Modal visualización
// ===============================
const modal = document.getElementById("viewModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

// ===============================
// 📦 Obtener datos reales backend
// ===============================
async function cargarDatos() {
  try {
    /* ======================
       👥 Obtener usuarios
    ====================== */
    const resUsuarios = await fetch(API_USERS, {
      credentials: "include"
    });

    if (!resUsuarios.ok) throw new Error("Usuarios no accesibles");

    const usuarios = await resUsuarios.json();

    userTable.innerHTML = "";
    usuarios.forEach(u => {
      userTable.innerHTML += `
        <tr>
          <td>${u.username}</td>
          <td>${u.correo || "Sin correo"}</td>
          <td>${u.rol || "usuario"}</td>
          <td>
            <button class="delete-btn" data-id="${u._id}" data-type="user">
              🗑️ Eliminar
            </button>
          </td>
        </tr>`;
    });


    /* ======================
       📰 Obtener publicaciones
    ====================== */
    const resPosts = await fetch(API_POSTS, {
      credentials: "include"
    });

    if (!resPosts.ok) throw new Error("Publicaciones no accesibles");

    const posts = await resPosts.json();

    postTable.innerHTML = "";
    posts.forEach(p => {
      const autor = p.author || "Usuario eliminado";
      const avatar = p.authorAvatar || "../img/default-avatar.png";
      const textoCorto = p.content.length > 40
        ? p.content.substring(0, 40) + "..."
        : p.content;

      postTable.innerHTML += `
        <tr>
          <td>${textoCorto}</td>
          <td>
            <div class="post-author">
              <img src="${avatar}" class="avatar-mini">
              <span>${autor}</span>
            </div>
          </td>
          <td>
            <button class="view-btn"
              data-texto="${p.content}"
              data-imagen="${p.img || ""}"
              data-autor="${autor}">
              👁️ Ver
            </button>
            <button class="delete-btn" data-id="${p._id}" data-type="post">
              🗑️ Eliminar
            </button>
          </td>
        </tr>`;
    });

    asignarEventos();

  } catch (err) {
    console.error("Error cargando datos:", err);
    alert("❌ No se pudo conectar con el servidor.");
  }
}

// ===============================
// 🗑️ Evento Eliminar user/post
// ===============================
function asignarEventos() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;

      if (!confirm(`¿Eliminar este ${type === "user" ? "usuario" : "post"}?`))
        return;

      try {
        const res = await fetch(
          `${type === "user" ? API_USERS : API_POSTS}/${id}`,
          {
            method: "DELETE",
            credentials: "include"
          }
        );

        if (!res.ok) throw new Error("Error en eliminación");

        alert(
          `${
            type === "user" ? "Usuario" : "Publicación"
          } eliminado correctamente ✔`
        );

        cargarDatos();

      } catch (error) {
        console.error(error);
        alert("❌ No se pudo eliminar.");
      }
    });
  });


  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      modalTitle.textContent = `Publicación de ${btn.dataset.autor}`;
      modalContent.innerHTML = `
        <p>${btn.dataset.texto}</p>
        ${
          btn.dataset.imagen
            ? `<img src="${btn.dataset.imagen}" class="modal-img">`
            : "<p>Sin imagen</p>"
        }`;

      modal.style.display = "flex";
    });
  });
}

// ===============================
// 👁️ Cerrar modal
// ===============================
closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

// ===============================
// 🚀 Ejecutar carga inicial
// ===============================
cargarDatos();
