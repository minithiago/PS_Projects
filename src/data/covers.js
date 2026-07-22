/* ============================================================
   COVERS — generación de portadas elegantes con gradientes
   cuando el repositorio no tiene imagen propia.
   Devuelve un data-URI SVG (ligero, cacheable, sin red).
   ============================================================ */

// Paletas de gradiente por "hash" del nombre → cada repo tiene una portada estable
const PALETTES = [
  ['#0a2a6b', '#2f9bff', '#0a3d8f'],
  ['#1a0b3a', '#7b3ff2', '#2f9bff'],
  ['#08313a', '#12b3a6', '#1e6ff2'],
  ['#3a0b1f', '#ff5e87', '#7b3ff2'],
  ['#2a1a05', '#ffb454', '#ff5e87'],
  ['#052a1c', '#3ee08e', '#12b3a6'],
  ['#0b0f2a', '#5468ff', '#2f9bff'],
  ['#2a0820', '#ff4d9d', '#5468ff'],
];

function hashStr(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Portada SVG con gradiente + patrón geométrico + inicial del proyecto */
export function generateCover(name = '?', language = '') {
  const h = hashStr(name + language);
  const pal = PALETTES[h % PALETTES.length];
  const angle = (h % 90) + 20;
  const letter = (name[0] || '?').toUpperCase();
  const cx = 40 + (h % 220);
  const cy = 60 + ((h >> 3) % 200);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${pal[0]}"/>
      <stop offset="0.55" stop-color="${pal[2]}"/>
      <stop offset="1" stop-color="${pal[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${cx / 6}%" cy="${cy / 8}%" r="70%">
      <stop offset="0" stop-color="${pal[1]}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${pal[1]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="b"><feGaussianBlur stdDeviation="30"/></filter>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <rect width="600" height="800" fill="url(#glow)"/>
  <circle cx="${cx}" cy="${cy}" r="120" fill="${pal[1]}" opacity="0.25" filter="url(#b)"/>
  <circle cx="${600 - cx}" cy="${800 - cy}" r="90" fill="#ffffff" opacity="0.08" filter="url(#b)"/>
  <g stroke="#ffffff" stroke-opacity="0.06" stroke-width="1">
    ${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${i * 110}" x2="600" y2="${i * 110 - 120}"/>`).join('')}
  </g>
  <text x="50%" y="46%" text-anchor="middle" font-family="Inter, Segoe UI, sans-serif"
        font-size="260" font-weight="800" fill="#ffffff" fill-opacity="0.14">${letter}</text>
</svg>`.trim();

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
