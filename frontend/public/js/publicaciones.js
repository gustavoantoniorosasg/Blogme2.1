/* publicaciones.js — Versión corregida */
(() => {
  'use strict';

  /* =======================
       CONFIG / SELECTORS
  ======================= */
  const API_BASE = 'https://blogme2-1.onrender.com';
<<<<<<< HEAD
  // Preferir la configuración global si existe (config.js)
  const API_PUBLICACIONES = (window && window.API_PUBLICACIONES) ? window.API_PUBLICACIONES : `${API_BASE}/api/publicaciones`;
=======
  const API_PUBLICACIONES = `${API_BASE}/api/publicaciones`;

>>>>>>> 87e1714e (actualizacion)
  const POSTS_KEY = 'blogme_posts';
  const SAVED_KEY = 'blogme_saved';
  const PROFILE_PREFIX = 'blogme_profile_';
  const PAGE_SIZE = 8;
  const DEFAULT_AVATAR = '../images/avatar-placeholder.png';

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const feedEl = $('#feed');
  const loaderEl = $('#infiniteLoader');
  const editorEl = $('#editor');
  const btnPublish = $('#btnPublish');
  const postCategoryEl = $('#postCategory');
<<<<<<< HEAD

=======
>>>>>>> 87e1714e (actualizacion)
  const inputFileGlobal = $('#newImg');

  /* =======================
          STATE
  ======================= */
  let currentUser = { id: 'anon', name: 'Invitado', avatar: DEFAULT_AVATAR };
  let posts = [];
  let saved = [];
  let offset = 0;
  let loading = false;
  let pendingImageFile = null;

  /* =======================
            UTIL
  ======================= */
  const escapeHtml = (s = '') =>
    (s + '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));

  function genId(prefix = 'id') {
    return prefix + '_' + Math.random().toString(36).slice(2, 10);
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

<<<<<<< HEAD
  // fallback showToast si no existe globalmente (mantener simple)
  if (typeof window.showToast !== 'function') {
    window.showToast = function(msg, type='info'){
      // no interfiere con tu UI: solo log si no hay implementación
      console.log(`[toast:${type}] ${msg}`);
    };
  }

  // helper para convertir File -> dataURL
  async function fileToDataURL(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  /* =======================
     LOAD CURRENT USER
  ======================= */
  function loadCurrentUser(){
    const raw = localStorage.getItem('usuarioActivo');
    if (!raw) { currentUser = { id:'anon', name:'Invitado', avatar: DEFAULT_AVATAR }; return; }
    try {
      const uobj = JSON.parse(raw);
      const id = uobj.id || uobj._id || uobj.username || uobj.nombre || JSON.stringify(uobj);
      const name = uobj.username || uobj.nombre || uobj.name || id;
      const avatar = uobj.avatar || uobj.authorAvatar || DEFAULT_AVATAR;
      currentUser = { id, name, avatar };
    } catch(e) {
      const id = raw;
      const profile = storageGet(PROFILE_PREFIX + id, null);
      if (profile) currentUser = { id, name: profile.name || id, avatar: profile.avatar || DEFAULT_AVATAR };
      else currentUser = { id, name: id, avatar: DEFAULT_AVATAR };
=======
  function storageGet(key, fallback = null) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function storageSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('storage fail', e);
>>>>>>> 87e1714e (actualizacion)
    }
  }

  /* =======================
<<<<<<< HEAD
     NETWORK HELPERS
=======
      LOAD CURRENT USER
>>>>>>> 87e1714e (actualizacion)
  ======================= */
  function loadCurrentUser() {
    const raw = localStorage.getItem('usuarioActivo');
    if (!raw) return;

    try {
      const u = JSON.parse(raw);
      currentUser = {
        id: u.id || u._id || u.username || u.nombre,
        name: u.username || u.nombre || 'Usuario',
        avatar: u.avatar || DEFAULT_AVATAR
      };
    } catch {
      currentUser = { id: raw, name: raw, avatar: DEFAULT_AVATAR };
    }
  }

  /* =======================
       NETWORK HELPERS
  ======================= */
  async function fetchWithTimeout(url, opts = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }

  /* =======================
<<<<<<< HEAD
     API FUNCTIONS
=======
        API FUNCTIONS
>>>>>>> 87e1714e (actualizacion)
  ======================= */
  async function apiFetchPosts() {
    try {
<<<<<<< HEAD
      const r = await fetchWithTimeout(API_PUBLICACIONES, {}, 7000);
      if (!r.ok) throw new Error('no-ok');
=======
      const r = await fetchWithTimeout(API_PUBLICACIONES);
      if (!r.ok) throw 0;
>>>>>>> 87e1714e (actualizacion)
      return await r.json();
    } catch {
      return null;
    }
  }

<<<<<<< HEAD
  async function apiCreatePost(payload, file = null){
    try {
      if (file) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k,v]) => fd.append(k, typeof v === "object" ? JSON.stringify(v) : v));
        fd.append("image", file);
        const r = await fetchWithTimeout(API_PUBLICACIONES, { method:"POST", body: fd }, 20000);
        if (!r.ok) throw new Error("no-ok");
        return await r.json();
      } else {
        const r = await fetchWithTimeout(API_PUBLICACIONES, { 
          method:"POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }, 10000);
        if (!r.ok) throw new Error("no-ok");
        return await r.json();
      }
    } catch(e){
      console.warn("apiCreatePost failed", e);
      return null;
    }
  }

  async function apiSendReaction(postId, emoji){
    try {
      const r = await fetchWithTimeout(`${API_PUBLICACIONES}/${postId}/reaction`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ reaction: emoji, user: currentUser.id })
      }, 7000);
      if (!r.ok) throw new Error('no-ok');
      return await r.json();
    } catch(e){
      console.warn('apiSendReaction failed', e);
=======
  async function apiCreatePost(payload, file) {
    try {
      if (file) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(payload)) {
          fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
        }
        fd.append('image', file);

        const r = await fetchWithTimeout(
          API_PUBLICACIONES,
          { method: 'POST', body: fd },
          20000
        );
        if (!r.ok) throw 0;
        return await r.json();
      }

      const r = await fetchWithTimeout(
        API_PUBLICACIONES,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        },
        12000
      );
      if (!r.ok) throw 0;
      return await r.json();
    } catch {
>>>>>>> 87e1714e (actualizacion)
      return null;
    }
  }

  async function apiSendReaction(postId, emoji) {
    try {
<<<<<<< HEAD
      const r = await fetchWithTimeout(`${API_PUBLICACIONES}/${postId}`, {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      }, 8000);
      if (!r.ok) throw new Error('no-ok');
      return await r.json();
    } catch(e){
      console.warn('apiUpdatePost failed', e);
=======
      const r = await fetchWithTimeout(
        `${API_PUBLICACIONES}/${postId}/reaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reaction: emoji, user: currentUser.id })
        },
        7000
      );
      if (!r.ok) throw 0;
      return await r.json();
    } catch {
>>>>>>> 87e1714e (actualizacion)
      return null;
    }
  }

  async function apiUpdatePost(id, payload) {
    try {
<<<<<<< HEAD
      const r = await fetchWithTimeout(`${API_PUBLICACIONES}/${postId}`, { method:'DELETE' }, 7000);
      if (!r.ok) throw new Error('no-ok');
      return true;
    } catch(e){
      console.warn('apiDeletePost failed', e);
      return null;
    }
  }

  async function apiUploadImageForPost(postId, file){
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await fetchWithTimeout(`${API_PUBLICACIONES}/${postId}/image`, { method:'POST', body: fd }, 15000);
      if (!r.ok) throw new Error('no-ok');
      return await r.json();
    } catch(e){
      console.warn('apiUploadImageForPost failed', e);
=======
      const r = await fetchWithTimeout(
        `${API_PUBLICACIONES}/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        },
        8000
      );
      if (!r.ok) throw 0;
      return await r.json();
    } catch {
      return null;
    }
  }

  async function apiDeletePost(id) {
    try {
      const r = await fetchWithTimeout(
        `${API_PUBLICACIONES}/${id}`,
        { method: 'DELETE' },
        7000
      );
      return r.ok;
    } catch {
>>>>>>> 87e1714e (actualizacion)
      return null;
    }
  }

  /* =======================
<<<<<<< HEAD
     LOCAL STORAGE HELPERS
  ======================= */
  function saveLocalPosts(){ storageSet(POSTS_KEY, posts); }
  function loadLocalPosts(){ return storageGet(POSTS_KEY, []) || []; }
  function loadSaved(){ saved = storageGet(SAVED_KEY, []) || []; }

  /* =======================
     RENDER / POSTS
  ======================= */
  function buildReactionsHTML(post){
    const emojis = ["❤","😂","😮","😢","😡"];
    const uid = currentUser.id || 'anon';
    const userChoice = (post.userReactions && post.userReactions[uid]) || null;

    return `<div class="post-reactions" data-post="${post.id}">
      ${emojis.map(e => {
        const count = (post.reactions && post.reactions[e]) ? post.reactions[e] : 0;
        const active = userChoice === e ? 'active' : '';
        return `<button class="react-btn ${active}" data-emoji="${encodeURIComponent(e)}" data-post="${post.id}" aria-pressed="${active? 'true':'false'}">
                  <span class="emoji">${e}</span>
                  <span class="count">${count}</span>
                </button>`;
      }).join('')}
    </div>`;
  }

  function renderPostCard(post){
    const imgsHtml = (post.imgs && post.imgs.length)
      ? `<div class="post-media">
           ${post.imgs.map(src => `<img src="${escapeHtml(src)}" alt="media">`).join('')}
         </div>`
      : '';

    const authorAvatar = post.authorAvatar || DEFAULT_AVATAR;
=======
      LOCAL STORAGE
  ======================= */
  function saveLocalPosts() {
    storageSet(POSTS_KEY, posts);
  }

  function loadLocalPosts() {
    return storageGet(POSTS_KEY, []) || [];
  }

  /* =======================
      RENDER POSTS
  ======================= */
  function buildReactionsHTML(post) {
    const emojis = ['❤', '😂', '😮', '😢', '😡'];
    const uid = currentUser.id;
    const userChoice = post.userReactions?.[uid] || null;
>>>>>>> 87e1714e (actualizacion)

    return `
      <div class="post-reactions" data-post="${post.id}">
        ${emojis
          .map(e => {
            const count = post.reactions?.[e] || 0;
            const active = userChoice === e ? 'active' : '';
            return `
              <button class="react-btn ${active}" data-emoji="${encodeURIComponent(
              e
            )}" data-post="${post.id}">
                <span class="emoji">${e}</span>
                <span class="count">${count}</span>
              </button>`;
          })
          .join('')}
      </div>`;
  }

  function renderPostCard(post) {
    const imgs = post.imgs?.length
      ? `<div class="post-media">
           ${post.imgs
             .map(src => `<img src="${escapeHtml(src)}" alt="img">`)
             .join('')}
         </div>`
      : '';

    return `
      <article class="post glass-card" data-id="${post.id}">
        <div class="post-header">
          <img src="${escapeHtml(
            post.authorAvatar || DEFAULT_AVATAR
          )}" class="post-avatar">
          <div class="meta">
            <strong>${escapeHtml(post.author)}</strong>
            <small>${timeAgo(post.ts)} · ${post.category || ''}</small>
          </div>

          <div class="post-options">
            <button class="btn-options">⋯</button>
            <div class="post-menu" style="display:none">
              <button data-action="edit">Editar</button>
              <button data-action="delete">Eliminar</button>
              <button data-action="hide">${post.hidden ? 'Mostrar' : 'Ocultar'}</button>
              <button data-action="report">Reportar</button>
            </div>
          </div>
        </div>

        <div class="post-content">${post.content}</div>
        ${imgs}

        <div class="post-actions">
          <div class="left">
            ${buildReactionsHTML(post)}
<<<<<<< HEAD
            <button class="action-btn comment" data-id="${post.id}" title="Comentarios">
              💬 <span class="count">${post.commentsCount || 0}</span>
            </button>
            <button class="action-btn save" data-id="${post.id}" title="Guardar">🔖</button>
=======
            <button class="action-btn comment" data-id="${post.id}">
              💬 <span>${post.commentsCount || 0}</span>
            </button>
            <button class="action-btn save" data-id="${post.id}">🔖</button>
>>>>>>> 87e1714e (actualizacion)
          </div>

          <div class="right">
            <button class="action-btn readmode" data-id="${post.id}">📖</button>
            <button class="action-btn share" data-id="${post.id}">🔁</button>
          </div>
        </div>
      </article>
    `;
  }

<<<<<<< HEAD
  function renderPage(reset=false){
=======
  function renderPage(reset = false) {
>>>>>>> 87e1714e (actualizacion)
    if (!feedEl) return;

    if (reset) {
      feedEl.innerHTML = '';
      offset = 0;
    }

    const slice = posts.slice(offset, offset + PAGE_SIZE);
    slice.forEach(p => feedEl.insertAdjacentHTML('beforeend', renderPostCard(p)));
    offset += PAGE_SIZE;

    loaderEl.style.display = offset < posts.length ? 'block' : 'none';
    attachListenersToVisible();
<<<<<<< HEAD
    if (loaderEl && loaderEl.style) loaderEl.style.display = offset < posts.length ? 'block' : 'none';
  }

  function patchReactionsUIForPost(postId){
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const article = feedEl && feedEl.querySelector ? feedEl.querySelector(`.post[data-id="${postId}"]`) : null;
    if (!article) return;
    const oldRow = article.querySelector('.post-reactions');
    const newRow = document.createElement('div');
    newRow.innerHTML = buildReactionsHTML(post);
    if (oldRow) oldRow.outerHTML = newRow.innerHTML;
    else {
      const left = article.querySelector('.post-actions .left');
      if (left) left.insertAdjacentHTML('afterbegin', buildReactionsHTML(post));
    }
    attachReactionButtons(article);
  }

  /* =======================
     ATTACH LISTENERS
  ======================= */
  function attachReactionButtons(article){
    article.querySelectorAll('.react-btn').forEach(btn => {
      btn.onclick = async (e) => {
        e.preventDefault();
        const postId = btn.dataset.post;
        const emoji = decodeURIComponent(btn.dataset.emoji);
        toggleReaction(postId, emoji);
      };
    });
  }

  function attachCommentButtons(article){
    article.querySelectorAll('.comment').forEach(btn => {
      btn.onclick = () => {
        const postId = btn.dataset.id;
        if (typeof window.openComments === 'function') window.openComments(postId);
        else showToast('Módulo de comentarios no disponible', 'warn');
      };
    });
  }

  function attachSaveButtons(article){
    article.querySelectorAll('.save').forEach(btn => {
      btn.onclick = () => toggleSave(btn.dataset.id);
    });
  }

  function attachPostMenu(article){
    const btnOpt = article.querySelector('.btn-options');
    if (!btnOpt) return;
    const menu = article.querySelector('.post-menu');
    btnOpt.onclick = (ev) => {
      ev.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    };
    menu.querySelectorAll('button').forEach(b => {
      b.onclick = (ev) => {
        const action = b.getAttribute('data-action') || b.textContent.trim().toLowerCase();
        const postId = article.dataset.id;
        if (action.includes('edit')) openEdit(postId);
        else if (action.includes('delete')) openConfirmDelete(postId);
        else if (action.includes('hide')) toggleHidePost(postId);
        else if (action.includes('report')) openConfirmReport(postId);
        menu.style.display = 'none';
      };
    });
  }

  function attachReadButtons(article){
    article.querySelectorAll('.readmode').forEach(btn => {
      btn.onclick = () => openReadMode(btn.dataset.id);
    });
  }

  function attachShareButtons(article){
    article.querySelectorAll('.share').forEach(btn => {
      btn.onclick = () => sharePost(btn.dataset.id);
    });
  }

  function attachListenersToVisible(){
=======
  }

  /* =======================
        ATTACH LISTENERS
  ======================= */
  function attachListenersToVisible() {
>>>>>>> 87e1714e (actualizacion)
    $$('.post').forEach(article => {
      attachReactionButtons(article);
      attachCommentButtons(article);
      attachSaveButtons(article);
      attachPostMenu(article);
      attachReadButtons(article);
      attachShareButtons(article);
    });
  }

  function attachReactionButtons(article) {
    article.querySelectorAll('.react-btn').forEach(btn => {
      btn.onclick = e => {
        e.preventDefault();
        toggleReaction(btn.dataset.post, decodeURIComponent(btn.dataset.emoji));
      };
    });
  }

  function attachCommentButtons(article) {
    article.querySelectorAll('.comment').forEach(btn => {
      btn.onclick = () => {
        if (window.openComments) window.openComments(btn.dataset.id);
      };
    });
  }

  function attachSaveButtons(article) {
    article.querySelectorAll('.save').forEach(btn => {
      btn.onclick = () => toggleSave(btn.dataset.id);
    });
  }

  function attachPostMenu(article) {
    const btn = article.querySelector('.btn-options');
    const menu = article.querySelector('.post-menu');

    if (!btn || !menu) return;

    btn.onclick = e => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    };

    menu.querySelectorAll('button').forEach(b => {
      b.onclick = e => {
        const action = b.dataset.action;
        const id = article.dataset.id;

        if (action === 'edit') openEdit(id);
        if (action === 'delete') openConfirmDelete(id);
        if (action === 'hide') toggleHidePost(id);
        if (action === 'report') openConfirmReport(id);

        menu.style.display = 'none';
      };
    });
  }

  function attachReadButtons(article) {
    article.querySelectorAll('.readmode').forEach(btn => {
      btn.onclick = () => openReadMode(btn.dataset.id);
    });
  }

  function attachShareButtons(article) {
    article.querySelectorAll('.share').forEach(btn => {
      btn.onclick = () => sharePost(btn.dataset.id);
    });
  }

  /* =======================
<<<<<<< HEAD
     REACTION LOGIC
=======
       REACTION LOGIC
>>>>>>> 87e1714e (actualizacion)
  ======================= */
  async function toggleReaction(postId, emoji) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    post.reactions ||= {};
    post.userReactions ||= {};

    const uid = currentUser.id;
    const prev = post.userReactions[uid] || null;

<<<<<<< HEAD
    post.reactions[emoji] = post.reactions[emoji] || 0;
    if (prev) post.reactions[prev] = post.reactions[prev] || 0;
=======
    // remove previous
    if (prev && post.reactions[prev]) post.reactions[prev]--;
>>>>>>> 87e1714e (actualizacion)

    // apply new
    if (prev === emoji) {
<<<<<<< HEAD
      post.reactions[emoji] = Math.max(0, post.reactions[emoji] - 1);
      delete post.userReactions[uid];
    } else if (!prev) {
      post.reactions[emoji] += 1;
      post.userReactions[uid] = emoji;
    } else {
      post.reactions[prev] = Math.max(0, post.reactions[prev] - 1);
      post.reactions[emoji] += 1;
      post.userReactions[uid] = emoji;
    }

    patchReactionsUIForPost(postId);
    saveLocalPosts();
    const res = await apiSendReaction(postId, emoji).catch(()=>null);
    if (res && res.reactions) {
=======
      delete post.userReactions[uid];
    } else {
      post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
      post.userReactions[uid] = emoji;
    }

    saveLocalPosts();
    renderPage(true);

    const res = await apiSendReaction(postId, emoji);
    if (res?.reactions) {
>>>>>>> 87e1714e (actualizacion)
      post.reactions = res.reactions;
      post.userReactions = res.userReactions || {};
      saveLocalPosts();
      renderPage(true);
    }
  }

  /* =======================
<<<<<<< HEAD
     SAVE POSTS
=======
        SAVE POSTS
>>>>>>> 87e1714e (actualizacion)
  ======================= */
  function toggleSave(id) {
    const idx = saved.indexOf(id);
    if (idx === -1) saved.unshift(id);
    else saved.splice(idx, 1);

    storageSet(SAVED_KEY, saved);
<<<<<<< HEAD
    showToast(idx === -1 ? 'Guardado' : 'Quitado de guardados', 'success');
    const art = feedEl && feedEl.querySelector ? feedEl.querySelector(`.post[data-id="${postId}"]`) : null;
    if (art) {
      const btn = art.querySelector('.save');
      if (btn) btn.classList.toggle('saved', idx === -1);
    }
=======
>>>>>>> 87e1714e (actualizacion)
  }

  /* =======================
         CREATE / EDIT
  ======================= */
  function sanitizeHtml(h) {
    return h;
  }

  function stripHtml(h) {
    return h.replace(/<[^>]+>/g, '');
  }

  async function publish() {
    const html = editorEl.innerHTML;
    if (!stripHtml(html).trim()) return;

    const payload = {
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatar: currentUser.avatar,
      content: sanitizeHtml(html),
      category: postCategoryEl?.value || '',
      ts: Date.now()
    };

<<<<<<< HEAD
    let backendResult = null;
    try { backendResult = await apiCreatePost(payload, pendingImageFile); } catch(e){ backendResult=null; }

    if (backendResult && (backendResult.publicacion || backendResult.id || backendResult._id)) {
      const serverPost = backendResult.publicacion || backendResult;
      const p = {
        id: serverPost.id || serverPost._id || genId('post'),
        author: serverPost.author || payload.author,
        authorAvatar: serverPost.authorAvatar || payload.authorAvatar,
        content: serverPost.content || payload.content,
        imgs: serverPost.imgs || (serverPost.img ? [serverPost.img] : []) || [],
        ts: serverPost.ts ? (typeof serverPost.ts === 'number' ? serverPost.ts : new Date(serverPost.ts).getTime()) : Date.now(),
        category: serverPost.category || payload.category,
        commentsCount: serverPost.commentsCount || 0,
        reactions: serverPost.reactions || {},
        userReactions: serverPost.userReactions || {}
      };
      posts.unshift(p);
      saveLocalPosts();
      renderPage(true);
      showToast('Publicado ✅', 'success');
      if (editorEl) editorEl.innerHTML = '';
      pendingImageFile = null;
      return;
    }

    // fallback offline
    const localPost = {
      id: genId('post'),
      author: payload.author,
      authorAvatar: payload.authorAvatar,
      content: payload.content,
      imgs: pendingImageFile ? [URL.createObjectURL(pendingImageFile)] : [],
      ts: payload.ts,
      category: payload.category,
      commentsCount: 0,
      reactions: {},
      userReactions: {}
    };
    posts.unshift(localPost);
    saveLocalPosts();
    renderPage(true);
    showToast('Publicado en local ✅', 'info');
    if (editorEl) editorEl.innerHTML = '';
    pendingImageFile = null;
  }

  function openEdit(postId){
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (editorEl) editorEl.innerHTML = post.content;
    btnPublish.onclick = async () => {
      post.content = sanitizeHtml(editorEl.innerHTML || '');
      await apiUpdatePost(postId, { content: post.content });
      saveLocalPosts();
      renderPage(true);
      showToast('Editado ✅', 'success');
=======
    const backend = await apiCreatePost(payload, pendingImageFile);

    let post;

    if (backend && (backend.id || backend._id || backend.publicacion)) {
      const p = backend.publicacion || backend;
      post = {
        id: p.id || p._id,
        author: p.author,
        authorAvatar: p.authorAvatar,
        content: p.content,
        imgs: p.imgs || [],
        category: p.category,
        ts: typeof p.ts === 'number' ? p.ts : new Date(p.ts).getTime(),
        reactions: p.reactions || {},
        userReactions: p.userReactions || {},
        commentsCount: p.commentsCount || 0
      };
    } else {
      post = {
        id: genId('post'),
        author: payload.author,
        authorAvatar: payload.authorAvatar,
        content: payload.content,
        imgs: pendingImageFile ? [URL.createObjectURL(pendingImageFile)] : [],
        ts: payload.ts,
        category: payload.category,
        reactions: {},
        userReactions: {},
        commentsCount: 0
      };
    }

    posts.unshift(post);
    saveLocalPosts();
    renderPage(true);

    editorEl.innerHTML = '';
    pendingImageFile = null;
  }

  function openEdit(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    editorEl.innerHTML = post.content;

    btnPublish.onclick = async () => {
      post.content = sanitizeHtml(editorEl.innerHTML);
      await apiUpdatePost(id, { content: post.content });
      saveLocalPosts();
      renderPage(true);
>>>>>>> 87e1714e (actualizacion)
      btnPublish.onclick = publish;
    };
  }

<<<<<<< HEAD
  function openConfirmDelete(postId){
    if (!confirm('¿Eliminar esta publicación?')) return;
    apiDeletePost(postId).catch(()=>null);
    posts = posts.filter(p => p.id !== postId);
    saveLocalPosts();
    renderPage(true);
    showToast('Eliminado ✅', 'info');
  }

  function toggleHidePost(postId){
    const post = posts.find(p=>p.id===postId);
    if (!post) return;
    post.hidden = !post.hidden;
    saveLocalPosts();
    renderPage(true);
    showToast(post.hidden ? 'Oculto' : 'Visible', 'info');
  }

  function openConfirmReport(postId){
    const reason = prompt('¿Por qué reportas esta publicación? (opcional)');
    if (!reason) { showToast('Reporte cancelado', 'info'); return; }
    showToast('Reporte enviado', 'success');
    // enviar al backend si aplica
  }

  /* =======================
     HELPER FUNCTIONS
  ======================= */
  function stripHtml(html){ return (html || '').replace(/<[^>]+>/g,''); }
  function sanitizeHtml(html){ return html; /* podrías usar DOMPurify si quieres */ }

  /* =======================
     IMAGE UPLOAD
  ======================= */
  inputFileGlobal?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    pendingImageFile = f;
    const preview = $('#imgPreview');
    if (preview) preview.src = URL.createObjectURL(f);
  });

  /* =======================
     INIT / BOOT
  ======================= */
  async function boot(){
=======
  function openConfirmDelete(id) {
    if (!confirm('¿Eliminar publicación?')) return;
    apiDeletePost(id);

    posts = posts.filter(p => p.id !== id);
    saveLocalPosts();
    renderPage(true);
  }

  function toggleHidePost(id) {
    const p = posts.find(x => x.id === id);
    if (!p) return;

    p.hidden = !p.hidden;
    saveLocalPosts();
    renderPage(true);
  }

  function openConfirmReport() {
    alert('Reporte enviado');
  }

  /* =======================
           INIT
  ======================= */
  async function boot() {
>>>>>>> 87e1714e (actualizacion)
    loadCurrentUser();
    saved = storageGet(SAVED_KEY, []);
    posts = loadLocalPosts();

    const remote = await apiFetchPosts();
    if (Array.isArray(remote)) {
      posts = remote.map(p => ({
        id: p.id || p._id || genId('post'),
        author: p.author || 'Anon',
        authorAvatar: p.authorAvatar || DEFAULT_AVATAR,
        content: p.content || '',
        imgs: p.imgs || [],
        ts: p.ts ? new Date(p.ts).getTime() : Date.now(),
        category: p.category || '',
        commentsCount: p.commentsCount || 0,
        reactions: p.reactions || {},
        userReactions: p.userReactions || {},
        hidden: p.hidden || false
      }));
      saveLocalPosts();
    }

    renderPage(true);

    if (loaderEl) {
      new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting)) renderPage();
        },
        { threshold: 0.5 }
      ).observe(loaderEl);
    }

    if (btnPublish) btnPublish.onclick = publish;

    if (inputFileGlobal) {
      inputFileGlobal.onchange = e => {
        pendingImageFile = e.target.files[0] || null;
      };
    }

    document.addEventListener('click', e => {
      $$('.post-menu').forEach(m => {
        if (!m.contains(e.target) && !m.previousElementSibling.contains(e.target)) {
          m.style.display = 'none';
        }
      });
    });
  }

  boot();

<<<<<<< HEAD
  /* =======================
     EXPORT DEBUG HELPERS
  ======================= */
  window.blogmePosts = {
    getAll: () => posts,
    save: () => saveLocalPosts(),
    toggleReaction: (id, emoji) => toggleReaction(id, emoji)
  };

  /* =======================
     Duplicate helper defs (compat)
  ======================= */
  function storageSetLocal(key,val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  function storageGetLocal(key, fallback=null){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(e){return fallback;} }
  // keep compatibility with older calls in this file
  function saveLocalPosts(){ storageSetLocal(POSTS_KEY, posts); }
  function loadLocalPosts(){ return storageGetLocal(POSTS_KEY, []) || []; }
  function loadSaved(){ saved = storageGetLocal(SAVED_KEY, []) || []; }

})();





// ===============================
// VARIABLES Y MODALES
// ===============================
const linkModal = document.getElementById("linkModal");
const linkInput = document.getElementById("linkInput");
const linkOk = document.getElementById("linkOk");
const linkCancel = document.getElementById("linkCancel");

const imageModal = document.getElementById("modalImagen");
const imageInput = document.getElementById("inputImagen");
const imageOk = document.getElementById("btnInsertarImagen");

let savedSelection = null;

// ===============================
// GUARDAR / RESTAURAR SELECCIÓN
// ===============================
function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedSelection = sel.getRangeAt(0);
  }
}

function restoreSelection() {
  const sel = window.getSelection();
  if (!savedSelection) return;
  sel.removeAllRanges();
  sel.addRange(savedSelection);
}

// ===============================
// ABRIR / CERRAR MODALES
// ===============================
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

// ===============================
// ACTIVAR BOTONES DEL EDITOR
// ===============================
document.querySelectorAll(".editor-toolbar button").forEach(btn => {
  btn.addEventListener("click", () => {
    const cmd = btn.dataset.cmd;

    if (cmd === "bold") document.execCommand("bold");
    if (cmd === "italic") document.execCommand("italic");
    if (cmd === "underline") document.execCommand("underline");

    // ABRIR MODAL DE ENLACE
    if (cmd === "link") {
      saveSelection();
      abrirModal("linkModal");
      if (linkInput) linkInput.focus();
    }

    // ABRIR MODAL DE IMAGEN
    if (cmd === "image") {
      saveSelection();
      abrirModal("modalImagen");
      if (imageInput) imageInput.focus();
    }
  });
});

// ===============================
// INSERTAR LINK
// ===============================
if (linkOk) linkOk.addEventListener("click", () => {
  const url = linkInput?.value?.trim();
  if (!url) return;

  restoreSelection();
  document.execCommand("createLink", false, url);

  cerrarModal("linkModal");
  if (linkInput) linkInput.value = "";
});

if (linkCancel) linkCancel.addEventListener("click", () => {
  cerrarModal("linkModal");
  if (linkInput) linkInput.value = "";
});

// ===============================
// INSERTAR IMAGEN
// ===============================
if (imageOk) imageOk.addEventListener("click", () => {
  const url = imageInput?.value?.trim();
  if (!url) return;

  restoreSelection();
  document.execCommand("insertImage", false, url);

  cerrarModal("modalImagen");
  if (imageInput) imageInput.value = "";
});



const darkBtn = document.getElementById('darkToggle');
const icon = darkBtn ? darkBtn.querySelector('i') : null;

// Aplicar preferencia guardada
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  if (icon) icon.classList.replace('fa-moon', 'fa-sun');
}

if (darkBtn) darkBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');

  // Cambiar ícono (protegido)
  if (icon) icon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');

  // Guardar preferencia
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Toast
  showToast(`Modo ${isDark ? 'Oscuro' : 'Claro'} activado`, 'info');
});
=======
  window.blogmeDebug = { posts };
})();
>>>>>>> 87e1714e (actualizacion)
