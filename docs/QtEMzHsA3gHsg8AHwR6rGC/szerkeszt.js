/*
 * Gépész záróvizsga tételtár — a tételek szövegének szerkesztése a claude.ai-on.
 * Az „Aa” gomb csak akkor jelenik meg, ha a lap a claude.ai-on fut, és az `artifact` képesség elérhető
 * (a Tanulás webappban — GitHub Pages — nincs window.claude, ott csak olvasni lehet). Mentéskor a megváltozott
 * adatfájl (data-a.js vagy data-b.js) új verzióként kerül az artifactba (files publish); a formátum bájtra azonos
 * az eredetivel: `window.AV_B=` + JSON + `;`. ES5 stílus (Safari 16).
 */
(function () {
  'use strict';
  if (window.TTE) return;

  var api = null, readOnly = false, ctx = null, editing = false, rec = null, docEl = null, bar = null, zones = [], dirty = {}, saving = false;
  var PEND = 'tte-pending', KEEP = 'data-tte-k';
  var RO_CODES = { not_writer: 1, not_granted: 1, not_declared: 1, capability_disabled: 1, capability_removed: 1, consent_required: 1 };

  function $(s) { return document.querySelector(s); }
  function btn() { return document.getElementById('editbtn'); }

  /* ---------------- indulás: van-e mentési lehetőség ---------------- */
  function init(c) { ctx = c; probe(); }
  function probe() {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    window.claude.use('artifact').then(function (a) {
      if (!a || readOnly) return;
      api = a;
      var b = btn(); if (b) b.hidden = false;
      offerPending();
    }, function () { /* nincs szerkesztés */ });
  }

  /* ---------------- szerkeszthető részek ---------------- */
  function collect() {
    var z = [], t = docEl.querySelector('h2.title'), q = docEl.querySelector('.qbox p'), s = docEl.querySelector('.sum');
    if (t) z.push({ f: 't', el: t, text: true });
    if (q) z.push({ f: 'q', el: q });
    if (s) z.push({ f: 'sum', el: s, outer: true });
    var fields = ['body'];
    if (rec.sup) fields.push('sup');
    if (rec.sup2) fields.push('sup2');
    [].forEach.call(docEl.querySelectorAll('.bodyhtml'), function (b, i) { if (fields[i] && fields[i] !== 'sup2') z.push({ f: fields[i], el: b }); });
    return z;
  }
  function clean(zn) {
    if (zn.text) return zn.el.textContent.replace(/\s+/g, ' ').trim();
    var c = zn.el.cloneNode(true);
    function each(sel, fn) { [].forEach.call(c.querySelectorAll(sel), fn); }
    each('.tt-note, .ix-sec, .ix-rule, .tt-banner', function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    each('.tscroll', function (w) { while (w.firstChild) w.parentNode.insertBefore(w.firstChild, w); w.parentNode.removeChild(w); });
    each('img.lz', function (im) { im.removeAttribute('src'); im.classList.remove('miss'); });
    each('[contenteditable]', function (x) { x.removeAttribute('contenteditable'); });
    each('details[open]', function (d) { d.removeAttribute('open'); });
    // Enterrel keletkezett, attribútum nélküli div → bekezdés (a szerkesztés előtt is meglévő div-ek és üres
    // bekezdések jelölve vannak, azokhoz nem nyúlunk)
    each('div', function (d) { if (!d.attributes.length && d.parentNode) { var p = document.createElement('p'); while (d.firstChild) p.appendChild(d.firstChild); d.parentNode.replaceChild(p, d); } });
    each('p', function (p) { if (!p.hasAttribute(KEEP) && !p.textContent.replace(/ /g, ' ').trim() && !p.querySelector('img, svg, figure, table') && p.parentNode) p.parentNode.removeChild(p); });
    each('[' + KEEP + ']', function (x) { x.removeAttribute(KEEP); });
    ['contenteditable', 'spellcheck', 'lang'].forEach(function (a) { c.removeAttribute(a); });
    return zn.outer ? c.outerHTML : c.innerHTML;
  }

  /* ---------------- minimális változás ----------------
   * A DOM-ból visszaírt HTML formailag eltér a tárolttól (< → &lt;, <rect/> → <rect></rect>), ezért a mező
   * felső szintű blokkjai közül a változatlanokat a tárolt forrásszövegükkel írjuk vissza, csak a
   * ténylegesen szerkesztett blokk kerül be új alakban. Ha a forrás nem bontható biztonságosan, az egész
   * mező az új alakot kapja. */
  var VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
  var TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
  function nodes(html) { var t = document.createElement('template'); t.innerHTML = html; return [].slice.call(t.content.childNodes); }
  function ser(n) {
    if (n.nodeType === 1) return n.outerHTML;
    if (n.nodeType === 8) return '<!--' + n.data + '-->';
    var d = document.createElement('div'); d.appendChild(n.cloneNode(true)); return d.innerHTML;
  }
  function svgFix(h) { return h.replace(/<(rect|circle|ellipse|line|path|polyline|polygon|use|stop)(\s[^<>]*)?><\/\1>/g, '<$1$2/>'); }
  var PCLOSE = /^(address|article|aside|blockquote|details|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|main|menu|nav|ol|p|pre|section|table|ul)$/i;
  function chunks(src) {
    var out = [], pos = 0, depth = 0, from = 0, top = '', m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(src))) {
      // lezáratlan felső szintű <p>: a böngésző a következő blokkelemnél lezárja
      if (depth === 1 && top === 'p' && !m[1] && m[0].charAt(1) !== '!' && PCLOSE.test(m[2])) { out.push(src.slice(from, m.index)); depth = 0; pos = m.index; }
      if (depth === 0 && m.index > pos) out.push(src.slice(pos, m.index));
      if (m[0].charAt(1) === '!') { if (depth === 0) out.push(m[0]); }
      else if (!m[1]) {
        if (depth === 0) { from = m.index; top = m[2].toLowerCase(); }
        if (m[4] || VOID.test(m[2])) { if (depth === 0) out.push(m[0]); }
        else depth++;
      } else if (--depth === 0) out.push(src.slice(from, TAG.lastIndex));
      else if (depth < 0) return null;
      pos = TAG.lastIndex;
    }
    if (depth > 0) out.push(src.slice(from));            // lezáratlan utolsó elem (pl. </p> nélkül)
    else if (pos < src.length) out.push(src.slice(pos));
    return out;
  }
  function minimal(src, html) {
    src = src || '';
    var a = nodes(src).map(ser), b = nodes(html).map(ser), ch = chunks(src), i, j;
    // a forrás felbontása csak akkor használható, ha blokkonként ugyanazt adja, mint a böngésző
    var ok = ch && ch.join('') === src && ch.length === a.length;
    for (i = 0; ok && i < ch.length; i++) ok = nodes(ch[i]).map(ser).join('') === a[i];
    if (!ok) return a.join('') === b.join('') ? src : svgFix(html);
    // leghosszabb közös részsorozat a blokkok között
    var n = a.length, k = b.length, L = [];
    for (i = 0; i <= n; i++) { L.push([]); for (j = 0; j <= k; j++) L[i].push(0); }
    for (i = n - 1; i >= 0; i--) for (j = k - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = ''; i = 0; j = 0;
    while (j < k) {
      if (i < n && a[i] === b[j]) { out += ch[i]; i++; j++; }
      else if (i < n && L[i + 1][j] >= L[i][j + 1]) i++;
      else { out += svgFix(b[j]); j++; }
    }
    return out;
  }

  /* ---------------- szerkesztő mód ---------------- */
  function start() {
    if (!api || readOnly || editing || saving) return;
    rec = ctx.record(); docEl = ctx.doc();
    if (!rec || !docEl) return;
    editing = true; dirty = {};
    document.body.classList.add('tt-editmode');
    [].forEach.call(docEl.querySelectorAll('details.full:not(.sup)'), function (d) { d.open = true; });
    zones = collect();
    zones.forEach(function (zn) {
      zn.el.setAttribute('contenteditable', 'true');
      zn.el.setAttribute('spellcheck', 'true');
      zn.el.setAttribute('lang', 'hu');
      [].forEach.call(zn.el.querySelectorAll('.tt-note, .ix-sec, figure.ixfig svg'), function (x) { x.setAttribute('contenteditable', 'false'); });
      [].forEach.call(zn.el.querySelectorAll('div, p'), function (d) { if (d.tagName === 'DIV' ? !d.attributes.length : !d.textContent.trim()) d.setAttribute(KEEP, ''); });
      zn.el.addEventListener('input', onInput);
      zn.el.addEventListener('keydown', onKey);
    });
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); document.execCommand('styleWithCSS', false, false); } catch (e) { /* régi böngésző */ }
    showBar();
    var nb = document.getElementById('notebtn'); if (nb) nb.disabled = true;
  }
  function onInput(e) {
    var zn = zones.filter(function (z) { return z.el === e.currentTarget; })[0];
    if (zn) { dirty[zn.f] = 1; status(Object.keys(dirty).length ? 'Nem mentett változás' : ''); }
  }
  function onKey(e) {
    // a címben és a kérdésben az Enter ne törje a sort
    var zn = zones.filter(function (z) { return z.el === e.currentTarget; })[0];
    if (e.key === 'Enter' && zn && (zn.f === 't' || zn.f === 'q')) e.preventDefault();
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  }
  function stop(reRender) {
    zones.forEach(function (zn) {
      zn.el.removeAttribute('contenteditable');
      [].forEach.call(zn.el.querySelectorAll('[' + KEEP + ']'), function (x) { x.removeAttribute(KEEP); });
      zn.el.removeEventListener('input', onInput);
      zn.el.removeEventListener('keydown', onKey);
    });
    zones = []; dirty = {}; editing = false;
    document.body.classList.remove('tt-editmode');
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
    var nb = document.getElementById('notebtn'); if (nb) nb.disabled = false;
    if (reRender && ctx) ctx.rerender();
  }
  function discard() { stop(true); }

  /* ---------------- eszközsáv ---------------- */
  function showBar() {
    bar = document.createElement('div');
    bar.className = 'tte-bar';
    bar.innerHTML = '<span class="tte-lab">Szerkesztés</span>' +
      '<button type="button" data-c="bold" title="Félkövér"><b>F</b></button>' +
      '<button type="button" data-c="italic" title="Dőlt"><i>D</i></button>' +
      '<button type="button" data-c="subscript" title="Alsó index">x<sub>2</sub></button>' +
      '<button type="button" data-c="superscript" title="Felső index">x<sup>2</sup></button>' +
      '<span class="tte-st"></span>' +
      '<button type="button" data-a="discard">Elvetés</button>' +
      '<button type="button" data-a="save" class="pri">Mentés</button>';
    // a gomb ne vegye el a kijelölést a szövegtől
    bar.addEventListener('pointerdown', function (e) { if (e.target.closest('button[data-c]')) e.preventDefault(); });
    bar.addEventListener('mousedown', function (e) { if (e.target.closest('button[data-c]')) e.preventDefault(); });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || saving) return;
      var c = b.getAttribute('data-c'), a = b.getAttribute('data-a');
      if (c) { try { document.execCommand(c, false, null); } catch (x) { /* nem támogatott */ } var sel = window.getSelection && window.getSelection(); if (sel && sel.anchorNode) { var z = zones.filter(function (q) { return q.el.contains(sel.anchorNode); })[0]; if (z) { dirty[z.f] = 1; status('Nem mentett változás'); } } }
      if (a === 'save') save();
      if (a === 'discard') { if (!Object.keys(dirty).length || b.getAttribute('data-armed')) discard(); else { b.setAttribute('data-armed', '1'); b.textContent = 'Biztosan elveted?'; setTimeout(function () { if (b.parentNode) { b.removeAttribute('data-armed'); b.textContent = 'Elvetés'; } }, 3000); } }
    });
    document.body.appendChild(bar);
    status('Koppints a szövegbe, és írj. A mentés új verziót készít.');
  }
  function status(t, warn) {
    if (!bar) return;
    var s = bar.querySelector('.tte-st');
    s.textContent = t || '';
    s.classList.toggle('warn', !!warn);
  }

  /* ---------------- mentés ---------------- */
  function replacer(k, v) { return k.charAt(0) === '_' ? undefined : v; }
  function save() {
    if (!editing || saving) return;
    var fs = Object.keys(dirty);
    if (!fs.length) { stop(true); return; }
    var name = rec.g === 'A' ? 'AV_A' : 'AV_B', file = rec.g === 'A' ? 'data-a.js' : 'data-b.js', arr = window[name];
    if (!arr) { status('A tétel adatai nem érhetők el.', true); return; }
    var orig = {}, next = {};
    zones.forEach(function (zn) {
      if (!dirty[zn.f]) return;
      var v = clean(zn);
      if (!zn.text) v = minimal(rec[zn.f], v);
      if (v !== rec[zn.f]) { orig[zn.f] = rec[zn.f]; next[zn.f] = v; }
    });
    if (!Object.keys(next).length) { stop(true); toast('Nem történt változás.'); return; }
    Object.keys(next).forEach(function (f) { rec[f] = next[f]; });
    var text = 'window.' + name + '=' + JSON.stringify(arr, replacer) + ';', files = {};
    files[file] = { content: text, contentType: 'text/javascript' };
    // ütközéskor a nézet újratöltődik: a szerkesztést megőrizzük, hogy vissza lehessen állítani
    try { sessionStorage.setItem(PEND, JSON.stringify({ id: rec.id, fields: next, at: Date.now() })); } catch (e) { /* nem kritikus */ }
    saving = true; status('Mentés…');
    var tries = 0;
    (function go() {
      api.publish(files).then(function () {
        saving = false;
        try { sessionStorage.removeItem(PEND); } catch (e) { /* – */ }
        stop(true);
        toast('Mentve — új verzió készült');
      }, function (err) {
        var code = (err && err.code) || 'upstream_error';
        if (code === 'upstream_error' && tries++ < 1) { setTimeout(go, 800 + Math.random() * 1200); return; }
        saving = false;
        Object.keys(orig).forEach(function (f) { rec[f] = orig[f]; });
        if (code === 'conflict') { status('Közben újabb verzió készült — a lap újratöltődik, a szerkesztésed visszaállítható.', true); return; }
        try { sessionStorage.removeItem(PEND); } catch (e) { /* – */ }
        if (RO_CODES[code]) {
          readOnly = true;
          var b = btn(); if (b) b.hidden = true;
          stop(true);
          toast('Ezen a nézeten a tételtár csak olvasható — a szerkesztés nem menthető.');
          return;
        }
        status(code === 'rate_limited' ? 'Túl sűrű mentés — várj egy kicsit, majd mentsd újra.' : code === 'too_large' ? 'A mentés túl nagy — nem sikerült.' : 'A mentés nem sikerült (' + code + '). Próbáld újra.', true);
      });
    })();
  }

  /* ---------------- ütközés utáni visszaállítás ---------------- */
  function offerPending() {
    var p = null;
    try { p = JSON.parse(sessionStorage.getItem(PEND) || 'null'); } catch (e) { p = null; }
    if (!p || Date.now() - p.at > 30 * 60 * 1000) return;
    var t = toast('Egy mentés nem ment át, mert közben új verzió készült. <button type="button">Visszaállítás</button> <button type="button">Elvetés</button>', 30000);
    var bs = t.querySelectorAll('button');
    bs[0].addEventListener('click', function () {
      t.parentNode && t.parentNode.removeChild(t);
      if (!ctx.go(p.id)) return;
      setTimeout(function () {
        start();
        zones.forEach(function (zn) {
          if (!(zn.f in p.fields)) return;
          if (zn.text) zn.el.textContent = p.fields[zn.f];
          else if (zn.outer) { var tmp = document.createElement('div'); tmp.innerHTML = p.fields[zn.f]; if (tmp.firstElementChild) zn.el.innerHTML = tmp.firstElementChild.innerHTML; }
          else zn.el.innerHTML = p.fields[zn.f];
          dirty[zn.f] = 1;
        });
        status('Visszaállítva — ellenőrizd, majd mentsd.');
      }, 50);
    });
    bs[1].addEventListener('click', function () { try { sessionStorage.removeItem(PEND); } catch (e) { /* – */ } t.parentNode && t.parentNode.removeChild(t); });
  }

  function toast(html, ms) {
    var t = document.createElement('div');
    t.className = 'tt-banner';
    t.innerHTML = '<span>' + html + '</span>';
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, ms || 3500);
    return t;
  }

  /* ---------------- navigáció közben ---------------- */
  function canLeave() {
    if (!editing) return true;
    if (Object.keys(dirty).length || saving) { status('Előbb mentsd vagy vesd el a módosítást.', true); return false; }
    stop(false);
    return true;
  }

  window.TTE = { init: init, probe: probe, start: start, canLeave: canLeave, editing: function () { return editing; }, _min: minimal };
})();
