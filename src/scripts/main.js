/* ============================================================
   MAIN — punto de entrada. Orquesta intro, datos y dashboard.
   ============================================================ */

import { CONFIG } from '../../config.js';
import { $, el } from '../utils/dom.js';
import { Sound } from '../utils/sound.js';
import { initCursor } from '../utils/cursor.js';
import { initParticles } from '../utils/particles.js';
import { initGamepad } from '../utils/gamepad.js';
import { fetchRepos, fetchProfile } from '../api/github.js';
import { runIntro } from '../components/intro.js';
import { renderTopbar } from '../components/topbar.js';
import { renderToolbar, applyFilter } from '../components/toolbar.js';
import { Carousel } from '../components/carousel.js';
import { openStats, closeStats } from '../components/stats.js';
import { openContact, closeContact } from '../components/contact.js';

/* ---------- 1. Tema desde config ---------- */
function applyTheme() {
  const root = document.documentElement.style;
  root.setProperty('--accent', CONFIG.accent);
  root.setProperty('--accent-deep', CONFIG.accentDeep);
  const rgb = hexToRgb(CONFIG.accent);
  if (rgb) root.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  document.title = `${CONFIG.name} — Portfolio`;
}
function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

/* ---------- 2. Estado global ---------- */
const AppState = {
  repos: [], profile: null, carousel: null,
  filter: { query: '', language: 'all' },
};

/* ---------- 3. Loader ---------- */
const loader = {
  show(text) {
    const l = $('#loader');
    if (text) l.querySelector('.loader__text').textContent = text;
    l.classList.add('is-visible');
    l.setAttribute('aria-hidden', 'false');
  },
  hide() { const l = $('#loader'); l.classList.remove('is-visible'); l.setAttribute('aria-hidden', 'true'); },
};

/* ---------- 4. Arranque ---------- */
function boot() {
  applyTheme();

  Sound.init(CONFIG.enableSound);
  if (CONFIG.enableCustomCursor) initCursor();
  if (CONFIG.enableParticles) {
    const rgb = hexToRgb(CONFIG.accent) || { r: 47, g: 155, b: 255 };
    initParticles('particles', { count: window.innerWidth < 700 ? 30 : 64, color: `${rgb.r},${rgb.g},${rgb.b}` });
  }

  renderHints();

  runIntro({
    enabled: CONFIG.enableIntro,
    onComplete: startDashboard,
  });

  // Cargar datos en paralelo a la intro
  loadData();
}

/* ---------- 5. Datos ---------- */
async function loadData() {
  try {
    const [profile, repos] = await Promise.all([
      fetchProfile().catch(() => null),
      fetchRepos(),
    ]);
    AppState.profile = profile;
    AppState.repos = repos;
    AppState._ready = true;
    if (AppState._dashboardStarted) populate();
  } catch (err) {
    AppState._error = err;
    if (AppState._dashboardStarted) showError(err);
  }
}

/* ---------- 6. Dashboard ---------- */
function startDashboard() {
  const app = $('#app');
  app.setAttribute('aria-hidden', 'false');
  app.classList.add('is-ready');
  AppState._dashboardStarted = true;

  AppState.carousel = new Carousel();

  if (AppState._error) return showError(AppState._error);
  if (AppState._ready) populate();
  else loader.show('Consultando GitHub…');

  initGamepad({
    onLeft: () => AppState.carousel?.prev(),
    onRight: () => AppState.carousel?.next(),
    onSelect: () => AppState.carousel?.openActive(),
    onBack: () => { closeStats(); closeContact(); },
  });
}

function populate() {
  loader.hide();
  renderTopbar(AppState.profile);

  renderToolbar(AppState.repos, {
    onChange: (state) => { AppState.filter = state; refresh(); },
    onOpenStats: () => openStats(AppState.repos, AppState.profile),
    onOpenContact: () => openContact(),
  });

  refresh(true);
}

function refresh(first = false) {
  const filtered = applyFilter(AppState.repos, AppState.filter || {});
  AppState.carousel.setRepos(filtered);
  if (first) Sound.play('open');
}

/* ---------- 7. Errores ---------- */
function showError(err) {
  loader.hide();
  const isRate = /RATE_LIMIT/.test(err?.message);
  const msg = isRate
    ? 'Se alcanzó el límite de la API pública de GitHub. Inténtalo de nuevo en unos minutos (o añade un token en config.js para desarrollo).'
    : `No se pudieron cargar los proyectos de "${CONFIG.githubUsername}". Revisa el usuario en config.js y tu conexión.`;
  $('#carousel').replaceChildren(
    el('div', { class: 'empty-state' }, [
      el('h3', {}, isRate ? 'Límite de API alcanzado' : 'No se pudieron cargar los proyectos'),
      el('p', {}, msg),
      el('button', { class: 'toolbar__btn', style: { marginTop: '16px' }, onclick: () => location.reload() }, 'Reintentar'),
    ])
  );
}

/* ---------- 8. Hints de controles ---------- */
function renderHints() {
  $('#hints').replaceChildren(
    hint('<kbd>←</kbd><kbd>→</kbd>', 'Navegar'),
    hint('<kbd>Enter</kbd>', 'Abrir proyecto'),
    hint('<kbd>🖱️</kbd>', 'Rueda / arrastrar'),
    hint('<kbd>🎮</kbd>', 'Mando compatible'),
  );
}
function hint(keys, label) {
  return el('span', { class: 'hints__group' }, [el('span', { html: keys }), el('span', {}, label)]);
}

/* ---------- Go ---------- */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
