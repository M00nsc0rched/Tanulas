/*
 * Gépész záróvizsga tételtár — interaktív ábrák a technológiai tervezés és az NC-programozás
 * tételeihez (A/25–A/30). A/25: a tanszéki Gyártástechnológia II. jegyzet technológiai tervezés
 * fejezete; A/26–A/30: a tételtár kidolgozásai (ISO 6983 szerinti általános G-/M-kód logika).
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;

  /* ================================================================== */
  /* A/25 — tömegszerűségi mutató                                          */
  /* ================================================================== */
  var KSZ = [
    { max: 1, n: 'Tömeggyártás', o: 'folyamszerű', c: '--ix-5' },
    { max: 10, n: 'Nagysorozat', o: 'szakaszos folyamrendszerű', c: '--ix-1' },
    { max: 20, n: 'Középsorozat', o: 'csoportrendszerű', c: '--ix-3' },
    { max: 1e9, n: 'Egyedi és kissorozat', o: 'műhelyrendszerű', c: '--ix-2' },
  ];
  AVIX.def('tomeg', {
    title: 'Tömegszerűségi mutató',
    sub: 'K_s = q/t_n, q = I_m/Q → gyártási típus és gyártásszervezési forma',
    mount: function (el) {
      var st = U.store('tomeg', { Q: 20000, sh: 2, tn: 6 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A kibocsátási ütem (q) megmutatja, hány percenként kell egy darabnak elkészülnie; ha ez közel van a műveleti normaidőhöz, a gépek folyamatosan ugyanazt a műveletet végzik — tömeggyártás. <b>Állítsd a darabszámot, a műszakokat és a normaidőt.</b></p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.34 : 0.18; }, minH: 110, maxH: 150, label: 'K_s skála' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Darabszám Q', min: 1, max: 6, step: 0.05, value: Math.log(S.Q) / Math.LN10, fmt: function (v) { return fmt(Math.round(Math.pow(10, v)), 0) + ' db/év'; }, onInput: function (v) { S.Q = Math.round(Math.pow(10, v)); st.set(S); P.render(); } });
      U.slider(g, { label: 'Műszakok', min: 1, max: 3, step: 1, value: S.sh, dec: 0, onInput: function (v) { S.sh = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Normaidő t_n', min: 0.5, max: 60, step: 0.5, value: S.tn, unit: 'perc', dec: 1, onInput: function (v) { S.tn = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var Im = S.sh * 250 * 8 * 60, q = Im / S.Q, Ks = q / S.tn, sx = U.scale(0.1, 1000, 14, w - 14, true), o = '', lo = 0.1;
        KSZ.forEach(function (z) { var hi = Math.min(1000, z.max); o += '<rect x="' + sx(lo).toFixed(1) + '" y="30" width="' + (sx(hi) - sx(lo)).toFixed(1) + '" height="20" style="fill:var(' + z.c + ');fill-opacity:.35"/><text class="sm" x="' + ((sx(lo) + sx(hi)) / 2).toFixed(1) + '" y="24" text-anchor="middle">' + z.n.split(' ')[0] + '</text>'; lo = hi; });
        [0.1, 1, 10, 20, 100, 1000].forEach(function (t) { o += '<text class="tk" x="' + sx(t).toFixed(1) + '" y="66" text-anchor="middle">' + fmt(t, t < 1 ? 1 : 0) + '</text>'; });
        var x = sx(U.clamp(Ks, 0.1, 1000));
        o += '<path d="M' + x.toFixed(1) + ',54l-7,12h14z" style="fill:var(--ink)"/><line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="28" y2="52" style="stroke:var(--ink);stroke-width:2.5"/>';
        P.svg.innerHTML = o;
        var z = KSZ.filter(function (k) { return Ks <= k.max; })[0];
        out.innerHTML = '<h4><small>I_m = ' + S.sh + ' műszak × 250 nap × 8 h × 60 = ' + fmt(Im, 0) + ' perc/év · q = I_m/Q = ' + fmt(q, 2) + ' perc/db</small>K_s = q/t_n = ' + fmt(Ks, 2) + ' → ' + z.n + '</h4><p>Gyártásszervezés: <b>' + z.o + '</b>.</p>' +
          U.kv([['Egyedi és kissorozat', 'K_s > 20', 'műhelyrendszerű; egyetemes gépek, rövid dokumentáció'], ['Középsorozat', '10 < K_s < 20', 'csoportrendszerű'], ['Nagysorozat', '1 < K_s < 10', 'szakaszos folyamrendszerű'], ['Tömeggyártás', 'K_s ≤ 1', 'folyamszerű; célgépek, gyártósor, műveleti utasítás szintű dokumentáció']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/25 — gyártási folyamatszakaszok sorba rendezése                     */
  /* ================================================================== */
  var SZAK = ['Előgyártás', 'Nagyolás', 'Hőkezelés I. (nemesítés / feszültségmentesítés)', 'Félsimítás I. (IT11–12)', 'Hőkezelés II. (cementálás)', 'Félsimítás II. (a cementált réteg eltávolítása)', 'Hőkezelés III. (edzés)', 'Simítás I. (IT7–10)', 'Hőkezelés IV. (nitridálás)', 'Simítás II. (köszörülés)', 'Simítás III. (IT6–7)', 'Felületkezelés (krómozás, nikkelezés)', 'Befejező megmunkálás (Ra 0,04–0,08)'];
  AVIX.def('szakaszok', {
    title: 'Gyártási folyamatszakaszok sorrendje',
    sub: 'Rakd sorba a jegyzet mintasorát: nagyolás → hőkezelés → félsimítás → … → befejező megmunkálás',
    mount: function (el) {
      el.innerHTML = '<p class="ix-lead">Koppints a szakaszokra <b>a helyes sorrendben</b> (egy cementált, edzett, nitridált alkatrész a Gyártás II. jegyzet szerint). Hibás választásnál megmutatjuk, mi következett volna.</p>';
      var box = U.h('div', 'ix-row'); box.style.flexWrap = 'wrap'; box.style.gap = '8px'; el.appendChild(box);
      var list = U.h('ol'); list.style.margin = '12px 0 0 20px'; el.appendChild(list);
      var msg = U.h('p', 'ix-note'); el.appendChild(msg);
      var again = U.h('button', 'ix-btn', 'Újrakezdés'); again.type = 'button'; el.appendChild(again);
      var next = 0;
      function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
      function start() {
        next = 0; list.innerHTML = ''; msg.textContent = '';
        box.innerHTML = shuffle(SZAK.map(function (s, i) { return i; })).map(function (i) { return '<button type="button" class="ix-btn" data-i="' + i + '" style="min-height:40px">' + esc(SZAK[i]) + '</button>'; }).join('');
      }
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var i = +b.getAttribute('data-i');
        if (i === next) {
          b.remove(); var li = U.h('li', '', esc(SZAK[i])); list.appendChild(li); next++; msg.textContent = next === SZAK.length ? 'Kész! Megjegyzendő szabály: nagyolás → hőkezelés → simítás; minden torzító hőkezelés után újabb megmunkálás jön.' : '';
        } else { msg.textContent = 'Nem ez következik: a(z) ' + (next + 1) + '. szakasz „' + SZAK[next] + '”.'; b.style.borderColor = 'var(--ix-5)'; }
      });
      again.addEventListener('click', start);
      start();
    },
  });

  /* ================================================================== */
  /* A/26, A/29, A/30 — egyszerű NC-szimulátor (G17, G00–G03, G90/G91)    */
  /* ================================================================== */
  var PROGS = {
    kontur: { n: 'Kontúr egyenesekkel és ívekkel', t: '%_N_KONTUR_MPF\nN10 G17 G90 G54\nN20 T1 M6\nN30 S1200 M3\nN40 G00 X0 Y0\nN50 G01 X60 F300\nN60 G03 X80 Y20 I0 J20\nN70 G01 Y50\nN80 G03 X60 Y70 R20\nN90 G01 X0\nN100 Y0\nN110 G00 X-20 Y-20\nN120 M30' },
    novm: { n: 'Növekményes (G91) lépcső', t: 'N10 G17 G90 G54\nN20 G00 X10 Y10\nN30 G91 G01 X20 F200\nN40 Y10\nN50 X20\nN60 Y10\nN70 X20\nN80 G90 G00 X10 Y10\nN90 M30' },
    hibas: { n: 'Hibás körív (ellenőrzés!)', t: 'N10 G17 G90\nN20 G00 X0 Y0\nN30 G01 X40 F250\nN40 G02 X80 Y5 I20 J0\nN50 G01 Y-30\nN60 M30' },
  };
  function parseNC(src) {
    var st = { x: 0, y: 0, mode: 0, abs: true, f: 0 }, segs = [], errs = [], lines = src.split('\n');
    lines.forEach(function (raw, li) {
      var line = raw.replace(/\(.*?\)/g, '').replace(/;.*/, '').toUpperCase().trim();
      if (!line || line[0] === '%') return;
      var w = {}, re = /([A-Z])\s*(-?\d*\.?\d+)/g, m, gs = [];
      while ((m = re.exec(line))) { if (m[1] === 'G') gs.push(+m[2]); else w[m[1]] = +m[2]; }
      gs.forEach(function (g) { if (g <= 3) st.mode = g; else if (g === 90) st.abs = true; else if (g === 91) st.abs = false; });
      if (w.F != null) st.f = w.F;
      var hasMove = w.X != null || w.Y != null;
      if (!hasMove) return;
      var nx = w.X != null ? (st.abs ? w.X : st.x + w.X) : st.x, ny = w.Y != null ? (st.abs ? w.Y : st.y + w.Y) : st.y;
      var seg = { li: li, from: [st.x, st.y], to: [nx, ny], mode: st.mode, f: st.f };
      if (st.mode === 2 || st.mode === 3) {
        var cw = st.mode === 2, cx, cy;
        if (w.I != null || w.J != null) { cx = st.x + (w.I || 0); cy = st.y + (w.J || 0); }
        else if (w.R != null) {
          var dx = nx - st.x, dy = ny - st.y, d = Math.hypot(dx, dy), r = Math.abs(w.R);
          if (d > 2 * r + 1e-6) { errs.push('N-mondat ' + (li + 1) + '. sor: a sugár (R' + fmt(r, 2) + ') kisebb, mint a húr fele — a körív nem létezik.'); cx = (st.x + nx) / 2; cy = (st.y + ny) / 2; }
          else { var hh = Math.sqrt(r * r - d * d / 4), mx = (st.x + nx) / 2, my = (st.y + ny) / 2, s = (cw ? -1 : 1) * (w.R < 0 ? -1 : 1); cx = mx - s * hh * dy / d; cy = my + s * hh * dx / d; }
        } else { errs.push((li + 1) + '. sor: körívhez I/J vagy R kell.'); cx = st.x; cy = st.y; }
        var r0 = Math.hypot(st.x - cx, st.y - cy), r1 = Math.hypot(nx - cx, ny - cy);
        if (Math.abs(r0 - r1) > 0.01) errs.push((li + 1) + '. sor: a kezdőpont (' + fmt(r0, 2) + ') és a végpont (' + fmt(r1, 2) + ') nem egyforma távol van a középponttól — a vezérlés hibát jelezne.');
        seg.c = [cx, cy]; seg.r = r0; seg.cw = cw;
      }
      if (st.mode === 1 && !st.f) errs.push((li + 1) + '. sor: G01-hez előtolás (F) kell.');
      segs.push(seg); st.x = nx; st.y = ny;
    });
    return { segs: segs, errs: errs, lines: lines };
  }
  function arcPts(s) {
    var a0 = Math.atan2(s.from[1] - s.c[1], s.from[0] - s.c[0]), a1 = Math.atan2(s.to[1] - s.c[1], s.to[0] - s.c[0]), da = a1 - a0, pts = [];
    if (s.cw) { while (da >= 0) da -= 2 * Math.PI; } else { while (da <= 0) da += 2 * Math.PI; }
    if (Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1]) < 1e-9) da = s.cw ? -2 * Math.PI : 2 * Math.PI;
    for (var i = 0; i <= 40; i++) { var a = a0 + da * i / 40; pts.push([s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)]); }
    return pts;
  }
  AVIX.def('ncsim', {
    title: 'NC-program szimulátor (G17 síkban)',
    sub: 'G00 gyorsmenet · G01 egyenes · G02/G03 körív (I, J vagy R) · G90/G91 · mondatonkénti léptetés és ellenőrzés',
    mount: function (el, opt) {
      var st = U.store('ncsim.' + (opt.prog || 'kontur'), { p: opt.prog || 'kontur', step: 99 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Írd át vagy válaszd ki a programot: a szimulátor a programozott pont pályáját rajzolja (szaggatott: G00 gyorsmenet, folytonos: G01–G03 munkamenet). <b>Léptesd mondatonként</b>, és figyeld a hibajelzéseket — ez a programellenőrzés (grafikus szimuláció) lényege.</p>';
      var chips = U.chips(el, Object.keys(PROGS).map(function (k) { return [k, PROGS[k].n]; }), S.p, function (v) { S.p = v; S.step = 99; ta.value = PROGS[v].t; st.set(S); run(); }, 'Mintaprogram');
      var ta = U.h('textarea'); ta.spellcheck = false; ta.value = (PROGS[S.p] || PROGS.kontur).t; ta.setAttribute('aria-label', 'NC-program');
      ta.style.cssText = 'width:100%;box-sizing:border-box;min-height:150px;margin-top:10px;padding:10px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:14px/1.45 var(--mono)';
      el.appendChild(ta);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.5; }, minH: 240, maxH: 380, label: 'Szerszámpálya' });
      var g = U.sliders(el), sl = U.slider(g, { label: 'Mondat', min: 0, max: 20, step: 1, value: S.step, dec: 0, onInput: function (v) { S.step = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var R = null;
      function run() { R = parseNC(ta.value); sl.input.max = R.segs.length; if (S.step > R.segs.length) S.step = R.segs.length; sl.set(S.step, true); P.render(); }
      ta.addEventListener('input', function () { chips.set(''); run(); });
      P.draw = function (w, h) {
        if (!R) return;
        var xs = [0], ys = [0];
        R.segs.forEach(function (s) { var pp = s.c ? arcPts(s) : [s.from, s.to]; pp.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var k = Math.min((w - 50) / Math.max(1, x1 - x0), (h - 50) / Math.max(1, y1 - y0)), ox = 25 - x0 * k + ((w - 50) - (x1 - x0) * k) / 2, oy = h - 25 + y0 * k - ((h - 50) - (y1 - y0) * k) / 2;
        function X(v) { return (ox + v * k).toFixed(1); } function Y(v) { return (oy - v * k).toFixed(1); }
        var o = '<path d="M' + X(x0 - 5) + ',' + Y(0) + 'H' + X(x1 + 5) + 'M' + X(0) + ',' + Y(y0 - 5) + 'V' + Y(y1 + 5) + '" class="grid"/>';
        o += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="6" style="fill:none;stroke:var(--ix-5);stroke-width:2"/><path d="M' + X(0) + ',' + Y(0) + 'm-8,0h16m-8,-8v16" style="stroke:var(--ix-5);stroke-width:1.5"/><text class="lb sm" x="' + (+X(0) + 9) + '" y="' + (+Y(0) + 14) + '" style="fill:var(--ix-5)">W</text>';
        R.segs.forEach(function (s, i) {
          if (i >= S.step) return;
          var pp = s.c ? arcPts(s) : [s.from, s.to], cur = i === S.step - 1;
          o += '<path d="M' + pp.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join('L') + '" style="fill:none;stroke:' + (s.mode === 0 ? 'var(--muted)' : 'var(--acc)') + ';stroke-width:' + (cur ? 3.5 : 2.2) + ';stroke-dasharray:' + (s.mode === 0 ? '6 4' : 'none') + '"/>';
          if (s.c && cur) o += '<circle cx="' + X(s.c[0]) + '" cy="' + Y(s.c[1]) + '" r="3" style="fill:var(--ix-2)"/><path d="M' + X(s.c[0]) + ',' + Y(s.c[1]) + 'L' + X(s.from[0]) + ',' + Y(s.from[1]) + 'M' + X(s.c[0]) + ',' + Y(s.c[1]) + 'L' + X(s.to[0]) + ',' + Y(s.to[1]) + '" style="stroke:var(--ix-2);stroke-dasharray:3 3"/>';
        });
        var last = S.step > 0 ? R.segs[S.step - 1] : null, p = last ? last.to : [0, 0];
        o += '<circle class="mk" cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="6"/>';
        P.svg.innerHTML = o;
        var lineTxt = last ? esc(R.lines[last.li].trim()) : '—', mname = last ? ['G00 gyorsmenet (pontvezérlés: csak a végpont számít)', 'G01 egyenes interpoláció F előtolással', 'G02 körív az óramutató járásával egyezően', 'G03 körív az óramutatóval ellentétesen'][last.mode] : 'kiinduló helyzet';
        out.innerHTML = '<h4><small>' + S.step + '/' + R.segs.length + '. mozgásmondat · ' + mname + '</small>' + lineTxt + '</h4>' +
          U.kv([['A programozott pont', 'X ' + fmt(p[0], 3) + ' · Y ' + fmt(p[1], 3)], ['Körív', last && last.c ? 'középpont X ' + fmt(last.c[0], 2) + ', Y ' + fmt(last.c[1], 2) + ' · R = ' + fmt(last.r, 2) : '—']]) +
          (R.errs.length ? '<p class="ix-note">' + R.errs.map(esc).join('<br>') + '</p>' : '<p class="ix-hint">Nincs geometriai hiba. A valódi ellenőrzésnél a szerszámkorrekciót (G41/G42), a biztonsági síkot és az ütközést is vizsgálni kell (szárazfutás, grafikus szimuláció).</p>');
      };
      run();
    },
  });

  /* ================================================================== */
  /* A/27 — gépi nullpont, referenciapont, munkadarab-nullpont (G54)      */
  /* ================================================================== */
  AVIX.def('nullpont', {
    title: 'Nullpontok és nullponteltolás',
    sub: 'M gépi nullpont · R referenciapont · W munkadarab-nullpont (G54) · P programozott pont',
    mount: function (el) {
      var st = U.store('nullpont', { wx: 220, wy: 120, px: 40, py: 30 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Marógép asztala felülnézetben. A gépi nullpont (M) rögzített, a referenciapont (R) a mérőrendszer bekapcsolás utáni felvételének helye. A munkadarab-nullpontot (W) a programozó választja; a G54 eltolás adja meg a helyét M-hez képest. <b>Húzd a munkadarabot</b> (W), a program ugyanaz marad — a vezérlés számolja át a gépi koordinátákat.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.7 : 0.45; }, minH: 230, maxH: 340, label: 'Nullpontok' });
      var g = U.sliders(el);
      U.slider(g, { label: 'P a W-hez képest: X', min: 0, max: 100, step: 1, value: S.px, unit: 'mm', dec: 0, onInput: function (v) { S.px = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'P a W-hez képest: Y', min: 0, max: 60, step: 1, value: S.py, unit: 'mm', dec: 0, onInput: function (v) { S.py = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var k, ox, oy, TW = 500, TH = 300;
      P.draw = function (w, h) {
        k = Math.min((w - 40) / TW, (h - 40) / TH); ox = 20; oy = h - 20;
        function X(v) { return (ox + v * k).toFixed(1); } function Y(v) { return (oy - v * k).toFixed(1); }
        var o = '<rect x="' + X(0) + '" y="' + Y(TH) + '" width="' + (TW * k) + '" height="' + (TH * k) + '" style="fill:var(--ix-8);fill-opacity:.15;stroke:var(--ink)"/>';
        for (var t = 50; t < TH; t += 50) o += '<path d="M' + X(0) + ',' + Y(t) + 'H' + X(TW) + '" class="grid"/>';
        // munkadarab
        o += '<rect x="' + X(S.wx) + '" y="' + Y(S.wy + 60) + '" width="' + (100 * k) + '" height="' + (60 * k) + '" style="fill:var(--ix-2);fill-opacity:.3;stroke:var(--ix-2);stroke-width:1.5;cursor:move"/>';
        function mark(x, y, lab, col) { return '<circle cx="' + X(x) + '" cy="' + Y(y) + '" r="7" style="fill:var(--surface);stroke:var(' + col + ');stroke-width:2.5"/><text class="lb sm" x="' + (+X(x) + 10) + '" y="' + (+Y(y) - 8) + '" style="fill:var(' + col + ')">' + lab + '</text>'; }
        o += '<path d="M' + X(0) + ',' + Y(0) + 'L' + X(S.wx) + ',' + Y(S.wy) + '" style="stroke:var(--ix-5);stroke-dasharray:5 4;stroke-width:1.5"/><text class="la sm" x="' + X(S.wx / 2) + '" y="' + (+Y(S.wy / 2) - 6) + '">G54</text>';
        o += '<path d="M' + X(S.wx) + ',' + Y(S.wy) + 'L' + X(S.wx + S.px) + ',' + Y(S.wy + S.py) + '" style="stroke:var(--ix-1);stroke-width:2"/>';
        o += mark(0, 0, 'M (gépi nullpont)', '--ix-5') + mark(TW - 20, TH - 20, 'R', '--ix-4') + mark(S.wx, S.wy, 'W', '--ix-2') + mark(S.wx + S.px, S.wy + S.py, 'P', '--ix-1');
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>programban (W-hez képest): X' + S.px + ' Y' + S.py + '</small>Gépi koordináta: X ' + (S.wx + S.px) + ' · Y ' + (S.wy + S.py) + '</h4>' +
          U.kv([['G54 nullponteltolás', 'X ' + S.wx + ' · Y ' + S.wy, 'a W helye az M-hez képest — a munkadarab felfogása után mérik be (G54–G57: több felfogás)'], ['M — gépi nullpont', 'a gyártó rögzíti', 'a gépi koordináta-rendszer origója, nem változtatható'], ['R — referenciapont', 'bekapcsolás után felvett pont', 'ezzel „találja meg” a vezérlés a gépi koordinátákat (inkrementális mérőrendszernél)'], ['W — munkadarab-nullpont', 'a programozó választja', 'lehetőleg a rajzi méretezés bázisán, hogy a méretek átszámítás nélkül programozhatók legyenek']]);
      };
      P.drag(function (x, y) { S.wx = Math.round(U.clamp((x - ox) / k - 50, 0, TW - 100)); S.wy = Math.round(U.clamp((oy - y) / k - 30, 0, TH - 60)); st.set(S); P.draw(P.w, P.h); });
      P.render();
    },
  });

  /* ================================================================== */
  /* A/28 — szerszámsugár-korrekció G41/G42                                */
  /* ================================================================== */
  AVIX.def('korr', {
    title: 'Szerszámsugár-korrekció: G41 / G42',
    sub: 'A programozott kontúr és a szerszámközéppont pályája · rávezetés, elvezetés · belső sarok',
    mount: function (el) {
      var st = U.store('korr', { g: 41, r: 6, dir: 'ccw' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A programban a kész kontúrt írjuk le; a vezérlés a szerszámközéppontot a sugárral eltolva vezeti. <b>G41</b>: a szerszám a haladási irányba nézve a kontúrtól <b>balra</b>, <b>G42</b>: jobbra halad. Váltsd a korrekciót és a körüljárási irányt: ugyanaz a kontúr egyszer kívülről, egyszer belülről lesz megmunkálva.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['41', 'G41 (bal)'], ['42', 'G42 (jobb)'], ['40', 'G40 (nincs)']], String(S.g), function (v) { S.g = +v; st.set(S); P.render(); }, 'Korrekció');
      U.seg(r1, [['ccw', 'Óramutatóval ellentétes'], ['cw', 'Óramutatóval egyező']], S.dir, function (v) { S.dir = v; st.set(S); P.render(); }, 'Körüljárás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.5; }, minH: 240, maxH: 360, label: 'Sugárkorrekció' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Szerszámsugár D', min: 1, max: 14, step: 0.5, value: S.r, unit: 'mm', dec: 1, onInput: function (v) { S.r = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var BASE = [[0, 0], [80, 0], [80, 30], [55, 30], [55, 55], [0, 55]]; // L alakú kontúr (belső sarokkal)
      function offset(poly, d) { // egyszerű sarokmetszéses eltolás (bal oldalra d > 0)
        var n = poly.length, lines = [], res = [];
        for (var i = 0; i < n; i++) { var a = poly[i], b = poly[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * d, ny = dx / L * d; lines.push([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]]); }
        for (i = 0; i < n; i++) {
          var l1 = lines[(i - 1 + n) % n], l2 = lines[i], x1 = l1[0][0], y1 = l1[0][1], x2 = l1[1][0], y2 = l1[1][1], x3 = l2[0][0], y3 = l2[0][1], x4 = l2[1][0], y4 = l2[1][1];
          var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
          if (Math.abs(den) < 1e-9) { res.push(l2[0]); continue; }
          var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den; res.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
        }
        return res;
      }
      P.draw = function (w, h) {
        var poly = S.dir === 'ccw' ? BASE.slice() : BASE.slice().reverse(), r = S.r, left = S.g === 41 ? 1 : S.g === 42 ? -1 : 0;
        var k = Math.min((w - 40) / 110, (h - 40) / 85), ox = 20 + 15 * k, oy = h - 20 - 15 * k;
        function X(v) { return (ox + v * k).toFixed(1); } function Y(v) { return (oy - v * k).toFixed(1); }
        var o = '<path d="M' + poly.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join('L') + 'Z" style="fill:var(--ix-8);fill-opacity:.25;stroke:var(--ink);stroke-width:2"/>';
        // haladási irány nyilak
        poly.forEach(function (a, i) { var b = poly[(i + 1) % poly.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]); o += '<path d="M' + X(mx) + ',' + Y(my) + 'l' + (-8 * Math.cos(ang - 0.4)).toFixed(1) + ',' + (8 * Math.sin(ang - 0.4)).toFixed(1) + 'M' + X(mx) + ',' + Y(my) + 'l' + (-8 * Math.cos(ang + 0.4)).toFixed(1) + ',' + (8 * Math.sin(ang + 0.4)).toFixed(1) + '" style="stroke:var(--ink);stroke-width:1.6"/>'; });
        var path = left ? offset(poly, left * r) : poly;
        o += '<path d="M' + path.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join('L') + 'Z" style="fill:none;stroke:var(--acc);stroke-width:2;stroke-dasharray:' + (left ? '6 4' : 'none') + '"/>';
        // szerszám néhány helyzetben
        path.forEach(function (p, i) { if (i % 2) return; o += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="' + (r * k).toFixed(1) + '" style="fill:var(--ix-1);fill-opacity:.25;stroke:var(--ix-1)"/><circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="2.5" style="fill:var(--acc)"/>'; });
        P.svg.innerHTML = o;
        // külső vagy belső megmunkálás? (ccw + bal = belül, ccw + jobb = kívül)
        var inside = (S.dir === 'ccw' && left === 1) || (S.dir === 'cw' && left === -1), innerCorner = 25; // a belső sarok miatt a legnagyobb sugár
        out.innerHTML = '<h4><small>G' + (S.g < 10 ? '0' : '') + S.g + ' · D = ' + fmt(r, 1) + ' mm · ' + (S.dir === 'ccw' ? 'óramutatóval ellentétes' : 'óramutatóval egyező') + ' körüljárás</small>' + (left ? 'A szerszámközéppont a kontúr ' + (inside ? 'belsejében' : 'külsején') + ' halad' : 'Korrekció nélkül a szerszámközéppont a kontúron megy — a darab a sugárral kisebb/nagyobb lesz!') + '</h4>' +
          '<p>' + (left ? 'A kontúr tehát ' + (inside ? '<b>belülről</b> (zseb, belső kontúr)' : '<b>kívülről</b> (sziget, külső kontúr)') + ' készül. A korrekciót G0/G1 rávezető mondatban kell bekapcsolni és G40-nel, elvezető mondatban kikapcsolni.' : 'G40-nél a programozott pont maga a szerszámközéppont.') + '</p>' +
          (left && inside && r > innerCorner / 2 ? '<p class="ix-note">Túl nagy szerszámsugár: a belső szűkületbe már nem fér be — a vezérlés kontúrsértést jelezne.</p>' : '') +
          '<p class="ix-hint">Ökölszabály: egyenirányú maráshoz külső kontúron (óramutatóval egyező körüljárásnál) G41 kell. A korrekció értékét (D) a szerszám bemérésekor tárolják; a kopás külön korrekciós értékkel állítható.</p>';
      };
      P.render();
    },
  });
})();
