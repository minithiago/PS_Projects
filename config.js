/**
 * ============================================================
 *  CONFIGURACIÓN — Edita SOLO este archivo
 * ============================================================
 *  Todo lo demás se genera automáticamente a partir de aquí
 *  y de la API pública de GitHub.
 * ============================================================
 */

export const CONFIG = {
  /* ---- Identidad ---- */
  githubUsername: 'minithiago',             // <-- tu usuario de GitHub
  name: 'Ivan Naranjo',                     // <-- tu nombre visible
  role: 'Full-Stack Developer',             // subtítulo opcional
  profileImage: '',                         // URL de tu foto (vacío = avatar de GitHub)

  /* ---- Color principal (acento del sistema) ---- */
  accent: '#2f9bff',                        // azul PS5
  accentDeep: '#0a3d8f',                    // azul profundo para halos

  /* ---- Redes sociales (deja '' para ocultar) ---- */
  social: {
    github: 'https://github.com/minithiago',
    linkedin: 'https://www.linkedin.com/in/ivan-naranjo-14049230a/',
    twitter: '',
    website: '',
  },

  /* ---- Contacto (formulario / correo) ---- */
  contact: {
    email: 'ivanind04@gmail.com',        // correo donde recibir los mensajes
    subjectPrefix: 'Contacto desde el portfolio', // asunto por defecto
  },

  /* ---- GitHub API ---- */
  github: {
    perPage: 20,                 // nº máximo de repos a pedir
    sort: 'updated',             // updated | created | pushed | full_name
    excludeForks: true,          // ocultar forks
    excludeArchived: false,      // ocultar archivados
    hideRepos: ['minithiago','PS_Projects'],                 // nombres exactos a ocultar
    pinnedFirst: ['portfolio'],  // nombres que quieres destacar primero
    // Token opcional (SOLO para desarrollo local, NUNCA lo subas a GitHub Pages).
    token: '',
  },

  /* ---- Comportamiento ---- */
  cacheMinutes: 30,              // minutos de caché local de la API
  enableIntro: true,            // animación de arranque
  enableSound: true,            // efectos de sonido
  enableAmbientMusic: false,    // música ambiental (off por defecto)
  enableCustomCursor: false,    // cursor personalizado (desactivado → cursor normal)
  enableParticles: true,        // partículas de fondo

  /* ---- Imágenes de portada a buscar dentro de cada repo ---- */
  coverCandidates: [
    'banner.png', 'cover.png', 'preview.png', 'thumbnail.png', 'hero.png',
    'banner.jpg', 'cover.jpg', 'preview.jpg', 'thumbnail.jpg', 'hero.jpg',
    'banner.webp', 'cover.webp', 'preview.webp',
    '.github/banner.png', 'assets/banner.png', 'docs/banner.png',
  ],

  /* ---- Secciones estáticas del portfolio (edítalas a tu gusto) ---- */
  timeline: [
    { year: '2024', title: 'Desarrollo Full-Stack', desc: 'Proyectos web modernos con React y Node.' },
    { year: '2023', title: 'Especialización Frontend', desc: 'UI/UX, animaciones e interfaces premium.' },
    { year: '2022', title: 'Primeros proyectos', desc: 'Fundamentos de programación y open source.' },
  ],

  achievements: [
    { icon: '🏆', title: 'Open Source', desc: 'Contribuciones a proyectos públicos.' },
    { icon: '⭐', title: 'Repos destacados', desc: 'Proyectos con estrellas de la comunidad.' },
    { icon: '🚀', title: 'Despliegues', desc: 'Aplicaciones en producción.' },
  ],

  certifications: [
    { title: 'JavaScript Avanzado', issuer: 'Autodidacta', year: '2024' },
    { title: 'Desarrollo Web', issuer: 'Autodidacta', year: '2023' },
    { title: 'Desarrollo de Aplicaciones Multiplataforma', issuer: 'Formación', year: '2023' },
    { title: 'Certificación de Programación', issuer: 'Formación', year: '2023' }, 
  ],
};

export default CONFIG;
