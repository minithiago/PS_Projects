/* Gamepad API — navegación con mando (D-pad / sticks / botones) */

export function initGamepad({ onLeft, onRight, onSelect, onBack }) {
  let raf;
  const state = { axisCooldown: 0, buttons: {} };
  const DEAD = 0.45;

  const poll = () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = [...pads].find(Boolean);
    if (gp) {
      const ax = gp.axes[0] || 0;
      const now = performance.now();

      // D-pad (12 up,13 down,14 left,15 right)
      const pressed = (i) => gp.buttons[i] && gp.buttons[i].pressed;
      const edge = (i) => {
        const p = pressed(i);
        const was = state.buttons[i];
        state.buttons[i] = p;
        return p && !was;
      };

      if (edge(14) || (ax < -DEAD && now > state.axisCooldown)) { onLeft?.(); state.axisCooldown = now + 220; }
      if (edge(15) || (ax > DEAD && now > state.axisCooldown)) { onRight?.(); state.axisCooldown = now + 220; }
      if (Math.abs(ax) < DEAD && !pressed(14) && !pressed(15)) state.axisCooldown = 0;

      if (edge(0)) onSelect?.();   // Cross / A
      if (edge(1)) onBack?.();     // Circle / B
    }
    raf = requestAnimationFrame(poll);
  };

  window.addEventListener('gamepadconnected', () => { cancelAnimationFrame(raf); poll(); });
  poll();
  return () => cancelAnimationFrame(raf);
}
