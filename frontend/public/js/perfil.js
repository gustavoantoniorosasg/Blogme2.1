// perfil.js - versión robusta y corregida
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

  // Confirm modal (insertado dinámicamente)
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
      <button id="confirmYes" style="padding:8px 14px;border-radius:8px;background:#3a7bfc;color:#fff;border:none;cursor:pointer;">Sí</button>
      <button id="confirmNo" style="padding:8px 14px;border-radius:8px;background:#ccc;color:#222;border:none;cursor:pointer;">Cancelar</button>
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

  // ---------------------------
  // Obtener nombre de usuario activo correctamente (parsea si es JSON)
  // ---------------------------
  const rawActive = LS.getItem("usuarioActivo");
  let activeName = "Invitado";
  if (rawActive) {
    try {
      const parsed = JSON.parse(rawActive);
      // busca campos típicos
      activeName = parsed.nombre || parsed.name || parsed.username || String(parsed) || "Invitado";
    } catch {
      // si no es JSON, usar el string tal cual
      activeName = rawActive || "Invitado";
    }
  }

  const profileKey = `blogme_profile_${activeName}`;

  // Crear perfil por defecto si no existe
  if (!LS.getItem(profileKey)) {
    const def = {
      name: activeName,
      // ruta pública (raíz) que funciona desde cualquier página
      avatar: "/images/decoraciones/avatar-placeholder.png",
      bio: "Hola! Soy nuevo en BlogMe.",
      notes: [{ id: genId(), text: "¡Mi primera nota!", ts: Date.now() }]
    };
    LS.setItem(profileKey, JSON.stringify(def));
  }

  const getUser = () => JSON.parse(LS.getItem(profileKey) || "{}");

  // ---------------------------
  // DOM (puede devolver null si algo falta; por eso comprobamos antes de usar)
  // ---------------------------
  const topAvatar = $("#topAvatar");
  const topName = $("#topName");
  const topNotesCount = $("#topNotesCount");
  const goFeed = $("#goFeed");
  const logoutBtn = $("#logoutBtn");

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

  // ---------------------------
  // loadProfileInfo seguro (comprueba null antes de asignar)
  // ---------------------------
  function loadProfileInfo() {
    const prof = getUser();

    if (profileName) profileName.textContent = prof.name || "Invitado";
    if (profileBio) profileBio.textContent = prof.bio || "Sin bio — ¡edítala!";
    if (profileAvatar) profileAvatar.src = prof.avatar || "/images/decoraciones/avatar-placeholder.png";

    if (topAvatar) topAvatar.src = (prof.avatar || "/images/decoraciones/avatar-placeholder.png");
    if (topName) topName.textContent = prof.name || "Invitado";
    if (topNotesCount) topNotesCount.textContent = `${(prof.notes || []).length} notas`;
    if (notesCountEl) notesCountEl.textContent = (prof.notes || []).length;

    renderNotes(prof.notes || []);
  }

  // ---------------------------
  // renderNotes (seguro)
  // ---------------------------
  function renderNotes(notes) {
    if (!profileNotesList) return;
    profileNotesList.innerHTML = "";
    (notes || []).forEach(n => {
      const div = document.createElement("div");
      div.className = "note-item";
      div.innerHTML = `
        <div class="note-text" contenteditable="false">${escapeHtml(n.text)}</div>
        <div class="note-actions">
          <button class="edit-note" data-id="${n.id}">Editar</button>
          <button class="del-note" data-id="${n.id}">Eliminar</button>
        </div>`;
      profileNotesList.appendChild(div);

      const noteTextEl = div.querySelector(".note-text");
      const editBtn = div.querySelector(".edit-note");
      const delBtn = div.querySelector(".del-note");

      if (editBtn) {
        editBtn.onclick = () => {
          if (editBtn.textContent === "Editar") {
            noteTextEl.contentEditable = "true";
            noteTextEl.classList.add("editing-note");
            noteTextEl.focus();
            editBtn.textContent = "Guardar";
          } else {
            noteTextEl.contentEditable = "false";
            noteTextEl.classList.remove("editing-note");
            const prof = getUser();
            const idx = (prof.notes || []).findIndex(x => x.id === n.id);
            if (idx !== -1) {
              prof.notes[idx].text = noteTextEl.textContent.trim();
              prof.notes[idx].ts = Date.now();
              LS.setItem(profileKey, JSON.stringify(prof));
              loadProfileInfo();
              toast("Nota actualizada");
            }
            editBtn.textContent = "Editar";
          }
        };
      }

      if (delBtn) {
        delBtn.onclick = () => {
          const prof = getUser();
          prof.notes = (prof.notes || []).filter(x => x.id !== n.id);
          LS.setItem(profileKey, JSON.stringify(prof));
          loadProfileInfo();
          toast("Nota eliminada", 1600);
        };
      }
    });
  }

  // ---------------------------
  // renderProfilePosts (seguro)
  // ---------------------------
  function renderProfilePosts() {
    if (!profilePosts) return;
    const posts = JSON.parse(LS.getItem("blogme_posts") || "[]");
    const prof = getUser();
    const mine = posts.filter(p => p.author === (prof.name || activeName));
    profilePosts.innerHTML = "";
    if (postsCountEl) postsCountEl.textContent = mine.length;
    if (mine.length === 0) {
      profilePosts.innerHTML = `<div style="color:#6b7280">Aún no has publicado nada.</div>`;
      return;
    }
    mine.sort((a, b) => b.ts - a.ts);
    mine.forEach(p => {
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <div class="post-header" style="display:flex;gap:10px;align-items:center">
          <img src="${p.authorAvatar || '/images/decoraciones/avatar-placeholder.png'}" style="width:42px;height:42px;border-radius:10px;border:2px solid var(--primary);">
          <div><strong>${escapeHtml(p.author)}</strong><div style="font-size:0.85rem;color:#6b7280">${timeAgo(p.ts)}</div></div>
        </div>
        <div class="post-content" contenteditable="false" style="margin-top:8px;">
          <p>${escapeHtml(p.content)}</p>
          ${p.img ? `<div class="post-media"><img src="${p.img}" alt="img"></div>` : ""}
        </div>
        <div style="margin-top:10px;display:flex;gap:6px;justify-content:flex-end;">
          <button class="btn-comment" data-id="${p.id}">Comentar</button>
          <button class="btn-edit-post" data-id="${p.id}">Editar</button>
          <button class="btn-del-post" data-id="${p.id}">Eliminar</button>
        </div>`;
      profilePosts.appendChild(card);

      const commentBtn = card.querySelector(".btn-comment");
      if (commentBtn) commentBtn.onclick = ev => {
        const id = ev.currentTarget.dataset.id;
        if (typeof window.openComments === "function") window.openComments(id);
        else toast("Función de comentarios no disponible");
      };

      const editBtn = card.querySelector(".btn-edit-post");
      if (editBtn) editBtn.onclick = () => {
        const contentEl = card.querySelector(".post-content");
        if (editBtn.textContent === "Editar") {
          contentEl.contentEditable = "true";
          contentEl.style.border = "1px solid var(--primary)";
          contentEl.style.background = "#FDF2F8";
          contentEl.focus();
          editBtn.textContent = "Guardar";
        } else {
          contentEl.contentEditable = "false";
          contentEl.style.border = "none";
          contentEl.style.background = "transparent";
          const postsArr = JSON.parse(LS.getItem("blogme_posts") || "[]");
          const idx = postsArr.findIndex(x => x.id === p.id);
          if (idx !== -1) {
            postsArr[idx].content = contentEl.innerText.trim();
            LS.setItem("blogme_posts", JSON.stringify(postsArr));
            renderProfilePosts();
            toast("Publicación actualizada");
          }
          editBtn.textContent = "Editar";
        }
      };

      const delBtn = card.querySelector(".btn-del-post");
      if (delBtn) delBtn.onclick = ev => {
        postToDelete = ev.currentTarget.dataset.id;
        confirmModal.style.display = "block";
      };
    });
  }

  // ---------------------------
  // Handlers modal perfil (seguro)
  // ---------------------------
  const cerrarModal = () => {
    if (profileModal) {
      profileModal.classList.add("hidden");
      profileModal.classList.remove("show");
    }
  };

  if (editProfileBtn) {
    editProfileBtn.onclick = () => {
      const prof = getUser();
      if (profileNameInput) profileNameInput.value = prof.name || "";
      if (profileBioInput) profileBioInput.value = prof.bio || "";
      if (profileModal) {
        profileModal.classList.remove("hidden");
        profileModal.classList.add("show");
      }
    };
  }

  if (closeProfile) closeProfile.onclick = cerrarModal;
  if (cancelProfile) cancelProfile.onclick = cerrarModal;

  if (saveProfile) {
    saveProfile.onclick = () => {
      const prof = getUser();
      if (profileNameInput) prof.name = profileNameInput.value.trim() || prof.name;
      if (profileBioInput) prof.bio = profileBioInput.value.trim() || prof.bio;
      LS.setItem(profileKey, JSON.stringify(prof));
      cerrarModal();
      loadProfileInfo();
      renderProfilePosts();
      toast("Perfil actualizado", 1600);
    };
  }

  // Avatar upload
  if (btnUpload && avatarUpload) {
    btnUpload.onclick = () => avatarUpload.click();
    avatarUpload.onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const maxMB = 3;
      if (f.size > maxMB * 1024 * 1024) {
        return toast(`Imagen demasiado grande (máx ${maxMB}MB)`);
      }
      const reader = new FileReader();
      reader.onload = () => {
        const prof = getUser();
        prof.avatar = reader.result;
        LS.setItem(profileKey, JSON.stringify(prof));
        loadProfileInfo();
        toast("Avatar actualizado", 1400);
      };
      reader.readAsDataURL(f);
      avatarUpload.value = "";
    };
  }

  // Notas: modal simple
  if (addNoteBtnProfile) {
    addNoteBtnProfile.onclick = () => {
      const noteModal = document.createElement("div");
      noteModal.style.cssText = `
        position: fixed; top:50%; left:50%; transform:translate(-50%,-50%);
        background: #fff; padding: 20px; border-radius:16px;
        box-shadow:0 8px 24px rgba(0,0,0,0.3); z-index:10000;
        width: 90%; max-width:400px; display:flex; flex-direction:column; gap:12px;
        font-family:sans-serif;
      `;
      noteModal.innerHTML = `
        <textarea placeholder="Escribe tu nota..." style="width:100%; height:120px; padding:10px; border:1px solid #ccc; border-radius:10px; resize:none; font-size:1rem;"></textarea>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button id="cancelNote" style="padding:8px 16px; border:none; border-radius:10px; cursor:pointer; background:#ccc; color:#333; font-weight:600;">Cancelar</button>
          <button id="saveNote" style="padding:8px 16px; border:none; border-radius:10px; cursor:pointer; background:#3a7bfc; color:#fff; font-weight:600;">Guardar</button>
        </div>
      `;
      document.body.appendChild(noteModal);

      const textarea = noteModal.querySelector("textarea");
      const cancelNote = noteModal.querySelector("#cancelNote");
      const saveNote = noteModal.querySelector("#saveNote");

      cancelNote.onclick = () => noteModal.remove();

      saveNote.onclick = () => {
        const txt = textarea.value.trim();
        if (!txt) return toast("La nota está vacía", 1500);
        const prof = getUser();
        prof.notes ||= [];
        prof.notes.unshift({ id: genId(), text: txt, ts: Date.now() });
        LS.setItem(profileKey, JSON.stringify(prof));
        noteModal.remove();
        loadProfileInfo();
        toast("Nota agregada", 1600);
      };
    };
  }

  // Top buttons
  if (goFeed) goFeed.onclick = () => window.location.href = "../pages/publicaciones.html";
  if (logoutBtn) logoutBtn.onclick = () => { LS.removeItem("usuarioActivo"); window.location.href = "../pages/login.html"; };

  // Init (seguro)
  loadProfileInfo();
  renderProfilePosts();

})();
