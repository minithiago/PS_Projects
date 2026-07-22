/* ============================================================
   INTRO — secuencia de arranque tipo consola (~4.5s)
   negro → halo azul → nombre (fade+zoom+glow+partículas)
   → salida con zoom hacia delante → menú principal
   ============================================================ */

import { $ } from '../utils/dom.js';
import { Sound } from '../utils/sound.js';

export function runIntro({ onComplete, enabled = true }) {
  const intro = $('#intro');
  const skip = $('#skip-intro');
  const canvas = $('#intro-particles');

  if (!enabled) { finish(true); return; }

  let particleStop = startIntroParticles(canvas);
  let done = false;
  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  // 1) Encendido: halo + nombre aparecen suavemente
  at(350, () => { intro.classList.add('is-lit'); Sound.play('boot'); });

  // 2) Se mantiene visible
  // 3) Zoom de salida (arranque de consola)
  at(3600, () => intro.classList.add('is-zoom'));

  // 4) Fundido final → menú
  at(4400, () => intro.classList.add('is-hidden'));
  at(5200, () => finish(false));

  skip?.addEventListener('click', () => finish(false));
  window.addEventListener('keydown', onKey);
  function onKey(e) { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') finish(false); }

  function finish(instant) {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    window.removeEventListener('keydown', onKey);
    particleStop?.();
    if (instant) {
      intro.classList.add('is-done');
    } else {
      intro.classList.add('is-hidden');
      setTimeout(() => intro.classList.add('is-done'), 800);
    }
    onComplete?.();
  }
}

/* Partículas ascendentes muy suaves durante la intro */
function startIntroParticles(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = canvas.width = innerWidth * dpr;
  let h = canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';

  const N = 70;
  const parts = Array.from({ length: N }, () => reset({}, w, h, true));
  let raf, running = true;

  function reset(p, w, h, spread) {
    p.x = Math.random() * w;
    p.y = spread ? Math.random() * h : h + 10;
    p.r = (Math.random() * 1.8 + 0.4) * dpr;
    p.vy = -(Math.random() * 0.4 + 0.15) * dpr;
    p.a = Math.random() * 0.6 + 0.1;
    return p;
  }

  (function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y += p.vy;
      if (p.y < -10) reset(p, w, h, false);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(120,180,255,${p.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  })();

  return () => { running = false; cancelAnimationFrame(raf); };
}
