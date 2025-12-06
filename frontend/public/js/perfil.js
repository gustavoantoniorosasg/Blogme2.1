// perfil.js - versión corregida

(() => {
  const $ = sel => document.querySelector(sel);
  const LS = window.localStorage;

  // Utilities
  const genId = () => 'id_' + Math.random().toString(36).slice(2, 10);
  const timeAgo = ts => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`;
  };
  const escapeHtml = s => (s + "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // Toast
  const toastEl = $("#toast");
  function toast(msg, t = 1800) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("toast-show");
    setTimeout(() => toastEl.classList.remove("toast-show"), t);
  }

  // Modal confirmación delete post
  let postToDelete = null;

  const confirmModal = document.createElement("div");
  confirmModal.id = "confirmModal";
  confirmModal.style.cssText = `
    position: fixed; top:50%; left:50%; transform:translate(-50%,-50%);
    background: #fff; padding: 20px 28px; border-radius:14px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25); z-index:9999; display:none;
    text-align:center; max-width:320px;
  `;
  confirmModal.innerHTML = `
    <p style="margin-bottom:15px;">¿Deseas eliminar la publicación?</p>
    <div style="display:flex; gap:10px; justify-content:center;">
      <button id="confirmYes">Sí</button>
      <button id="confirmNo">Cancelar</button>
    </div>
  `;
  document.body.appendChild(confirmModal);

  const confirmYesBtn = confirmModal.querySelector("#confirmYes");
  const confirmNoBtn = confirmModal.querySelector("#confirmNo");

  confirmNoBtn.onclick = () => { postToDelete = null; confirmModal.style.display = "none"; };

  confirmYesBtn.onclick = () => {
    if (postToDelete) {
      const postsArr = JSON.parse(LS.getItem("blogme_posts") || "[]");
      LS.removeItem(`blogme_comments_${postToDelete}`);
      LS.setItem("blogme_posts", JSON.stringify(postsArr.filter(x => x.id !== postToDelete)));
      renderProfilePosts();
      toast("Publicación eliminada", 2000);
      postToDelete = null;
      confirmModal.style.display = "none";
    }
  };

  // Usuario activo y perfil
  const user = LS.getItem("usuarioActivo") || "Invitado";
  const profileKey = `blogme_profile_${user}`;

  // Crear perfil si no existe
  if (!LS.getItem(profileKey)) {
    const def = {
      name: user,
      avatar: "../images/decoraciones/avatar-placeholder.png", // CORREGIDO
      bio: "Hola! Soy nuevo en BlogMe.",
      notes: [{ id: genId(), text: "¡Mi primera nota!", ts: Date.now() }]
    };
    LS.setItem(profileKey, JSON.stringify(def));
  }

  const getUser = () => JSON.parse(LS.getItem(profileKey) || "{}");

  // Obtener elementos
  const topAvatar = $("#topAvatar");
  const topName = $("#topName");
  const topNotesCount = $("#topNotesCount");
  const logoutBtn = $("#logoutBtn");
  const goFeed = $("#goFeed");

  const profileAvatar = $("#profileAvatar");
  const profileName = $("#profileName");
  const profileBio = $("#profileBio");
  const profileNotesList = $("#profileNotesList");

  const profilePosts = $("#profilePosts");
  const postsCountEl = $("#postsCount");
  const notesCountEl = $("#notesCount");

  const editProfileBtn = $("#editProfileBtn");
  const profileModal = $("#profileModal");
  const closeProfile = $("#closeProfile");
  const cancelProfile = $("#cancelProfile");

  const profileNameInput = $("#profileNameInput");
  const profileBioInput = $("#profileBioInput");

  const avatarUpload = $("#avatarUpload");
  const btnUpload = document.querySelector(".btn-upload");

  const saveProfile = $("#saveProfile");
  const addNoteBtnProfile = $("#addNoteBtnProfile");

  // Función cerrar modal perfil
  function cerrarModal() {
    profileModal.classList.add("hidden");
    profileModal.classList.remove("show");
  }

  // Actualizar UI de perfil
  function loadProfileInfo() {
    const prof = getUser();

    profileName.textContent = prof.name || "Invitado";
    profileBio.textContent = prof.bio || "Sin bio — ¡edítala!";
    profileAvatar.src = prof.avatar || "../images/decoraciones/avatar-placeholder.png";  // CORREGIDO

    topAvatar && (topAvatar.src = profileAvatar.src);
    topName && (topName.textContent = prof.name);
    topNotesCount && (topNotesCount.textContent = `${(prof.notes || []).length} notas`);
    notesCountEl && (notesCountEl.textContent = (prof.notes || []).length);

    renderNotes(prof.notes || []);
  }

  // Renderizar notas
  function renderNotes(notes) {
    if (!profileNotesList) return;
    profileNotesList.innerHTML = "";

    (notes || []).forEach(n => {
      const div = document.createElement("div");
      div.className = "note-item";
      div.innerHTML = `
        <div class="note-text" contenteditable="false">${escapeHtml(n.text)}</div>
        <button class="del-note" data-id="${n.id}">Eliminar</button>
      `;
      profileNotesList.appendChild(div);

      div.querySelector(".del-note").onclick = () => {
        const prof = getUser();
        prof.notes = prof.notes.filter(x => x.id !== n.id);
        LS.setItem(profileKey, JSON.stringify(prof));
        loadProfileInfo();
      };
    });
  }

  // Render posts del usuario
  function renderProfilePosts() {
    if (!profilePosts) return;
    const posts = JSON.parse(LS.getItem("blogme_posts") || "[]");
    const prof = getUser();
    const mine = posts.filter(p => p.author === prof.name);

    postsCountEl && (postsCountEl.textContent = mine.length);
    profilePosts.innerHTML = "";

    if (!mine.length) {
      profilePosts.innerHTML = `<small style="color:#666">Aún no has publicado nada.</small>`;
      return;
    }

    mine.sort((a, b) => b.ts - a.ts);

    mine.forEach(p => {
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <strong>${p.author}</strong> - ${timeAgo(p.ts)}
        <p>${escapeHtml(p.content)}</p>
        <button class="btn-del-post" data-id="${p.id}">Eliminar</button>
      `;
      profilePosts.appendChild(card);

      card.querySelector(".btn-del-post").onclick = ev => {
        postToDelete = ev.currentTarget.dataset.id;
        confirmModal.style.display = "block";
      };
    });
  }

  // Modal de edición perfil
  editProfileBtn && (editProfileBtn.onclick = () => {
    const prof = getUser();
    profileNameInput.value = prof.name || "";
    profileBioInput.value = prof.bio || "";
    profileModal.classList.add("show");
    profileModal.classList.remove("hidden");
  });

  closeProfile && (closeProfile.onclick = cerrarModal);
  cancelProfile && (cancelProfile.onclick = cerrarModal);

  saveProfile && (saveProfile.onclick = () => {
    const prof = getUser();
    prof.name = profileNameInput.value.trim() || prof.name;
    prof.bio = profileBioInput.value.trim() || prof.bio;
    LS.setItem(profileKey, JSON.stringify(prof));
    cerrarModal();
    loadProfileInfo();
    renderProfilePosts();
  });

  // Avatar upload
  if (btnUpload && avatarUpload) {
    btnUpload.onclick = () => avatarUpload.click();
    avatarUpload.onchange = async e => {
      const f = e.target.files[0];
      if (!f) return;

      const reader = new FileReader();
      reader.onload = () => {
        const prof = getUser();
        prof.avatar = reader.result;
        LS.setItem(profileKey, JSON.stringify(prof));
        loadProfileInfo();
      };
      reader.readAsDataURL(f);
    };
  }

  // Ir al feed
  goFeed && (goFeed.onclick = () => window.location.href = "../pages/publicaciones.html");

  // Logout
  logoutBtn && (logoutBtn.onclick = () => {
    LS.removeItem("usuarioActivo");
    window.location.href = "../pages/login.html";
  });

  // Init
  loadProfileInfo();
  renderProfilePosts();
})();
