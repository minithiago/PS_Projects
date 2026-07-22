/* Caché local con expiración (localStorage) para evitar llamadas repetidas */

const PREFIX = 'ps5pf:';

export const Cache = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const { exp, data } = JSON.parse(raw);
      if (exp && Date.now() > exp) { localStorage.removeItem(PREFIX + key); return null; }
      return data;
    } catch { return null; }
  },

  set(key, data, ttlMinutes = 30) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({
        exp: ttlMinutes ? Date.now() + ttlMinutes * 60000 : 0,
        data,
      }));
    } catch { /* storage lleno o bloqueado: ignorar */ }
  },

  remove(key) { try { localStorage.removeItem(PREFIX + key); } catch {} },

  clearAll() {
    try {
      Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    } catch {}
  },
};
