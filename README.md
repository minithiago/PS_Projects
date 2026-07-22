# 🎮 Portfolio estilo consola de nueva generación

Una **Single Page Application** que recrea la experiencia visual y de navegación
del dashboard de una consola de nueva generación (inspirado en la estética PS5),
pero donde cada "juego" es uno de **tus proyectos de GitHub**.

Todo es **dinámico**: los proyectos se obtienen en tiempo real de la API pública
de GitHub. No hay datos hardcodeados ni backend. Listo para **GitHub Pages**.

> Inspirado en la estética, **sin usar assets con copyright** (logos, iconos,
> sonidos o imágenes oficiales de Sony). Iconos, portadas y sonidos son propios
> o generados.

---

## ✨ Características

- **Intro de arranque** cinematográfica (negro → halo azul → nombre con glow y
  partículas → zoom hacia el menú).
- **Carrusel horizontal** de tarjetas enormes con foco, escala de vecinas,
  profundidad, parallax, blur y sombras suaves.
- **Fondo dinámico** que cambia con cada proyecto (imagen desenfocada, gradientes,
  glow y movimiento lento cinematográfico).
- **Panel inferior** con descripción, tecnologías, lenguajes, README resumido,
  commits y botones *Ver proyecto / Abrir GitHub / Ver demo* (GitHub Pages).
- **Navegación** por teclado (← →), ratón (rueda / arrastre), touch y **gamepad**.
- **Barra superior** con reloj, nombre, avatar y redes sociales.
- **Extras premium**: cursor personalizado, partículas, favoritos, buscador,
  filtro por lenguaje, vista de estadísticas, timeline, logros, certificaciones,
  "actualmente desarrollando", pantalla completa, caché local y lazy loading.
- **Sonidos** en `/sounds` (con síntesis de respaldo si faltan los archivos).

---

## 🚀 Uso

Al usar **módulos ES**, ábrelo con un servidor (no con `file://`):

```bash
# Opción 1 — Python
python -m http.server 8080

# Opción 2 — Node
npx serve .
```

Luego abre `http://localhost:8080`.

---

## ⚙️ Personalización

Edita **solo** `config.js`:

```js
export const CONFIG = {
  githubUsername: 'IvanNaranjo',   // tu usuario de GitHub
  name: 'Ivan Naranjo',            // tu nombre
  profileImage: '',                // URL de tu foto (o vacío = avatar de GitHub)
  accent: '#2f9bff',               // color principal
  social: { github: '…', linkedin: '…' },
  // …timeline, logros, certificaciones, etc.
};
```

Todo lo demás se actualiza automáticamente.

### Portadas de proyecto
Si un repo contiene `banner.png`, `cover.png`, `preview.png`, `thumbnail.png` o
`hero.png` (ver `coverCandidates` en `config.js`), se usa como portada.
Si no, se genera una portada elegante con gradientes.

---

## 🌐 Desplegar en GitHub Pages

1. Sube este proyecto a un repositorio.
2. **Settings → Pages → Source: `main` / root**.
3. Listo. (El archivo `.nojekyll` ya está incluido.)

> El *token* de `config.js` es **opcional y solo para desarrollo local**.
> Nunca lo subas a un repositorio público.

---

## 🗂️ Estructura

```
config.js                 ← ÚNICO archivo a editar
index.html
.nojekyll                 ← compatibilidad GitHub Pages
/sounds                   ← efectos de sonido (opcionales)
/src
  /api        github.js, cache.js       (datos + caché)
  /components intro, topbar, toolbar,
              carousel, card, panel, stats
  /data       covers.js (portadas SVG), icons.js
  /styles     base, intro, dashboard, panel, overlays
  /utils      dom, format, sound, cursor,
              particles, gamepad, favorites
  /scripts    main.js  (orquestador)
```

---

## 🎯 Rendimiento

- Imágenes con `loading="lazy"` y decodificación asíncrona.
- Animaciones basadas en `transform`/`opacity` (sin reflow).
- Caché local de la API con expiración configurable.
- Partículas pausadas cuando la pestaña no está visible.
- Respeta `prefers-reduced-motion`.

---

Hecho con HTML5 · CSS3 · JavaScript ES6+ (sin frameworks, sin Bootstrap, sin jQuery).
