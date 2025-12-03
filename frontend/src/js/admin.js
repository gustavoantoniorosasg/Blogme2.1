// ===============================
// 🔧 CONFIG: URL del backend real
// ===============================
const API_URL = "https://blogme2-1.onrender.com/api/admin";

// 🚨 Protección de acceso
if (!localStorage.getItem("adminSession")) {
  alert("Acceso denegado. Inicia sesión como administrador.");
  window.location.href = "login.html";
}

// 🔘 Cerrar sesión
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("adminSession");
  window.location.href = "login.html";
});

// 🧍 Tablas
const userTable = document.querySelector("#usersTable tbody");
const postTable = document.querySelector("#postsTable tbody");

// 👁️ Modal
const modal = document.getElementById("viewModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

/* ============================================================
   📦 Obtener datos reales del backend
============================================================ */
async function cargarDatos() {
  try {
    /* =======================
       👥 Obtener usuarios
    ======================== */
    const resUsuarios = await fetch(`${API_URL}/usuarios`);
    if (!resUsuarios.ok) throw new Error("Error al obtener usuarios");
    const usuarios = await resUsuarios.json();

    userTable.innerHTML = "";
    usuarios.forEach(u => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${u.username}</td>
        <td>${u.email || "Sin correo"}</td>
        <td>${u.rol || "usuario"}</td>
        <td>
          <button class="delete-btn" data-id="${u._id}" data-type="user">🗑️ Eliminar</button>
        </td>
      `;

      userTable.appendChild(row);
    });

    /* =======================
       📰 Obtener publicaciones
    ======================== */
    const resPosts = await fetch(`${API_URL}/publicaciones`);
    if (!resPosts.ok) throw new Error("Error al obtener publicaciones");
    const posts = await resPosts.json();

    postTable.innerHTML = "";
    posts.forEach(p => {
      const autor = p.author || "Usuario eliminado";
      const avatar = p.authorAvatar || "../img/default-avatar.png";
      const textoCorto = p.content.length > 40 ? p.content.substring(0, 40) + "..." : p.content;

      const row = document.createElement("tr");
      row.innerHTML = `
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
          <button class="delete-btn" data-id="${p._id}" data-type="post">🗑️ Eliminar</button>
        </td>
      `;

      postTable.appendChild(row);
    });

    // Activar eventos
    asignarEventos();

  } catch (err) {
    console.error("Error cargando datos:", err);
    alert("❌ No se pudo conectar con el servidor.");
  }
}

/* ============================================================
   🗑️ Eliminar usuario o publicación
============================================================ */
function asignarEventos() {
  /* --------------------------
      🗑️ Eliminar elemento
  --------------------------- */
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;

      if (!confirm(`¿Eliminar este ${type === "user" ? "usuario" : "post"}?`)) return;

      try {
        const res = await fetch(`${API_URL}/${type === "user" ? "usuarios" : "publicaciones"}/${id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error("Error al eliminar");

        alert(`${type === "user" ? "Usuario" : "Publicación"} eliminado correctamente`);
        cargarDatos();

      } catch (error) {
        console.error(error);
        alert("❌ No se pudo eliminar.");
      }
    });
  });

  /* --------------------------
       👁️ Ver publicación
  --------------------------- */
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      modalTitle.textContent = `Publicación de ${btn.dataset.autor}`;
      modalContent.innerHTML = `
        <p>${btn.dataset.texto}</p>
        ${btn.dataset.imagen
          ? `<img src="${btn.dataset.imagen}" class="modal-img">`
          : "<p>Sin imagen</p>"
        }
      `;
      modal.style.display = "flex";
    });
  });
}

/* ============================================================
   👁️ Cerrar modal
============================================================ */
closeModal.addEventListener("click", () => modal.style.display = "none");

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ============================================================
   🚀 Cargar datos al iniciar
============================================================ */
cargarDatos();
