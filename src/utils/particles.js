/* Fondo de partículas ligero en canvas (transform/alpha, sin reflow) */

export function initParticles(canvasId, { count = 60, color = '47,155,255' } = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles = [], raf, running = true;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  };

  const spawn = () => {
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.6 + 0.4) * dpr,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr,
      a: Math.random() * 0.5 + 0.1,
      tw: Math.random() * 0.02,
    }));
  };

  const tick = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      p.a += p.tw;
      if (p.a > 0.6 || p.a < 0.1) p.tw *= -1;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };

  resize(); spawn(); tick();
  window.addEventListener('resize', () => { resize(); spawn(); });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) tick();
  });

  return () => { running = false; cancelAnimationFrame(raf); };
}
