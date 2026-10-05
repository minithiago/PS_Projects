# 🎮 Next-Generation Console-Style Portfolio

A **Single Page Application** that recreates the visual style and navigation
experience of a next-generation console dashboard (inspired by the PS5 aesthetic),
but where every "game" is one of **your GitHub projects**.

Everything is **fully dynamic**: projects are fetched in real time from the public
GitHub API. No hardcoded data and no backend required. Ready for **GitHub Pages**.

> Inspired by the aesthetic, **without using copyrighted assets** (logos, icons,
> sounds, or official Sony images). Icons, covers, and sounds are custom-made or generated.

---

## ✨ Features

- Cinematic **boot intro** (black screen → blue halo → glowing name with
  particles → zoom into the main menu).
- **Horizontal carousel** of large cards with focus effects, neighboring card
  scaling, depth, parallax, blur, and smooth shadows.
- **Dynamic background** that changes with each project (blurred image, gradients,
  glow effects, and slow cinematic motion).
- **Bottom information panel** with description, technologies, languages,
  summarized README, commits, and buttons for *View Project / Open GitHub / View Demo* (GitHub Pages).
- Navigation via **keyboard** (← →), mouse (wheel / drag), touch, and **gamepad**.
- **Top bar** with clock, name, avatar, and social media links.
- **Premium extras**: custom cursor, particles, favorites, search, language
  filtering, statistics view, timeline, achievements, certifications,
  "currently developing", fullscreen mode, local cache, and lazy loading.
- **Sound effects** stored in `/sounds` (with synthesized fallbacks when files are missing).

---

## 🚀 Usage

Since the project uses **ES modules**, it must be served through a web server
(not opened via `file://`):

```bash
# Option 1 — Python
python -m http.server 8080

# Option 2 — Node
npx serve .
```

Then open:

```text
http://localhost:8080
```

---

## ⚙️ Customization

Edit **only** `config.js`:

```js
export const CONFIG = {
  githubUsername: 'IvanNaranjo',   // your GitHub username
  name: 'Ivan Naranjo',            // your name
  profileImage: '',                // profile image URL (empty = GitHub avatar)
  accent: '#2f9bff',               // primary accent color
  social: { github: '…', linkedin: '…' },
  // …timeline, achievements, certifications, etc.
};
```

Everything else updates automatically.

### Project Covers

If a repository contains `banner.png`, `cover.png`, `preview.png`,
`thumbnail.png`, or `hero.png` (see `coverCandidates` in `config.js`),
it will be used as the project cover.

Otherwise, an elegant gradient-based cover is generated automatically.

---

## 🌐 Deploying to GitHub Pages

1. Upload this project to a GitHub repository.
2. Go to **Settings → Pages → Source: `main` / root**.
3. Done. (`.nojekyll` is already included.)

> The token in `config.js` is **optional and intended only for local development**.
> Never commit it to a public repository.

---

## 🗂️ Structure

```text
config.js                 ← ONLY file you need to edit
index.html
.nojekyll                 ← GitHub Pages compatibility

/sounds                   ← sound effects (optional)

/src
  /api
    github.js
    cache.js              (data + cache)

  /components
    intro
    topbar
    toolbar
    carousel
    card
    panel
    stats

  /data
    covers.js             (SVG covers)
    icons.js

  /styles
    base
    intro
    dashboard
    panel
    overlays

  /utils
    dom
    format
    sound
    cursor
    particles
    gamepad
    favorites

  /scripts
    main.js               (application orchestrator)
```

---

## 🎯 Performance

- Images use `loading="lazy"` and asynchronous decoding.
- Animations rely on `transform` and `opacity` to avoid reflows.
- Local GitHub API cache with configurable expiration.
- Particles automatically pause when the tab is not visible.
- Respects `prefers-reduced-motion`.

---

Built with **HTML5 · CSS3 · JavaScript ES6+**

No frameworks. No Bootstrap. No jQuery.
