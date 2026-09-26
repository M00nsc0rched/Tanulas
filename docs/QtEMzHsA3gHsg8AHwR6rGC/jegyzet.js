/*
 * Gépész záróvizsga tételtár — saját rajz és kézírás a szövegrészekhez.
 * A ✎ gombbal kijelölsz egy bekezdést (listaelemet, címet, ábrát, táblázatot, kérdést), és rajzolsz / írsz hozzá
 * Apple Pencillel (nyomásérzékenyen) vagy ujjal. A jegyzet a szövegrész alá kerül, a képernyő szélességéhez igazodva.
 * Tárolás: csak ezen az eszközön (IndexedDB, ha nem érhető el: localStorage). ES5 stílus (Safari 16).
 */
(function () {
  'use strict';
  if (window.TTN) return;

  // a jegyzethez köthető szövegrészek
  var SEL = 'p, li, h3, h4, figure, .tscroll, table.nums, .defbox, dt, dd, details.ask, .one, .lead';
  var COL = { ink: null, blue: '#2F6FD0', red: '#D0402F', green: '#2E9A55', hl: '#FFD400' };
  var TOOLS = [['ink', 'Toll'], ['blue', 'Kék'], ['red', 'Piros'], ['green', 'Zöld'], ['hl', 'Kiemelő'], ['er', 'Radír']];
  var DBN = 'tt-jegyzet', STN = 'notes', db = null, dbState = 0, dbWait = [];
  var cur = null, docEl = null, seq = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------------- tárolás ---------------- */
  function lsKey(t) { return 'tt-jegyzet.' + t; }
  function lsGet(t) { try { return JSON.parse(localStorage.getItem(lsKey(t)) || '[]'); } catch (e) { return []; } }
  function lsSet(t, a) { try { localStorage.setItem(lsKey(t), JSON.stringify(a)); return true; } catch (e) { return false; } }
  function withDb(cb) {
    if (dbState === 2) return cb(db);
    dbWait.push(cb);
    if (dbState === 1) return;
    dbState = 1;
    function done(d) { db = d; dbState = 2; var w = dbWait; dbWait = []; w.forEach(function (f) { f(db); }); }
    try {
      var rq = indexedDB.open(DBN, 1);
      rq.onupgradeneeded = function () { var s = rq.result.createObjectStore(STN, { keyPath: 'id' }); s.createIndex('t', 't'); };
      rq.onsuccess = function () { done(rq.result); };
      rq.onerror = function () { done(null); };
      rq.onblocked = function () { done(null); };
    } catch (e) { done(null); }
  }
  function load(t, cb) {
    withDb(function (d) {
      if (!d) return cb(lsGet(t));
      try {
        var out = [], rq = d.transaction(STN, 'readonly').objectStore(STN).index('t').openCursor(IDBKeyRange.only(t));
        rq.onsuccess = function () {
          var c = rq.result;
          if (c) { out.push(c.value); c['continue'](); return; }
          var ids = {}; out.forEach(function (x) { ids[x.id] = 1; });
          cb(out.concat(lsGet(t).filter(function (x) { return !ids[x.id]; })));
        };
        rq.onerror = function () { cb(lsGet(t)); };
      } catch (e) { cb(lsGet(t)); }
    });
  }
  function store(n, cb) {
    withDb(function (d) {
      function ls() { var a = lsGet(n.t).filter(function (x) { return x.id !== n.id; }); a.push(n); cb(lsSet(n.t, a)); }
      if (!d) return ls();
      try { var tx = d.transaction(STN, 'readwrite'); tx.objectStore(STN).put(n); tx.oncomplete = function () { cb(true); }; tx.onerror = ls; } catch (e) { ls(); }
    });
  }
  function drop(n, cb) {
    withDb(function (d) {
      lsSet(n.t, lsGet(n.t).filter(function (x) { return x.id !== n.id; }));
      if (!d) return cb(true);
      try { var tx = d.transaction(STN, 'readwrite'); tx.objectStore(STN)['delete'](n.id); tx.oncomplete = function () { cb(true); }; tx.onerror = function () { cb(false); }; } catch (e) { cb(false); }
    });
  }

  /* ---------------- horgony: melyik szövegrészhez tartozik ---------------- */
  function zones() {
    var z = [], s = docEl.querySelector('.sum');
    if (s) z.push(['s', s]);
    [].forEach.call(docEl.querySelectorAll('.bodyhtml'), function (b, i) { z.push(['b' + i, b]); });
    return z;
  }
  function anchors(zone) { return [].filter.call(zone.querySelectorAll(SEL), function (e) { return !e.closest('.tt-note, .ix-sec, .ix-card'); }); }
  function fp(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80); }
  function locate(el) {
    var z = zones();
    for (var k = 0; k < z.length; k++) if (z[k][1].contains(el)) { var a = anchors(z[k][1]); return { z: z[k][0], i: a.indexOf(el), fp: fp(el) }; }
    return null;
  }
  function find(n) {
    var z = zones().filter(function (q) { return q[0] === n.z; })[0];
    if (!z) return null;
    var a = anchors(z[1]);
    if (a[n.i] && fp(a[n.i]) === n.fp) return a[n.i];
    for (var k = 0; k < a.length; k++) if (n.fp && fp(a[k]) === n.fp) return a[k];
    // a szövegrészt azóta szerkesztették (pl. elírás javítása): a leghasonlóbb szövegrész, ha elég közeli
    var best = null, bs = 0;
    if (n.fp) for (k = 0; k < a.length; k++) { var sc = sim(fp(a[k]), n.fp) - Math.min(0.1, Math.abs(k - n.i) * 0.01); if (sc > bs) { bs = sc; best = a[k]; } }
    if (best && bs >= 0.6) { n.fp = fp(best); n.i = a.indexOf(best); store(n, function () { /* a horgony frissítve */ }); return best; }
    return null;
  }
  // Dice-együttható a karakterpárokon (0…1)
  function sim(x, y) {
    if (x === y) return 1;
    if (x.length < 2 || y.length < 2) return 0;
    var m = {}, i, hit = 0;
    for (i = 0; i < x.length - 1; i++) { var p = x.substr(i, 2); m[p] = (m[p] || 0) + 1; }
    for (i = 0; i < y.length - 1; i++) { var q = y.substr(i, 2); if (m[q] > 0) { m[q]--; hit++; } }
    return 2 * hit / (x.length + y.length - 2);
  }
  function place(el, box) {
    if (el.tagName === 'DT' && el.nextElementSibling && el.nextElementSibling.tagName === 'DD') el = el.nextElementSibling;
    if (el.tagName === 'LI' || el.tagName === 'DD') el.appendChild(box);
    else el.parentNode.insertBefore(box, el.nextSibling);
  }

  /* ---------------- megjelenítés ---------------- */
  function inkColor() { var c = getComputedStyle(document.documentElement).getPropertyValue('--ink'); return (c && c.trim()) || '#1B1D1F'; }
  function avgP(p) { var s = 0, n = p.length / 3; for (var i = 2; i < p.length; i += 3) s += p[i]; return n ? s / n : 0.5; }
  function pathD(p) {
    var n = p.length / 3, d = 'M' + p[0] + ',' + p[1];
    if (n === 1) return d + 'l0.1,0';
    for (var i = 1; i < n - 1; i++) {
      var x = p[i * 3], y = p[i * 3 + 1], nx = p[(i + 1) * 3], ny = p[(i + 1) * 3 + 1];
      d += 'Q' + x + ',' + y + ' ' + ((x + nx) / 2).toFixed(1) + ',' + ((y + ny) / 2).toFixed(1);
    }
    return d + 'L' + p[(n - 1) * 3] + ',' + p[(n - 1) * 3 + 1];
  }
  function svgOf(n) {
    var o = '<svg class="tt-svg" viewBox="0 0 1000 ' + Math.max(40, Math.round(n.h)) + '" role="img" aria-label="Saját rajz">';
    n.s.forEach(function (st) {
      var w = st.c === 'hl' ? st.w : st.w * (0.5 + avgP(st.p));
      o += '<path d="' + pathD(st.p) + '" style="fill:none;stroke:' + (st.c === 'ink' ? 'currentColor' : COL[st.c]) + ';stroke-width:' + w.toFixed(1) + ';stroke-linecap:round;stroke-linejoin:round' + (st.c === 'hl' ? ';stroke-opacity:.4' : '') + '"/>';
    });
    return o + '</svg>';
  }
  function noteBox(n) {
    var b = document.createElement('div');
    b.className = 'tt-note';
    b.setAttribute('data-nid', n.id);
    b.innerHTML = '<div class="tt-nh"><span>✎ Saját jegyzet</span><button type="button" data-a="edit">Szerkesztés</button><button type="button" data-a="del">Törlés</button></div>' + svgOf(n);
    var armed = 0;
    b.addEventListener('click', function (e) {
      var x = e.target.closest('button'); if (!x) return;
      e.stopPropagation();
      if (x.getAttribute('data-a') === 'edit') return edit(n, b, null);
      // kétlépéses törlés (a párbeszédablakot az olvasó keretében nem biztos, hogy megjeleníti a böngésző)
      if (!armed) { armed = setTimeout(function () { armed = 0; x.textContent = 'Törlés'; x.classList.remove('warn'); }, 3000); x.textContent = 'Biztosan?'; x.classList.add('warn'); return; }
      clearTimeout(armed);
      drop(n, function () { if (b.parentNode) b.parentNode.removeChild(b); });
    });
    return b;
  }
  function render(r, doc) {
    cur = r; docEl = doc;
    var tok = ++seq;
    load(r.id, function (list) {
      if (tok !== seq) return;
      list.sort(function (a, b) { return a.c - b.c; });
      var orphans = [];
      list.forEach(function (n) { var el = find(n); if (el) place(el, noteBox(n)); else orphans.push(n); });
      if (orphans.length) {
        var box = document.createElement('div');
        box.innerHTML = '<div class="secrule"><span>Saját jegyzetek — a szövegrész azóta megváltozott</span></div>';
        orphans.forEach(function (n) { box.appendChild(noteBox(n)); });
        doc.appendChild(box);
      }
    });
  }

  /* ---------------- szövegrész kiválasztása ---------------- */
  var picking = false, banner = null;
  function pick() {
    if (!docEl || !cur) return;
    if (picking) return stopPick();
    picking = true;
    document.body.classList.add('tt-picking');
    banner = document.createElement('div');
    banner.className = 'tt-banner';
    banner.innerHTML = '<span>Koppints arra a szövegrészre, amelyhez rajzot vagy kézírást fűznél. (A részletes kidolgozást előbb nyisd ki.)</span><button type="button">Mégse</button>';
    banner.querySelector('button').addEventListener('click', stopPick);
    document.body.appendChild(banner);
    document.addEventListener('click', onPick, true);
  }
  function stopPick() {
    picking = false;
    document.body.classList.remove('tt-picking');
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
    document.removeEventListener('click', onPick, true);
  }
  function onPick(e) {
    if (banner && banner.contains(e.target)) return;
    var el = e.target.closest ? e.target.closest(SEL) : null;
    if (!el || !docEl.contains(el) || el.closest('.tt-note, .ix-sec, .ix-card')) return; // pl. a kidolgozás lenyitása
    var loc = locate(el);
    if (!loc || loc.i < 0) return;
    e.preventDefault(); e.stopPropagation();
    stopPick();
    edit({ id: 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), t: cur.id, z: loc.z, i: loc.i, fp: loc.fp, h: 0, s: [], c: Date.now() }, null, el);
  }

  /* ---------------- rajzoló ---------------- */
  function edit(n, box, anchorEl) {
    var strokes = JSON.parse(JSON.stringify(n.s || [])), undo = [], tool = 'ink', thick = 1, penSeen = false;
    var ctxText = anchorEl ? fp(anchorEl) : n.fp;
    var ed = document.createElement('div');
    ed.className = 'tt-ed';
    ed.setAttribute('role', 'dialog');
    ed.setAttribute('aria-label', 'Rajz vagy kézírás');
    ed.innerHTML = '<div class="tt-bar"><div class="tt-ctx">✎ Jegyzet ehhez: „' + esc((ctxText || '').slice(0, 90)) + ((ctxText || '').length > 90 ? '…' : '') + '”</div>' +
      '<div class="tt-tools">' + TOOLS.map(function (t) { return '<button type="button" data-t="' + t[0] + '" aria-pressed="' + (t[0] === tool) + '">' + (t[0] === 'er' ? '' : '<span class="sw" style="background:' + (t[0] === 'ink' ? 'var(--ink)' : COL[t[0]]) + (t[0] === 'hl' ? ';opacity:.6' : '') + '"></span>') + t[1] + '</button>'; }).join('') +
      '<button type="button" data-w="1" aria-pressed="true">vékony</button><button type="button" data-w="2" aria-pressed="false">vastag</button></div>' +
      '<div class="tt-act"><button type="button" data-a="undo" title="Visszavonás">↶</button><button type="button" data-a="more" title="Több hely lefelé">+ hely</button><button type="button" data-a="clear">Mind törlése</button><button type="button" data-a="cancel">Mégse</button><button type="button" data-a="save" class="pri">Kész</button></div></div>' +
      '<div class="tt-pad"><div class="tt-sheet"><canvas class="tt-base"></canvas><canvas class="tt-live"></canvas>' + (strokes.length ? '' : '<div class="tt-hint">Rajzolj vagy írj ide — Apple Pencillel nyomásérzékenyen</div>') + '</div></div>';
    document.body.appendChild(ed);
    document.body.classList.add('tt-editing');
    var pad = ed.querySelector('.tt-pad'), sheet = ed.querySelector('.tt-sheet'), base = ed.querySelector('.tt-base'), live = ed.querySelector('.tt-live'), hint = ed.querySelector('.tt-hint');
    var bx = base.getContext('2d'), lx = live.getContext('2d'), hL = 0, s = 1, dpr = window.devicePixelRatio || 1, ink = inkColor();

    function bottom() { var m = 0; strokes.forEach(function (st) { for (var i = 1; i < st.p.length; i += 3) if (st.p[i] > m) m = st.p[i]; }); return m; }
    function fit() {
      var aw = Math.max(200, pad.clientWidth - 20), ah = Math.max(160, pad.clientHeight - 20);
      if (!hL) hL = Math.max(ah / aw * 1000, bottom() + 80);
      s = Math.min(aw / 1000, ah / hL);
      var cw = Math.round(1000 * s), ch = Math.round(hL * s);
      sheet.style.width = cw + 'px'; sheet.style.height = ch + 'px';
      sheet.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent 0, transparent ' + (60 * s - 1).toFixed(1) + 'px, var(--rule) ' + (60 * s - 1).toFixed(1) + 'px, var(--rule) ' + (60 * s).toFixed(1) + 'px)';
      [base, live].forEach(function (c) { c.style.width = cw + 'px'; c.style.height = ch + 'px'; c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); c.getContext('2d').setTransform(dpr * s, 0, 0, dpr * s, 0, 0); });
      redraw();
    }
    function color(c) { return c === 'ink' ? ink : COL[c]; }
    function drawStroke(g, st) {
      var p = st.p, n = p.length / 3;
      if (!n) return;
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = color(st.c); g.globalAlpha = st.c === 'hl' ? 0.4 : 1;
      if (st.c === 'hl' || n < 2) {
        g.lineWidth = st.c === 'hl' ? st.w : st.w * (0.5 + p[2]);
        g.beginPath(); g.moveTo(p[0], p[1]);
        for (var i = 1; i < n; i++) g.lineTo(p[i * 3], p[i * 3 + 1]);
        if (n === 1) g.lineTo(p[0] + 0.1, p[1]);
        g.stroke();
      } else {
        for (var j = 1; j < n; j++) {
          g.lineWidth = st.w * (0.5 + (p[j * 3 + 2] + p[(j - 1) * 3 + 2]) / 2);
          g.beginPath(); g.moveTo(p[(j - 1) * 3], p[(j - 1) * 3 + 1]); g.lineTo(p[j * 3], p[j * 3 + 1]); g.stroke();
        }
      }
      g.restore();
    }
    function redraw() { bx.clearRect(0, 0, 1000, hL); strokes.forEach(function (st) { drawStroke(bx, st); }); }
    function drawLive() { lx.clearRect(0, 0, 1000, hL); if (drawing && drawing.p) drawStroke(lx, drawing); }
    function pt(e) { var r = live.getBoundingClientRect(); return [Math.max(0, Math.min(1000, (e.clientX - r.left) / s)), Math.max(0, Math.min(hL, (e.clientY - r.top) / s))]; }
    function add(q, e) {
      var p = drawing.p, pr = e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5, k = p.length;
      if (k && Math.abs(p[k - 3] - q[0]) + Math.abs(p[k - 2] - q[1]) < 0.8) return;
      p.push(Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10, Math.round(pr * 100) / 100);
    }
    function snapshot() { undo.push(JSON.stringify(strokes)); if (undo.length > 60) undo.shift(); }
    function erase(q) {
      var r = 14, before = strokes.length;
      strokes = strokes.filter(function (st) { for (var i = 0; i < st.p.length; i += 3) { var dx = st.p[i] - q[0], dy = st.p[i + 1] - q[1], rr = r + st.w / 2; if (dx * dx + dy * dy < rr * rr) return false; } return true; });
      if (strokes.length !== before) redraw();
    }

    var drawing = null, pid = null;
    live.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return; // tenyér: ceruza mellett az ujj nem rajzol
      if (drawing) return;
      pid = e.pointerId;
      try { live.setPointerCapture(pid); } catch (x) { /* régi böngésző */ }
      if (hint && hint.parentNode) { hint.parentNode.removeChild(hint); hint = null; }
      snapshot();
      var q = pt(e);
      if (tool === 'er') { drawing = { er: 1 }; erase(q); }
      else { drawing = { c: tool, w: tool === 'hl' ? 22 : (thick === 2 ? 5 : 2.6), p: [] }; add(q, e); drawLive(); }
      e.preventDefault();
    });
    live.addEventListener('pointermove', function (e) {
      if (!drawing || e.pointerId !== pid) return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (!evs || !evs.length) evs = [e];
      evs.forEach(function (ev) { var q = pt(ev); if (drawing.er) erase(q); else add(q, ev); });
      if (!drawing.er) drawLive();
      e.preventDefault();
    });
    function end(e) {
      if (!drawing || (e && e.pointerId !== pid)) return;
      if (!drawing.er && drawing.p.length) strokes.push(drawing);
      drawing = null; pid = null;
      lx.clearRect(0, 0, 1000, hL);
      redraw();
    }
    live.addEventListener('pointerup', end);
    live.addEventListener('pointercancel', end);

    function close() {
      window.removeEventListener('resize', fit);
      document.removeEventListener('keydown', onKey);
      if (ed.parentNode) ed.parentNode.removeChild(ed);
      document.body.classList.remove('tt-editing');
    }
    function finish() {
      if (!strokes.length) {
        if (box) drop(n, function () { if (box.parentNode) box.parentNode.removeChild(box); });
        return close();
      }
      var minY = Infinity, maxY = 0;
      strokes.forEach(function (st) { for (var i = 1; i < st.p.length; i += 3) { minY = Math.min(minY, st.p[i] - st.w); maxY = Math.max(maxY, st.p[i] + st.w); } });
      var off = Math.max(0, minY - 16);
      strokes.forEach(function (st) { for (var i = 1; i < st.p.length; i += 3) st.p[i] = Math.round((st.p[i] - off) * 10) / 10; });
      n.s = strokes; n.h = Math.round(maxY - off + 16); n.u = Date.now();
      store(n, function (ok) {
        if (!ok) { alertBar('A jegyzetet nem sikerült menteni (megtelt vagy tiltott a tárhely).'); return; }
        var nb = noteBox(n);
        if (box && box.parentNode) box.parentNode.replaceChild(nb, box);
        else { var el = anchorEl && document.body.contains(anchorEl) ? anchorEl : find(n); if (el) place(el, nb); else docEl.appendChild(nb); }
        close();
      });
    }
    function alertBar(msg) { var a = document.createElement('div'); a.className = 'tt-banner'; a.innerHTML = '<span>' + esc(msg) + '</span>'; document.body.appendChild(a); setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 4000); }
    function onKey(e) { if (e.key === 'Escape') close(); }

    ed.querySelector('.tt-bar').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var t = b.getAttribute('data-t'), w = b.getAttribute('data-w'), a = b.getAttribute('data-a');
      if (t) { tool = t; [].forEach.call(ed.querySelectorAll('[data-t]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
      if (w) { thick = +w; [].forEach.call(ed.querySelectorAll('[data-w]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }
      if (a === 'undo' && undo.length) { strokes = JSON.parse(undo.pop()); redraw(); }
      if (a === 'more') { hL *= 1.35; fit(); }
      if (a === 'clear' && strokes.length) { snapshot(); strokes = []; redraw(); }
      if (a === 'cancel') close();
      if (a === 'save') finish();
    });
    window.addEventListener('resize', fit);
    document.addEventListener('keydown', onKey);
    fit();
  }

  window.TTN = { render: render, pick: pick };
})();
