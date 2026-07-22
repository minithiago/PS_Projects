/* ============================================================
   STATS OVERLAY — estadísticas globales, lenguajes, timeline,
   logros y certificaciones.
   ============================================================ */

import { el, $ } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { langColor, compactNumber } from '../utils/format.js';
import { CONFIG } from '../../config.js';
import { Sound } from '../utils/sound.js';

export function openStats(repos, profile) {
  const overlay = $('#stats-overlay');
  overlay.replaceChildren(buildContent(repos, profile));
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');

  const close = () => closeStats();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  const onKey = (e) => { if (e.key === 'Escape') { close(); window.removeEventListener('keydown', onKey); } };
  window.addEventListener('keydown', onKey);

  // animar barras
  requestAnimationFrame(() => {
    overlay.querySelectorAll('.langstat__fill').forEach(f => (f.style.width = f.dataset.w));
  });
}

export function closeStats() {
  const overlay = $('#stats-overlay');
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  Sound.play('back');
}

function buildContent(repos, profile) {
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);

  // Distribución de lenguajes (por nº de repos)
  const langCount = {};
  repos.forEach(r => r.language && (langCount[r.language] = (langCount[r.language] || 0) + 1));
  const langEntries = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  const langTotal = langEntries.reduce((s, [, v]) => s + v, 0) || 1;

  // "Actualmente desarrollando" = repos actualizados en los últimos 14 días
  const recent = [...repos]
    .filter(r => (Date.now() - new Date(r.updatedAt)) < 14 * 864e5)
    .slice(0, 4);

  const statCell = (v, l) => el('div', { class: 'stat-cell' }, [el('b', {}, v), el('span', {}, l)]);

  return el('div', { class: 'overlay__card' }, [
    el('div', { class: 'overlay__head' }, [
      el('h2', {}, 'Panel de estadísticas'),
      el('button', { class: 'overlay__close', 'aria-label': 'Cerrar', html: ICONS.close, onclick: closeStats }),
    ]),

    // Resumen
    el('div', { class: 'overlay__section' }, [
      el('div', { class: 'stat-grid' }, [
        statCell(String(repos.length), 'Proyectos'),
        statCell(compactNumber(totalStars), 'Estrellas totales'),
        statCell(compactNumber(totalForks), 'Forks'),
        statCell(String(langEntries.length), 'Lenguajes'),
        profile ? statCell(compactNumber(profile.followers || 0), 'Seguidores') : null,
      ].filter(Boolean)),
    ]),

    // Lenguajes
    langEntries.length ? el('div', { class: 'overlay__section' }, [
      el('h3', {}, 'Lenguajes más usados'),
      el('div', { class: 'langstat' }, langEntries.slice(0, 8).map(([name, count]) => {
        const pct = ((count / langTotal) * 100).toFixed(0);
        return el('div', { class: 'langstat__row' }, [
          el('span', {}, [el('i', { class: 'card__lang-dot', style: { background: langColor(name), display: 'inline-block', marginRight: '6px' } }), name]),
          el('div', { class: 'langstat__bar' }, [
            el('div', { class: 'langstat__fill', dataset: { w: pct + '%' }, style: { width: '0%', background: langColor(name) } }),
          ]),
          el('div', { class: 'langstat__pct' }, pct + '%'),
        ]);
      })),
    ]) : null,

    // Actualmente desarrollando
    recent.length ? el('div', { class: 'overlay__section' }, [
      el('h3', {}, 'Actualmente desarrollando'),
      el('div', { class: 'badge-grid' }, recent.map(r =>
        el('a', { class: 'badge-cell', href: r.url, target: '_blank', rel: 'noopener', onmouseenter: () => Sound.play('hover') }, [
          el('div', { class: 'badge-cell__icon' }, '🚧'),
          el('div', {}, [
            el('div', { class: 'badge-cell__title' }, r.prettyName),
            el('div', { class: 'badge-cell__desc' }, r.description || r.language || 'Proyecto activo'),
          ]),
        ])
      )),
    ]) : null,

    // Timeline (config)
    CONFIG.timeline?.length ? el('div', { class: 'overlay__section' }, [
      el('h3', {}, 'Trayectoria'),
      el('div', { class: 'timeline' }, CONFIG.timeline.map(t =>
        el('div', { class: 'timeline__item' }, [
          el('div', { class: 'timeline__year' }, t.year),
          el('div', { class: 'timeline__title' }, t.title),
          el('div', { class: 'timeline__desc' }, t.desc),
        ])
      )),
    ]) : null,

    // Logros
    CONFIG.achievements?.length ? el('div', { class: 'overlay__section' }, [
      el('h3', {}, 'Logros'),
      el('div', { class: 'badge-grid' }, CONFIG.achievements.map(a =>
        el('div', { class: 'badge-cell' }, [
          el('div', { class: 'badge-cell__icon' }, a.icon),
          el('div', {}, [
            el('div', { class: 'badge-cell__title' }, a.title),
            el('div', { class: 'badge-cell__desc' }, a.desc),
          ]),
        ])
      )),
    ]) : null,

    // Certificaciones
    CONFIG.certifications?.length ? el('div', { class: 'overlay__section' }, [
      el('h3', {}, 'Certificaciones'),
      el('div', { class: 'badge-grid' }, CONFIG.certifications.map(c =>
        el('div', { class: 'badge-cell' }, [
          el('div', { class: 'badge-cell__icon' }, '📜'),
          el('div', {}, [
            el('div', { class: 'badge-cell__title' }, c.title),
            el('div', { class: 'badge-cell__desc' }, `${c.issuer} · ${c.year}`),
          ]),
        ])
      )),
    ]) : null,
  ].filter(Boolean));
}
