// perfil.js — sincronización con API + fallback localStorage (versión extendida)
// Requisitos: config.js debe definir window.API_USUARIOS
(() => {
  const $ = sel => document.querySelector(sel);
  const LS = window.localStorage;

  /* ----------------------
     Utilities
  ---------------------- */
  const genId = () => "id_" + Math.random().toString(36).slice(2, 10);
  const escapeHtml = s => (s + "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const timeAgo = ts => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  /* ----------------------
     Toast helper
  ---------------------- */
  const toastEl = $("#toast");
  function toast(msg, t = 1800) {
    if (!toastEl) return console.warn("Toast element not found:", msg);
    toastEl.textContent = msg;
    toastEl.classList.remove("toast-show");
    void toastEl.offsetWidth;
    toastEl.classList.add("toast-show");
    setTimeout(() => toastEl.classList.remove("toast-show"), t);
  }

  /* ----------------------
     Active user detection (robusto)
     - lee localStorage 'usuarioActivo'
     - extrae id si existe (_id | id)
  ---------------------- */
  const rawActive = LS.getItem("usuarioActivo");
  let activeId = null;
  let activeName = "Invitado";
  let activeEmail = null;

  if (rawActive) {
    try {
      const parsed = JSON.parse(rawActive);
      // campos comunes
      activeId = parsed._id || parsed.id || null;
      activeName = parsed.nombre || parsed.name || parsed.username || parsed.nombreUsuario || activeName;
      activeEmail = parsed.email || parsed.correo || null;
    } catch {
      // si no es JSON, guardar como string
      activeName = rawActive;
    }
  }

  const profileKey = `blogme_profile_${activeName}`;

  /* ----------------------
     Asegurar perfil en localStorage (fallback)
  ---------------------- */
  if (!LS.getItem(profileKey)) {
    LS.setItem(profileKey, JSON.stringify({
      name: activeName,
      avatar: "/images/decoraciones/avatar-placeholder.png",
      bio: "Hola! Soy nuevo en BlogMe.",
      notes: [{ id: genId(), text: "¡Mi primera nota!", ts: Date.now() }]
    }));
  }

  const getLocalProfile = () => JSON.parse(LS.getItem(profileKey) || "{}");
  const setLocalProfile = (p) => LS.setItem(profileKey, JSON.stringify(p));

  /* ----------------------
     DOM (selectores; tolerantes a null)
  ---------------------- */
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

  const avatarUpload = $("#avatarUpload");
  const btnUpload = document.querySelector(".btn-upload");

  const profileNameInput = $("#profileNameInput");
  const profileBioInput = $("#profileBioInput");
  const saveProfile = $("#saveProfile");
  const addNoteBtnProfile = $("#addNoteBtnProfile");

  /* ----------------------
     API helpers
     - intenta GET /api/usuarios/:id
     - intenta PUT /api/usuarios/:id
     - si no hay id o la API falla, usa localStorage
  ---------------------- */
  const API_BASE = window.API_USUARIOS || null; // debe venir de config.js

  async function fetchProfileFromAPI() {
    if (!API_BASE || !activeId) return null;
    try {
      const resp = await fetch(`${API_BASE}/${activeId}`, { method: "GET", headers: { "Content-Type": "application/json" } });
      if (!resp.ok) {
        // no disponible o no encontrado -> retorna null para usar local
        console.warn("API profile GET failed", resp.status);
        return null;
      }
      const json = await resp.json();
      // el backend devuelve el perfil sin password (según tus rutas)
      // convertir campos a la estructura local que usamos:
      const profile = {
        name: json.nombre || json.name || json.username || activeName,
        avatar: json.avatar || "/images/decoraciones/avatar-placeholder.png",
        bio: json.descripcion || json.bio || "",
        notes: json.notes || getLocalProfile().notes || []
      };
      // guardar localmente (sin borrar notas si ya existían)
      setLocalProfile(Object.assign(getLocalProfile(), profile));
      return profile;
    } catch (err) {
      console.warn("fetchProfileFromAPI error:", err);
      return null;
    }
  }

  async function saveProfileToAPI(profile) {
    if (!API_BASE || !activeId) return { ok: false, reason: "no-id-or-api" };
    try {
      // Aquí enviamos un PUT. El backend de ejemplo espera PUT /api/usuarios/:id
      // Enviar JSON con los campos editables: nombre, avatar, descripcion
      const body = {
        nombre: profile.name,
        avatar: profile.avatar,
        descripcion: profile.bio
      };
      const resp = await fetch(`${API_BASE}/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const t = await resp.text().catch(()=>null);
        console.warn("saveProfileToAPI failed", resp.status, t);
        return { ok: false, status: resp.status, text: t };
      }
      const json = await resp.json().catch(()=>null);
      return { ok: true, data: json };
    } catch (err) {
      console.warn("saveProfileToAPI err", err);
      return { ok: false, reason: err.message };
    }
  }

  /* ----------------------
     UI rendering (seguro)
  ---------------------- */
  function loadProfileInfo(profileOverride = null) {
    const prof = profileOverride || getLocalProfile();

    if (profileName) profileName.textContent = prof.name || "Invitado";
    if (profileBio) profileBio.textContent = prof.bio || "Sin bio — ¡edítala!";
    if (profileAvatar) profileAvatar.src = prof.avatar || "/images/decoraciones/avatar-placeholder.png";

    if (topAvatar) topAvatar.src = prof.avatar || "/images/decoraciones/avatar-placeholder.png";
    if (topName) topName.textContent = prof.name || "Invitado";
    if (topNotesCount) topNotesCount.textContent = `${(prof.notes || []).length} notas`;
    if (notesCountEl) notesCountEl.textContent = (prof.notes || []).length;

    renderNotes(prof.notes || []);
  }

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

      const editBtn = div.querySelector(".edit-note");
      const delBtn = div.querySelector(".del-note");
      const textEl = div.querySelector(".note-text");

      if (editBtn) {
        editBtn.onclick = () => {
          if (textEl.isContentEditable) {
            // guardar
            textEl.contentEditable = false;
            const local = getLocalProfile();
            const idx = (local.notes || []).findIndex(x => x.id === n.id);
            if (idx !== -1) {
              local.notes[idx].text = textEl.textContent.trim();
              local.notes[idx].ts = Date.now();
              setLocalProfile(local);
              // opcional: aquí podríamos enviar notas a API si la soportas
              toast("Nota guardada");
              loadProfileInfo();
            }
            editBtn.textContent = "Editar";
          } else {
            textEl.contentEditable = true;
            textEl.focus();
            editBtn.textContent = "Guardar";
          }
        };
      }

      if (delBtn) {
        delBtn.onclick = () => {
          const local = getLocalProfile();
          local.notes = (local.notes || []).filter(x => x.id !== n.id);
          setLocalProfile(local);
          loadProfileInfo();
          toast("Nota eliminada");
        };
      }
    });
  }

  /* ----------------------
     Publicaciones del perfil (trae desde localStorage y, opcional, desde API si quieres)
     - Aquí solo mostramos lo que hay en localStorage (porque tu backend publica posts en otra ruta)
     - Si quieres que también traiga posts desde API podemos integrarlo.
  ---------------------- */
  function renderProfilePosts() {
    if (!profilePosts) return;
    const posts = JSON.parse(LS.getItem("blogme_posts") || "[]");
    const prof = getLocalProfile();
    const mine = posts.filter(p => p.author === (prof.name || activeName));
    profilePosts.innerHTML = "";
    if (postsCountEl) postsCountEl.textContent = mine.length;
    if (!mine.length) {
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
        </div>`;
      profilePosts.appendChild(card);
    });
  }

  /* ----------------------
     Handlers: modal edición perfil
  ---------------------- */
  const hideProfileModal = () => {
    if (profileModal) {
      profileModal.classList.add("hidden");
      profileModal.classList.remove("show");
    }
  };

  if (editProfileBtn) {
    editProfileBtn.onclick = () => {
      const prof = getLocalProfile();
      if (profileNameInput) profileNameInput.value = prof.name || "";
      if (profileBioInput) profileBioInput.value = prof.bio || "";
      if (profileModal) {
        profileModal.classList.remove("hidden");
        profileModal.classList.add("show");
      }
    };
  }

  if (closeProfile) closeProfile.onclick = hideProfileModal;
  if (cancelProfile) cancelProfile.onclick = hideProfileModal;

  if (saveProfile) {
    saveProfile.onclick = async () => {
      const prof = getLocalProfile();
      const newName = (profileNameInput?.value || "").trim();
      const newBio = (profileBioInput?.value || "").trim();

      if (newName) prof.name = newName;
      prof.bio = newBio || prof.bio;

      // Guardamos localmente primero (optimista)
      setLocalProfile(prof);
      loadProfileInfo();
      renderProfilePosts();
      toast("Guardando perfil...");

      // Intentamos guardar en API si tenemos id
      if (activeId && API_BASE) {
        const res = await saveProfileToAPI({
          name: prof.name,
          avatar: prof.avatar,
          bio: prof.bio
        });
        if (res.ok) {
          toast("Perfil sincronizado con servidor");
          // si API devolvió algo, actualizar local con respuesta
          if (res.data && res.data.usuario) {
            // si tu backend responde con usuario actualizado, puedes mapearlo.
            const remote = res.data.usuario;
            const merged = Object.assign(prof, {
              name: remote.nombre || remote.name || prof.name,
              avatar: remote.avatar || prof.avatar,
              bio: remote.descripcion || remote.bio
            });
            setLocalProfile(merged);
            loadProfileInfo();
          }
        } else {
          toast("Perfil guardado localmente (no se pudo sincronizar)");
        }
      } else {
        toast("Perfil guardado localmente");
      }
      hideProfileModal();
    };
  }

  /* ----------------------
     Avatar upload: guardamos local y tratamos de enviar al API también
     - Enviamos como dataURL en el PUT (si tu backend lo acepta)
     - Si prefieres subir la imagen a Cloudinary/S3 y guardar URL, adapta aquí.
  ---------------------- */
  if (btnUpload && avatarUpload) {
    btnUpload.onclick = () => avatarUpload.click();
    avatarUpload.onchange = async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const maxMB = 3;
      if (f.size > maxMB * 1024 * 1024) {
        return toast(`Imagen demasiado grande (máx ${maxMB}MB)`);
      }
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const prof = getLocalProfile();
        prof.avatar = dataUrl;
        setLocalProfile(prof);
        loadProfileInfo();
        toast("Avatar actualizado localmente");

        // intentar sincronizar avatar con API
        if (activeId && API_BASE) {
          const res = await saveProfileToAPI({
            name: prof.name,
            avatar: prof.avatar,
            bio: prof.bio
          });
          if (res.ok) {
            toast("Avatar sincronizado con servidor");
          } else {
            toast("Avatar guardado localmente (no se pudo subir)");
          }
        }
      };
      reader.readAsDataURL(f);
      avatarUpload.value = "";
    };
  }

  /* ----------------------
     Notas: añadir nota simple
  ---------------------- */
  if (addNoteBtnProfile) {
    addNoteBtnProfile.onclick = () => {
      const modal = document.createElement("div");
      modal.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;background:#fff;padding:14px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.2);";
      modal.innerHTML = `
        <textarea placeholder="Escribe tu nota..." style="width:300px;height:120px;padding:8px;border-radius:8px;border:1px solid #ddd;"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
          <button id="ntCancel" style="padding:8px 12px;border-radius:8px;background:#ccc;border:none;">Cancelar</button>
          <button id="ntSave" style="padding:8px 12px;border-radius:8px;background:#3a7bfc;color:#fff;border:none;">Guardar</button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector("#ntCancel").onclick = () => modal.remove();
      modal.querySelector("#ntSave").onclick = () => {
        const txt = modal.querySelector("textarea").value.trim();
        if (!txt) return toast("La nota está vacía");
        const prof = getLocalProfile();
        prof.notes ||= [];
        prof.notes.unshift({ id: genId(), text: txt, ts: Date.now() });
        setLocalProfile(prof);
        modal.remove();
        loadProfileInfo();
        toast("Nota añadida");
      };
    };
  }

  /* ----------------------
     Botones superiores
  ---------------------- */
  if (goFeed) goFeed.onclick = () => window.location.href = "../pages/publicaciones.html";
  if (logoutBtn) logoutBtn.onclick = () => { LS.removeItem("usuarioActivo"); window.location.href = "../pages/login.html"; };

  /* ----------------------
     Inicialización: intenta sincronizar desde API (GET) si es posible
     - Si la API responde, usamos la versión remota y la guardamos local
     - Si no, usamos local
  ---------------------- */
  (async function init() {
    // primero cargamos local para que la UI no quede vacía
    loadProfileInfo();

    // intentar sincronizar desde API si hay ID y API definida
    if (activeId && API_BASE) {
      const remote = await fetchProfileFromAPI();
      if (remote) {
        // remote ya fue guardado en local por fetchProfileFromAPI
        loadProfileInfo(remote);
        toast("Perfil sincronizado con servidor");
      } else {
        // no alcanzó API -> quedarse con local
        toast("Usando perfil local");
      }
    } else {
      // sin id o sin API -> quedamos en local
      // si tienes email-only workflows, podríamos intentar otra ruta, pero depende del backend
      // Por ahora: usar local
      // (no toast obligatorio)
    }

    renderProfilePosts();
  })();

})();
