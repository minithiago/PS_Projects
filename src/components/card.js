/* ============================================================
   CARD — tarjeta de proyecto (estilo "juego" de consola)
   Resuelve la portada probando imágenes candidatas y, si no,
   genera una portada con gradiente.
   ============================================================ */

import { el } from '../utils/dom.js';
import { langColor, timeAgo } from '../utils/format.js';
import { generateCover } from '../data/covers.js';

/** Intenta cargar en cadena una lista de URLs de imagen; usa fallback si todas fallan */
function loadCover(imgEl, candidates, fallback) {
  let i = 0;
  const tryNext = () => {
    if (i >= candidates.length) { imgEl.src = fallback; return; }
    const url = candidates[i++];
    imgEl.src = url;
  };
  imgEl.addEventListener('error', tryNext);
  imgEl.addEventListener('load', () => {
    // Descarta imágenes rotas de 1x1 o placeholders diminutos
    if (imgEl.naturalWidth < 40 && imgEl.src !== fallback) tryNext();
  });
  tryNext();
}

export function createCard(repo, index, { onFocus, onActivate }) {
  const fallback = generateCover(repo.name, repo.language);

  const img = el('img', {
    class: 'card__img', alt: repo.prettyName, loading: 'lazy', decoding: 'async',
  });
  loadCover(img, repo.coverCandidates, fallback);

  const isFeatured = (repo.stars > 0) || repo.topics.includes('featured');
  const isDev = repo.topics.includes('wip') || repo.topics.includes('in-progress')
    || (Date.now() - new Date(repo.updatedAt)) < 7 * 864e5;

  const badges = el('div', { class: 'card__badges' }, [
    isDev && el('span', { class: 'badge badge--dev' }, 'En desarrollo'),
    isFeatured && el('span', { class: 'badge badge--featured' }, 'Destacado'),
  ].filter(Boolean));

  const langNode = repo.language
    ? el('span', { class: 'card__lang' }, [
        el('i', { class: 'card__lang-dot', style: { color: langColor(repo.language), background: langColor(repo.language) } }),
        repo.language,
      ])
    : el('span', { class: 'card__lang' }, 'Proyecto');

  const card = el('article', {
    class: 'card',
    role: 'option',
    tabindex: '-1',
    dataset: { id: repo.id, index },
    style: { animationDelay: `${Math.min(index * 0.06, 0.6)}s` },
  }, [
    el('div', { class: 'card__media' }, [
      img,
      el('div', { class: 'card__shine' }),
      el('div', { class: 'card__overlay' }),
    ]),
    badges,
    el('div', { class: 'card__body' }, [
      el('h3', { class: 'card__title', title: repo.prettyName }, repo.prettyName),
      el('p', { class: 'card__desc' }, repo.description || 'Sin descripción.'),
      el('div', { class: 'card__meta' }, [
        langNode,
        el('span', {}, timeAgo(repo.updatedAt)),
      ]),
    ]),
  ]);

  card.addEventListener('click', () => onActivate?.(index));
  card.addEventListener('pointerenter', () => onFocus?.(index));

  card._repo = repo;
  card._cover = { img, fallback };
  return card;
}
