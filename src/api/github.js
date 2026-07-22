/* ============================================================
   GITHUB API — obtiene y normaliza los repositorios.
   Todo dinámico, sin datos hardcodeados. Usa caché local.
   Las imágenes (raw.githubusercontent) NO consumen rate-limit.
   ============================================================ */

import { Cache } from './cache.js';
import { CONFIG } from '../../config.js';
import { firstImageFromMarkdown, readmeSummary } from '../utils/format.js';

const API = 'https://api.github.com';

function headers() {
  const h = { Accept: 'application/vnd.github+json' };
  if (CONFIG.github.token) h.Authorization = `Bearer ${CONFIG.github.token}`;
  return h;
}

async function apiGet(url) {
  const res = await fetch(url, { headers: headers() });
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') throw new Error('RATE_LIMIT');
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return { data: await res.json(), res };
}

/* ---------- Lista de repositorios ---------- */
export async function fetchRepos() {
  const user = CONFIG.githubUsername;
  const cacheKey = `repos:${user}`;
  const cached = Cache.get(cacheKey);
  if (cached) return cached;

  const url = `${API}/users/${user}/repos?per_page=${CONFIG.github.perPage}&sort=${CONFIG.github.sort}&direction=desc`;
  const { data } = await apiGet(url);

  let repos = data
    .filter(r => !(CONFIG.github.excludeForks && r.fork))
    .filter(r => !(CONFIG.github.excludeArchived && r.archived))
    .filter(r => !CONFIG.github.hideRepos.includes(r.name))
    .map(normalizeRepo);

  repos = sortRepos(repos);
  Cache.set(cacheKey, repos, CONFIG.cacheMinutes);
  return repos;
}

function normalizeRepo(r) {
  const raw = `https://raw.githubusercontent.com/${r.owner.login}/${r.name}/${r.default_branch}`;
  const coverCandidates = CONFIG.coverCandidates.map(f => `${raw}/${f}`);
  const demoUrl = resolveDemo(r);
  return {
    id: r.id,
    name: r.name,
    prettyName: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: r.description || '',
    language: r.language || '',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    watchers: r.watchers_count || 0,
    issues: r.open_issues_count || 0,
    topics: r.topics || [],
    url: r.html_url,
    homepage: r.homepage || '',
    demoUrl,
    hasPages: !!r.has_pages,
    updatedAt: r.pushed_at || r.updated_at,
    createdAt: r.created_at,
    archived: r.archived,
    defaultBranch: r.default_branch,
    owner: r.owner.login,
    raw,
    coverCandidates,
    // detalle cargado bajo demanda:
    _details: null,
  };
}

function resolveDemo(r) {
  // Prioriza la URL del "About" del repositorio (campo homepage).
  if (r.homepage && r.homepage.trim()) {
    let h = r.homepage.trim().replace(/\\/g, '/'); // corrige barras invertidas
    if (!/^https?:\/\//i.test(h)) h = 'https://' + h;
    return h;
  }
  // Si no hay About pero el repo publica GitHub Pages, usa esa URL.
  if (r.has_pages) return `https://${r.owner.login}.github.io/${r.name}/`;
  return '';
}

function sortRepos(repos) {
  const pinned = CONFIG.github.pinnedFirst || [];
  return repos.sort((a, b) => {
    const pa = pinned.indexOf(a.name), pb = pinned.indexOf(b.name);
    if (pa !== -1 || pb !== -1) {
      if (pa === -1) return 1;
      if (pb === -1) return -1;
      return pa - pb;
    }
    // luego por estrellas, luego por fecha
    if (b.stars !== a.stars) return b.stars - a.stars;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

/* ---------- Detalle bajo demanda (README, lenguajes, commits) ---------- */
export async function fetchRepoDetails(repo) {
  if (repo._details) return repo._details;
  const cacheKey = `details:${repo.owner}/${repo.name}`;
  const cached = Cache.get(cacheKey);
  if (cached) { repo._details = cached; return cached; }

  const [readme, languages, commits] = await Promise.all([
    fetchReadme(repo),
    fetchLanguages(repo),
    fetchCommitCount(repo),
  ]);

  const details = {
    readmeRaw: readme,
    readmeSummary: readme ? readmeSummary(readme) : '',
    readmeImage: readme ? firstImageFromMarkdown(readme, repo.raw) : null,
    languages,          // { JavaScript: 12345, CSS: 234 }
    commits,            // número o null
  };
  repo._details = details;
  Cache.set(cacheKey, details, CONFIG.cacheMinutes);
  return details;
}

async function fetchReadme(repo) {
  // raw no consume rate-limit
  for (const file of ['README.md', 'readme.md', 'README.MD', 'Readme.md']) {
    try {
      const res = await fetch(`${repo.raw}/${file}`);
      if (res.ok) return await res.text();
    } catch { /* siguiente */ }
  }
  return '';
}

async function fetchLanguages(repo) {
  try {
    const { data } = await apiGet(`${API}/repos/${repo.owner}/${repo.name}/languages`);
    return data;
  } catch { return repo.language ? { [repo.language]: 1 } : {}; }
}

async function fetchCommitCount(repo) {
  try {
    const res = await fetch(`${API}/repos/${repo.owner}/${repo.name}/commits?per_page=1`, { headers: headers() });
    if (!res.ok) return null;
    const link = res.headers.get('link');
    if (link) {
      const m = link.match(/&page=(\d+)>;\s*rel="last"/);
      if (m) return parseInt(m[1], 10);
    }
    const data = await res.json();
    return Array.isArray(data) ? data.length : null;
  } catch { return null; }
}

/* ---------- Perfil del usuario (avatar de respaldo) ---------- */
export async function fetchProfile() {
  const cacheKey = `profile:${CONFIG.githubUsername}`;
  const cached = Cache.get(cacheKey);
  if (cached) return cached;
  try {
    const { data } = await apiGet(`${API}/users/${CONFIG.githubUsername}`);
    const profile = {
      avatar: data.avatar_url,
      name: data.name,
      bio: data.bio,
      followers: data.followers,
      publicRepos: data.public_repos,
      url: data.html_url,
    };
    Cache.set(cacheKey, profile, CONFIG.cacheMinutes);
    return profile;
  } catch { return null; }
}
