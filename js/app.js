// Tanulás — egyszerű, build nélküli PWA. Safari 16 (iPad 5. gen) kompatibilis.

const APP_VERSION = '1.1.0';
const DATA_URL = 'data/artifacts.json';
const REPO_URL = 'https://github.com/M00nsc0rched/Tanulas';

/* ---------- Segédfüggvények ---------- */

const $ = (sel, root = document) => root.querySelector(sel);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('tanulas.' + key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem('tanulas.' + key, JSON.stringify(value)); } catch { /* privát mód */ }
  },
  remove(key) {
    try { localStorage.removeItem('tanulas.' + key); } catch { /* privát mód */ }
  },
};

const fmtDay = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });
const fmtToday = new Intl.DateTimeFormat('hu-HU', { month: 'long', day: 'numeric', weekday: 'long' });
const rtf = new Intl.RelativeTimeFormat('hu', { numeric: 'auto' });

function parseDate(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Naptári napokban: „ma”, „tegnap”, „3 nappal ezelőtt”, utána dátum.
function relDay(value) {
  const d = parseDate(value);
  if (!d) return '–';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((day - today) / 86400000);
  return diff <= 0 && diff > -7 ? rtf.format(diff, 'day') : fmtDay.format(d);
}

// Pontos időből: „most”, „5 perccel ezelőtt”, „2 órával ezelőtt”, majd napok.
function relTime(ms) {
  const sec = Math.round((ms - Date.now()) / 1000);
  if (sec > -45) return 'most';
  const min = Math.round(sec / 60);
  if (min > -60) return rtf.format(min, 'minute');
  const hour = Math.round(min / 60);
  if (hour > -24) return rtf.format(hour, 'hour');
  return relDay(new Date(ms).toISOString());
}

const normalize = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function tint(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h % 6;
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

/* ---------- Ikonok ---------- */

const icons = {
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 3.5V8H16"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  chevron: '<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  share: '<svg class="inline-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M7 10H5v11h14V10h-2"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
  external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  shrink: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
};

/* ---------- Állapot ---------- */

const state = {
  remote: store.get('remoteCache', null), // utoljára letöltött artifacts.json
  loading: false,
  error: null,
  favs: new Set(store.get('favs', [])),
  recent: store.get('recent', []), // [{ id, at }]
  custom: store.get('custom', []), // [{ id, title, url, added }]
  sort: store.get('sort', 'new'),
  theme: store.get('theme', 'auto'),
  immersive: store.get('immersive', false), // olvasóban a felső sáv elrejtve
  returnTo: 'claude', // ahová az olvasó „Vissza” gombja visz
  query: '',
};

function allDocs() {
  const remote = (state.remote?.items || []).map((d) => ({ ...d, source: 'claude' }));
  const custom = state.custom.map((d) => ({ ...d, updated: d.added, source: 'custom' }));
  return [...remote, ...custom];
}

function docById(id) {
  return allDocs().find((d) => d.id === id);
}

/* ---------- Adatok betöltése (szinkron) ---------- */

async function loadRemote({ force = false } = {}) {
  state.loading = true;
  try {
    const url = force ? `${DATA_URL}?t=${Date.now()}` : DATA_URL;
    const res = await fetch(url, { cache: force ? 'no-store' : 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.items)) throw new Error('Hibás adatformátum');
    const before = new Set((state.remote?.items || []).map((d) => d.id));
    state.remote = data;
    state.error = null;
    store.set('remoteCache', data);
    store.set('lastSync', Date.now());
    return data.items.filter((d) => !before.has(d.id)).length;
  } catch (err) {
    state.error = err;
    throw err;
  } finally {
    state.loading = false;
  }
}

/* ---------- Közös HTML darabok ---------- */

function topbar(title, actions = '') {
  return `<header class="topbar"><div class="topbar-inner"><h1>${esc(title)}</h1>${actions}</div></header>`;
}

// A helyi másolattal rendelkező dokumentumok az appon belüli olvasóban nyílnak meg.
function docLink(d) {
  return d.local
    ? `href="#/olvaso/${encodeURIComponent(d.id)}"`
    : `href="${esc(d.url)}" target="_blank" rel="noopener"`;
}

function docCard(d, meta) {
  const fav = state.favs.has(d.id);
  const letter = (Array.from(d.title.trim())[0] || '?').toUpperCase();
  const defaultMeta = d.source === 'custom'
    ? `<span class="badge">Saját</span>Hozzáadva: ${esc(relDay(d.added))}`
    : `Frissítve: ${esc(relDay(d.updated))}`;
  return `<li class="doc">
    <a class="doc-main" ${docLink(d)} data-open="${esc(d.id)}">
      <span class="doc-tile tint-${tint(d.title)}" aria-hidden="true">${esc(letter)}</span>
      <span class="doc-text">
        <span class="doc-title">${esc(d.title)}</span>
        <span class="doc-meta">${meta || defaultMeta}</span>
      </span>
    </a>
    <button class="doc-btn" type="button" data-action="fav" data-id="${esc(d.id)}" aria-pressed="${fav}"
      aria-label="${fav ? 'Eltávolítás a kedvencek közül' : 'Hozzáadás a kedvencekhez'}">${icons.star}</button>
    ${d.source === 'custom' ? `<button class="doc-btn danger" type="button" data-action="remove" data-id="${esc(d.id)}" aria-label="Törlés">${icons.trash}</button>` : ''}
  </li>`;
}

function syncSummary() {
  if (!state.remote) return state.loading ? 'Betöltés…' : 'Még nincs letöltött lista';
  const n = state.remote.items.length;
  return `${n} dokumentum · lista frissítve: ${relDay(state.remote.updated)}`;
}

/* ---------- Nézetek ---------- */

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Jó éjszakát!';
  if (h < 10) return 'Jó reggelt!';
  if (h < 18) return 'Jó napot!';
  return 'Jó estét!';
}

function renderHome() {
  const favDocs = allDocs().filter((d) => state.favs.has(d.id));
  const recentDocs = state.recent
    .map((r) => ({ doc: docById(r.id), at: r.at }))
    .filter((r) => r.doc)
    .slice(0, 5);

  const showInstall = isIOS && !isStandalone && !store.get('installHintClosed', false);
  const today = fmtToday.format(new Date());

  return `
    ${topbar('Tanulás')}
    <section class="hero"><div class="hero-inner">
      <p class="hero-greet">${greeting()}</p>
      <p class="hero-date">${esc(today.charAt(0).toUpperCase() + today.slice(1))}</p>
    </div></section>
    <div class="content">
      ${showInstall ? `
        <div class="banner">
          <p><strong>Telepítsd az appot:</strong> koppints a Megosztás ${icons.share} gombra, majd a <strong>„Főképernyőhöz adás”</strong> pontra.</p>
          <button class="banner-close" type="button" data-action="close-install" aria-label="Bezárás">${icons.close}</button>
        </div>` : ''}

      <a class="feature" href="#/claude">
        <span class="feature-icon">${icons.doc}</span>
        <span class="feature-text">
          <span class="feature-title">Claude dokumentumok</span>
          <span class="feature-sub" data-sync-summary>${esc(syncSummary())}</span>
        </span>
        ${icons.chevron}
      </a>

      <h2 class="section-title">Kedvencek</h2>
      ${favDocs.length
        ? `<ul class="doc-list">${favDocs.map((d) => docCard(d)).join('')}</ul>`
        : '<p class="empty">Még nincs kedvenced. A dokumentumok melletti csillaggal jelölheted a gyakran használtakat.</p>'}

      <h2 class="section-title">Legutóbb megnyitott</h2>
      ${recentDocs.length
        ? `<ul class="doc-list">${recentDocs.map((r) => docCard(r.doc, `Megnyitva: ${esc(relTime(r.at))}`)).join('')}</ul>`
        : '<p class="empty">Itt jelennek meg a nemrég megnyitott dokumentumok.</p>'}
    </div>`;
}

function renderClaude() {
  return `
    ${topbar('Claude dokumentumok', `
      <button class="icon-btn${state.loading ? ' is-busy' : ''}" type="button" data-action="sync" aria-label="Szinkronizálás">${icons.refresh}</button>
      <button class="icon-btn" type="button" data-action="add" aria-label="Link hozzáadása">${icons.plus}</button>`)}
    <div class="content">
      <p class="lead" data-sync-summary>${esc(syncSummary())}</p>
      <div class="toolbar">
        <label class="search">
          ${icons.search}
          <input id="doc-search" type="search" placeholder="Keresés" value="${esc(state.query)}"
            autocomplete="off" autocorrect="off" enterkeyhint="search" aria-label="Keresés a dokumentumok között">
        </label>
        <div class="segmented" role="group" aria-label="Rendezés">
          <button type="button" data-action="sort" data-value="new" aria-pressed="${state.sort === 'new'}">Legújabb</button>
          <button type="button" data-action="sort" data-value="az" aria-pressed="${state.sort === 'az'}">A–Z</button>
        </div>
      </div>
      <ul class="doc-list" id="doc-list"></ul>
      <p class="hint">A dokumentumok az appon belül, teljes képernyőn nyílnak meg, és egyszeri megnyitás után offline is
        olvashatók. A lista a claude.ai-on lévő Artifact-jaidból készül. Új vagy módosított dokumentum után kérd meg Claude-ot:
        <strong>„Frissítsd a Tanulás app dokumentumlistáját”</strong>, majd koppints a frissítés gombra.</p>
    </div>`;
}

function renderDocList() {
  const list = $('#doc-list');
  if (!list) return;

  if (!state.remote && state.loading) {
    list.innerHTML = '<li class="skeleton"></li><li class="skeleton"></li><li class="skeleton"></li>';
    return;
  }

  const q = normalize(state.query.trim());
  let docs = allDocs().filter((d) => !q || normalize(d.title).includes(q));
  docs = docs.sort(state.sort === 'az'
    ? (a, b) => a.title.localeCompare(b.title, 'hu')
    : (a, b) => (parseDate(b.updated)?.getTime() || 0) - (parseDate(a.updated)?.getTime() || 0));

  if (!docs.length) {
    const msg = q
      ? `Nincs találat erre: „${esc(state.query.trim())}”.`
      : state.error
        ? 'Nem sikerült betölteni a listát. Ellenőrizd az internetkapcsolatot, majd próbáld újra.'
        : 'Még nincs dokumentum a listában.';
    list.innerHTML = `<li class="empty empty-center">${msg}</li>`;
    return;
  }
  list.innerHTML = docs.map((d) => docCard(d)).join('');
}

function renderSettings() {
  const lastSync = store.get('lastSync', null);
  const theme = (value, label) =>
    `<button type="button" data-action="theme" data-value="${value}" aria-pressed="${state.theme === value}">${label}</button>`;

  return `
    ${topbar('Beállítások')}
    <div class="content">
      <h2 class="section-title">Megjelenés</h2>
      <div class="group">
        <div class="row">
          <span>Téma</span>
          <div class="segmented" role="group" aria-label="Téma">
            ${theme('auto', 'Auto')}${theme('light', 'Világos')}${theme('dark', 'Sötét')}
          </div>
        </div>
      </div>

      <h2 class="section-title">Claude dokumentumok</h2>
      <div class="group">
        <div class="row"><span>Forrás</span><span class="row-value">claude.ai Artifacts</span></div>
        <div class="row"><span>Dokumentumok</span><span class="row-value">${state.remote ? state.remote.items.length : '–'}</span></div>
        <div class="row"><span>Lista frissítve</span><span class="row-value">${state.remote ? esc(relDay(state.remote.updated)) : '–'}</span></div>
        <div class="row"><span>Utolsó szinkron</span><span class="row-value">${lastSync ? esc(relTime(lastSync)) : '–'}</span></div>
        <div class="row"><span>Saját linkek</span><span class="row-value">${state.custom.length}</span></div>
        <button class="row row-btn" type="button" data-action="sync">Szinkronizálás most</button>
        <button class="row row-btn" type="button" data-action="add">Link hozzáadása…</button>
      </div>

      <h2 class="section-title">Telepítés</h2>
      <div class="group">
        <div class="row-text">
          ${isStandalone
            ? '<strong>Az app telepítve van</strong> — a főképernyőről teljes képernyőn fut, offline is megnyílik.'
            : `<strong>iPhone és iPad:</strong> Safariban nyisd meg az oldalt, majd
              <ol><li>koppints a Megosztás ${icons.share} gombra,</li>
              <li>válaszd a <strong>„Főképernyőhöz adás”</strong> pontot,</li>
              <li>és koppints a <strong>Hozzáadás</strong> gombra.</li></ol>`}
        </div>
      </div>

      <h2 class="section-title">Adatok</h2>
      <div class="group">
        <button class="row row-btn danger" type="button" data-action="reset">Helyi adatok törlése</button>
      </div>
      <p class="hint">A kedvencek, az előzmények és a saját linkek csak ezen az eszközön tárolódnak.</p>

      <p class="footnote">Tanulás v${APP_VERSION} · <a href="${REPO_URL}" target="_blank" rel="noopener">GitHub</a></p>
    </div>`;
}

/* ---------- Olvasó (teljes képernyős, appon belüli) ---------- */

function renderReader(id) {
  const d = docById(id);
  const back = `<a class="reader-back" href="#/${state.returnTo}">${icons.back}<span>Vissza</span></a>`;

  if (!d || !d.local) {
    const msg = !state.remote && state.loading
      ? '<span class="spinner" aria-hidden="true"></span>Betöltés…'
      : 'Ez a dokumentum nem található.';
    return `<div class="reader"><header class="reader-bar">${back}</header>
      <div class="reader-body"><div class="reader-loading" role="status">${msg}</div></div></div>`;
  }

  return `<div class="reader${state.immersive ? ' is-immersive' : ''}" id="reader">
    <header class="reader-bar">
      ${back}
      <h1 class="reader-title">${esc(d.title)}</h1>
      <a class="reader-btn" href="${esc(d.url)}" target="_blank" rel="noopener" aria-label="Megnyitás a claude.ai-on">${icons.external}</a>
      <button class="reader-btn" type="button" data-action="immersive" aria-label="Teljes képernyő">${icons.expand}</button>
    </header>
    <div class="reader-body">
      <div class="reader-loading" id="reader-loading" role="status"><span class="spinner" aria-hidden="true"></span>Betöltés…</div>
      <iframe class="reader-frame" src="${esc(d.local)}" title="${esc(d.title)}" allow="fullscreen; clipboard-write"></iframe>
    </div>
    <button class="reader-exit" type="button" data-action="immersive" aria-label="Felső sáv megjelenítése">${icons.shrink}</button>
  </div>`;
}

function toggleImmersive() {
  state.immersive = !state.immersive;
  store.set('immersive', state.immersive);
  $('#reader')?.classList.toggle('is-immersive', state.immersive);
}

/* ---------- Router ---------- */

const routes = {
  '': renderHome,
  claude: renderClaude,
  beallitasok: renderSettings,
  olvaso: (id) => renderReader(id),
};
const view = $('#view');

function parseHash(hash) {
  const [route = '', param = ''] = hash.replace(/^#\/?/, '').split('?')[0].split('/');
  return Object.prototype.hasOwnProperty.call(routes, route)
    ? { route, param: decodeURIComponent(param) }
    : { route: '', param: '' };
}

const currentRoute = () => parseHash(location.hash).route;

function render({ keepScroll = false } = {}) {
  const { route, param } = parseHash(location.hash);
  const y = window.scrollY;
  view.innerHTML = routes[route](param);
  if (route === 'claude') renderDocList();

  const reading = route === 'olvaso';
  document.documentElement.classList.toggle('is-reading', reading);
  if (reading) {
    $('.reader-frame')?.addEventListener('load', () => $('#reader-loading')?.remove(), { once: true });
  }

  document.querySelectorAll('.nav-item').forEach((a) => {
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  if (keepScroll) window.scrollTo(0, y);
}

window.addEventListener('hashchange', (e) => {
  const prev = parseHash(new URL(e.oldURL).hash).route;
  if (currentRoute() === 'olvaso' && prev !== 'olvaso') state.returnTo = prev;
  state.query = '';
  render();
  window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
});

// Csak a változó részeket frissíti (a keresőmező fókusza megmarad, a megnyitott dokumentum nem töltődik újra).
function refreshInPlace() {
  document.querySelectorAll('[data-sync-summary]').forEach((el) => { el.textContent = syncSummary(); });
  document.querySelectorAll('[data-action="sync"].icon-btn').forEach((b) => b.classList.toggle('is-busy', state.loading));
  const route = currentRoute();
  if (route === 'olvaso') {
    if (!$('.reader-frame')) render(); // a lista még töltődött, amikor a dokumentumot kérték
  } else if (route === 'claude') {
    renderDocList();
  } else {
    render({ keepScroll: true });
  }
}

/* ---------- Téma ---------- */

const THEME_COLORS = { light: '#4263eb', dark: '#2b3a99' };

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');

  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    const scheme = m.media.includes('dark') ? 'dark' : 'light';
    m.content = THEME_COLORS[theme === 'auto' ? scheme : theme];
  });
}

/* ---------- Toast ---------- */

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

/* ---------- Műveletek ---------- */

async function sync() {
  if (state.loading) return;
  document.querySelectorAll('[data-action="sync"].icon-btn').forEach((b) => b.classList.add('is-busy'));
  try {
    const added = await loadRemote({ force: true });
    toast(added ? `${added} új dokumentum érkezett` : 'A lista naprakész');
  } catch {
    toast(navigator.onLine ? 'Nem sikerült szinkronizálni' : 'Nincs internet – a mentett lista látható');
  } finally {
    document.querySelectorAll('[data-action="sync"].icon-btn').forEach((b) => b.classList.remove('is-busy'));
    refreshInPlace();
  }
}

function toggleFav(id, btn) {
  if (state.favs.has(id)) state.favs.delete(id);
  else state.favs.add(id);
  store.set('favs', [...state.favs]);
  const fav = state.favs.has(id);
  if (currentRoute() === '') {
    render({ keepScroll: true });
  } else if (btn) {
    btn.setAttribute('aria-pressed', String(fav));
    btn.setAttribute('aria-label', fav ? 'Eltávolítás a kedvencek közül' : 'Hozzáadás a kedvencekhez');
  }
  toast(fav ? 'Hozzáadva a kedvencekhez' : 'Eltávolítva a kedvencek közül');
}

function recordOpen(id) {
  state.recent = [{ id, at: Date.now() }, ...state.recent.filter((r) => r.id !== id)].slice(0, 12);
  store.set('recent', state.recent);
  // A kezdőlap „Legutóbb megnyitott” listája a visszatéréskor frissül.
  if (currentRoute() === '') setTimeout(() => render({ keepScroll: true }), 400);
}

function removeCustom(id) {
  const doc = state.custom.find((d) => d.id === id);
  if (!doc || !confirm(`Törlöd ezt a linket?\n\n${doc.title}`)) return;
  state.custom = state.custom.filter((d) => d.id !== id);
  state.favs.delete(id);
  state.recent = state.recent.filter((r) => r.id !== id);
  store.set('custom', state.custom);
  store.set('favs', [...state.favs]);
  store.set('recent', state.recent);
  refreshInPlace();
  toast('Link törölve');
}

function resetLocal() {
  if (!confirm('Törlöd a kedvenceket, az előzményeket és a saját linkeket erről az eszközről?')) return;
  ['favs', 'recent', 'custom', 'installHintClosed'].forEach((k) => store.remove(k));
  state.favs = new Set();
  state.recent = [];
  state.custom = [];
  render({ keepScroll: true });
  toast('Helyi adatok törölve');
}

/* ---------- Link hozzáadása dialógus ---------- */

const dialog = $('#add-dialog');
const form = $('#add-form');

function openAddDialog() {
  form.reset();
  $('#add-error').textContent = '';
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  setTimeout(() => form.elements.title.focus(), 50);
}

function closeAddDialog() {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = form.elements.title.value.trim();
  const raw = form.elements.url.value.trim();
  const error = $('#add-error');

  if (!title) { error.textContent = 'Adj meg egy címet.'; form.elements.title.focus(); return; }

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!raw || !/^https?:$/.test(url.protocol) || !url.hostname.includes('.')) throw new Error();
  } catch {
    error.textContent = 'Érvénytelen link. Pl.: https://claude.ai/artifact/…';
    form.elements.url.focus();
    return;
  }

  if (allDocs().some((d) => d.url.replace(/\/$/, '') === url.href.replace(/\/$/, ''))) {
    error.textContent = 'Ez a link már szerepel a listában.';
    return;
  }

  state.custom.push({ id: `c-${Date.now().toString(36)}`, title, url: url.href, added: new Date().toISOString() });
  store.set('custom', state.custom);
  closeAddDialog();
  refreshInPlace();
  toast('Link hozzáadva');
});

async function pasteUrl() {
  try {
    const text = (await navigator.clipboard.readText()).trim();
    if (text) form.elements.url.value = text;
  } catch {
    form.elements.url.focus();
    toast('Tartsd lenyomva a mezőt, és válaszd a Beillesztést');
  }
}

/* ---------- Eseménykezelés (delegálva) ---------- */

document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) { recordOpen(open.dataset.open); return; }

  const btn = e.target.closest('[data-action]');
  if (!btn) {
    // Kattintás a dialógus hátterére → bezárás
    if (e.target === dialog) closeAddDialog();
    return;
  }

  switch (btn.dataset.action) {
    case 'sync': sync(); break;
    case 'add': openAddDialog(); break;
    case 'close-dialog': closeAddDialog(); break;
    case 'paste': pasteUrl(); break;
    case 'fav': toggleFav(btn.dataset.id, btn); break;
    case 'remove': removeCustom(btn.dataset.id); break;
    case 'reset': resetLocal(); break;
    case 'sort':
      state.sort = btn.dataset.value;
      store.set('sort', state.sort);
      btn.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderDocList();
      break;
    case 'theme':
      state.theme = btn.dataset.value;
      store.set('theme', state.theme);
      applyTheme(state.theme);
      btn.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      break;
    case 'immersive': toggleImmersive(); break;
    case 'close-install':
      store.set('installHintClosed', true);
      btn.closest('.banner').remove();
      break;
    default: break;
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'doc-search') {
    state.query = e.target.value;
    renderDocList();
  }
});

// iOS csak akkor alkalmazza a :active stílust, ha van touchstart figyelő.
document.addEventListener('touchstart', () => {}, { passive: true });

const AUTO_SYNC_MS = 10 * 60 * 1000;

function backgroundSync() {
  if (state.loading) return;
  loadRemote()
    .catch(() => { /* offline: a mentett lista marad */ })
    .finally(refreshInPlace);
}

// Visszatéréskor (pl. a claude.ai-ról) frissülnek a relatív idők, és ha rég volt, a lista is.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || dialog.open) return;
  if (currentRoute() !== 'olvaso') render({ keepScroll: true });
  if (Date.now() - store.get('lastSync', 0) > AUTO_SYNC_MS) backgroundSync();
});

/* ---------- Indítás ---------- */

applyTheme(state.theme);
backgroundSync(); // a loading állapot már az első rajzolásnál látszik
render();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* nem kritikus */ });
}
