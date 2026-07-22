/* Formateo de datos y utilidades de color por lenguaje */

export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  const units = [
    ['año', 31536000], ['mes', 2592000], ['semana', 604800],
    ['día', 86400], ['hora', 3600], ['minuto', 60],
  ];
  for (const [name, secs] of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) {
      const plural = val > 1 ? (name === 'mes' ? 'meses' : name + 's') : name;
      return `hace ${val} ${plural}`;
    }
  }
  return 'ahora mismo';
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function compactNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return String(n);
}

/* Colores oficiales aproximados por lenguaje (paleta propia, no copiada de assets) */
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', HTML: '#e34c26', CSS: '#563d7c',
  SCSS: '#c6538c', PHP: '#4F5D95', Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584',
  Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB', Shell: '#89e051', Vue: '#41b883',
  Svelte: '#ff3e00', Jupyter: '#DA5B0B', Lua: '#000080', 'Objective-C': '#438eff',
  R: '#198CE7', Elixir: '#6e4a7e', Haskell: '#5e5086', Perl: '#0298c3', Scala: '#c22d40',
  Solidity: '#AA6746', PowerShell: '#012456', Makefile: '#427819', Dockerfile: '#384d54',
};

export const langColor = (lang) => LANG_COLORS[lang] || '#7c88a3';

/* Extrae la primera imagen de un README (para portada de respaldo) */
export function firstImageFromMarkdown(md = '', repoRaw = '') {
  const mdImg = md.match(/!\[[^\]]*\]\(([^)\s]+)/);
  const htmlImg = md.match(/<img[^>]+src=["']([^"']+)["']/i);
  let src = (mdImg && mdImg[1]) || (htmlImg && htmlImg[1]) || null;
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  // ruta relativa -> raw.githubusercontent
  return repoRaw + '/' + src.replace(/^\.?\//, '');
}

/* Limpia el README para un resumen legible */
export function readmeSummary(md = '', maxLen = 320) {
  let text = md
    .replace(/```[\s\S]*?```/g, ' ')            // bloques de código
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // imágenes
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // enlaces -> texto
    .replace(/<[^>]+>/g, ' ')                   // html
    .replace(/[#>*_`~|-]+/g, ' ')               // símbolos markdown
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length > maxLen) text = text.slice(0, maxLen).trim() + '…';
  return text;
}
