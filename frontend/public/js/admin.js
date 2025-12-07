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

// 🌐 URL base del backend
const API_URL = "http://localhost:4000/api/admin";

// 🧍‍♀ Tablas
const userTable = document.querySelector("#usersTable tbody");
const postTable = document.querySelector("#postsTable tbody");

// 👁 Modal de ver publicación
const modal = document.getElementById("viewModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

/* ============================================================
   📦 Cargar datos reales desde MongoDB
============================================================ */
async function cargarDatos() {
  try {
    // 👥 Obtener usuarios
    const resUsuarios = await fetch(`${API_URL}/usuarios`);
    if (!resUsuarios.ok) throw new Error("Error al obtener usuarios");
    const usuarios = await resUsuarios.json();

    userTable.innerHTML = "";
    usuarios.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.username}</td>
        <td>${u.correo || u.email || "Sin correo"}</td>
        <td>${u.rol || "usuario"}</td>
        <td>
          <button class="delete-btn" data-id="${u._id}" data-type="user">🗑 Eliminar</button>
        </td>
      `;
      userTable.appendChild(row);
    });

    // 📰 Obtener publicaciones
    const resPosts = await fetch(`${API_URL}/publicaciones`);
    if (!resPosts.ok) throw new Error("Error al obtener publicaciones");
    const posts = await resPosts.json();

    postTable.innerHTML = "";
    posts.forEach(p => {
      const autor = p.author || "Usuario eliminado";
      const avatar = p.authorAvatar || "../img/default-avatar.png";
      const textoCorto = p.content.length > 40 ? p.content.substring(0, 40) + "..." : p.content;

      const rowHTML = `
        <td>${textoCorto}</td>
        <td>
          <div class="post-author">
            <img src="${avatar}" alt="avatar" class="avatar-mini">
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
          <button class="delete-btn" data-id="${p._id}" data-type="post">🗑 Eliminar</button>
        </td>
      `;

      const row = document.createElement("tr");
      row.innerHTML = rowHTML;
      postTable.appendChild(row);
    });

    // 🔄 Asignar eventos después de renderizar
    asignarEventos();
  } catch (err) {
    console.error("Error cargando datos:", err);
    alert("❌ No se pudo conectar con el servidor.");
  }
}

/* ============================================================
   🗑 Eliminar usuario o publicación
============================================================ */
function asignarEventos() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;

      const ok = await customConfirm(`¿Eliminar este ${type === "user" ? "usuario" : "post"}?`);
      if (!ok) return;

      try {
        const res = await fetch(`${API_URL}/${type === "user" ? "usuarios" : "publicaciones"}/${id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error("Error al eliminar");

        mostrarSuccess(`${type === "user" ? "Usuario" : "Publicación"} eliminado correctamente ✔`);
        cargarDatos();
      } catch (error) {
        console.error(error);
        alert("❌ No se pudo eliminar el elemento.");
      }
    });
  });

  // Ver publicaciones
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const texto = btn.dataset.texto;
      const imagen = btn.dataset.imagen;
      const autor = btn.dataset.autor;

      modalTitle.textContent = `Publicación de ${autor}`;
      modalContent.innerHTML = `
        <p>${texto}</p>
        ${imagen ? `<img src="${imagen}" alt="imagen publicación" class="modal-img">` : `<p>Sin imagen</p>`}
      `;

      modal.style.display = "flex";
    });
  });
}

// ======================
// MODAL PERSONALIZADO
// ======================
const confirmModal = document.getElementById("confirmModal");
const confirmText = document.getElementById("confirmText");
const confirmCancel = document.getElementById("confirmCancel");
const confirmOk = document.getElementById("confirmOk");

let confirmResolve;

// Función para mostrar el modal y esperar confirmación
function customConfirm(message) {
  confirmText.textContent = message;
  confirmModal.style.display = "flex";

  return new Promise(resolve => {
    confirmResolve = resolve;
  });
}

// Botón cancelar
confirmCancel.addEventListener("click", () => {
  confirmModal.style.display = "none";
  confirmResolve(false);
});

// Botón aceptar
confirmOk.addEventListener("click", () => {
  confirmModal.style.display = "none";
  confirmResolve(true);
});

// ======================
// MODAL DE ÉXITO
// ======================
const successModal = document.getElementById("successModal");
const successText = document.getElementById("successText");
const successOk = document.getElementById("successOk");

// función para mostrar el modal
function mostrarSuccess(msg) {
  successText.textContent = msg;
  successModal.style.display = "flex";
}

// cerrar modal
successOk.addEventListener("click", () => {
  successModal.style.display = "none";
});

/* ============================================================
   👁 Cerrar modal
============================================================ */
closeModal.addEventListener("click", () => (modal.style.display = "none"));

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ============================================================
   🚀 Cargar datos al iniciar
============================================================ */
cargarDatos();
