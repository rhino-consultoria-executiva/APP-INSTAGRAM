/* =====================================================
   GanchoReel — Lógica principal do app
   ===================================================== */

/* ── Estado global ───────────────────────────────── */
const state = {
  sessionId:          getOrCreateSessionId(),
  selectedNicho:      null,
  selectedCategories: ['todos'],
  generatedHooks:     [],
  favorites:          [],
  darkMode:           localStorage.getItem('gr_darkMode') === 'true',
  apiTemplates:       null,
  lastTopic:          '',
  lastCategories:     [],
};

/* ── Bootstrap ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  loadFavoritesFromStorage();
  renderNichos();
  renderCategories();
  updateFavoritesCount();
  wireEvents();

  // Tenta carregar templates e favoritos do Sheets em background
  if (API.isConfigured()) {
    setApiStatus('loading');
    Promise.all([loadApiTemplates(), syncFavoritesFromApi()])
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }
});

/* ── Session ID ──────────────────────────────────── */
function getOrCreateSessionId() {
  let id = localStorage.getItem('gr_sessionId');
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('gr_sessionId', id);
  }
  return id;
}

/* ── Tema claro / escuro ─────────────────────────── */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  const btn = document.getElementById('btn-toggle-theme');
  if (btn) btn.textContent = state.darkMode ? '☀️' : '🌙';
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('gr_darkMode', state.darkMode);
  applyTheme();
}

/* ── Status indicador da API ─────────────────────── */
function setApiStatus(status) {
  const el = document.getElementById('api-status');
  if (!el) return;
  el.className = 'api-status';
  if (status === 'connected') {
    el.classList.add('connected');
    el.title = 'Google Sheets conectado ✓';
  } else if (status === 'error') {
    el.classList.add('error');
    el.title = 'Google Sheets offline — usando modo local';
  } else {
    el.title = 'Conectando ao Google Sheets...';
  }
}

/* ── Nichos ──────────────────────────────────────── */
function renderNichos() {
  const container = document.getElementById('nichos-container');
  if (!container) return;

  const pills = NICHOS.map(n =>
    `<button class="pill" data-nicho="${n.id}">${n.label}</button>`
  ).join('');

  container.innerHTML =
    `<button class="pill active" data-nicho="">Todos os nichos</button>` + pills;
}

function selectNicho(nichoId) {
  state.selectedNicho = nichoId || null;

  document.querySelectorAll('#nichos-container .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nicho === (nichoId || ''));
  });

  if (nichoId && NICHE_TOPICS[nichoId]) {
    const topicInput = document.getElementById('input-topic');
    if (topicInput && !topicInput.value.trim()) {
      const opts = NICHE_TOPICS[nichoId];
      topicInput.placeholder = 'Ex: ' + opts[Math.floor(Math.random() * opts.length)] + '...';
    }
  }
}

/* ── Categorias ──────────────────────────────────── */
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const templates = state.apiTemplates || HOOK_TEMPLATES;

  let html = `<div class="category-card active" data-cat="todos">
    <span class="cat-emoji">✨</span>
    <span class="cat-label">Todas</span>
  </div>`;

  for (const [key, cat] of Object.entries(templates)) {
    html += `<div class="category-card" data-cat="${key}">
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-label">${cat.label}</span>
    </div>`;
  }

  container.innerHTML = html;
  state.selectedCategories = ['todos'];
}

function toggleCategory(catId) {
  const el = document.querySelector(`[data-cat="${catId}"]`);
  if (!el) return;

  if (catId === 'todos') {
    state.selectedCategories = ['todos'];
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    return;
  }

  // Sai do "Todas"
  const todosEl = document.querySelector('[data-cat="todos"]');
  state.selectedCategories = state.selectedCategories.filter(c => c !== 'todos');
  if (todosEl) todosEl.classList.remove('active');

  if (state.selectedCategories.includes(catId)) {
    state.selectedCategories = state.selectedCategories.filter(c => c !== catId);
    el.classList.remove('active');
  } else {
    state.selectedCategories.push(catId);
    el.classList.add('active');
  }

  if (state.selectedCategories.length === 0) {
    state.selectedCategories = ['todos'];
    if (todosEl) todosEl.classList.add('active');
  }
}

/* ── Geração de ganchos ──────────────────────────── */
function handleGenerate() {
  const topicInput = document.getElementById('input-topic');
  const topic = topicInput.value.trim();

  if (!topic) {
    topicInput.classList.add('shake');
    topicInput.addEventListener('animationend', () => topicInput.classList.remove('shake'), { once: true });
    showToast('Digite um tema para continuar 😊', 'warn');
    topicInput.focus();
    return;
  }

  const templates = state.apiTemplates || HOOK_TEMPLATES;
  const categories = state.selectedCategories.includes('todos')
    ? Object.keys(templates)
    : state.selectedCategories;

  const hooks = generateHooks(topic, categories, templates);
  state.generatedHooks = hooks;
  state.lastTopic = topic;
  state.lastCategories = categories;

  renderHookCards(hooks, topic, categories);

  const resultsSection = document.getElementById('results-section');
  resultsSection.removeAttribute('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  API.trackGenerate(
    { topic, nicho: state.selectedNicho, categories, hooksGenerated: hooks.length },
    state.sessionId
  );
}

function generateHooks(topic, categories, templates) {
  return categories.flatMap(cat => {
    const catData = templates[cat];
    if (!catData) return [];

    const { templates: tpls, withEmojis, emoji, label, color } = catData;
    const shuffled = shuffleArray([...tpls.map((t, i) => ({ t, e: withEmojis[i] }))]);
    return shuffled.slice(0, 2).map(({ t, e }) => ({
      id:            uid(),
      text:          t.replace(/\{tema\}/g, topic),
      withEmoji:     (e || t).replace(/\{tema\}/g, topic),
      category:      cat,
      categoryLabel: label,
      emoji,
      color:         color || '#7c3aed',
      topic,
    }));
  });
}

/* ── Renderização dos cards ──────────────────────── */
function renderHookCards(hooks, topic, categories) {
  const grid = document.getElementById('hooks-container');
  const meta = document.getElementById('results-meta');

  meta.textContent = `${hooks.length} ganchos gerados para "${topic}" • ${categories.length} ${categories.length === 1 ? 'categoria' : 'categorias'}`;

  grid.innerHTML = '';

  hooks.forEach((hook, i) => {
    const isFav = state.favorites.some(f => f.id === hook.id || f.text === hook.text);
    const card  = buildHookCard(hook, isFav);
    grid.appendChild(card);
    // Stagger de entrada
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('visible'), i * 55);
    });
  });
}

function buildHookCard(hook, isFav) {
  const card = document.createElement('article');
  card.className = 'hook-card';
  card.dataset.hookId = hook.id;

  const badgeBg  = hexToRgba(hook.color, 0.15);
  const badgeCol = hook.color;
  const charPlain = hook.text.length;
  const charEmoji = hook.withEmoji.length;

  card.innerHTML = `
    <div class="hook-card-header">
      <span class="category-badge" style="background:${badgeBg};color:${badgeCol}">
        ${hook.emoji} ${hook.categoryLabel}
      </span>
      <button class="btn-favorite ${isFav ? 'active' : ''}"
              data-action="favorite"
              aria-label="${isFav ? 'Remover dos favoritos' : 'Favoritar'}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </div>

    <div class="hook-block hook-block-plain">
      <div class="hook-block-label">Texto simples</div>
      <p class="hook-text">${escHtml(hook.text)}</p>
      <span class="hook-meta">${charPlain} caracteres</span>
    </div>

    <div class="hook-block hook-block-emoji">
      <div class="hook-block-label">Com emojis</div>
      <p class="hook-text">${escHtml(hook.withEmoji)}</p>
      <span class="hook-meta">${charEmoji} caracteres</span>
    </div>

    <div class="hook-card-actions">
      <button class="btn-action" data-action="copy" data-copy-type="text">📋 Copiar Texto</button>
      <button class="btn-action" data-action="copy" data-copy-type="emoji">🎨 Copiar c/ Emoji</button>
      <button class="btn-action btn-action-share" data-action="share">📤 Compartilhar</button>
    </div>
  `;

  return card;
}

/* ── Copiar ──────────────────────────────────────── */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

async function handleCopy(hookId, type) {
  const hook = state.generatedHooks.find(h => h.id === hookId);
  if (!hook) return;

  const text = type === 'emoji' ? hook.withEmoji : hook.text;
  await copyText(text);

  const card = document.querySelector(`[data-hook-id="${hookId}"]`);
  if (card) {
    const btn = card.querySelector(`[data-copy-type="${type}"]`);
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ Copiado!';
      btn.classList.add('copied');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
    }
  }

  showToast('Copiado para a área de transferência ✅', 'success');
}

/* ── Compartilhar ────────────────────────────────── */
async function handleShare(hookId) {
  const hook = state.generatedHooks.find(h => h.id === hookId);
  if (!hook) return;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Gancho para Reel', text: hook.withEmoji });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback: copia o texto com emoji
  await copyText(hook.withEmoji);
  showToast('Copiado para compartilhar! 📋', 'info');
}

/* ── Favoritos ───────────────────────────────────── */
function handleFavorite(hookId) {
  const hook = state.generatedHooks.find(h => h.id === hookId);
  if (!hook) return;

  const idx = state.favorites.findIndex(f => f.id === hookId || f.text === hook.text);

  if (idx >= 0) {
    const removed = state.favorites.splice(idx, 1)[0];
    API.removeFavorite(removed.id, state.sessionId);
    showToast('Removido dos favoritos', 'info');

    // Atualiza botão no card
    const card = document.querySelector(`[data-hook-id="${hookId}"]`);
    if (card) {
      const btn = card.querySelector('[data-action="favorite"]');
      if (btn) { btn.textContent = '🤍'; btn.classList.remove('active'); }
    }
  } else {
    const favHook = { ...hook, savedAt: new Date().toISOString() };
    state.favorites.unshift(favHook);
    API.saveFavorite(favHook, state.sessionId);
    showToast('Adicionado aos favoritos ❤️', 'success');

    const card = document.querySelector(`[data-hook-id="${hookId}"]`);
    if (card) {
      const btn = card.querySelector('[data-action="favorite"]');
      if (btn) {
        btn.textContent = '❤️';
        btn.classList.add('active', 'pop');
        btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });
      }
    }
  }

  saveFavoritesToStorage();
  updateFavoritesCount();

  if (!document.getElementById('favorites-section').hidden) {
    renderFavoritesPanel();
  }
}

function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem('gr_favorites');
    state.favorites = raw ? JSON.parse(raw) : [];
  } catch {
    state.favorites = [];
  }
}

function saveFavoritesToStorage() {
  try {
    localStorage.setItem('gr_favorites', JSON.stringify(state.favorites));
  } catch { /* quota exceeded — ignore */ }
}

async function syncFavoritesFromApi() {
  const apiFavs = await API.getFavorites(state.sessionId);
  if (!apiFavs || apiFavs.length === 0) return;

  // Merge: API tem prioridade para novos items
  const localIds = new Set(state.favorites.map(f => f.id));
  for (const f of apiFavs) {
    if (!localIds.has(f.id)) {
      state.favorites.push(f);
    }
  }
  saveFavoritesToStorage();
  updateFavoritesCount();
}

function updateFavoritesCount() {
  const el = document.getElementById('favorites-count');
  if (el) el.textContent = state.favorites.length;
}

function toggleFavoritesPanel() {
  const section = document.getElementById('favorites-section');
  const btn     = document.getElementById('btn-toggle-favorites');

  if (section.hidden) {
    section.removeAttribute('hidden');
    btn.classList.add('active');
    renderFavoritesPanel();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    section.setAttribute('hidden', '');
    btn.classList.remove('active');
  }
}

function renderFavoritesPanel() {
  const container = document.getElementById('favorites-container');
  if (!container) return;

  if (state.favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🤍</span>
        <strong>Nenhum favorito ainda</strong>
        <p>Clique no coração em qualquer gancho gerado para salvar aqui.</p>
      </div>`;
    return;
  }

  container.innerHTML = state.favorites.map((hook, i) => {
    const color  = hook.color || '#7c3aed';
    const badgeBg  = hexToRgba(color, 0.15);
    return `
    <div class="fav-item" data-fav-index="${i}">
      <div class="fav-item-header">
        <span class="category-badge" style="background:${badgeBg};color:${color}">
          ${hook.emoji || ''} ${hook.categoryLabel || hook.category}
        </span>
        <button class="btn-fav-remove" data-fav-index="${i}" aria-label="Remover favorito">✕</button>
      </div>
      <p class="fav-text">${escHtml(hook.text)}</p>
      <div class="fav-actions">
        <button class="btn-fav-action" data-fav-index="${i}" data-fav-type="text">📋 Copiar</button>
        <button class="btn-fav-action" data-fav-index="${i}" data-fav-type="emoji">🎨 c/ Emoji</button>
      </div>
    </div>`;
  }).join('');
}

function removeFavoriteByIndex(i) {
  const removed = state.favorites.splice(i, 1)[0];
  if (removed) {
    API.removeFavorite(removed.id, state.sessionId);
    saveFavoritesToStorage();
    updateFavoritesCount();
    renderFavoritesPanel();
    showToast('Removido dos favoritos', 'info');
  }
}

function clearAllFavorites() {
  if (state.favorites.length === 0) return;
  if (!confirm('Remover todos os favoritos?')) return;
  state.favorites.forEach(f => API.removeFavorite(f.id, state.sessionId));
  state.favorites = [];
  saveFavoritesToStorage();
  updateFavoritesCount();
  renderFavoritesPanel();
  showToast('Todos os favoritos removidos', 'info');
}

/* ── API: carrega templates dinâmicos ────────────── */
async function loadApiTemplates() {
  const data = await API.getTemplates();
  if (!data) return;
  state.apiTemplates = data;
  renderCategories();
}

/* ── Wiring de eventos (event delegation) ─────────── */
function wireEvents() {
  // Tema
  document.getElementById('btn-toggle-theme')
    .addEventListener('click', toggleTheme);

  // Favoritos (header toggle)
  document.getElementById('btn-toggle-favorites')
    .addEventListener('click', toggleFavoritesPanel);

  // Limpar todos favoritos
  document.getElementById('btn-clear-favorites')
    .addEventListener('click', clearAllFavorites);

  // Gerar
  document.getElementById('btn-generate')
    .addEventListener('click', handleGenerate);

  // Regenerar
  document.getElementById('btn-regenerate')
    .addEventListener('click', () => {
      const input = document.getElementById('input-topic');
      if (state.lastTopic) {
        input.value = state.lastTopic;
        handleGenerate();
      } else {
        handleGenerate();
      }
    });

  // Enter no input
  document.getElementById('input-topic').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleGenerate();
  });

  // Botão limpar input
  const topicInput = document.getElementById('input-topic');
  const clearBtn   = document.getElementById('btn-clear');
  topicInput.addEventListener('input', () => {
    clearBtn.classList.toggle('show', topicInput.value.length > 0);
  });
  clearBtn.addEventListener('click', () => {
    topicInput.value = '';
    clearBtn.classList.remove('show');
    topicInput.focus();
  });

  // Delegation — nichos
  document.getElementById('nichos-container').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (pill) selectNicho(pill.dataset.nicho);
  });

  // Delegation — categorias
  document.getElementById('categories-container').addEventListener('click', e => {
    const card = e.target.closest('.category-card');
    if (card) toggleCategory(card.dataset.cat);
  });

  // Delegation — ações nos cards de ganchos
  document.getElementById('hooks-container').addEventListener('click', async e => {
    const btn    = e.target.closest('[data-action]');
    if (!btn) return;
    const hookId = btn.closest('[data-hook-id]')?.dataset.hookId;
    if (!hookId) return;

    const action = btn.dataset.action;
    if (action === 'copy')     await handleCopy(hookId, btn.dataset.copyType);
    if (action === 'share')    await handleShare(hookId);
    if (action === 'favorite') handleFavorite(hookId);
  });

  // Delegation — ações nos favoritos
  document.getElementById('favorites-container').addEventListener('click', async e => {
    // Remover
    const removeBtn = e.target.closest('.btn-fav-remove');
    if (removeBtn) {
      removeFavoriteByIndex(Number(removeBtn.dataset.favIndex));
      return;
    }

    // Copiar
    const copyBtn = e.target.closest('.btn-fav-action');
    if (copyBtn) {
      const i    = Number(copyBtn.dataset.favIndex);
      const type = copyBtn.dataset.favType;
      const hook = state.favorites[i];
      if (hook) {
        const text = type === 'emoji' ? hook.withEmoji : hook.text;
        await copyText(text);
        showToast('Copiado! ✅', 'success');
      }
    }
  });
}

/* ── Toast ───────────────────────────────────────── */
let _toastTimer;
function showToast(message, type = 'info') {
  let toast = document.getElementById('gr-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gr-toast';
    document.body.appendChild(toast);
  }

  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  clearTimeout(_toastTimer);
  requestAnimationFrame(() => {
    toast.classList.add('show');
    _toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  });
}

/* ── Utilitários ─────────────────────────────────── */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function uid() {
  return 'h_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function hexToRgba(hex, alpha) {
  const clean = (hex || '#7c3aed').replace('#', '');
  const full  = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
