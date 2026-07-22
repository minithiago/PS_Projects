/* ============================================================
   TOOLBAR — buscador, filtro por lenguaje, estadísticas, contacto
   Emite eventos 'filterchange' con el estado actual.
   ============================================================ */

import { el, $, debounce } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { langColor } from '../utils/format.js';
import { Sound } from '../utils/sound.js';

export function renderToolbar(repos, { onChange, onOpenStats, onOpenContact }) {
  const toolbar = $('#toolbar');
  const state = { query: '', language: 'all' };

  // Lenguajes únicos ordenados por frecuencia
  const langCount = {};
  repos.forEach(r => r.language && (langCount[r.language] = (langCount[r.language] || 0) + 1));
  const langs = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a]);

  const input = el('input', {
    type: 'search', placeholder: 'Buscar proyecto…', 'aria-label': 'Buscar',
    oninput: debounce((e) => { state.query = e.target.value.trim().toLowerCase(); emit(); }, 160),
  });
  const search = el('div', { class: 'search', html: ICONS.search }, [input]);

  const chips = el('div', { class: 'chips' });
  const mkChip = (label, value, color) => {
    const c = el('button', {
      class: 'chip', dataset: { active: value === 'all' ? 'true' : 'false', value },
      onmouseenter: () => Sound.play('hover'),
      onclick: () => {
        if (state.language === value) return;
        state.language = value;
        [...chips.children].forEach(x => (x.dataset.active = 'false'));
        c.dataset.active = 'true';   // <- el propio chip pulsado
        Sound.play('select');
        emit();
      },
    }, [
      color ? el('span', { class: 'chip__dot', style: { background: color } }) : null,
      label,
    ].filter(Boolean));
    return c;
  };
  chips.append(mkChip('Todos', 'all'));
  langs.forEach(l => chips.append(mkChip(l, l, langColor(l))));

  const statsBtn = el('button', {
    class: 'toolbar__btn', html: `${ICONS.chart} Estadísticas`,
    onmouseenter: () => Sound.play('hover'),
    onclick: () => { Sound.play('open'); onOpenStats?.(); },
  });

  const contactBtn = el('button', {
    class: 'toolbar__btn toolbar__btn--accent', html: `${ICONS.mail} Contacto`,
    onmouseenter: () => Sound.play('hover'),
    onclick: () => { Sound.play('open'); onOpenContact?.(); },
  });

  toolbar.replaceChildren(
    search,
    chips,
    el('div', { class: 'toolbar__spacer' }),
    statsBtn,
    contactBtn,
  );

  function emit() { onChange?.({ ...state }); }
  return { getState: () => ({ ...state }) };
}

/* Aplica el filtro sobre la lista de repos */
export function applyFilter(repos, state = {}) {
  const language = state.language || 'all';
  return repos.filter(r => {
    if (language !== 'all' && r.language !== language) return false;
    if (state.query) {
      const hay = `${r.name} ${r.description} ${r.topics.join(' ')} ${r.language}`.toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  });
}
