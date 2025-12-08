/* publicaciones.js — Versión corregida */
(() => {
  'use strict';

  /* =======================
       CONFIG / SELECTORS
  ======================= */
  const API_BASE = 'https://blogme2-1.onrender.com';
  const API_PUBLICACIONES = `${API_BASE}/api/publicaciones`;

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
    }
  }

  /* =======================
      LOAD CURRENT USER
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
        API FUNCTIONS
  ======================= */
  async function apiFetchPosts() {
    try {
      const r = await fetchWithTimeout(API_PUBLICACIONES);
      if (!r.ok) throw 0;
      return await r.json();
    } catch {
      return null;
    }
  }

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
      return null;
    }
  }

  async function apiSendReaction(postId, emoji) {
    try {
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
      return null;
    }
  }

  async function apiUpdatePost(id, payload) {
    try {
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
      return null;
    }
  }

  /* =======================
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
            <button class="action-btn comment" data-id="${post.id}">
              💬 <span>${post.commentsCount || 0}</span>
            </button>
            <button class="action-btn save" data-id="${post.id}">🔖</button>
          </div>

          <div class="right">
            <button class="action-btn readmode" data-id="${post.id}">📖</button>
            <button class="action-btn share" data-id="${post.id}">🔁</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderPage(reset = false) {
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
  }

  /* =======================
        ATTACH LISTENERS
  ======================= */
  function attachListenersToVisible() {
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
       REACTION LOGIC
  ======================= */
  async function toggleReaction(postId, emoji) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    post.reactions ||= {};
    post.userReactions ||= {};

    const uid = currentUser.id;
    const prev = post.userReactions[uid] || null;

    // remove previous
    if (prev && post.reactions[prev]) post.reactions[prev]--;

    // apply new
    if (prev === emoji) {
      delete post.userReactions[uid];
    } else {
      post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
      post.userReactions[uid] = emoji;
    }

    saveLocalPosts();
    renderPage(true);

    const res = await apiSendReaction(postId, emoji);
    if (res?.reactions) {
      post.reactions = res.reactions;
      post.userReactions = res.userReactions || {};
      saveLocalPosts();
      renderPage(true);
    }
  }

  /* =======================
        SAVE POSTS
  ======================= */
  function toggleSave(id) {
    const idx = saved.indexOf(id);
    if (idx === -1) saved.unshift(id);
    else saved.splice(idx, 1);

    storageSet(SAVED_KEY, saved);
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
      btnPublish.onclick = publish;
    };
  }

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

  window.blogmeDebug = { posts };
})();
