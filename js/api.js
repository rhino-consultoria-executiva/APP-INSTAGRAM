/* =====================================================
   GanchoReel — Camada de API (Google Apps Script)

   CONFIGURAÇÃO:
   1. Crie a planilha no Google Sheets
   2. Abra Extensões → Apps Script → cole o Code.gs
   3. Execute setupSheets() uma vez
   4. Implante como Web App (Qualquer pessoa, sem autenticação)
   5. Cole a URL gerada em API_URL abaixo
   ===================================================== */

// Substitua pela URL do seu Google Apps Script Web App
const API_URL = '';

/* ── Utilitários internos ─────────────────────────── */

function _buildUrl(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  return `${API_URL}?${query.toString()}`;
}

async function _get(action, params = {}) {
  const url = _buildUrl(action, params);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Fire-and-forget via GET (evita preflight CORS em Apps Script)
function _fire(action, params = {}) {
  if (!API_URL) return;
  const url = _buildUrl(action, params);
  fetch(url).catch(() => {});
}

/* ── API pública ──────────────────────────────────── */

const API = {
  /** Verifica se a API está configurada */
  isConfigured() {
    return Boolean(API_URL && API_URL.startsWith('https://'));
  },

  /**
   * Busca templates dinâmicos do Google Sheets.
   * Retorna null em caso de erro (usa fallback estático).
   */
  async getTemplates() {
    if (!this.isConfigured()) return null;
    try {
      const data = await _get('getTemplates');
      return data?.success ? data.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Busca favoritos salvos para a sessão atual.
   * Retorna array vazio em caso de erro.
   */
  async getFavorites(sessionId) {
    if (!this.isConfigured() || !sessionId) return [];
    try {
      const data = await _get('getFavorites', { sessionId });
      return data?.success ? data.data : [];
    } catch {
      return [];
    }
  },

  /** Salva um favorito no Google Sheets (fire-and-forget). */
  saveFavorite(hook, sessionId) {
    if (!this.isConfigured()) return;
    _fire('saveFavorite', {
      sessionId,
      id:          hook.id,
      text:        hook.text,
      withEmoji:   hook.withEmoji,
      category:    hook.category,
      emoji:       hook.emoji,
      topic:       hook.topic || '',
      timestamp:   hook.savedAt || new Date().toISOString(),
    });
  },

  /** Remove um favorito do Google Sheets (fire-and-forget). */
  removeFavorite(hookId, sessionId) {
    if (!this.isConfigured()) return;
    _fire('removeFavorite', { id: hookId, sessionId });
  },

  /** Registra evento de geração na aba Analytics. */
  trackGenerate(data, sessionId) {
    if (!this.isConfigured()) return;
    _fire('trackAnalytics', {
      sessionId,
      topic:          data.topic || '',
      nicho:          data.nicho || '',
      categories:     (data.categories || []).join(','),
      hooksGenerated: data.hooksGenerated || 0,
      timestamp:      new Date().toISOString(),
    });
  },
};
