/* ============================================================
   TOPBAR — avatar, nombre, reloj, redes sociales, fullscreen
   ============================================================ */

import { el, $ } from '../utils/dom.js';
import { ICONS } from '../data/icons.js';
import { CONFIG } from '../../config.js';
import { Sound } from '../utils/sound.js';
import { openContact } from './contact.js';

export function renderTopbar(profile) {
  const bar = $('#topbar');
  const avatarSrc = CONFIG.profileImage || profile?.avatar
    || `https://avatars.githubusercontent.com/${CONFIG.githubUsername}`;

  const clock = el('div', { class: 'topbar__clock' }, '--:--');
  const date = el('div', { class: 'topbar__date' }, '');

  const social = [];
  const add = (key, href) => {
    if (!href) return;
    social.push(el('a', {
      class: 'icon-btn', href, target: '_blank', rel: 'noopener', 'aria-label': key,
      html: ICONS[key] || ICONS.globe,
      onmouseenter: () => Sound.play('hover'),
    }));
  };
  add('github', CONFIG.social.github);
  add('linkedin', CONFIG.social.linkedin);
  add('twitter', CONFIG.social.twitter);
  add('globe', CONFIG.social.website);

  const contactBtn = el('button', {
    class: 'icon-btn icon-btn--accent', 'aria-label': 'Contacto', title: 'Contacto', html: ICONS.mail,
    onclick: () => { Sound.play('open'); openContact(); }, onmouseenter: () => Sound.play('hover'),
  });

  const fullscreenBtn = el('button', {
    class: 'icon-btn', 'aria-label': 'Pantalla completa', html: ICONS.expand,
    onclick: toggleFullscreen, onmouseenter: () => Sound.play('hover'),
  });

  bar.replaceChildren(
    el('div', { class: 'topbar__left' }, [
      el('img', { class: 'topbar__avatar', src: avatarSrc, alt: CONFIG.name, loading: 'lazy' }),
      el('div', {}, [
        el('div', { class: 'topbar__name' }, CONFIG.name),
        CONFIG.role && el('div', { class: 'topbar__role' }, CONFIG.role),
      ].filter(Boolean)),
    ]),
    el('div', { class: 'topbar__center' }, [clock, date]),
    el('div', { class: 'topbar__right' }, [...social, contactBtn, fullscreenBtn]),
  );

  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    date.textContent = now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  tick();
  setInterval(tick, 1000 * 20);
  // actualización al minuto exacto
  setTimeout(() => { tick(); setInterval(tick, 60000); }, (60 - new Date().getSeconds()) * 1000);
}

function toggleFullscreen() {
  Sound.play('open');
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}
