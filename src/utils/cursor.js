/* Cursor personalizado con seguimiento suave (lerp) */
import { $ } from './dom.js';

export function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || matchMedia('(pointer: coarse)').matches) {
    cursor && (cursor.style.display = 'none');
    return;
  }
  document.body.classList.add('custom-cursor');

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  // Estados hot sobre elementos interactivos
  const hotSel = 'a, button, .card, .chip, input, [data-hot]';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hotSel)) cursor.classList.add('is-hot');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hotSel)) cursor.classList.remove('is-hot');
  });

  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
}
