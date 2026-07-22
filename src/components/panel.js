/* ============================================================
   PANEL inferior — detalle ampliado del proyecto seleccionado.
   Carga README, lenguajes y commits bajo demanda.
   ============================================================ */

import { el, $ } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { langColor, formatDate, compactNumber } from '../utils/format.js';
import { fetchRepoDetails } from '../api/github.js';
import { Sound } from '../utils/sound.js';

let _seq = 0;

export function renderPanel(repo) {
  const panel = $('#panel');
  const seq = ++_seq;

  const stat = (value, label) => el('div', { class: 'panel__stat' }, [
    el('b', {}, value), el('span', {}, label),
  ]);

  const topics = repo.topics.slice(0, 6).map(t => el('span', { class: 'topic-tag' }, `#${t}`));

  const btn = (cls, icon, label, href, disabled) => el('a', {
    class: `btn ${cls}`,
    ...(href ? { href, target: '_blank', rel: 'noopener' } : {}),
    ...(disabled ? { 'aria-disabled': 'true' } : {}),
    html: `${icon}<span>${label}</span>`,
    onmouseenter: () => Sound.play('hover'),
    onclick: () => Sound.play('open'),
  });

  const commitsEl = stat('…', 'Commits');
  const readmeEl = el('p', { class: 'panel__readme' }, 'Cargando README…');
  const langbar = el('div', { class: 'panel__langbar' });
  const langlegend = el('div', { class: 'panel__langlegend' });

  const demo = repo.demoUrl
    ? btn('btn--demo', ICONS.play, 'Ver demo', repo.demoUrl)
    : btn('btn--demo', ICONS.play, 'Sin demo', null, true);

  const inner = el('div', { class: 'panel__inner panel__key' }, [
    el('div', { class: 'panel__left' }, [
      el('h2', { class: 'panel__title' }, repo.prettyName),
      el('p', { class: 'panel__desc' }, repo.description || 'Este proyecto aún no tiene descripción.'),
      el('div', { class: 'panel__stats' }, [
        stat(compactNumber(repo.stars), 'Estrellas'),
        stat(compactNumber(repo.forks), 'Forks'),
        commitsEl,
        stat(formatDate(repo.updatedAt), 'Actualizado'),
      ]),
      topics.length ? el('div', { class: 'panel__topics' }, topics) : null,
      readmeEl,
    ].filter(Boolean)),
    el('div', { class: 'panel__right' }, [
      repo.language ? el('div', {}, [
        el('div', { class: 'panel__langlegend', style: { marginBottom: '6px' } }, [
          el('span', {}, [el('i', { style: { background: langColor(repo.language) } }), `Principal: ${repo.language}`]),
        ]),
      ]) : null,
      langbar,
      langlegend,
      el('div', { class: 'panel__actions' }, [
        btn('btn--primary', ICONS.external, 'Ver proyecto', repo.url),
        demo,
      ]),
    ].filter(Boolean)),
  ]);

  panel.replaceChildren(inner);

  // ---- Detalle asíncrono ----
  fetchRepoDetails(repo).then(details => {
    if (seq !== _seq) return; // ya cambió la selección
    commitsEl.querySelector('b').textContent = details.commits != null ? compactNumber(details.commits) : '—';
    readmeEl.textContent = details.readmeSummary || 'Sin README disponible.';
    renderLangBar(langbar, langlegend, details.languages);
  }).catch(() => {
    if (seq !== _seq) return;
    commitsEl.querySelector('b').textContent = '—';
    readmeEl.textContent = repo.description || 'Sin README disponible.';
  });
}

function renderLangBar(bar, legend, languages) {
  const entries = Object.entries(languages || {});
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (!total) { bar.remove?.(); return; }
  bar.replaceChildren(...entries.map(([name, val]) =>
    el('span', { style: { width: `${(val / total) * 100}%`, background: langColor(name) }, title: name })
  ));
  legend.replaceChildren(...entries.slice(0, 5).map(([name, val]) =>
    el('span', {}, [el('i', { style: { background: langColor(name) } }), `${name} ${((val / total) * 100).toFixed(0)}%`])
  ));
}
