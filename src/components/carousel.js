/* ============================================================
   CAROUSEL — barra horizontal de tarjetas estilo consola.
   Centra la tarjeta activa, escala vecinas, actualiza el fondo
   dinámico y el panel. Navegación teclado/ratón/touch/gamepad.
   ============================================================ */

import { el, $, clamp } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { createCard } from './card.js';
import { renderPanel } from './panel.js';
import { generateCover } from '../data/covers.js';
import { Sound } from '../utils/sound.js';

export class Carousel {
  constructor() {
    this.track = $('#carousel');
    this.wrap = $('#carousel-wrap');
    this.bg = $('#dynamic-bg');
    this.layers = [...this.bg.querySelectorAll('.dynamic-bg__layer')];
    this.repos = [];
    this.cards = [];
    this.index = 0;
    this._activeLayer = 0;
    this._panelTimer = null;
    this._addArrows();
    this._bindInput();
    window.addEventListener('resize', () => this.center(false));
  }

  setRepos(repos) {
    this.repos = repos;
    this.track.replaceChildren();
    this.cards = [];

    if (!repos.length) {
      this.track.append(el('div', { class: 'empty-state' }, [
        el('h3', {}, 'No hay proyectos que mostrar'),
        el('p', {}, 'Prueba con otro filtro o revisa el usuario en config.js'),
      ]));
      $('#panel').replaceChildren();
      this._clearBg();
      return;
    }

    repos.forEach((repo, i) => {
      const card = createCard(repo, i, {
        onFocus: (idx) => this.hoverPreview(idx),
        onActivate: (idx) => (idx === this.index ? this.openActive() : this.setIndex(idx)),
      });
      this.cards.push(card);
      this.track.append(card);
    });

    this.index = 0;
    // El acceso a offsetLeft fuerza layout síncrono, así que podemos
    // centrar y enfocar sin depender de requestAnimationFrame (que se
    // pausa si la pestaña no está compositando).
    this._applyFocus();
    this.center(false);
    this.updatePanel();
    this.updateBg();
  }

  _addArrows() {
    const left = el('button', { class: 'carousel-arrow carousel-arrow--left', 'aria-label': 'Anterior', html: ICONS.chevronLeft, onclick: () => this.prev() });
    const right = el('button', { class: 'carousel-arrow carousel-arrow--right', 'aria-label': 'Siguiente', html: ICONS.chevronRight, onclick: () => this.next() });
    this.wrap.append(left, right);
  }

  /* -------- Navegación -------- */
  prev() { this.setIndex(this.index - 1); }
  next() { this.setIndex(this.index + 1); }

  setIndex(i, { sound = true } = {}) {
    const next = clamp(i, 0, this.repos.length - 1);
    if (next === this.index && this.cards.length) { return; }
    this.index = next;
    if (sound) Sound.play('select');
    this.center(true);
    this._applyFocus();
    this.updateBg();
    this._debouncedPanel();
  }

  /* Vista previa al pasar el ratón (sin abrir), suave */
  hoverPreview(idx) {
    if (idx === this.index) return;
    // sólo resalta ligeramente; el foco real requiere click/teclas
  }

  openActive() {
    const repo = this.repos[this.index];
    if (!repo) return;
    Sound.play('open');
    window.open(repo.url, '_blank', 'noopener');
  }

  /* -------- Layout / centrado -------- */
  center(animate = true) {
    if (!this.cards.length) return;
    const card = this.cards[this.index];
    if (!card) return;
    const wrapW = this.wrap.clientWidth;
    const target = wrapW / 2 - (card.offsetLeft + card.offsetWidth / 2);
    this.track.style.transition = animate ? '' : 'none';
    this.track.style.transform = `translate3d(${target}px, 0, 0)`;
    if (!animate) {
      // reactiva la transición tras aplicar la posición (timer, no rAF,
      // para funcionar aunque la pestaña no esté compositando)
      void this.track.offsetWidth;
      setTimeout(() => (this.track.style.transition = ''), 0);
    }
  }

  _applyFocus() {
    this.cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === this.index);
      c.classList.toggle('is-near', Math.abs(i - this.index) === 1);
      c.setAttribute('aria-selected', i === this.index ? 'true' : 'false');
    });
    // Enfocar la card activa para accesibilidad, pero NUNCA robar el foco
    // si el usuario está escribiendo (buscador) o hay un overlay abierto.
    const activeEl = document.activeElement;
    const typing = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);
    const overlayOpen = $('#stats-overlay').classList.contains('is-open');
    if (!typing && !overlayOpen) {
      this.cards[this.index]?.focus?.({ preventScroll: true });
    }
  }

  /* -------- Panel -------- */
  _debouncedPanel() {
    clearTimeout(this._panelTimer);
    this._panelTimer = setTimeout(() => this.updatePanel(), 130);
  }
  updatePanel() {
    const repo = this.repos[this.index];
    if (repo) renderPanel(repo);
  }

  /* -------- Fondo dinámico -------- */
  updateBg() {
    const repo = this.repos[this.index];
    if (!repo) return;
    const card = this.cards[this.index];
    const img = card?._cover?.img;
    let src = generateCover(repo.name, repo.language);
    if (img && img.complete && img.naturalWidth > 40) src = img.currentSrc || img.src;

    const nextLayer = this.layers[this._activeLayer ^ 1];
    const curLayer = this.layers[this._activeLayer];
    const apply = (url) => {
      nextLayer.style.backgroundImage = `url("${url}")`;
      nextLayer.style.opacity = '1';
      curLayer.style.opacity = '0';
      this._activeLayer ^= 1;
    };
    if (img && !img.complete) {
      // usar fallback y actualizar cuando cargue
      apply(src);
      img.addEventListener('load', () => {
        if (this.repos[this.index] === repo && img.naturalWidth > 40) {
          this.layers[this._activeLayer].style.backgroundImage = `url("${img.currentSrc || img.src}")`;
        }
      }, { once: true });
    } else {
      apply(src);
    }
  }
  _clearBg() { this.layers.forEach(l => (l.style.opacity = '0')); }

  /* -------- Entrada (teclado/touch) -------- */
  _bindInput() {
    window.addEventListener('keydown', (e) => {
      if (document.querySelector('.overlay.is-open')) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); this.next(); break;
        case 'ArrowLeft': e.preventDefault(); this.prev(); break;
        case 'Home': e.preventDefault(); this.setIndex(0); break;
        case 'End': e.preventDefault(); this.setIndex(this.repos.length - 1); break;
        case 'Enter': e.preventDefault(); this.openActive(); break;
      }
    });

    // Rueda del ratón horizontal
    let wheelLock = 0;
    this.wrap.addEventListener('wheel', (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 8) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelLock = now + 220;
      delta > 0 ? this.next() : this.prev();
    }, { passive: false });

    // Touch / swipe
    let startX = 0, startY = 0, active = false;
    this.wrap.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; active = true;
    }, { passive: true });
    this.wrap.addEventListener('touchend', (e) => {
      if (!active) return;
      active = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? this.next() : this.prev();
      }
    }, { passive: true });
  }
}
