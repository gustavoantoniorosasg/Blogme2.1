/* =========================================================================
   🛡️ BLOGME — PANEL ADMIN PRO
   Limpio • Seguro • Compatible con config.js global
=========================================================================== */

/* =========================================================================
   🔐 PROTECCIÓN DE ACCESO
=========================================================================== */
if (!localStorage.getItem("adminSession")) {
  alert("Acceso denegado. Inicia sesión como administrador.");
  window.location.href = "login.html";
}

/* =========================================================================
   🚪 CERRAR SESIÓN GLOBAL (usa logout() de config.js)
=========================================================================== */
document.getElementById("logout-btn").addEventListener("click", () => {
  logout();
});

/* =========================================================================
   🌐 API GLOBAL (tomado desde config.js)
=========================================================================== */
const API_URL = `${API_ADMIN}`; // api/admin
const API_POSTS = `${API_PUBLICACIONES}`; // api/publicaciones

const userTable = document.querySelector("#usersTable tbody");
const postTable = document.querySelector("#postsTable tbody");

/* =========================================================================
   📦 MODALES
=========================================================================== */
const modal = document.getElementById("viewModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmCancel = document.getElementById("confirmCancel");
const confirmOk = document.getElementById("confirmOk");

let confirmResolve;

const successModal = document.getElementById("successModal");
const successText = document.getElementById("successText");
const successOk = document.getElementById("successOk");

const loader = document.getElementById("loader");

/* =========================================================================
   🔄 LOADER
=========================================================================== */
function mostrarLoader() { loader.style.display = "flex"; }
function ocultarLoader() { loader.style.display = "none"; }

/* =========================================================================
   📥 CARGAR USUARIOS + PUBLICACIONES
=========================================================================== */
async function cargarDatos() {
  try {
    mostrarLoader();

    /* --- 👥 USUARIOS --- */
    const resUsuarios = await fetch(`${API_URL}/lista`);
    if (!resUsuarios.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await resUsuarios.json();
    userTable.innerHTML = "";

    usuarios.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.username}</td>
        <td>${u.correo || "Sin correo"}</td>
        <td>${u.rol || "usuario"}</td>
        <td>
          <button class="delete-btn" data-id="${u._id}" data-type="user">
            🗑 Eliminar
          </button>
        </td>
      `;
      userTable.appendChild(row);
    });

    /* --- 📰 PUBLICACIONES --- */
    const resPosts = await fetch(`${API_POSTS}/lista`);
    if (!resPosts.ok) throw new Error("Error al obtener publicaciones");

    const posts = await resPosts.json();
    postTable.innerHTML = "";

    posts.forEach(p => {
      const autor = p.author || "Usuario eliminado";
      const avatar = p.authorAvatar || "assets/img/default-avatar.png";
      const textoCorto = p.content.length > 40
        ? p.content.substring(0, 40) + "..."
        : p.content;

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
            👁 Ver
          </button>

          <button class="delete-btn"
            data-id="${p._id}"
            data-type="post">
            🗑 Eliminar
          </button>
        </td>
      `;
      postTable.appendChild(row);
    });

    asignarEventos();

  } catch (err) {
    console.error(err);
    alert("❌ Error: No se pudo conectar con el servidor.");
  } finally {
    ocultarLoader();
  }
}

/* =========================================================================
   🗑 EVENTOS (ELIMINAR + VER)
=========================================================================== */
function asignarEventos() {
  /* --- ELIMINAR --- */
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;

      const ok = await customConfirm(
        `¿Eliminar este ${type === "user" ? "usuario" : "post"}?`
      );
      if (!ok) return;

      try {
        const endpoint =
          type === "user"
            ? `${API_URL}/${id}`
            : `${API_POSTS}/${id}`;

        const res = await fetch(endpoint, { method: "DELETE" });

        if (!res.ok) throw new Error("Error al eliminar");

        mostrarSuccess(
          `${type === "user" ? "Usuario" : "Publicación"} eliminado ✔`
        );

        cargarDatos();
      } catch (err) {
        console.error(err);
        alert("❌ No se pudo eliminar.");
      }
    });
  });

  /* --- VER PUBLICACIÓN --- */
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const texto = btn.dataset.texto;
      const imagen = btn.dataset.imagen;
      const autor = btn.dataset.autor;

      modalTitle.textContent = `Publicación de ${autor}`;
      modalContent.innerHTML = `
        <p>${texto}</p>
        ${imagen ? `<img src="${imagen}" class="modal-img">` : "<p>Sin imagen</p>"}
      `;

      modal.style.display = "flex";
    });
  });
}

/* =========================================================================
   📌 MODALES DE CONFIRMACIÓN
=========================================================================== */
function customConfirm(message) {
  confirmText.textContent = message;
  confirmModal.style.display = "flex";

  return new Promise(resolve => {
    confirmResolve = resolve;
  });
}
confirmCancel.addEventListener("click", () => {
  confirmModal.style.display = "none";
  confirmResolve(false);
});
confirmOk.addEventListener("click", () => {
  confirmModal.style.display = "none";
  confirmResolve(true);
});

/* =========================================================================
   🎉 MODAL DE EXITO
=========================================================================== */
function mostrarSuccess(msg) {
  successText.textContent = msg;
  successModal.style.display = "flex";
}
successOk.addEventListener("click", () => {
  successModal.style.display = "none";
});

/* =========================================================================
   ❌ CERRAR MODAL VER
=========================================================================== */
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* =========================================================================
   🚀 INICIO
=========================================================================== */
cargarDatos();
