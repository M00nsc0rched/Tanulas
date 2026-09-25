/*
 * Gépész záróvizsga tételtár — interaktív ábrák (AVIX keret)
 *
 * A tételtár show() függvénye minden tétel megjelenítésekor meghívja az AVIX.show(r, doc)-ot.
 * Ha a tételhez tartozik interaktív ábra (REG), a Témaösszefoglaló után „Interaktív ábrák” szakasz
 * kerül a lapra; minden ábra egy lenyitható kártya, amely csak az első lenyitáskor épül fel.
 * Az ábrák külön fájlokban vannak (ix/*.js), és AVIX.def(név, {title, sub, mount}) hívással jelentkeznek be.
 * Stílus: a tételtár CSS-változói (--surface, --ink, --acc …), így világos és sötét témában is illeszkedik.
 * Csak Safari 16-tal is működő megoldások (ES5 stílus, pointer events, ResizeObserver, <details>).
 */
(function () {
  'use strict';
  if (window.AVIX) return;

  var DEF = {};

  /* ------------------------------------------------------------------ */
  /* Tétel → ábrák (név, beállítások)                                    */
  /* ------------------------------------------------------------------ */
  var REG = {
    A1: [['fec', { set: 'a1' }], ['kereg']],
    A2: [['megeresztes'], ['szacel']],
    A3: [['fec', { set: 'a3' }], ['szakitas'], ['kemenyseg'], ['hofugg']],
    A5: [['hociklus'], ['fec', { set: 'a5', title: 'A hőkezelések helye a vas–szén állapotábrán', sub: 'Ac1 alatt vagy fölött? — feszültségcsökkentés, újrakristályosítás, lágyítások, patentírozás' }]],
    A6: [['haz'], ['hofor']],
    A7: [['munkapont', { mode: 'eso' }], ['elektroda']],
    A8: [['vfi'], ['munkapont', { mode: 'lapos', sub: 'Lapos (feszültségtartó) jelleggörbe és belső szabályozás — hasonlítsd össze a BKI-vel' }]],
    A9: [['forma'], ['hegtab'], ['ce']],
    A10: [['fec', { set: 'a10', title: 'Kovácsolás és a hidegalakítás hőkezelései az állapotábrán', sub: 'Felső és alsó kovácsolási hőköz · feszültségcsökkentés, lágyítás, újrakristályosítás, patentírozás' }], ['kovacs']],
    A11: [['vagas'], ['savterv']],
    A12: [['tures'], ['nyomkp'], ['savterv']],
    A13: [['fec', { set: 'a13', title: 'Öntöttvasak a vas–szén állapotábrán', sub: 'Metastabil és stabil (vas–grafit) rendszer · temperálás · öntési szempontok' }], ['minta']],
    A14: [['forgadat'], ['lehajlas']],
    A15: [['furat']],
    A16: [['maras']],
    A17: [['korong']],
    A18: [['kup']],
    A19: [['menet']],
    A20: [['pontossag'], ['retegek']],
    A21: [['evolvens']],
    A22: [['maag'], ['evolvens']],
    A23: [['kupkerek']],
    A24: [['csiga']],
    A25: [['tomeg'], ['szakaszok']],
    A26: [['ncsim', { prog: 'kontur' }]],
    A27: [['nullpont'], ['ncsim', { prog: 'novm', title: 'Abszolút és növekményes méretmegadás', sub: 'G90: a W nullponthoz képest · G91: az előző ponthoz képest — léptesd a programot' }]],
    A28: [['korr'], ['ncsim', { prog: 'kontur' }]],
    A29: [['ncsim', { prog: 'hibas', title: 'Programellenőrzés grafikus szimulációval', sub: 'A szimulátor jelzi a hibás körívet és a hiányzó előtolást — javítsd ki a programot' }]],
    A30: [['ncsim', { prog: 'kontur', title: 'Egyenes és körív menti mondatok', sub: 'G00 pontvezérlés · G01 egyenes · G02/G03 körív végponttal és I, J középponttal vagy R sugárral' }]],
    A4: [['acjel'], ['ce'], ['fec', { set: 'a4', title: 'Hegesztés előtti és utáni hőkezelések az állapotábrán', sub: 'Előmelegítés, hidrogénmentesítés, feszültségcsökkentés, megeresztés, normalizálás' }]],
    B1: [['gyrfajta'], ['gyrhier'], ['fmsrend']],
    B2: [['kapacitas'], ['muvkapcs'], ['valasztek']],
    B3: [['optim'], ['furatalg']],
    B4: [['tkod'], ['reprez'], ['gtcsop']],
    B5: [['vezmozg'], ['eloredontes'], ['barazda']],
    B6: [['fmsrend'], ['paletta'], ['gyrfajta']],
    B7: [['keszlet'], ['utemez'], ['sorrend']],
    B8: [['cimy'], ['pushpull'], ['leanjp']],
  };

  /* ------------------------------------------------------------------ */
  /* Segédfüggvények                                                    */
  /* ------------------------------------------------------------------ */
  var U = {};
  U.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };
  U.fmt = function (v, d) {
    if (!isFinite(v)) return '–';
    var s = (d == null ? v : v.toFixed(d));
    s = String(s).replace('.', ',').replace('-', '−');
    // ezres tagolás (keskeny szóköz) 10 000 felett
    var m = s.match(/^(−?)(\d+)(.*)$/);
    if (m && m[2].length > 4) s = m[1] + m[2].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + m[3];
    return s;
  };
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  U.lerp = function (x0, y0, x1, y1, x) { return y0 + (y1 - y0) * (x - x0) / (x1 - x0); };
  U.h = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  U.store = function (key, def) {
    var k = 'avix.' + key;
    return {
      get: function () { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } },
      set: function (v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* nem kritikus */ } },
    };
  };
  U.reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Csúszka: {label, min, max, step, value, unit, dec, fmt(v), onInput(v)} */
  U.slider = function (parent, o) {
    var row = U.h('div', 'ix-sl');
    row.innerHTML = '<span>' + U.esc(o.label) + '</span><input type="range"><output></output>';
    var inp = row.querySelector('input'), out = row.querySelector('output');
    inp.min = o.min; inp.max = o.max; inp.step = o.step || 1; inp.value = o.value;
    inp.setAttribute('aria-label', o.label);
    function show(v) { out.textContent = o.fmt ? o.fmt(v) : U.fmt(v, o.dec) + (o.unit ? ' ' + o.unit : ''); }
    inp.addEventListener('input', function () { var v = parseFloat(inp.value); show(v); if (o.onInput) o.onInput(v); });
    show(parseFloat(inp.value));
    (parent.querySelector('.ix-sls') || parent).appendChild(row);
    return {
      el: row, input: inp,
      get: function () { return parseFloat(inp.value); },
      set: function (v, silent) { inp.value = v; show(parseFloat(inp.value)); if (!silent && o.onInput) o.onInput(parseFloat(inp.value)); },
    };
  };
  U.sliders = function (parent) { var g = U.h('div', 'ix-sls'); parent.appendChild(g); return g; };

  /* Szegmentált választó / chipek: items = [[érték, felirat], …] */
  function choice(cls, parent, items, value, onChange, label) {
    var g = U.h('div', cls);
    g.setAttribute('role', 'group');
    if (label) g.setAttribute('aria-label', label);
    g.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + U.esc(it[0]) + '">' + it[1] + '</button>';
    }).join('');
    function mark(v) { [].forEach.call(g.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === String(v))); }); }
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var v = b.getAttribute('data-v'); mark(v); if (onChange) onChange(v);
    });
    mark(value);
    parent.appendChild(g);
    return { el: g, set: function (v) { mark(v); } };
  }
  U.seg = function (p, items, v, cb, label) { return choice('ix-seg', p, items, v, cb, label); };
  U.chips = function (p, items, v, cb, label) { return choice('ix-chips', p, items, v, cb, label); };

  /* Rajzterület SVG-vel; draw(w, h) minden méretváltozáskor újrarajzol. */
  U.plot = function (parent, o) {
    o = o || {};
    var wrap = U.h('div', 'ix-plot' + (o.cls ? ' ' + o.cls : ''));
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ix-svg');
    svg.setAttribute('role', 'img');
    if (o.label) svg.setAttribute('aria-label', o.label);
    wrap.appendChild(svg);
    parent.appendChild(wrap);
    var P = { wrap: wrap, svg: svg, w: 0, h: 0, draw: o.draw || null };
    P.size = function () {
      var w = Math.max(260, wrap.clientWidth || 600);
      var ratio = o.ratio ? (typeof o.ratio === 'function' ? o.ratio(w) : o.ratio) : 0.6;
      var h = Math.round(U.clamp(w * ratio, o.minH || 220, o.maxH || 560));
      P.w = w; P.h = h;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('height', h);
      return P;
    };
    P.render = function () { P.size(); if (P.draw) P.draw(P.w, P.h); };
    // koordináta a viewBox rendszerében
    P.at = function (e) {
      var r = svg.getBoundingClientRect();
      return [(e.clientX - r.left) * P.w / r.width, (e.clientY - r.top) * P.h / r.height];
    };
    // húzás / koppintás
    P.drag = function (fn) {
      var on = false;
      svg.style.touchAction = 'none';
      svg.addEventListener('pointerdown', function (e) {
        on = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { /* régi böngésző */ }
        var p = P.at(e); fn(p[0], p[1], 'down', e); e.preventDefault();
      });
      svg.addEventListener('pointermove', function (e) { if (on) { var p = P.at(e); fn(p[0], p[1], 'move', e); } });
      ['pointerup', 'pointercancel'].forEach(function (t) { svg.addEventListener(t, function () { on = false; }); });
    };
    var lastW = 0;
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        var w = wrap.clientWidth;
        if (w && Math.abs(w - lastW) > 2) { lastW = w; P.render(); }
      }).observe(wrap);
    }
    return P;
  };

  /* Tengelyskála: lineáris vagy logaritmikus */
  U.scale = function (d0, d1, r0, r1, log) {
    if (log) {
      var l0 = Math.log(d0), l1 = Math.log(d1);
      var f = function (v) { return r0 + (Math.log(v) - l0) / (l1 - l0) * (r1 - r0); };
      f.inv = function (p) { return Math.exp(l0 + (p - r0) / (r1 - r0) * (l1 - l0)); };
      return f;
    }
    var g = function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); };
    g.inv = function (p) { return d0 + (p - r0) / (r1 - r0) * (d1 - d0); };
    return g;
  };
  U.path = function (pts, sx, sy) {
    return 'M' + pts.map(function (p) { return (sx ? sx(p[0]) : p[0]).toFixed(1) + ',' + (sy ? sy(p[1]) : p[1]).toFixed(1); }).join('L');
  };
  // Tengelyek: {x0,x1,y0,y1 (pixel), xt:[…], yt:[…], sx, sy, xl, yl, xf, yf}
  U.axes = function (a) {
    var o = '';
    (a.yt || []).forEach(function (t) {
      var y = a.sy(t).toFixed(1);
      o += '<line class="grid" x1="' + a.x0 + '" x2="' + a.x1 + '" y1="' + y + '" y2="' + y + '"/>';
      o += '<text class="tk" x="' + (a.x0 - 6) + '" y="' + (+y + 3.5) + '" text-anchor="end">' + (a.yf ? a.yf(t) : U.fmt(t)) + '</text>';
    });
    (a.xt || []).forEach(function (t) {
      var x = a.sx(t).toFixed(1);
      if (a.xgrid) o += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + a.y0 + '" y2="' + a.y1 + '"/>';
      o += '<text class="tk" x="' + x + '" y="' + (a.y1 + 15) + '" text-anchor="middle">' + (a.xf ? a.xf(t) : U.fmt(t)) + '</text>';
    });
    o += '<rect class="ax" x="' + a.x0 + '" y="' + a.y0 + '" width="' + (a.x1 - a.x0) + '" height="' + (a.y1 - a.y0) + '" fill="none"/>';
    if (a.xl) o += '<text class="tk" x="' + a.x1 + '" y="' + (a.y1 + 30) + '" text-anchor="end">' + U.esc(a.xl) + '</text>';
    if (a.yl) o += '<text class="tk" x="' + (a.x0 - 6) + '" y="' + (a.y0 - 8) + '" text-anchor="end">' + U.esc(a.yl) + '</text>';
    return o;
  };

  /* Eredménykártya: rows = [[címke, érték, megjegyzés?], …] */
  U.kv = function (rows) {
    return '<dl class="ix-kv">' + rows.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd><b>' + r[1] + '</b>' + (r[2] ? '<small>' + r[2] + '</small>' : '') + '</dd>';
    }).join('') + '</dl>';
  };

  /* Feleletválasztós gyakorló: qs = [{q, opts:[…], a:index, why}] */
  U.quiz = function (parent, qs, o) {
    o = o || {};
    var box = U.h('details', 'ix-quiz');
    box.innerHTML = '<summary>' + U.esc(o.title || 'Gyakorlás') + '</summary><div class="ix-qb"></div>';
    parent.appendChild(box);
    var body = box.querySelector('.ix-qb');
    var order = [], i = 0, score = [0, 0], cur = null;
    function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
    function next() {
      if (!order.length || i >= order.length) { order = shuffle(qs.map(function (_, k) { return k; })); i = 0; }
      var q = qs[order[i++]];
      var idx = shuffle(q.opts.map(function (_, k) { return k; }));
      cur = { q: q, idx: idx, done: false };
      draw();
    }
    function draw(pick) {
      if (!cur) {
        body.innerHTML = '<p class="ix-qmsg">' + U.esc(o.intro || 'Kérdések a tétel anyagából — válaszd ki a helyeset.') + '</p><button type="button" class="ix-btn" data-q="go">Kezdjük</button>';
        return;
      }
      var q = cur.q;
      var h = '<p class="ix-qq">' + q.q + '</p><div class="ix-opts">';
      cur.idx.forEach(function (k) {
        var cls = '';
        if (cur.done) cls = k === q.a ? ' ok' : (k === pick ? ' no' : '');
        h += '<button type="button" class="ix-opt' + cls + '" data-k="' + k + '"' + (cur.done ? ' disabled' : '') + '>' + q.opts[k] + '</button>';
      });
      h += '</div>';
      if (cur.done) h += '<p class="ix-why">' + (pick === q.a ? '<b>Helyes.</b> ' : '<b>Nem ez.</b> ') + (q.why || '') + '</p>';
      h += '<div class="ix-qf"><span class="ix-score">Eredmény: ' + score[0] + ' / ' + score[1] + '</span>' +
        (cur.done ? '<button type="button" class="ix-btn" data-q="go">Következő</button>' : '') + '</div>';
      body.innerHTML = h;
      if (o.onShow) o.onShow(q, cur.done);
    }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.getAttribute('data-q') === 'go') { next(); return; }
      if (b.hasAttribute('data-k') && cur && !cur.done) {
        var k = +b.getAttribute('data-k');
        cur.done = true; score[1]++; if (k === cur.q.a) score[0]++;
        draw(k);
      }
    });
    draw();
    return box;
  };

  /* ------------------------------------------------------------------ */
  /* Stílus                                                              */
  /* ------------------------------------------------------------------ */
  var CSS = [
    ':root{--ix-1:#D9822B;--ix-2:#3B82C4;--ix-3:#3D8B5A;--ix-4:#8E6BBF;--ix-5:#C0504D;--ix-6:#2A9D8F;--ix-7:#B0567A;--ix-8:#7A8B99}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ix-1:#E9A35A;--ix-2:#6FA8DC;--ix-3:#6DBB86;--ix-4:#B29BDB;--ix-5:#E07A76;--ix-6:#5CC3B6;--ix-7:#D98BAE;--ix-8:#9FB0BD}}',
    ':root[data-theme="dark"]{--ix-1:#E9A35A;--ix-2:#6FA8DC;--ix-3:#6DBB86;--ix-4:#B29BDB;--ix-5:#E07A76;--ix-6:#5CC3B6;--ix-7:#D98BAE;--ix-8:#9FB0BD}',
    '.ix-sec{display:grid;gap:10px;margin-top:16px}',
    '.ix-sec>*{min-width:0}',
    'details.ix-card{background:var(--surface);border:1px solid var(--rule);border-radius:12px;box-shadow:var(--shadow);color:var(--ink);font-family:var(--disp)}',
    'details.ix-card>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:12px 16px;min-height:52px}',
    'details.ix-card>summary::-webkit-details-marker{display:none}',
    '.ix-ico{flex:none;width:30px;height:30px;border-radius:8px;background:var(--acc-soft);color:var(--acc);display:flex;align-items:center;justify-content:center}',
    '.ix-ico svg{width:17px;height:17px}',
    '.ix-t{flex:1;min-width:0;display:grid;gap:2px}',
    '.ix-t b{font-size:15px;font-weight:700;line-height:1.3}',
    '.ix-t small{font-size:12.5px;color:var(--muted);line-height:1.35}',
    'details.ix-card>summary .chev{flex:none;width:8px;height:8px;border-right:1.7px solid var(--acc);border-bottom:1.7px solid var(--acc);transform:rotate(-45deg);margin-right:4px;transition:transform .16s}',
    'details.ix-card[open]>summary .chev{transform:rotate(45deg)}',
    '.ix-body{padding:4px 16px 18px}',
    '.ix-lead{margin:0 0 12px;font-family:var(--serif);font-size:15.5px;line-height:1.55;color:var(--ink-2)}',
    '.ix-lead b{font-family:var(--disp);color:var(--ink)}',
    '.ix-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 10px}',
    '.ix-seg{display:inline-flex;flex-wrap:wrap;padding:2px;border-radius:9px;background:var(--surface-2);border:1px solid var(--rule)}',
    '.ix-seg button{min-height:36px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--ink-2);font:600 14px var(--disp);cursor:pointer}',
    '.ix-seg button[aria-pressed="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.12)}',
    '.ix-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}',
    '.ix-chips button{min-height:34px;padding:0 12px;border:1px solid var(--rule-2);border-radius:999px;background:transparent;color:var(--ink-2);font:500 14px var(--disp);cursor:pointer}',
    '.ix-chips button[aria-pressed="true"]{border-color:var(--acc-line);background:var(--acc-soft);color:var(--acc);font-weight:600}',
    '.ix-btn{min-height:38px;padding:0 14px;border:1px solid var(--acc-line);border-radius:9px;background:var(--acc-soft);color:var(--acc);font:600 14px var(--disp);cursor:pointer}',
    '.ix-btn:disabled{opacity:.5}',
    '.ix-plot{position:relative;border-radius:10px;background:var(--surface-2);border:1px solid var(--rule);overflow:hidden}',
    '.ix-svg{display:block;width:100%;-webkit-user-select:none;user-select:none}',
    '.ix-svg text{font-family:var(--disp);font-size:12px;fill:var(--ink-2)}',
    '.ix-svg .tk{font-family:var(--mono);font-size:10.5px;fill:var(--muted)}',
    '.ix-svg .lb{font-weight:600;fill:var(--ink);paint-order:stroke;stroke:var(--surface-2);stroke-width:3px;stroke-linejoin:round}',
    '.ix-svg .la{font-weight:700;fill:var(--acc);paint-order:stroke;stroke:var(--surface-2);stroke-width:3px;stroke-linejoin:round}',
    '.ix-svg .sm{font-size:10.5px}',
    '.ix-svg .grid{stroke:var(--rule);stroke-width:1;stroke-dasharray:2 4}',
    '.ix-svg .ax{stroke:var(--rule-2);stroke-width:1}',
    '.ix-svg .ln{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round}',
    '.ix-svg .ln.th{stroke-width:1}',
    '.ix-svg .ln.bd{stroke-width:2.6}',
    '.ix-svg .ln.dash{stroke-dasharray:5 4}',
    '.ix-svg .ln.dot{stroke-dasharray:1.5 3.5}',
    '.ix-svg .acc{stroke:var(--acc)}',
    '.ix-svg .fa{fill:var(--acc);fill-opacity:.14}',
    '.ix-svg .fi{fill:var(--ink)}',
    '.ix-svg .fs{fill:var(--surface)}',
    '.ix-svg .mk{fill:var(--surface);stroke:var(--acc);stroke-width:3}',
    '.ix-svg .hit{fill:transparent;cursor:pointer}',
    '.ix-sls{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px 10px;margin:12px 0 4px}',
    '.ix-sl{display:contents}',
    '.ix-sl span{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}',
    '.ix-sl input{width:100%;min-width:0;height:30px;margin:0;accent-color:var(--acc)}',
    '.ix-sl output{min-width:72px;text-align:right;font:600 14.5px var(--mono);color:var(--ink)}',
    '.ix-out{margin:12px 0 0;padding:14px;border-radius:10px;background:var(--surface-2);border:1px solid var(--rule)}',
    '.ix-out h4{margin:0 0 8px;font:700 17px/1.3 var(--disp);color:var(--ink)}',
    '.ix-out h4 small{display:block;font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--acc);margin-bottom:3px}',
    '.ix-out p{margin:6px 0 0;font-family:var(--serif);font-size:15px;line-height:1.55;color:var(--ink-2)}',
    '.ix-out p b{font-family:var(--disp);color:var(--ink)}',
    '.ix-kv{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:0 14px;margin:6px 0 0}',
    '.ix-kv dt{padding:7px 0;border-top:1px solid var(--rule);font-size:13.5px;color:var(--muted)}',
    '.ix-kv dd{margin:0;padding:7px 0;border-top:1px solid var(--rule);font-size:14.5px;color:var(--ink)}',
    '.ix-kv dd b{font:600 14.5px var(--mono)}',
    '.ix-kv dd small{display:block;font-size:12.5px;color:var(--muted);line-height:1.4;margin-top:2px}',
    '.ix-note{margin:10px 0 0;font-size:12.5px;line-height:1.45;color:var(--muted)}',
    '.ix-hint{margin:12px 0 0;padding:10px 12px;border-left:3px solid var(--acc-line);background:var(--surface);font-family:var(--serif);font-size:15px;line-height:1.5;color:var(--ink-2);border-radius:0 8px 8px 0}',
    '.ix-hint b{font-family:var(--disp);color:var(--ink)}',
    '.ix-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:8px 0 0;font-size:13px;color:var(--ink-2)}',
    '.ix-legend i{display:inline-block;width:12px;height:4px;border-radius:2px;margin-right:6px;vertical-align:3px}',
    '.ix-quiz{margin:14px 0 0;border-top:1px solid var(--rule);padding-top:8px}',
    '.ix-quiz summary{cursor:pointer;min-height:40px;display:flex;align-items:center;font:600 15px var(--disp);color:var(--ink);list-style:none}',
    '.ix-quiz summary::-webkit-details-marker{display:none}',
    '.ix-quiz summary:before{content:"";width:7px;height:7px;margin:0 10px 0 2px;border-right:2px solid var(--acc);border-bottom:2px solid var(--acc);transform:rotate(-45deg);transition:transform .2s}',
    '.ix-quiz[open] summary:before{transform:rotate(45deg)}',
    '.ix-qq,.ix-qmsg{margin:6px 0 10px;font-family:var(--serif);font-size:15.5px;line-height:1.5;color:var(--ink)}',
    '.ix-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}',
    '.ix-opt{min-height:44px;padding:8px 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:500 14.5px/1.35 var(--disp);text-align:left;cursor:pointer}',
    '.ix-opt.ok{border-color:var(--ok);background:var(--ok);color:var(--surface);font-weight:600}',
    '.ix-opt.no{border-color:#c0392b;color:#c0392b}',
    '.ix-why{margin:10px 0 0;font-family:var(--serif);font-size:15px;line-height:1.5;color:var(--ink-2)}',
    '.ix-qf{display:flex;align-items:center;gap:12px;margin-top:10px}',
    '.ix-score{font:600 12px var(--mono);color:var(--muted);letter-spacing:.06em}',
    '.ix-err{color:#b4451f;font-size:14px}',
    '.ix-tbl{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 0}',
    '.ix-tbl th,.ix-tbl td{padding:7px 8px;border-bottom:1px solid var(--rule);text-align:left;vertical-align:top}',
    '.ix-tbl th{font:600 12.5px var(--disp);color:var(--muted)}',
    '.ix-tbl tr.on td{background:var(--acc-soft)}',
    /* statikus SVG-ábrák a kidolgozásokban (figure.ixfig) */
    'figure.ixfig{margin:22px 0 0;padding:12px;background:var(--surface-2);border:1px solid var(--rule);border-radius:9px}',
    'figure.ixfig svg{display:block;width:100%;height:auto;max-height:520px;overflow:visible}',
    'figure.ixfig figcaption{margin-top:8px;font-family:var(--disp);font-size:12.5px;color:var(--muted);text-align:center;line-height:1.45}',
    'figure.ixfig text{font-family:var(--disp);font-size:13px;fill:var(--ink-2)}',
    'figure.ixfig .t-s{font-size:11px}',
    'figure.ixfig .t-l{font-size:15px}',
    'figure.ixfig .t-xl{font-size:17px;font-weight:700;fill:var(--ink)}',
    'figure.ixfig .fr{fill:var(--surface);stroke:var(--rule);stroke-width:1}',
    'figure.ixfig .t-m{font-family:var(--mono);font-size:11px;fill:var(--muted)}',
    'figure.ixfig .t-b{font-weight:700;fill:var(--ink)}',
    'figure.ixfig .t-a{font-weight:700;fill:var(--acc)}',
    'figure.ixfig .l{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round}',
    'figure.ixfig .l1{fill:none;stroke:var(--ink);stroke-width:1}',
    'figure.ixfig .la{fill:none;stroke:var(--acc);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}',
    'figure.ixfig .lm{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:4 4}',
    'figure.ixfig .g{stroke:var(--rule);stroke-width:1;stroke-dasharray:2 4}',
    'figure.ixfig .fa{fill:var(--acc);fill-opacity:.16}',
    'figure.ixfig .fa2{fill:var(--acc);fill-opacity:.32}',
    'figure.ixfig .fs{fill:var(--surface)}',
    'figure.ixfig .fk{fill:var(--ink)}',
    'figure.ixfig .fm{fill:var(--muted);fill-opacity:.25}',
    'figure.ixfig .c1{fill:var(--ix-1)}figure.ixfig .c2{fill:var(--ix-2)}figure.ixfig .c3{fill:var(--ix-3)}figure.ixfig .c4{fill:var(--ix-4)}figure.ixfig .c5{fill:var(--ix-5)}figure.ixfig .c6{fill:var(--ix-6)}',
    'figure.ixfig .s1{stroke:var(--ix-1)}figure.ixfig .s2{stroke:var(--ix-2)}figure.ixfig .s3{stroke:var(--ix-3)}figure.ixfig .s4{stroke:var(--ix-4)}figure.ixfig .s5{stroke:var(--ix-5)}figure.ixfig .s6{stroke:var(--ix-6)}',
    'figure.ixfig .o3{fill-opacity:.3}figure.ixfig .o5{fill-opacity:.55}',
    '@media (max-width:520px){.ix-body{padding:2px 12px 16px}.ix-sl output{min-width:60px}.ix-opts{grid-template-columns:1fr}}',
    '@media (prefers-reduced-motion:reduce){.ix-card *,.ix-quiz *{transition:none!important}}',
    '@media print{details.ix-card{display:block}}',
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('avix-css')) return;
    var st = document.createElement('style');
    st.id = 'avix-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  var ICON = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16.5h14"/><path d="M4 13.5 8 8.5l3 3 5-7"/><circle cx="16" cy="4.5" r="1.6" fill="currentColor"/></svg>';

  /* ------------------------------------------------------------------ */
  /* Beillesztés a tétel lapjára                                         */
  /* ------------------------------------------------------------------ */
  var openStore = U.store('open', {});

  function show(r, doc) {
    injectCSS();
    var list = (REG[r.id] || []).filter(function (it) { return DEF[it[0]]; });
    if (!list.length) return;
    var before = null;
    [].forEach.call(doc.children, function (el) {
      if (!before && el.classList.contains('secrule') && /Teljes kidolgozás/i.test(el.textContent)) before = el;
    });
    var rule = U.h('div', 'secrule ix-rule', '<span>Interaktív ábrák</span>');
    var sec = U.h('section', 'ix-sec');
    sec.setAttribute('aria-label', 'Interaktív ábrák');
    var opened = openStore.get();
    var cards = list.map(function (it, i) {
      var d = DEF[it[0]], o = it[1] || {};
      var title = o.title || d.title, sub = o.sub || d.sub || '';
      var key = r.id + ':' + it[0];
      var card = U.h('details', 'ix-card');
      card.innerHTML = '<summary><span class="ix-ico" aria-hidden="true">' + ICON + '</span><span class="ix-t"><b>' + U.esc(title) + '</b>' +
        (sub ? '<small>' + U.esc(sub) + '</small>' : '') + '</span><span class="chev"></span></summary><div class="ix-body"></div>';
      var body = card.querySelector('.ix-body');
      var mounted = false;
      function mount() {
        if (mounted || !card.open) return;
        mounted = true;
        try { d.mount(body, o, U, r); } catch (e) {
          body.innerHTML = '<p class="ix-err">Az interaktív ábra nem tölthető be (' + U.esc(e && e.message) + ').</p>';
        }
      }
      card.addEventListener('toggle', function () {
        var s = openStore.get(); s[key] = card.open; openStore.set(s);
        mount();
      });
      card.open = key in opened ? !!opened[key] : i === 0;
      sec.appendChild(card);
      return mount;
    });
    doc.insertBefore(rule, before);
    doc.insertBefore(sec, before);
    cards.forEach(function (m) { m(); });
  }

  window.AVIX = {
    def: function (name, d) { DEF[name] = d; },
    show: show,
    U: U,
    REG: REG,
  };
})();
