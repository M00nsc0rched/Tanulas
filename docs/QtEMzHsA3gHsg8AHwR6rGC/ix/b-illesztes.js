/*
 * Gépész záróvizsga tételtár — interaktív ábrák a B/15, B/19 és B/20 tételekhez
 * (illesztés, méretlánc, válogató párosítás; gördülőcsapágyak szerelése; kötések).
 * Források: a Szereléstechnológia tárgy előadásai (tűréstechnika, méretláncok, csapágyszerelés, kötések),
 * Gyártás 2 (Szigeti). Az ISO 286 alapeltérések és tűrésfokozatok 1–250 mm között táblázatból számolva.
 * Az ábrák saját rajzok; a csapágy-, csavar- és sajtolt kötési adatok tájékoztató értékek, a szöveg jelzi.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;
  var RAD = Math.PI / 180;

  /* ------------------------------------------------------------------ */
  /* ISO 286 — tűrésfokozat és alapeltérés (µm), 1–250 mm                */
  /* ------------------------------------------------------------------ */
  var ISO = (function () {
    var LIM = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250];
    var IT = {
      5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20], 6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29], 7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46],
      8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72], 9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115],
    };
    var UP = { d: [-20, -30, -40, -50, -65, -80, -100, -120, -145, -170], e: [-14, -20, -25, -32, -40, -50, -60, -72, -85, -100], f: [-6, -10, -13, -16, -20, -25, -30, -36, -43, -50], g: [-2, -4, -5, -6, -7, -9, -10, -12, -14, -15] };
    var LO = { k: [0, 1, 1, 1, 2, 2, 2, 3, 3, 4], m: [2, 4, 6, 7, 8, 9, 11, 13, 15, 17], n: [4, 8, 10, 12, 15, 17, 20, 23, 27, 31], p: [6, 12, 15, 18, 22, 26, 32, 37, 43, 50] };
    // r és s 50 mm felett finomabb lépcsőkkel
    var FINE = [65, 80, 100, 120, 140, 160, 180, 200, 225, 250];
    var R = { a: [10, 15, 19, 23, 28, 34], b: [41, 43, 51, 54, 63, 65, 68, 77, 80, 84] }, S = { a: [14, 19, 23, 28, 35, 43], b: [53, 59, 71, 79, 92, 100, 108, 122, 130, 140] };
    function idx(d) { for (var i = 0; i < LIM.length; i++) if (d <= LIM[i]) return i; return LIM.length - 1; }
    function range(d) { var i = idx(d); return (i ? LIM[i - 1] : 1) + '–' + LIM[i]; }
    function it(g, d) { return IT[g][idx(d)]; }
    function fine(tab, d) { if (d <= 50) return tab.a[idx(d)]; for (var i = 0; i < FINE.length; i++) if (d <= FINE[i]) return tab.b[i]; return tab.b[tab.b.length - 1]; }
    // csap: [es, ei]
    function shaft(l, g, d) {
      var T = it(g, d), i = idx(d);
      if (l === 'h') return [0, -T];
      if (l === 'js') return [T / 2, -T / 2];
      if (UP[l]) return [UP[l][i], UP[l][i] - T];
      var ei = l === 'k' ? (g <= 7 ? LO.k[i] : 0) : l === 'r' ? fine(R, d) : l === 's' ? fine(S, d) : LO[l][i];
      return [ei + T, ei];
    }
    // furat: [ES, EI] — K, M, N (IT ≤ 8) és P (IT ≤ 7) a Δ-szabállyal
    function hole(L, g, d) {
      var T = it(g, d), i = idx(d), l = L.toLowerCase();
      if (L === 'H') return [T, 0];
      if (L === 'JS') return [T / 2, -T / 2];
      if (UP[l]) return [-UP[l][i] + T, -UP[l][i]];
      var D = d > 3 && g > 5 ? it(g, d) - it(g - 1, d) : 0, sh = shaft(l, g, d)[1];
      var ES = L === 'K' ? -sh + (g <= 8 ? D : 0) : (L === 'P' ? -sh + (g <= 7 ? D : 0) : -sh + (g <= 8 ? D : 0));
      return [ES, ES - T];
    }
    function parse(s) { var m = /^([A-Za-z]+)(\d)$/.exec(s); return [m[1], +m[2]]; }
    return { idx: idx, range: range, it: it, shaft: shaft, hole: hole, parse: parse };
  })();

  // standard normális eloszlásfüggvény (Abramowitz–Stegun)
  function ncdf(x) {
    var t = 1 / (1 + 0.2316419 * Math.abs(x)), dd = 0.3989423 * Math.exp(-x * x / 2);
    var p = dd * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }
  function um(v) { return (v > 0 ? '+' : '') + fmt(v, 0); }
  function arrowV(x, y1, y2, col, lab, right) {
    var o = '<line x1="' + x + '" x2="' + x + '" y1="' + y1.toFixed(1) + '" y2="' + y2.toFixed(1) + '" style="stroke:' + col + ';stroke-width:1.6"/>';
    [[y1, y2], [y2, y1]].forEach(function (p) { var dir = p[1] > p[0] ? 1 : -1; o += '<path d="M' + x + ',' + p[0].toFixed(1) + 'l-4,' + (6 * dir) + 'l8,0Z" style="fill:' + col + '"/>'; });
    if (lab) o += '<text class="lb sm" x="' + (x + (right ? 6 : -6)) + '" y="' + ((y1 + y2) / 2 + 4).toFixed(1) + '"' + (right ? '' : ' text-anchor="end"') + ' style="fill:' + col + '">' + lab + '</text>';
    return o;
  }

  /* ================================================================== */
  /* B/15 — ISO illesztés: játék, fedés, jelleg                           */
  /* ================================================================== */
  var FITS = {
    H: [['H7/f7', 'laza'], ['H7/g6', 'laza, pontos'], ['H7/h6', 'laza, csúszó'], ['H8/e8', 'bő laza'], ['H7/js6', 'átmeneti'], ['H7/k6', 'átmeneti'], ['H7/n6', 'átmeneti, szoros'], ['H7/p6', 'szilárd, könnyű'], ['H7/r6', 'szilárd'], ['H7/s6', 'szilárd, erős']],
    h: [['F7/h6', 'laza'], ['G7/h6', 'laza, pontos'], ['H7/h6', 'laza, csúszó'], ['JS7/h6', 'átmeneti'], ['K7/h6', 'átmeneti'], ['M7/h6', 'átmeneti'], ['N7/h6', 'átmeneti, szoros'], ['P7/h6', 'szilárd, könnyű']],
  };
  AVIX.def('illesztes', {
    title: 'ISO illesztés: játék, fedés, illesztési tűrés',
    sub: 'Válassz névleges méretet és ajánlott illesztést — laza, átmeneti vagy szilárd?',
    mount: function (el) {
      var st = U.store('illesztes', { d: 40, sys: 'H', fit: 'H7/k6' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A tűrésmező helyzetét az <b>alapeltérés</b> (betű), szélességét a <b>tűrésfokozat</b> (szám) adja. Alaplyuk-rendszerben a furat mindig <b>H</b>, alapcsap-rendszerben a csap mindig <b>h</b>. Nézd meg, hogyan lesz a két tűrésmező helyzetéből játék vagy fedés.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['H', 'Alaplyuk (H)'], ['h', 'Alapcsap (h)']], S.sys, function (v) { S.sys = v; S.fit = FITS[v][v === 'H' ? 5 : 4][0]; st.set(S); chips(); P.render(); }, 'Rendszer');
      var cw = U.h('div'); el.appendChild(cw);
      function chips() { cw.innerHTML = ''; U.chips(cw, FITS[S.sys].map(function (f) { return [f[0], f[0]]; }), S.fit, function (v) { S.fit = v; st.set(S); P.render(); }, 'Illesztés'); }
      chips();
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.82 : 0.46; }, minH: 250, maxH: 360, label: 'Tűrésmezők az alapvonalhoz képest' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Névleges méret d', min: 4, max: 250, step: 1, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var pr = S.fit.split('/'), hp = ISO.parse(pr[0]), sp = ISO.parse(pr[1]);
        var H = ISO.hole(hp[0], hp[1], S.d), C = ISO.shaft(sp[0], sp[1], S.d);
        var vals = [0, H[0], H[1], C[0], C[1]], lo = Math.min.apply(0, vals), hi = Math.max.apply(0, vals), pad = Math.max(6, (hi - lo) * 0.18);
        var top = 26, bot = h - 22, sy = U.scale(lo - pad, hi + pad, bot, top), narrow = w < 520;
        var x0 = narrow ? 56 : w * 0.2, bw = narrow ? Math.min(78, (w - 150) / 2) : Math.min(120, w * 0.16), gap = narrow ? 20 : 46, xh = x0, xc = x0 + bw + gap, o = '';
        // tengely µm-ben
        var step = (hi - lo + 2 * pad) > 120 ? 20 : (hi - lo + 2 * pad) > 60 ? 10 : 5;
        for (var t = Math.ceil((lo - pad) / step) * step; t <= hi + pad; t += step) o += '<line class="grid" x1="' + (x0 - 8) + '" x2="' + (w - 10) + '" y1="' + sy(t).toFixed(1) + '" y2="' + sy(t).toFixed(1) + '"/><text class="tk" x="' + (x0 - 12) + '" y="' + (sy(t) + 3.5).toFixed(1) + '" text-anchor="end">' + um(t) + '</text>';
        o += '<text class="tk" x="' + (x0 - 12) + '" y="14" text-anchor="end">µm</text>';
        o += '<line x1="' + (x0 - 8) + '" x2="' + (w - 10) + '" y1="' + sy(0).toFixed(1) + '" y2="' + sy(0).toFixed(1) + '" style="stroke:var(--ink);stroke-width:1.6"/><text class="tk" x="' + (w - 12) + '" y="14" text-anchor="end">0 = alapvonal (d = ' + S.d + ' mm)</text>';
        function box(x, v, col, lab) {
          var y1 = sy(v[0]), y2 = sy(v[1]);
          return '<rect x="' + x + '" y="' + y1.toFixed(1) + '" width="' + bw + '" height="' + Math.max(2, y2 - y1).toFixed(1) + '" rx="3" style="fill:' + col + ';fill-opacity:.35;stroke:' + col + ';stroke-width:1.6"/>' +
            '<text class="lb" x="' + (x + bw / 2) + '" y="' + (y1 - 6).toFixed(1) + '" text-anchor="middle">' + lab + '</text>' +
            '<text class="tk" x="' + (x + bw / 2) + '" y="' + ((y1 + y2) / 2 + 4).toFixed(1) + '" text-anchor="middle">T = ' + fmt(v[0] - v[1], 0) + '</text>';
        }
        o += box(xh, H, 'var(--ix-1)', 'furat ' + pr[0]) + box(xc, C, 'var(--ix-3)', 'csap ' + pr[1]);
        var NJ = H[0] - C[1], KJ = H[1] - C[0], xa = xc + bw + (narrow ? 12 : 26);
        if (NJ > 0) o += arrowV(xa, sy(C[1]), sy(H[0]), 'var(--ix-2)', 'NJ ' + fmt(NJ, 0), true);
        if (KJ < 0) o += arrowV(xa + (narrow ? 40 : 64), sy(H[1]), sy(C[0]), 'var(--ix-5)', 'NF ' + fmt(-KJ, 0), true);
        else o += arrowV(xa + (narrow ? 40 : 64), sy(C[0]), sy(H[1]), 'var(--ix-4)', 'KJ ' + fmt(KJ, 0), true);
        P.svg.innerHTML = o;
        var kind = KJ >= 0 ? 'Laza illesztés — mindig játék' : NJ <= 0 ? 'Szilárd illesztés — mindig fedés' : 'Átmeneti illesztés — játék vagy fedés';
        var Till = (H[0] - H[1]) + (C[0] - C[1]);
        var rows = [['Furat ' + pr[0], 'ES = ' + um(H[0]) + ' µm, EI = ' + um(H[1]) + ' µm', 'FH = ' + fmt(S.d + H[0] / 1000, 3) + ' mm, AH = ' + fmt(S.d + H[1] / 1000, 3) + ' mm'],
          ['Csap ' + pr[1], 'es = ' + um(C[0]) + ' µm, ei = ' + um(C[1]) + ' µm', 'FH = ' + fmt(S.d + C[0] / 1000, 3) + ' mm, AH = ' + fmt(S.d + C[1] / 1000, 3) + ' mm'],
          ['Illesztés tűrése', 'T<sub>ill</sub> = ' + fmt(Till, 0) + ' µm', 'T<sub>fy</sub> + T<sub>cs</sub> — tartomány: ' + ISO.range(S.d) + ' mm']];
        if (KJ >= 0) rows.push(['Játék', 'NJ = ' + fmt(NJ, 0) + ' µm, KJ = ' + fmt(KJ, 0) + ' µm', 'közepes játék J<sub>k</sub> = ' + fmt((NJ + KJ) / 2, 1) + ' µm']);
        else if (NJ <= 0) rows.push(['Fedés', 'NF = ' + fmt(-KJ, 0) + ' µm, KF = ' + fmt(-NJ, 0) + ' µm', 'közepes fedés F<sub>k</sub> = ' + fmt(-(NJ + KJ) / 2, 1) + ' µm']);
        else {
          var m = (NJ + KJ) / 2, sg = Math.sqrt(Math.pow((H[0] - H[1]) / 6, 2) + Math.pow((C[0] - C[1]) / 6, 2)), pj = ncdf(m / sg);
          rows.push(['Szélső értékek', 'NJ = ' + fmt(NJ, 0) + ' µm, NF = ' + fmt(-KJ, 0) + ' µm', 'közepes érték: ' + (m >= 0 ? 'játék ' : 'fedés ') + fmt(Math.abs(m), 1) + ' µm']);
          rows.push(['Valószínűség', 'kb. ' + fmt(pj * 100, 0) + ' % játékos', 'ha a méretek a tűrésmező közepe körül normális eloszlásúak (±3σ = T/2) — becslés']);
        }
        out.innerHTML = '<h4><small class="nc">' + S.fit + ' · ' + (FITS[S.sys].filter(function (f) { return f[0] === S.fit; })[0] || ['', ''])[1] + '</small>' + kind + '</h4>' + U.kv(rows) +
          '<p class="ix-note">A szabványos illesztéseknél a csap általában egy fokozattal finomabb, mint a furat (H7/k6). Nagyobb méretnél ugyanaz a betű–szám pár nagyobb µm-értéket jelent — húzd a méretet!</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/15 — méretlánc: teljes, részleges cserélhetőség, kompenzátor        */
  /* ================================================================== */
  var ML = [
    { n: 'A1 ház belső hossza', nom: 99.5, dir: 1, T: 0.10 },
    { n: 'A2 csapágy (bal)', nom: 17, dir: -1, T: 0.12 },
    { n: 'A3 távtartó hüvely', nom: 65, dir: -1, T: 0.10 },
    { n: 'A4 csapágy (jobb)', nom: 17, dir: -1, T: 0.12 },
  ];
  AVIX.def('meretlanc', {
    title: 'Méretlánc: a záró tag (axiális hézag) szórása',
    sub: 'Négy lánctag, egy záró tag — teljes cserélhetőség, valószínűségi méretezés vagy álló kompenzátor',
    mount: function (el) {
      var st = U.store('meretlanc', { T: [0.10, 0.12, 0.10, 0.12], lo: 0.25, hi: 0.75, m: 'teljes', Tk: 0.02 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A tengely két csapágya és a távtartó a ház furatában ül; a záró tag az <b>A0 axiális hézag</b> a fedél előtt: A0 = A1 − A2 − A3 − A4 (névlegesen 0,5 mm). A tagok tűrése <b>összegződik</b>. Állítsd a tűréseket, és válassz megoldási módszert.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['teljes', 'Teljes cserélhetőség'], ['resz', 'Részleges (valószínűségi)'], ['komp', 'Álló kompenzátor']], S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Módszer');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1.0 : 0.56; }, minH: 320, maxH: 440, label: 'Méretlánc és a záró tag eloszlása' });
      var g = U.sliders(el);
      ML.forEach(function (m, i) { U.slider(g, { label: 'Tűrés ' + m.n.split(' ')[0], min: 0.02, max: 0.3, step: 0.01, value: S.T[i], unit: 'mm', dec: 2, onInput: function (v) { S.T[i] = v; st.set(S); P.render(); } }); });
      U.slider(g, { label: 'Előírt A0 min', min: 0.1, max: 0.5, step: 0.05, value: S.lo, unit: 'mm', dec: 2, onInput: function (v) { S.lo = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Előírt A0 max', min: 0.5, max: 0.9, step: 0.05, value: S.hi, unit: 'mm', dec: 2, onInput: function (v) { S.hi = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var sumT = 0, sq = 0, nom = 0, o = '', narrow = w < 520;
        ML.forEach(function (m, i) { sumT += S.T[i]; sq += S.T[i] * S.T[i]; nom += m.dir * m.nom; });
        var Treq = S.hi - S.lo, rss = Math.sqrt(sq), mid = (S.lo + S.hi) / 2;
        // kompenzátor: a lemezt középre válogatjuk
        var komp = S.m === 'komp', step = Math.max(0.005, Treq - S.Tk), ncls = Math.max(1, Math.ceil(sumT / step));
        var center = komp ? mid : nom, wc = komp ? Treq : (S.m === 'resz' ? rss : sumT);
        var sigma = S.m === 'resz' ? rss / 6 : 0;
        // --- felső rész: vázlat ---
        var hh = h * 0.46, L = w - 40, x0 = 20, wall = 12, yT = 26, yB = hh - 34, gapPx = 26;
        var k = (L - 2 * wall - gapPx - (komp ? 14 : 0)) / 99;
        o += '<rect x="' + x0 + '" y="' + (yT - 6) + '" width="' + wall + '" height="' + (yB - yT + 12) + '" style="fill:var(--ix-8);fill-opacity:.35;stroke:var(--ink)"/>';
        var xr = x0 + L - wall;
        o += '<rect x="' + xr + '" y="' + (yT - 6) + '" width="' + wall + '" height="' + (yB - yT + 12) + '" style="fill:var(--ix-8);fill-opacity:.35;stroke:var(--ink)"/><text class="tk" x="' + (xr + wall) + '" y="' + (yT - 10) + '" text-anchor="end">fedél</text><text class="tk" x="' + x0 + '" y="' + (yT - 10) + '">ház</text>';
        var x = x0 + wall, parts = [[17, 'var(--ix-1)', 'A2'], [65, 'var(--ix-4)', 'A3'], [17, 'var(--ix-1)', 'A4']];
        parts.forEach(function (p) {
          var pw = p[0] * k;
          o += '<rect x="' + x.toFixed(1) + '" y="' + (yT + 6) + '" width="' + pw.toFixed(1) + '" height="' + (yB - yT - 12) + '" rx="2" style="fill:' + p[1] + ';fill-opacity:.28;stroke:var(--ink)"/><text class="lb sm" x="' + (x + pw / 2).toFixed(1) + '" y="' + ((yT + yB) / 2 + 4).toFixed(1) + '" text-anchor="middle">' + p[2] + '</text>';
          x += pw;
        });
        if (komp) { o += '<rect x="' + x.toFixed(1) + '" y="' + (yT + 10) + '" width="12" height="' + (yB - yT - 20) + '" style="fill:var(--ix-6);fill-opacity:.6;stroke:var(--ink)"/><text class="tk" x="' + (x + 6).toFixed(1) + '" y="' + (yB + 12) + '" text-anchor="middle">lemez</text>'; x += 14; }
        o += '<rect x="' + x.toFixed(1) + '" y="' + (yT + 6) + '" width="' + (xr - x).toFixed(1) + '" height="' + (yB - yT - 12) + '" style="fill:var(--acc);fill-opacity:.18;stroke:var(--acc);stroke-dasharray:3 3"/><text class="la sm" x="' + ((x + xr) / 2).toFixed(1) + '" y="' + (yT + 2) + '" text-anchor="middle">A0</text>';
        // méretnyilak
        var yd1 = yB + 12, yd2 = yB + 26;
        function dim(xa, xb, y, lab, col, dir) {
          var s = '<line x1="' + xa.toFixed(1) + '" x2="' + xb.toFixed(1) + '" y1="' + y + '" y2="' + y + '" style="stroke:' + col + ';stroke-width:1.4"/>';
          var tip = dir > 0 ? xb : xa, d = dir > 0 ? -1 : 1;
          s += '<path d="M' + tip.toFixed(1) + ',' + y + 'l' + (7 * d) + ',-4l0,8Z" style="fill:' + col + '"/>';
          return s + '<text class="tk" x="' + ((xa + xb) / 2).toFixed(1) + '" y="' + (y - 3) + '" text-anchor="middle" style="fill:' + col + '">' + lab + '</text>';
        }
        o += dim(x0 + wall, xr, yd2, 'A1 → növelő', 'var(--ix-2)', 1);
        var xx = x0 + wall; parts.forEach(function (p) { o += dim(xx, xx + p[0] * k, yd1, p[2] + ' ←', 'var(--ix-5)', -1); xx += p[0] * k; });
        // --- alsó rész: eloszlás ---
        var gy0 = h - 36, gy1 = hh + 26, lo = Math.min(S.lo, center - wc / 2) - 0.08, hi = Math.max(S.hi, center + wc / 2) + 0.08;
        var gx0 = 44, gx1 = w - 24, sx = U.scale(lo, hi, gx0, gx1), sy = U.scale(0, 1, gy0, gy1);
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: sx, sy: sy, xt: [Math.ceil(lo * 10) / 10, 0.5, Math.floor(hi * 10) / 10].filter(function (v, i, a) { return a.indexOf(v) === i; }), yt: [], xl: 'A0, mm', xf: function (v) { return fmt(v, 1); } });
        o += '<rect x="' + sx(S.lo).toFixed(1) + '" y="' + gy1 + '" width="' + (sx(S.hi) - sx(S.lo)).toFixed(1) + '" height="' + (gy0 - gy1) + '" style="fill:var(--ix-3);fill-opacity:.14"/><text class="tk" x="' + ((sx(S.lo) + sx(S.hi)) / 2).toFixed(1) + '" y="' + (gy1 + 12) + '" text-anchor="middle">előírt tartomány</text>';
        var bad = 0;
        if (S.m === 'resz') {
          var pts = [], pk = 1 / (sigma * Math.sqrt(2 * Math.PI)), scl = 0.8 / pk;
          for (var i = 0; i <= 80; i++) { var v = center - 4 * sigma + 8 * sigma * i / 80; pts.push([sx(v), sy(scl * pk * Math.exp(-Math.pow((v - center) / sigma, 2) / 2))]); }
          o += '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + '" style="fill:var(--acc);fill-opacity:.2;stroke:var(--acc);stroke-width:2"/>';
          bad = ncdf((S.lo - center) / sigma) + 1 - ncdf((S.hi - center) / sigma);
        }
        var yb = S.m === 'resz' ? gy0 - 8 : sy(0.45);
        o += '<rect x="' + sx(center - wc / 2).toFixed(1) + '" y="' + (yb - 7).toFixed(1) + '" width="' + (sx(center + wc / 2) - sx(center - wc / 2)).toFixed(1) + '" height="14" rx="3" style="fill:' + (S.m === 'resz' ? 'var(--acc)' : (center - wc / 2 < S.lo - 1e-9 || center + wc / 2 > S.hi + 1e-9 ? 'var(--ix-5)' : 'var(--ix-3)')) + ';fill-opacity:.55"/>';
        o += '<text class="tk" x="' + sx(center).toFixed(1) + '" y="' + (yb - 11).toFixed(1) + '" text-anchor="middle">' + (S.m === 'resz' ? '±3σ tartomány' : komp ? 'kompenzálva' : 'legrosszabb eset') + '</text>';
        P.svg.innerHTML = o;
        var okWorst = nom - sumT / 2 >= S.lo - 1e-9 && nom + sumT / 2 <= S.hi + 1e-9;
        var rows = [['A0 névleges', fmt(nom, 2) + ' mm', 'A0 = A1 − A2 − A3 − A4'],
          ['Teljes cserélhetőség', 'T0 = ΣTi = ' + fmt(sumT, 2) + ' mm', 'A0 = ' + fmt(nom - sumT / 2, 2) + ' … ' + fmt(nom + sumT / 2, 2) + ' mm — ' + (okWorst ? 'megfelel' : 'nem fér bele az előírt ' + fmt(Treq, 2) + ' mm-be')],
          ['Valószínűségi', 'T0 = √ΣTi² = ' + fmt(rss, 3) + ' mm', 'selejt (normális eloszlás, középre állítva): ' + fmt((ncdf((S.lo - nom) / (rss / 6)) + 1 - ncdf((S.hi - nom) / (rss / 6))) * 100, 2) + ' %']];
        if (komp) rows.push(['Álló kompenzátor', ncls + ' lemezvastagság-osztály', 'lépcső = T0,előírt − T<sub>lemez</sub> = ' + fmt(Treq, 2) + ' − ' + fmt(S.Tk, 2) + ' = ' + fmt(step, 2) + ' mm; szereléskor a mért hézaghoz választjuk a lemezt, a lemezvastagság osztályonként ennyivel nő']);
        var head = S.m === 'teljes' ? (okWorst ? 'Minden darab válogatás nélkül beszerelhető' : 'Teljes cserélhetőséggel nem teljesíthető') : S.m === 'resz' ? 'Selejt: ' + fmt(bad * 100, 2) + ' %' : 'Kompenzálva: minden szerelvény az előírt tartományban';
        out.innerHTML = '<h4><small>' + { teljes: 'Teljes cserélhetőség', resz: 'Részleges cserélhetőség', komp: 'Beszabályozás álló kompenzátorral' }[S.m] + '</small>' + head + '</h4>' + U.kv(rows) +
          '<p class="ix-note">Szimmetrikus tűrésekkel (középméret = névleges) számolva; a vázlaton a hézag nagyítva. Négy tagnál a valószínűségi tűrés kb. fele a legrosszabb esetinek (√4 = 2).</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/15 — válogató párosítás                                           */
  /* ================================================================== */
  AVIX.def('valogat', {
    title: 'Válogató párosítás: méretcsoportok',
    sub: 'Tág tűréssel gyártunk, n csoportra válogatunk — a párok játékának szórása n-ed részére csökken',
    mount: function (el) {
      var st = U.store('valogat', { tf: 30, tc: 30, n: 3, a: 5 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A furatot és a csapot olcsó, tág tűréssel gyártjuk, majd <b>megmérjük és méretcsoportokba soroljuk</b>. Szereléskor az azonos sorszámú csoportokat párosítjuk — így a játék szórása kicsi marad (tipikus példa: csapágygyártás).</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.9 : 0.46; }, minH: 270, maxH: 360, label: 'Méretcsoportok és a párok játéka' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Furattűrés Tfy', min: 10, max: 60, step: 2, value: S.tf, unit: 'µm', dec: 0, onInput: function (v) { S.tf = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Csaptűrés Tcs', min: 10, max: 60, step: 2, value: S.tc, unit: 'µm', dec: 0, onInput: function (v) { S.tc = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Csoportok száma n', min: 1, max: 6, step: 1, value: S.n, dec: 0, onInput: function (v) { S.n = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Legkisebb játék KJ', min: 0, max: 20, step: 1, value: S.a, unit: 'µm', dec: 0, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var COL = ['var(--ix-1)', 'var(--ix-3)', 'var(--ix-2)', 'var(--ix-4)', 'var(--ix-6)', 'var(--ix-7)'];
      P.draw = function (w, h) {
        var n = S.n, o = '', narrow = w < 520;
        var H = [S.tf, 0], C = [-S.a, -S.a - S.tc];
        var lo = C[1] - 8, hi = H[0] + 8, sy = U.scale(lo, hi, h - 30, 24);
        var x0 = 50, bw = narrow ? 44 : 64, xh = x0, xc = x0 + bw + 14, xg = xc + bw + (narrow ? 26 : 50), gw = w - xg - 14;
        o += '<line x1="' + (x0 - 6) + '" x2="' + (xc + bw + 6) + '" y1="' + sy(0).toFixed(1) + '" y2="' + sy(0).toFixed(1) + '" style="stroke:var(--ink);stroke-width:1.4"/><text class="tk" x="' + (x0 - 8) + '" y="' + (sy(0) + 4).toFixed(1) + '" text-anchor="end">0</text>';
        o += '<text class="lb sm" x="' + (xh + bw / 2) + '" y="16" text-anchor="middle">furat</text><text class="lb sm" x="' + (xc + bw / 2) + '" y="16" text-anchor="middle">csap</text>';
        var grp = [];
        for (var i = 0; i < n; i++) {
          var h0 = H[1] + S.tf * i / n, h1 = H[1] + S.tf * (i + 1) / n, c0 = C[1] + S.tc * i / n, c1 = C[1] + S.tc * (i + 1) / n;
          o += '<rect x="' + xh + '" y="' + sy(h1).toFixed(1) + '" width="' + bw + '" height="' + (sy(h0) - sy(h1)).toFixed(1) + '" style="fill:' + COL[i] + ';fill-opacity:.45;stroke:var(--ink);stroke-width:.8"/>';
          o += '<rect x="' + xc + '" y="' + sy(c1).toFixed(1) + '" width="' + bw + '" height="' + (sy(c0) - sy(c1)).toFixed(1) + '" style="fill:' + COL[i] + ';fill-opacity:.45;stroke:var(--ink);stroke-width:.8"/>';
          o += '<text class="tk" x="' + (xh + bw / 2) + '" y="' + ((sy(h0) + sy(h1)) / 2 + 4).toFixed(1) + '" text-anchor="middle">' + (i + 1) + '</text><text class="tk" x="' + (xc + bw / 2) + '" y="' + ((sy(c0) + sy(c1)) / 2 + 4).toFixed(1) + '" text-anchor="middle">' + (i + 1) + '</text>';
          grp.push([h0 - c1, h1 - c0]);
        }
        // játékdiagram: minden csoportpár játéktartománya
        var jmin = S.a, jmax = S.a + S.tf + S.tc, jx = U.scale(0, jmax + 6, xg, xg + gw);
        o += '<text class="lb sm" x="' + xg + '" y="16">a párok játéka, µm</text>';
        var rowH = Math.min(26, (h - 70) / (n + 1));
        o += '<rect x="' + jx(jmin).toFixed(1) + '" y="30" width="' + (jx(jmax) - jx(jmin)).toFixed(1) + '" height="' + (rowH - 8).toFixed(1) + '" rx="3" style="fill:var(--muted);fill-opacity:.35"/><text class="tk" x="' + (jx(jmin) + 4).toFixed(1) + '" y="' + (30 + rowH / 2).toFixed(1) + '">válogatás nélkül</text>';
        grp.forEach(function (gg, i) {
          var y = 30 + (i + 1) * rowH;
          o += '<rect x="' + jx(gg[0]).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(2, jx(gg[1]) - jx(gg[0])).toFixed(1) + '" height="' + (rowH - 8).toFixed(1) + '" rx="3" style="fill:' + COL[i] + ';fill-opacity:.6"/><text class="tk" x="' + (xg - 4) + '" y="' + (y + rowH / 2).toFixed(1) + '" text-anchor="end">' + (i + 1) + '.</text>';
        });
        var ya = 30 + (n + 1) * rowH + 6;
        [0, Math.round(jmax / 2), jmax].forEach(function (t) { o += '<text class="tk" x="' + jx(t).toFixed(1) + '" y="' + (ya + 10).toFixed(1) + '" text-anchor="middle">' + t + '</text>'; });
        P.svg.innerHTML = o;
        var same = S.tf === S.tc, widths = grp.map(function (gg) { return gg[1] - gg[0]; });
        out.innerHTML = '<h4><small>' + n + ' csoport</small>A párok játékának szórása: ' + fmt(widths[0], 1) + ' µm (válogatás nélkül ' + fmt(S.tf + S.tc, 0) + ' µm)</h4>' +
          U.kv([['Csoportok közepes játéka', grp.map(function (gg) { return fmt((gg[0] + gg[1]) / 2, 1); }).join(' · ') + ' µm', same ? 'azonos tűrésnél minden csoportban ugyanaz' : 'eltérő tűrésnél csoportról csoportra eltolódik — ezért kedvezőtlen a nem azonos tűrésmező-szélesség'],
            ['Összefüggés', 'T<sub>ill,cs</sub> = (T<sub>fy</sub> + T<sub>cs</sub>) / n', 'a csoportok darabszáma csak azonos eloszlásnál egyezik — különben maradék alkatrészek keletkeznek']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/19 — vezetőcsapágy és hőtágulás                                   */
  /* ================================================================== */
  AVIX.def('vezeto', {
    title: 'Vezetőcsapágy: miért csak az egyiket fogjuk be?',
    sub: 'A tengely melegebb a háznál, megnyúlik — ha mindkét csapágy rögzített, a csapágyakon át befeszül',
    mount: function (el) {
      var st = U.store('vezeto', { L: 400, d: 40, dT: 25, m: 'vez' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Üzem közben a tengely rendszerint melegebb a háznál, ezért jobban tágul. <b>Csak az egyik csapágyat fogjuk be</b> (vezetőcsapágy, ez veszi fel az axiális erőt); a másiknak oldalirányú helyet hagyunk. Nézd meg, mi történik, ha mindkettőt befogjuk.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['vez', 'Vezető + elmozduló'], ['ket', 'Mindkettő befogva']], S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Ágyazás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.34; }, minH: 200, maxH: 280, label: 'Tengely két csapággyal' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Csapágytávolság L', min: 100, max: 1200, step: 50, value: S.L, unit: 'mm', dec: 0, onInput: function (v) { S.L = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Tengelyátmérő d', min: 20, max: 100, step: 5, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Hőmérséklet-különbség ΔT', min: 0, max: 60, step: 1, value: S.dT, unit: 'K', dec: 0, onInput: function (v) { S.dT = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var a = 11.5e-6, dL = a * S.L * S.dT, E = 210000, A = Math.PI * S.d * S.d / 4, F = E * a * S.dT * A / 1000, fix = S.m === 'ket', o = '';
        var cy = h * 0.5, x0 = 40, x1 = w - 64, R = Math.min(h * 0.12, 22), grow = Math.min(36, dL * 60);
        // ház
        o += '<rect x="' + (x0 - 22) + '" y="' + (cy - R - 34) + '" width="' + (x1 - x0 + 44) + '" height="' + (2 * R + 68) + '" rx="8" style="fill:var(--ix-8);fill-opacity:.12;stroke:var(--rule-2)"/>';
        // tengely (nyújtva)
        var xe = x1 + (fix ? 0 : grow);
        o += '<rect x="' + (x0 - 16) + '" y="' + (cy - R * 0.55) + '" width="' + (xe - x0 + 32) + '" height="' + (R * 1.1) + '" rx="4" style="fill:' + (fix && S.dT > 0 ? 'var(--ix-5)' : 'var(--ix-8)') + ';fill-opacity:' + (fix && S.dT > 0 ? Math.min(0.55, 0.12 + S.dT / 90) : 0.3) + ';stroke:var(--ink)"/>';
        function brg(x, lab, locked) {
          var s = '';
          [-1, 1].forEach(function (sg) {
            var yy = cy + sg * (R * 0.55 + 10);
            s += '<rect x="' + (x - 11) + '" y="' + (yy - 10) + '" width="22" height="20" rx="3" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.4"/><circle cx="' + x + '" cy="' + yy + '" r="5.5" style="fill:none;stroke:var(--ink)"/>';
            if (locked) s += '<rect x="' + (x - 15) + '" y="' + (yy - 12) + '" width="4" height="24" style="fill:var(--ink)"/><rect x="' + (x + 11) + '" y="' + (yy - 12) + '" width="4" height="24" style="fill:var(--ink)"/>';
          });
          return s + '<text class="lb sm" x="' + x + '" y="' + (cy + R + 44) + '" text-anchor="middle">' + lab + '</text>';
        }
        o += brg(x0 + 20, 'vezetőcsapágy', true);
        var xb = x1 - 20 + (fix ? 0 : grow);
        o += brg(xb, fix ? 'befogva' : 'elmozduló', fix);
        if (!fix && S.dT > 0) o += '<path d="M' + (x1 - 20) + ',' + (cy - R - 26) + 'H' + (xb) + '" style="stroke:var(--acc);stroke-width:2"/><path d="M' + xb + ',' + (cy - R - 26) + 'l-7,-4l0,8Z" style="fill:var(--acc)"/><text class="la sm" x="' + ((x1 - 20 + xb) / 2) + '" y="' + (cy - R - 30) + '" text-anchor="middle">ΔL</text>';
        if (fix && S.dT > 0) [x0 + 40, x1 - 40].forEach(function (xx, i) { var d = i ? -1 : 1; o += '<path d="M' + (xx + d * 26) + ',' + cy + 'H' + xx + '" style="stroke:var(--ix-5);stroke-width:3"/><path d="M' + xx + ',' + cy + 'l' + (8 * d) + ',-5l0,10Z" style="fill:var(--ix-5)"/>'; });
        o += '<text class="tk" x="' + (w / 2) + '" y="' + (h - 8) + '" text-anchor="middle">a nyúlás erősen nagyítva</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small class="nc">ΔL = α · L · ΔT = 11,5·10⁻⁶ · ' + S.L + ' · ' + S.dT + '</small>ΔL = ' + fmt(dL, 3) + ' mm</h4>' +
          (fix ? U.kv([['Befeszülő erő', fmt(F, 1) + ' kN', 'F = E · A · α · ΔT (ha a ház és a csapágyak merevek lennének — felső becslés)'], ['Következmény', '', 'Ez az axiális erő a gördülőelemeken át adódik át: melegedés, zaj, gyors tönkremenetel. Ezért <b>csak az egyik csapágyat fogjuk be</b>.']]) :
            U.kv([['Elmozdulás', fmt(dL * 1000, 0) + ' µm', 'az elmozduló csapágy külső gyűrűje a házban (vagy a belső a tengelyen) ennyit csúszik — oldalirányú helyet kell hagyni'], ['Axiális erő', 'csak az üzemi erő', 'a hőtágulás nem okoz befeszülést']]));
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/19 — csapágy illesztése és melegítése                             */
  /* ================================================================== */
  // mélyhornyú golyóscsapágy radiális hézaga (µm), ISO 5753 szerinti nagyságrend — tájékoztató
  var CLR = { lim: [18, 24, 30, 40, 50, 65, 80, 100, 120, 140], CN: [[3, 18], [5, 20], [5, 20], [6, 20], [6, 23], [8, 28], [10, 30], [12, 36], [15, 41], [18, 48]], C3: [[11, 25], [13, 28], [13, 28], [15, 33], [18, 36], [23, 43], [25, 51], [30, 58], [36, 66], [41, 81]] };
  function clr(grp, d) { for (var i = 0; i < CLR.lim.length; i++) if (d <= CLR.lim[i]) return CLR[grp][i]; return CLR[grp][CLR[grp].length - 1]; }
  function boreTol(d) { var L = [18, 30, 50, 80, 120, 180], V = [8, 10, 12, 15, 20, 25]; for (var i = 0; i < L.length; i++) if (d <= L[i]) return V[i]; return 30; }
  AVIX.def('csapmeleg', {
    title: 'Csapágy illesztése és melegítése',
    sub: 'Tengelytűrés → túlfedés → hézagcsökkenés és a meleg szereléshez szükséges hőmérséklet',
    mount: function (el) {
      var st = U.store('csapmeleg', { d: 50, f: 'k5', s: 15, g: 'CN', t0: 20 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A csapágy furatának tűrése különleges: <b>felső eltérése 0</b>, a mező a névleges méret alatt van — ezért a k5 vagy m5 csap már biztosan <b>túlfedéssel</b> ül. A túlfedés kitágítja a belső gyűrűt, és <b>csökkenti a csapágy radiális hézagát</b>. Meleg szerelésnél a gyűrűt annyira melegítjük, hogy a túlfedésen felül kis játékkal csússzon fel.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.chips(r1, [['js5', 'js5'], ['k5', 'k5'], ['m5', 'm5'], ['m6', 'm6'], ['n6', 'n6'], ['p6', 'p6']], S.f, function (v) { S.f = v; st.set(S); P.render(); }, 'Tengelytűrés');
      var r2 = U.h('div', 'ix-row'); el.appendChild(r2);
      U.seg(r2, [['CN', 'Normál hézag (CN)'], ['C3', 'Nagyobb hézag (C3)']], S.g, function (v) { S.g = v; st.set(S); P.render(); }, 'Hézagcsoport');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.42; }, minH: 250, maxH: 330, label: 'Túlfedés, hézag és melegítés' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Furatátmérő d', min: 15, max: 140, step: 5, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Szerelési játék s', min: 0, max: 50, step: 5, value: S.s, unit: 'µm', dec: 0, onInput: function (v) { S.s = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var sp = ISO.parse(S.f), C = ISO.shaft(sp[0], sp[1], S.d), tb = boreTol(S.d), dmin = C[1], dmax = C[0] + tb;
        var c = clr(S.g, S.d), red = [0.8 * Math.max(0, dmin), 0.8 * dmax], rem = [c[0] - red[1], c[1] - red[0]], likely = (c[0] + c[1]) / 2 - 0.8 * Math.max(0, (dmin + dmax) / 2);
        var dT = (dmax + S.s) / 1000 / (12e-6 * S.d), T = S.t0 + dT, narrow = w < 520, o = '';
        // 1) tűrésmezők
        var pw = narrow ? w * 0.46 : w * 0.34, lo = Math.min(-tb, C[1], 0) - 6, hi = Math.max(C[0], 0) + 6, sy = U.scale(lo, hi, h - 34, 30);
        o += '<text class="lb sm" x="16" y="16">tűrésmezők, µm</text><line x1="14" x2="' + (pw - 6) + '" y1="' + sy(0).toFixed(1) + '" y2="' + sy(0).toFixed(1) + '" style="stroke:var(--ink);stroke-width:1.4"/><text class="tk" x="' + (pw - 8) + '" y="' + (sy(0) - 4).toFixed(1) + '" text-anchor="end">d = ' + S.d + '</text>';
        var bw = (pw - 60) / 2;
        o += '<rect x="30" y="' + sy(0).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (sy(-tb) - sy(0)).toFixed(1) + '" style="fill:var(--ix-1);fill-opacity:.4;stroke:var(--ix-1)"/><text class="tk" x="' + (30 + bw / 2).toFixed(1) + '" y="' + (sy(-tb) + 12).toFixed(1) + '" text-anchor="middle">furat 0/−' + tb + '</text>';
        o += '<rect x="' + (40 + bw).toFixed(1) + '" y="' + sy(C[0]).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (sy(C[1]) - sy(C[0])).toFixed(1) + '" style="fill:var(--ix-3);fill-opacity:.4;stroke:var(--ix-3)"/><text class="tk" x="' + (40 + 1.5 * bw).toFixed(1) + '" y="' + (sy(C[0]) - 5).toFixed(1) + '" text-anchor="middle">' + S.f + ' ' + um(C[0]) + '/' + um(C[1]) + '</text>';
        // 2) hőmérő
        var tx = pw + (narrow ? 20 : 40), tw = 16, tmax = 160, ty = U.scale(0, tmax, h - 34, 26);
        o += '<text class="lb sm" x="' + (tx - 6) + '" y="16">melegítés</text><rect x="' + tx + '" y="' + ty(tmax) + '" width="' + tw + '" height="' + (ty(0) - ty(tmax)) + '" rx="8" style="fill:var(--surface);stroke:var(--rule-2)"/>';
        o += '<rect x="' + (tx + 3) + '" y="' + ty(Math.min(T, tmax)).toFixed(1) + '" width="' + (tw - 6) + '" height="' + (ty(0) - ty(Math.min(T, tmax))).toFixed(1) + '" rx="5" style="fill:' + (T > 120 ? 'var(--ix-5)' : 'var(--ix-2)') + '"/>';
        o += '<line x1="' + (tx - 4) + '" x2="' + (tx + tw + 4) + '" y1="' + ty(120) + '" y2="' + ty(120) + '" style="stroke:var(--ix-5);stroke-dasharray:3 2"/><text class="tk" x="' + (tx + tw + 6) + '" y="' + (ty(120) + 4) + '">120 °C</text>';
        o += '<text class="la sm" x="' + (tx + tw + 6) + '" y="' + (ty(Math.min(T, tmax)) + 4).toFixed(1) + '">' + fmt(T, 0) + ' °C</text>';
        // 3) hézag
        var gx = tx + (narrow ? 66 : 110), gw = w - gx - 14, gxs = U.scale(Math.min(0, rem[0]) - 5, c[1] + 5, gx, gx + gw);
        o += '<text class="lb sm" x="' + gx + '" y="16">radiális hézag, µm</text>';
        function bar(y, a, b, col, lab) { return '<rect x="' + gxs(a).toFixed(1) + '" y="' + y + '" width="' + Math.max(2, gxs(b) - gxs(a)).toFixed(1) + '" height="16" rx="3" style="fill:' + col + ';fill-opacity:.55"/><text class="tk" x="' + gx + '" y="' + (y - 4) + '">' + lab + '</text>'; }
        o += bar(46, c[0], c[1], 'var(--ix-4)', (narrow ? 'előtte (' + S.g + ')' : 'szerelés előtt (' + S.g + ')')) + bar(96, rem[0], rem[1], likely < 0 ? 'var(--ix-5)' : rem[0] < 0 ? 'var(--ix-6)' : 'var(--ix-3)', (narrow ? 'utána' : 'szerelés után')) + '<path d="M' + gxs(likely).toFixed(1) + ',92v24" style="stroke:var(--ink);stroke-width:2.4"/><text class="tk" x="' + gxs(likely).toFixed(1) + '" y="128" text-anchor="middle">várható</text>';
        o += '<line x1="' + gxs(0).toFixed(1) + '" x2="' + gxs(0).toFixed(1) + '" y1="36" y2="' + (h - 40) + '" style="stroke:var(--ink);stroke-dasharray:3 3"/><text class="tk" x="' + gxs(0).toFixed(1) + '" y="' + (h - 28) + '" text-anchor="middle">0</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small class="nc">d = ' + S.d + ' mm · ' + S.f + ' · furat 0/−' + tb + ' µm</small>Túlfedés: ' + fmt(dmin, 0) + ' … ' + fmt(dmax, 0) + ' µm</h4>' +
          U.kv([['Hézagcsökkenés', '≈ 0,8 · túlfedés = ' + fmt(red[0], 0) + ' … ' + fmt(red[1], 0) + ' µm', 'tömör acéltengelynél a túlfedés kb. 80%-a jelenik meg a futópálya tágulásában'],
            ['Maradó hézag', 'várhatóan ' + fmt(likely, 0) + ' µm', likely < 0 ? '<b style="color:var(--ix-5)">már átlagosan is előfeszített — nagyobb hézagcsoport (C3) vagy lazább illesztés kell</b>' : rem[0] < 0 ? 'szélső esetben (' + fmt(rem[0], 0) + ' … ' + fmt(rem[1], 0) + ' µm) elfogyhat — melegedésnél, nagy terhelésnél C3 ajánlott' : 'szélső esetben is pozitív (' + fmt(rem[0], 0) + ' … ' + fmt(rem[1], 0) + ' µm)'],
            ['Melegítés', 'ΔT = (δ<sub>max</sub> + s) / (α · d) = ' + fmt(dT, 0) + ' K', T > 120 ? '<b style="color:var(--ix-5)">120 °C fölött — helyette hidraulikus vagy olajnyomásos szerelés</b>' : 'olajfürdő vagy indukciós melegítő; ' + fmt(T, 0) + ' °C (α ≈ 12·10⁻⁶ 1/K)']]) +
          '<p class="ix-note">A furattűrés (normál pontossági osztály) és a CN/C3 hézagok tájékoztató értékek a szabványok nagyságrendjében; a konkrét csapágyat a gyártói katalógusból kell ellenőrizni.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/19 — kúpos ülés: feltolás és hézagcsökkenés                        */
  /* ================================================================== */
  AVIX.def('kupos', {
    title: 'Kúpos ülés: feltolási út és hézagcsökkenés',
    sub: '1:12 kúpon a belső gyűrű a feltolással tágul — a hézagot a legalsó görgő alatt mérjük',
    mount: function (el) {
      var st = U.store('kupos', { d: 100, s: 0.4, c0: 0.11 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Beálló görgőscsapágy kúpos furattal, 1:12 kúpos tengelycsapon vagy hüvelyen. Minél messzebb toljuk fel, annál nagyobb a túlfedés és annál <b>kisebb a radiális hézag</b>. A mértéket a <b>hézagcsökkenéssel</b> (hézagmérő a legalsó, terheletlen görgő alatt) vagy a <b>feltolási úttal</b> ellenőrizzük.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.4; }, minH: 240, maxH: 320, label: 'Kúpos ülés és csapágyhézag' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Furatátmérő d', min: 40, max: 200, step: 5, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Feltolási út s', min: 0, max: 1.6, step: 0.01, value: S.s, unit: 'mm', dec: 2, onInput: function (v) { S.s = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Mért kiinduló hézag', min: 0.04, max: 0.25, step: 0.005, value: S.c0, unit: 'mm', dec: 3, onInput: function (v) { S.c0 = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var red = S.s / 15, tgt = [0.00042 * S.d, 0.00055 * S.d], sT = [tgt[0] * 15, tgt[1] * 15], rem = S.c0 - red, narrow = w < 520, o = '';
        var ok = red >= tgt[0] - 1e-9 && red <= tgt[1] + 1e-9, over = red > tgt[1] + 1e-9;
        // bal: kúpos csap és a gyűrű (a kúposság nagyítva)
        var lw = narrow ? w * 0.55 : w * 0.46, cy = h * 0.52, x0 = 18, x1 = lw - 10, r0 = Math.min(h * 0.18, 36), k = 0.18;
        o += '<path d="M' + x0 + ',' + (cy - r0) + 'L' + x1 + ',' + (cy - r0 - (x1 - x0) * k) + 'L' + x1 + ',' + (cy + r0 + (x1 - x0) * k) + 'L' + x0 + ',' + (cy + r0) + 'Z" style="fill:var(--ix-8);fill-opacity:.28;stroke:var(--ink)"/>';
        o += '<line x1="' + (x0 - 6) + '" x2="' + (x1 + 6) + '" y1="' + cy + '" y2="' + cy + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/>';
        var ringW = (x1 - x0) * 0.26, pos = x0 + (x1 - x0) * 0.18 + S.s / 1.6 * (x1 - x0) * 0.5;
        [-1, 1].forEach(function (sg) {
          var yIn = cy + sg * (r0 + (pos - x0) * k), yOut = cy + sg * (r0 + (pos - x0) * k + 30);
          o += '<rect x="' + pos.toFixed(1) + '" y="' + Math.min(yIn, yIn + sg * 10).toFixed(1) + '" width="' + ringW.toFixed(1) + '" height="10" style="fill:var(--ix-1);fill-opacity:.5;stroke:var(--ink)"/>';
          o += '<rect x="' + pos.toFixed(1) + '" y="' + Math.min(yOut, yOut + sg * 10).toFixed(1) + '" width="' + ringW.toFixed(1) + '" height="10" style="fill:var(--ix-1);fill-opacity:.25;stroke:var(--ink)"/>';
          o += '<circle cx="' + (pos + ringW / 2).toFixed(1) + '" cy="' + (yIn + sg * 20).toFixed(1) + '" r="8" style="fill:var(--surface);stroke:var(--ink)"/>';
        });
        o += '<path d="M' + (pos - 30) + ',' + (cy - r0 - 34) + 'H' + (pos - 4) + '" style="stroke:var(--acc);stroke-width:2"/><path d="M' + (pos - 4) + ',' + (cy - r0 - 34) + 'l-7,-4l0,8Z" style="fill:var(--acc)"/><text class="la sm" x="' + Math.max(4, pos - 30).toFixed(1) + '" y="' + (cy - r0 - 42) + '">s = ' + fmt(S.s, 2) + ' mm</text>';
        o += '<text class="tk" x="' + ((x0 + x1) / 2) + '" y="' + (h - 8) + '" text-anchor="middle">a kúposság nagyítva</text>';
        // jobb: a legalsó görgő alatti rés (nagyítva)
        var gx = lw + 16, gw = w - gx - 12, gcx = gx + gw / 2, gy = h * 0.5, gap = Math.max(0, rem) / 0.25 * 34;
        o += '<text class="lb sm" x="' + gx + '" y="16">legalsó görgő (nagyítás)</text>';
        o += '<rect x="' + (gcx - gw * 0.4) + '" y="' + (gy + 28) + '" width="' + (gw * 0.8) + '" height="12" style="fill:var(--ix-1);fill-opacity:.25;stroke:var(--ink)"/><text class="tk" x="' + (gcx + gw * 0.4) + '" y="' + (gy + 54) + '" text-anchor="end">külső gyűrű</text>';
        o += '<circle cx="' + gcx + '" cy="' + (gy + 28 - gap - 14).toFixed(1) + '" r="14" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.4"/>';
        o += '<rect x="' + (gcx - gw * 0.4) + '" y="' + (gy + 28 - gap - 40).toFixed(1) + '" width="' + (gw * 0.8) + '" height="12" style="fill:var(--ix-1);fill-opacity:.5;stroke:var(--ink)"/><text class="tk" x="' + (gcx - gw * 0.4) + '" y="' + (gy + 28 - gap - 46).toFixed(1) + '">belső gyűrű</text>';
        if (gap > 1) o += '<rect x="' + (gcx - 3) + '" y="' + (gy + 28 - gap).toFixed(1) + '" width="' + (gw * 0.45) + '" height="' + gap.toFixed(1) + '" style="fill:var(--acc);fill-opacity:.5"/><text class="la sm" x="' + (gcx + gw * 0.45) + '" y="' + (gy + 24 - gap / 2).toFixed(1) + '" text-anchor="end">' + fmt(rem, 3) + '</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small class="nc">1:12 kúp · a hézagcsökkenés ≈ s / 15</small>Hézagcsökkenés: ' + fmt(red, 3) + ' mm — ' + (ok ? 'a tartományban' : over ? '<span style="color:var(--ix-5)">túl sok</span>' : 'még kevés') + '</h4>' +
          U.kv([['Átmérő-növekedés', 'Δd = s / 12 = ' + fmt(S.s / 12, 3) + ' mm', 'a futópálya ennek kb. 80%-ával tágul → hézagcsökkenés ≈ 0,8 · s / 12'],
            ['Ajánlott (tájékoztató)', fmt(tgt[0], 3) + ' … ' + fmt(tgt[1], 3) + ' mm csökkenés', '≈ ' + fmt(sT[0], 2) + ' … ' + fmt(sT[1], 2) + ' mm feltolás — a gyártói táblázatok nagyságrendje (kb. 0,0004–0,0005 · d)'],
            ['Mérendő hézag', fmt(rem, 3) + ' mm', rem <= 0 ? '<b style="color:var(--ix-5)">a hézag elfogyott — a csapágy befeszül, túlmelegszik</b>' : 'hézagmérővel a legalsó görgő alatt, mindkét görgősorban']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/19 — kúpgörgős pár: X és O elrendezés, hézagbeállítás             */
  /* ================================================================== */
  AVIX.def('xo', {
    title: 'Kúpgörgős csapágypár: X és O elrendezés, hézagbeállítás',
    sub: 'A hatásvonalak metszéspontja adja a hatásos támaszközt — a hézagot hézagolólemezzel állítjuk',
    mount: function (el) {
      var st = U.store('xo', { m: 'elr', a: 20, L: 90, arr: 'O', sh: [0.2, 0.2, 0.1], s0: 0.43 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A kúpgörgős csapágy radiális és egyirányú axiális erőt vesz fel, ezért párosával építjük be. <b>X</b>: a hatásvonalak a csapágyak <b>között</b> metszik a tengelyt; <b>O</b>: a csapágypáron <b>kívül</b> — nagyobb hatásos támaszköz, merevebb ágyazás. A pár axiális hézagát szereléskor állítjuk be.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['elr', 'Elrendezés'], ['hez', 'Hézag beállítása']], S.m, function (v) { S.m = v; st.set(S); build(); }, 'Nézet');
      var box = U.h('div'); el.appendChild(box);
      var P, out;
      function build() {
        box.innerHTML = '';
        if (S.m === 'elr') {
          var r2 = U.h('div', 'ix-row'); box.appendChild(r2);
          U.seg(r2, [['X', '„X” elrendezés'], ['O', '„O” elrendezés']], S.arr, function (v) { S.arr = v; st.set(S); P.render(); }, 'Elrendezés');
        }
        P = U.plot(box, { ratio: function (w) { return w < 520 ? 0.7 : 0.38; }, minH: 230, maxH: 300, label: 'Kúpgörgős csapágypár' });
        var g = U.sliders(box);
        if (S.m === 'elr') {
          U.slider(g, { label: 'Érintkezési szög α', min: 10, max: 30, step: 1, value: S.a, unit: '°', dec: 0, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
          U.slider(g, { label: 'Csapágytávolság L', min: 60, max: 240, step: 5, value: S.L, unit: 'mm', dec: 0, onInput: function (v) { S.L = v; st.set(S); P.render(); } });
        } else {
          var r3 = U.h('div', 'ix-row'); box.appendChild(r3);
          r3.innerHTML = '<button type="button" class="ix-btn" data-a="+0.05">+ 0,05</button><button type="button" class="ix-btn" data-a="+0.1">+ 0,10</button><button type="button" class="ix-btn" data-a="+0.2">+ 0,20</button><button type="button" class="ix-btn" data-a="pop">− utolsó lemez</button><button type="button" class="ix-btn" data-a="new">Új szerelés</button>';
          r3.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
            if (a === 'pop') S.sh.pop(); else if (a === 'new') { S.sh = []; S.s0 = Math.round((0.3 + Math.random() * 0.3) * 100) / 100 + 0.005 * Math.round(Math.random() * 4); } else S.sh.push(parseFloat(a));
            st.set(S); P.render();
          });
        }
        out = U.h('div', 'ix-out'); box.appendChild(out);
        P.draw = S.m === 'elr' ? drawArr : drawShim;
        P.render();
      }
      function drawArr(w, h) {
        var cy = h * 0.55, cx = w / 2, sc = Math.min((w - 60) / (S.L + 110), (h - 50) / 160), rm = 45, bw = 24, o = '';
        var xL = cx - S.L / 2 * sc, xR = cx + S.L / 2 * sc, t = Math.tan(S.a * RAD) * rm;
        o += '<line x1="14" x2="' + (w - 14) + '" y1="' + cy + '" y2="' + cy + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/>';
        o += '<rect x="' + (xL - 40 * sc) + '" y="' + (cy - 14 * sc) + '" width="' + ((S.L + 80) * sc) + '" height="' + (28 * sc) + '" style="fill:var(--ix-8);fill-opacity:.25;stroke:var(--ink)"/>';
        var spans = { X: S.L - 2 * t, O: S.L + 2 * t };
        [[xL, -1], [xR, 1]].forEach(function (b) {
          var x = b[0], side = b[1], lean = (S.arr === 'O' ? side : -side);
          [-1, 1].forEach(function (sg) {
            var yc = cy + sg * rm * sc, dx = lean * Math.tan(S.a * RAD) * 12 * sc;
            o += '<path d="M' + (x - bw / 2 * sc - dx).toFixed(1) + ',' + (yc - sg * 7 * sc).toFixed(1) + 'L' + (x + bw / 2 * sc - dx).toFixed(1) + ',' + (yc - sg * 7 * sc).toFixed(1) + 'L' + (x + bw / 2 * sc + dx).toFixed(1) + ',' + (yc + sg * 7 * sc).toFixed(1) + 'L' + (x - bw / 2 * sc + dx).toFixed(1) + ',' + (yc + sg * 7 * sc).toFixed(1) + 'Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.4"/>';
            // hatásvonal: a görgő közepéből a tengelyig
            var xa = x + lean * t * sc * (sg > 0 ? 1 : 1);
            o += '<line x1="' + x.toFixed(1) + '" y1="' + yc.toFixed(1) + '" x2="' + xa.toFixed(1) + '" y2="' + cy + '" style="stroke:var(--acc);stroke-width:1.6"/>';
          });
          o += '<circle cx="' + (x + lean * t * sc).toFixed(1) + '" cy="' + cy + '" r="4" style="fill:var(--acc)"/>';
        });
        var pa = S.arr === 'O' ? xL - t * sc : xL + t * sc, pb = S.arr === 'O' ? xR + t * sc : xR - t * sc, yd = cy + rm * sc + 30;
        o += '<line x1="' + pa.toFixed(1) + '" x2="' + pb.toFixed(1) + '" y1="' + yd + '" y2="' + yd + '" style="stroke:var(--acc);stroke-width:1.6"/><path d="M' + pa.toFixed(1) + ',' + yd + 'l7,-4l0,8Z M' + pb.toFixed(1) + ',' + yd + 'l-7,-4l0,8Z" style="fill:var(--acc)"/><text class="la sm" x="' + ((pa + pb) / 2).toFixed(1) + '" y="' + (yd - 5) + '" text-anchor="middle">hatásos támaszköz ' + fmt(spans[S.arr], 0) + ' mm</text>';
        o += '<text class="tk" x="' + ((xL + xR) / 2).toFixed(1) + '" y="' + (cy - rm * sc - 22) + '" text-anchor="middle">csapágytávolság L = ' + S.L + ' mm</text>';
        P.svg.innerHTML = o;
        var ratio = Math.pow(spans.O / spans.X, 2);
        out.innerHTML = '<h4><small class="nc">α = ' + S.a + '°, r<sub>m</sub> = ' + rm + ' mm</small>' + (S.arr === 'O' ? '„O”: a hatásvonalak kívül metszik a tengelyt' : '„X”: a hatásvonalak a csapágyak között metszik a tengelyt') + '</h4>' +
          U.kv([['Hatásos támaszköz', 'X: ' + fmt(spans.X, 0) + ' mm · O: ' + fmt(spans.O, 0) + ' mm', 'a = L ∓ 2 · r<sub>m</sub> · tg α'],
            ['Billentőmerevség', 'O / X ≈ ' + fmt(ratio, 2) + '×', 'közelítőleg a támaszköz négyzetével arányos — ezért merevebb az O'],
            ['Alkalmazás', S.arr === 'O' ? 'főorsó, kerékagy' : 'hajtóműtengelyek', S.arr === 'O' ? 'merev, kis billenés; rövid tengelyen is nagy hatásos támaszköz' : 'kevésbé érzékeny a szögkitérésre és a tengely lehajlására; egyszerű hézagolás fedéllel']]);
      }
      function drawShim(w, h) {
        var tot = S.sh.reduce(function (a, b) { return a + b; }, 0), play = tot - S.s0, tgt = [0.03, 0.06], o = '', read = Math.max(0, play);
        var cx = w * (w < 520 ? 0.3 : 0.28), cy = h * 0.52, R = Math.min(h * 0.36, 80);
        // mérőóra
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>';
        for (var i = 0; i < 100; i++) { var an = -Math.PI / 2 + i / 100 * 2 * Math.PI, l = i % 10 ? 5 : 12; o += '<line x1="' + (cx + (R - 4) * Math.cos(an)).toFixed(1) + '" y1="' + (cy + (R - 4) * Math.sin(an)).toFixed(1) + '" x2="' + (cx + (R - 4 - l) * Math.cos(an)).toFixed(1) + '" y2="' + (cy + (R - 4 - l) * Math.sin(an)).toFixed(1) + '" style="stroke:var(--ink)"/>'; }
        var ang = -Math.PI / 2 + (Math.min(read, 0.99) * 100) / 100 * 2 * Math.PI;
        var a0 = -Math.PI / 2 + tgt[0] * 100 / 100 * 2 * Math.PI, a1 = -Math.PI / 2 + tgt[1] * 100 / 100 * 2 * Math.PI;
        o += '<path d="M' + (cx + (R - 18) * Math.cos(a0)).toFixed(1) + ',' + (cy + (R - 18) * Math.sin(a0)).toFixed(1) + 'A' + (R - 18) + ',' + (R - 18) + ' 0 0,1 ' + (cx + (R - 18) * Math.cos(a1)).toFixed(1) + ',' + (cy + (R - 18) * Math.sin(a1)).toFixed(1) + '" style="fill:none;stroke:var(--ix-3);stroke-width:8;stroke-opacity:.6"/>';
        o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + (R - 10) * Math.cos(ang)).toFixed(1) + '" y2="' + (cy + (R - 10) * Math.sin(ang)).toFixed(1) + '" style="stroke:var(--ix-5);stroke-width:2.4"/><circle cx="' + cx + '" cy="' + cy + '" r="5" class="fi"/>';
        o += '<text class="tk" x="' + cx + '" y="' + (cy + R * 0.45) + '" text-anchor="middle">0,01 mm/osztás</text>';
        // lemezköteg
        var sx0 = cx + R + (w < 520 ? 22 : 40), sw = w - sx0 - 12, y = cy + 50;
        o += '<text class="lb sm" x="' + sx0 + '" y="' + (cy - 60) + '">' + (w < 520 ? 'lemezköteg' : 'hézagolólemezek a fedél alatt') + '</text>';
        S.sh.forEach(function (t) { var hh = Math.max(4, t * 60); y -= hh; o += '<rect x="' + sx0 + '" y="' + y.toFixed(1) + '" width="' + Math.min(160, sw - 36) + '" height="' + hh.toFixed(1) + '" style="fill:var(--ix-6);fill-opacity:.55;stroke:var(--ink);stroke-width:.8"/><text class="tk" x="' + (sx0 + Math.min(160, sw - 36) + 4) + '" y="' + (y + hh / 2 + 3).toFixed(1) + '">' + fmt(t, 2) + '</text>'; });
        o += '<text class="tk" x="' + sx0 + '" y="' + (cy + 66) + '">összesen ' + fmt(tot, 2) + ' mm</text>';
        P.svg.innerHTML = o;
        var inT = play >= tgt[0] - 1e-9 && play <= tgt[1] + 1e-9;
        out.innerHTML = '<h4><small>Mérés: tengely előbb az egyik, majd a másik irányba tolva</small>' + (play < 0 ? '<span style="color:var(--ix-5)">Előfeszítve: ' + fmt(-play, 2) + ' mm — a tengely szorul</span>' : 'Axiális hézag: ' + fmt(play, 2) + ' mm' + (inT ? ' — megfelelő' : '')) + '</h4>' +
          '<p>Cél (tájékoztató): ' + fmt(tgt[0], 2) + '–' + fmt(tgt[1], 2) + ' mm hézag. A lemezvastagság változása közvetlenül a hézagot változtatja — ez <b>álló kompenzátor</b> (B/15). Kezdd egy vastag köteggel, mérj, majd vegyél el vagy tegyél hozzá lemezt.</p>';
      }
      build();
    },
  });

  /* ================================================================== */
  /* B/20 — csavarkötés előfeszítési diagramja                           */
  /* ================================================================== */
  var SCR = { M8: { As: 36.6, d: 8, P: 1.25, d2: 7.188, dk: 10.7 }, M10: { As: 58, d: 10, P: 1.5, d2: 9.026, dk: 13.25 }, M12: { As: 84.3, d: 12, P: 1.75, d2: 10.863, dk: 15.5 }, M16: { As: 157, d: 16, P: 2, d2: 14.701, dk: 20.5 }, M20: { As: 245, d: 20, P: 2.5, d2: 18.376, dk: 26 }, M24: { As: 353, d: 24, P: 3, d2: 22.051, dk: 31 }, M6: { As: 20.1, d: 6, P: 1, d2: 5.35, dk: 8.2 } };
  var CLS = { '8.8': 640, '10.9': 940, '12.9': 1100 };
  AVIX.def('elofesz', {
    title: 'Előfeszített csavarkötés: a kötésdiagram',
    sub: 'Fe előfeszítés, Fü üzemi erő — mennyi jut a csavarra (Ft), és mennyi szorítás marad (Fm)?',
    mount: function (el) {
      var st = U.store('elofesz', { s: 'M12', c: '8.8', fe: 60, fu: 20, phi: 0.2 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Az előfeszítés a csavart megnyújtja (λ), a közrefogott alkatrészeket összenyomja (δ). A külső erő (Fü) a csavart tovább nyújtja — de csak <b>Ft = Φ · Fü</b> többlet jut rá, a többi az alkatrészek szorítását csökkenti. Feltétel: <b>Fm = Fmax − Fü &gt; 0</b>, és a csavar maradjon rugalmas.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, ['M8', 'M10', 'M12', 'M16', 'M20'].map(function (k) { return [k, k]; }), S.s, function (v) { S.s = v; st.set(S); P.render(); }, 'Csavar');
      U.seg(r1, [['8.8', '8.8'], ['10.9', '10.9']], S.c, function (v) { S.c = v; st.set(S); P.render(); }, 'Szilárdsági osztály');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.44; }, minH: 250, maxH: 340, label: 'Erő–alakváltozás diagram' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Előfeszítés Fe', min: 20, max: 90, step: 5, value: S.fe, unit: '% F0,2', dec: 0, onInput: function (v) { S.fe = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Üzemi erő Fü', min: 0, max: 100, step: 1, value: S.fu, unit: 'kN', dec: 0, onInput: function (v) { S.fu = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Terhelési tényező Φ', min: 0.05, max: 0.6, step: 0.01, value: S.phi, dec: 2, onInput: function (v) { S.phi = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var sc = SCR[S.s], F02 = CLS[S.c] * sc.As / 1000, Fe = S.fe / 100 * F02, Fu = S.fu, phi = S.phi;
        var Ft = phi * Fu, Fmax = Fe + Ft, Fm = Fe - (1 - phi) * Fu, open = Fm <= 0;
        if (open) { Fmax = Fu; Fm = 0; }
        // merevségek: a csavaré egységnyi, az alkatrészeké (1−Φ)/Φ-szerese
        var cb = 1, cp = (1 - phi) / phi, lam = Fe / cb, del = Fe / cp;
        var o = '', gx0 = 48, gx1 = w - 20, gy0 = h - 36, gy1 = 22, Fscale = Math.max(F02 * 1.08, Fmax * 1.1, Fu * 1.05);
        var xmax = lam + del + Math.max(Ft / cb, 0) + del * 0.2, sx = U.scale(0, xmax, gx0, gx1), sy = U.scale(0, Fscale, gy0, gy1);
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: sx, sy: sy, xt: [], yt: [0, Math.round(Fscale / 2), Math.round(Fscale)], yl: 'F, kN', xl: 'alakváltozás' });
        o += '<line x1="' + gx0 + '" x2="' + gx1 + '" y1="' + sy(F02).toFixed(1) + '" y2="' + sy(F02).toFixed(1) + '" style="stroke:var(--ix-5);stroke-dasharray:4 3"/><text class="tk" x="' + (gx1 - 2) + '" y="' + (sy(F02) - 4).toFixed(1) + '" text-anchor="end">F0,2 = ' + fmt(F02, 0) + ' kN (megfolyás)</text>';
        // csavar egyenes és alkatrész egyenes
        var xA = lam, xE = lam + Ft / cb;
        o += '<path d="M' + sx(0) + ',' + sy(0) + 'L' + sx(open ? Fmax / cb : xE).toFixed(1) + ',' + sy(Fmax).toFixed(1) + '" class="ln" style="stroke:var(--ix-1);stroke-width:2.2"/>';
        o += '<path d="M' + sx(xA).toFixed(1) + ',' + sy(Fe).toFixed(1) + 'L' + sx(lam + del).toFixed(1) + ',' + sy(0).toFixed(1) + '" class="ln" style="stroke:var(--ix-3);stroke-width:2.2"/>';
        o += '<circle cx="' + sx(xA).toFixed(1) + '" cy="' + sy(Fe).toFixed(1) + '" r="4" class="fi"/>';
        if (!open) {
          var yP = sy(Fm);
          // az alkatrész-egyenes eltolt pontja: ugyanakkora alakváltozásnál (xE)
          o += '<line x1="' + sx(xE).toFixed(1) + '" x2="' + sx(xE).toFixed(1) + '" y1="' + sy(Fmax).toFixed(1) + '" y2="' + yP.toFixed(1) + '" style="stroke:var(--acc);stroke-width:3"/><text class="la sm" x="' + (sx(xE) + 6).toFixed(1) + '" y="' + ((sy(Fmax) + yP) / 2 + 4).toFixed(1) + '">Fü</text>';
          o += '<line x1="' + sx(xE).toFixed(1) + '" x2="' + sx(xE).toFixed(1) + '" y1="' + yP.toFixed(1) + '" y2="' + sy(0).toFixed(1) + '" style="stroke:var(--ix-3);stroke-width:3;stroke-opacity:.5"/><text class="lb sm" x="' + (sx(xE) + 6).toFixed(1) + '" y="' + ((yP + sy(0)) / 2).toFixed(1) + '">Fm</text>';
        }
        o += '<text class="lb sm" x="' + (sx(xA) - 8).toFixed(1) + '" y="' + (sy(Fe) - 8).toFixed(1) + '" text-anchor="end">Fe</text>';
        o += '<line x1="' + gx0 + '" x2="' + sx(open ? Fmax / cb : xE).toFixed(1) + '" y1="' + sy(Fmax).toFixed(1) + '" y2="' + sy(Fmax).toFixed(1) + '" style="stroke:var(--ix-1);stroke-dasharray:2 3"/><text class="tk" x="' + (gx0 + 4) + '" y="' + (sy(Fmax) - 4).toFixed(1) + '">Fmax</text>';
        o += '<text class="tk" x="' + sx(lam / 2).toFixed(1) + '" y="' + (gy0 - 6) + '" text-anchor="middle">λ</text><text class="tk" x="' + sx(lam + del / 2).toFixed(1) + '" y="' + (gy0 - 6) + '" text-anchor="middle">δ</text>';
        P.svg.innerHTML = o;
        var yield_ = Fmax > F02;
        out.innerHTML = '<h4><small class="nc">' + S.s + ' ' + S.c + ' · A<sub>s</sub> = ' + sc.As + ' mm² · F0,2 = ' + fmt(F02, 1) + ' kN</small>' + (open ? '<span style="color:var(--ix-5)">A kötés felnyílik!</span>' : yield_ ? '<span style="color:var(--ix-5)">A csavar megfolyik!</span>' : 'Fm = ' + fmt(Fm, 1) + ' kN maradó szorítás') + '</h4>' +
          U.kv([['Előfeszítés', 'Fe = ' + fmt(Fe, 1) + ' kN', S.fe + ' % az F0,2 folyáshatári erőnek'],
            ['Többleterő', 'Ft = Φ · Fü = ' + fmt(Ft, 1) + ' kN', 'Φ = c<sub>cs</sub> / (c<sub>cs</sub> + c<sub>p</sub>) — karcsú csavar, merev alkatrész → kicsi Φ'],
            ['Csavarerő', 'Fmax = Fe + Ft = ' + fmt(open ? Fu : Fe + Ft, 1) + ' kN', yield_ ? '<b style="color:var(--ix-5)">nagyobb F0,2-nél — maradó nyúlás</b>' : 'rugalmas tartományban'],
            ['Felnyílás', 'Fü ≥ Fe / (1 − Φ) = ' + fmt(Fe / (1 - phi), 1) + ' kN', open ? '<b style="color:var(--ix-5)">elérte — a szorítás megszűnt, a teljes Fü a csavaré</b>' : 'tartalék: ' + fmt(Fe / (1 - phi) - Fu, 1) + ' kN']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/20 — meghúzónyomaték és a kenés hatása                            */
  /* ================================================================== */
  var MU = [['0.40', 'zsírtalanított', 0.4], ['0.16', 'rézzel bevont', 0.16], ['0.13', 'gépolajos', 0.13], ['0.10', 'állati olajos', 0.10]];
  function preload(sc, M, mu) { return M * 1000 / (0.16 * sc.P + 0.58 * mu * sc.d2 + mu * sc.dk / 2) / 1000; } // kN, M Nm-ben
  function sigRed(sc, F, mu) {
    var d3 = sc.d - 1.2269 * sc.P, ds = (sc.d2 + d3) / 2, Mg = F * 1000 * (0.16 * sc.P + 0.58 * mu * sc.d2);
    var s = F * 1000 / sc.As, t = Mg / (Math.PI * ds * ds * ds / 16);
    return Math.sqrt(s * s + 3 * t * t);
  }
  AVIX.def('meghuz', {
    title: 'Meghúzónyomaték és előfeszítés: a kenés és a méret hatása',
    sub: 'M = F · (0,16 P + 0,58 μ d₂ + μ D_Km / 2) — ugyanaz a nyomaték más-más szorítóerőt ad',
    mount: function (el) {
      var st = U.store('meghuz', { m: 'ken', s: 'M12', mu: '0.13', M: 60, K: 40 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A kulcson mért nyomaték nagy része a <b>menet és a felfekvés súrlódására</b> megy el, csak kb. 10–15%-a feszíti elő a csavart. Ezért a kenés (a 20.5. ábra 1–4. egyenese) erősen befolyásolja a szorítóerőt, és egy „érzésre” meghúzott csavar kicsiben túl, nagyban alul van húzva.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['ken', 'Kenés hatása'], ['meret', 'Méret hatása']], S.m, function (v) { S.m = v; st.set(S); build(); }, 'Nézet');
      var box = U.h('div'); el.appendChild(box);
      var P, out;
      function build() {
        box.innerHTML = '';
        var r2 = U.h('div', 'ix-row'); box.appendChild(r2);
        if (S.m === 'ken') {
          U.seg(r2, ['M8', 'M10', 'M12', 'M16', 'M20'].map(function (k) { return [k, k]; }), S.s, function (v) { S.s = v; st.set(S); P.render(); }, 'Csavar');
          var r3 = U.h('div', 'ix-row'); box.appendChild(r3);
          U.chips(r3, MU.map(function (m) { return [m[0], m[1] + ' (μ ≈ ' + fmt(m[2], 2) + ')']; }), S.mu, function (v) { S.mu = v; st.set(S); P.render(); }, 'Menet állapota');
        }
        P = U.plot(box, { ratio: function (w) { return w < 520 ? 0.8 : 0.44; }, minH: 250, maxH: 340, label: S.m === 'ken' ? 'Nyomaték–szorítóerő' : 'Állandó nyomaték különböző méreteken' });
        var g = U.sliders(box);
        if (S.m === 'ken') U.slider(g, { label: 'Meghúzónyomaték M', min: 5, max: 400, step: 5, value: S.M, unit: 'Nm', dec: 0, onInput: function (v) { S.M = v; st.set(S); P.render(); } });
        else U.slider(g, { label: '„Érzésre” adott nyomaték', min: 10, max: 150, step: 5, value: S.K, unit: 'Nm', dec: 0, onInput: function (v) { S.K = v; st.set(S); P.render(); } });
        out = U.h('div', 'ix-out'); box.appendChild(out);
        P.draw = S.m === 'ken' ? drawKen : drawMeret;
        P.render();
      }
      var COLS = ['var(--ix-5)', 'var(--ix-2)', 'var(--ix-3)', 'var(--ix-1)'];
      function drawKen(w, h) {
        var sc = SCR[S.s], Fperm = 0.9 * 640 * sc.As / 1000, Mmax = 0, o = '';
        MU.forEach(function (m) { Mmax = Math.max(Mmax, Fperm * 1.2 * (0.16 * sc.P + 0.58 * m[2] * sc.d2 + m[2] * sc.dk / 2)); });
        Mmax = Math.min(400, Math.max(S.M * 1.1, Mmax * 0.6));
        var gx0 = 50, gx1 = w - 16, gy0 = h - 36, gy1 = 22, Fmx = Fperm * 1.3, sx = U.scale(0, Fmx, gx0, gx1), sy = U.scale(0, Mmax, gy0, gy1);
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: sx, sy: sy, xt: [0, Math.round(Fmx / 2), Math.round(Fmx)], yt: [0, Math.round(Mmax / 2), Math.round(Mmax)], xl: 'szorítóerő F, kN', yl: 'M, Nm' });
        o += '<rect x="' + sx(Fperm * 0.7).toFixed(1) + '" y="' + gy1 + '" width="' + (sx(Fperm) - sx(Fperm * 0.7)).toFixed(1) + '" height="' + (gy0 - gy1) + '" style="fill:var(--ix-3);fill-opacity:.1"/><text class="tk" x="' + sx(Fperm * 0.85).toFixed(1) + '" y="' + (gy1 + 12) + '" text-anchor="middle">cél (8.8)</text>';
        MU.forEach(function (m, i) {
          var k = 0.16 * sc.P + 0.58 * m[2] * sc.d2 + m[2] * sc.dk / 2, Fend = Math.min(Fmx, Mmax * 1000 / k / 1000);
          o += '<line x1="' + sx(0) + '" y1="' + sy(0) + '" x2="' + sx(Fend).toFixed(1) + '" y2="' + sy(Fend * k).toFixed(1) + '" style="stroke:' + COLS[i] + ';stroke-width:' + (m[0] === S.mu ? 3 : 1.4) + '"/><text class="tk" x="' + (sx(Fend) - 2).toFixed(1) + '" y="' + (sy(Fend * k) - 4).toFixed(1) + '" text-anchor="end" style="fill:' + COLS[i] + '">' + (i + 1) + '</text>';
        });
        var mu = parseFloat(S.mu), F = preload(sc, S.M, mu);
        o += '<line x1="' + gx0 + '" x2="' + sx(Math.min(F, Fmx)).toFixed(1) + '" y1="' + sy(S.M).toFixed(1) + '" y2="' + sy(S.M).toFixed(1) + '" style="stroke:var(--ink);stroke-dasharray:3 3"/><circle cx="' + sx(Math.min(F, Fmx)).toFixed(1) + '" cy="' + sy(S.M).toFixed(1) + '" r="5" class="mk"/>';
        P.svg.innerHTML = o;
        var sr = sigRed(sc, F, mu), util = sr / 640;
        out.innerHTML = '<h4><small class="nc">' + S.s + ' · μ ≈ ' + fmt(mu, 2) + ' (' + MU.filter(function (m) { return m[0] === S.mu; })[0][1] + ')</small>F = ' + fmt(F, 1) + ' kN szorítóerő</h4>' +
          U.kv([['Egyenesek', '1 zsírtalanított · 2 rezezett · 3 gépolajos · 4 állati olajos', 'a meredekebb egyenesen ugyanaz a nyomaték kisebb erőt ad'],
            ['Igénybevétel', 'σ<sub>red</sub> = ' + fmt(sr, 0) + ' MPa', util > 0.9 ? '<b style="color:var(--ix-5)">' + fmt(util * 100, 0) + '% — 8.8-as csavar megfolyik</b>' : fmt(util * 100, 0) + '% a 8.8-as csavar folyáshatárának (húzás + menetcsavarás)'],
            ['Nyomaték-megoszlás', fmt(0.16 * sc.P / (0.16 * sc.P + 0.58 * mu * sc.d2 + mu * sc.dk / 2) * 100, 0) + ' % előfeszítésre', 'a többi a menet és a fej/anya felfekvésének súrlódása']]) +
          '<p class="ix-note">μ-értékek tájékoztatók, a 20.5. ábra jellegét követik (a zsírtalanított, száraz menet súrlódása a legnagyobb). Pontos előfeszítéshez: nyúlásmérés, szöghúzás vagy hidraulikus feszítés.</p>';
      }
      function drawMeret(w, h) {
        var keys = ['M6', 'M8', 'M10', 'M12', 'M16', 'M20', 'M24'], o = '', gx0 = 44, gx1 = w - 14, gy0 = h - 36, gy1 = 24, bw = (gx1 - gx0) / keys.length;
        var sy = U.scale(0, 200, gy0, gy1), res = [];
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: function (v) { return v; }, sy: sy, xt: [], yt: [0, 50, 100, 150, 200], yl: '% cél', yf: function (v) { return v; } });
        o += '<rect x="' + gx0 + '" y="' + sy(100).toFixed(1) + '" width="' + (gx1 - gx0) + '" height="' + (sy(70) - sy(100)).toFixed(1) + '" style="fill:var(--ix-3);fill-opacity:.14"/>';
        keys.forEach(function (k, i) {
          var sc = SCR[k], F = preload(sc, S.K, 0.13), Ft = 0.7 * 640 * sc.As / 1000, p = F / Ft * 100, x = gx0 + i * bw + bw * 0.18, bh = sy(0) - sy(Math.min(p, 200));
          res.push([k, p]);
          o += '<rect x="' + x.toFixed(1) + '" y="' + sy(Math.min(p, 200)).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" style="fill:' + (p > 130 ? 'var(--ix-5)' : p < 60 ? 'var(--ix-4)' : 'var(--ix-3)') + ';fill-opacity:.7"/><text class="tk" x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (gy0 + 14) + '" text-anchor="middle">' + k + '</text>';
          if (p > 200) o += '<text class="la sm" x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (gy1 + 10) + '" text-anchor="middle">' + fmt(p, 0) + '%</text>';
        });
        P.svg.innerHTML = o;
        var over = res.filter(function (r) { return r[1] > 130; }).map(function (r) { return r[0]; }), under = res.filter(function (r) { return r[1] < 60; }).map(function (r) { return r[0]; });
        out.innerHTML = '<h4><small class="nc">' + S.K + ' Nm minden méreten, gépolajos menet (μ ≈ 0,13)</small>Egy nyomaték nem jó minden csavarhoz</h4>' +
          U.kv([['Túlhúzott (&gt;130%)', over.length ? over.join(', ') : '—', 'a kis csavar megfolyik, elszakad, kiszakítja a menetet'], ['Alulhúzott (&lt;60%)', under.length ? under.join(', ') : '—', 'a nagy csavar kilazulhat, a kötés felnyílhat'], ['Cél', '70–100 %', 'a 8.8-as csavar F0,2 erejének kb. 70%-a (sáv)']]) +
          '<p class="ix-note">Ezért kell méretenként előírt meghúzónyomaték és nyomatékkulcs — „a meghúzónyomaték a kisméretű csavarokhoz túl nagy, a nagyobbakhoz túl kicsi”.</p>';
      }
      build();
    },
  });

  /* ================================================================== */
  /* B/20 — sajtolt, zsugorkötés teherbírása                             */
  /* ================================================================== */
  AVIX.def('zsugor', {
    title: 'Sajtolt és zsugorkötés: túlfedés → nyomás → nyomaték',
    sub: 'Az érdességcsúcsok „megeszik” a túlfedést; a szükséges melegítés az agyfurat méretéből',
    mount: function (el) {
      var st = U.store('zsugor', { d: 60, ld: 1, q: 0.5, f: 'H7/s6', rz: 10, mu: 0.12, Mt: 500 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A tengely és az agy közötti túlfedés rugalmas alakváltozást okoz; a felületek között <b>p nyomás</b> ébred, a súrlódás ebből viszi át a nyomatékot. A sajtoláskor belapuló érdességcsúcsok miatt a <b>hatásos túlfedés kisebb</b> a mértnél. (Kiegészítő számítás a DIN 7190 alapösszefüggéseivel, azonos anyagú tömör tengely és agy.)</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.chips(r1, [['H7/p6', 'H7/p6'], ['H7/r6', 'H7/r6'], ['H7/s6', 'H7/s6']], S.f, function (v) { S.f = v; st.set(S); P.render(); }, 'Illesztés');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.74 : 0.4; }, minH: 240, maxH: 320, label: 'Tengely–agy keresztmetszet és teherbírás' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Átmérő d', min: 20, max: 160, step: 5, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Agyhossz l / d', min: 0.5, max: 2, step: 0.1, value: S.ld, dec: 1, onInput: function (v) { S.ld = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Viszonyszám Q = d / D', min: 0.3, max: 0.8, step: 0.05, value: S.q, dec: 2, onInput: function (v) { S.q = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Érdesség Rz (tengely + agy)', min: 2, max: 30, step: 1, value: S.rz, unit: 'µm', dec: 0, onInput: function (v) { S.rz = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Súrlódási tényező μ', min: 0.08, max: 0.2, step: 0.01, value: S.mu, dec: 2, onInput: function (v) { S.mu = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Átviendő nyomaték', min: 50, max: 8000, step: 50, value: S.Mt, unit: 'Nm', dec: 0, onInput: function (v) { S.Mt = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var pr = S.f.split('/'), H = ISO.hole('H', 7, S.d), C = ISO.shaft(pr[1][0], 6, S.d), dmin = C[1] - H[0], dmax = C[0] - H[1];
        var lost = 0.8 * S.rz, emin = Math.max(0, dmin - lost), emax = Math.max(0, dmax - lost), E = 210000, Q = S.q, l = S.ld * S.d;
        function pres(e) { return E * e / 1000 * (1 - Q * Q) / (2 * S.d); }
        var pmin = pres(emin), pmax = pres(emax), Mmin = S.mu * pmin * Math.PI * S.d * S.d * l / 2 / 1000, Fax = S.mu * pmin * Math.PI * S.d * l / 1000;
        var sigT = pmax * (1 + Q * Q) / (1 - Q * Q), dT = (dmax / 1000 + 0.001 * S.d) / (11e-6 * S.d), Sf = Mmin / S.Mt, o = '', narrow = w < 520;
        // keresztmetszet
        var cx = narrow ? w * 0.28 : w * 0.22, cy = h / 2, R = Math.min(h * 0.38, (narrow ? w * 0.26 : w * 0.2)), rs = R * Q;
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R.toFixed(1) + '" style="fill:var(--ix-1);fill-opacity:.2;stroke:var(--ink);stroke-width:1.4"/>';
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rs.toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.45;stroke:var(--ink);stroke-width:1.4"/>';
        var nA = Math.round(6 + Math.min(18, pmin / 8));
        for (var i = 0; i < nA; i++) { var a = i / nA * 2 * Math.PI, x1 = cx + (rs + 12) * Math.cos(a), y1 = cy + (rs + 12) * Math.sin(a), x2 = cx + (rs + 2) * Math.cos(a), y2 = cy + (rs + 2) * Math.sin(a); o += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" style="stroke:var(--acc);stroke-width:1.6"/>'; }
        o += '<text class="lb sm" x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle">tengely</text><text class="tk" x="' + cx + '" y="' + (cy - R - 6).toFixed(1) + '" text-anchor="middle">agy (D = ' + fmt(S.d / Q, 0) + ' mm)</text>';
        // nyomatékoszlopok
        var gx0 = cx + R + (narrow ? 22 : 50), gx1 = w - 14, gy0 = h - 30, gy1 = 26, mx = Math.max(Mmin, S.Mt) * 1.2, sy = U.scale(0, mx, gy0, gy1), bw = Math.min(70, (gx1 - gx0) / 3);
        [[Mmin, 'átvihető', Sf >= 1.5 ? 'var(--ix-3)' : Sf >= 1 ? 'var(--ix-4)' : 'var(--ix-5)'], [S.Mt, 'terhelő', 'var(--ix-8)']].forEach(function (b, i) {
          var x = gx0 + i * (bw + 18);
          o += '<rect x="' + x.toFixed(1) + '" y="' + sy(b[0]).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (gy0 - sy(b[0])).toFixed(1) + '" rx="3" style="fill:' + b[2] + ';fill-opacity:.7"/><text class="tk" x="' + (x + bw / 2).toFixed(1) + '" y="' + (gy0 + 14) + '" text-anchor="middle">' + b[1] + '</text><text class="lb sm" x="' + (x + bw / 2).toFixed(1) + '" y="' + (sy(b[0]) - 5).toFixed(1) + '" text-anchor="middle">' + fmt(b[0], 0) + ' Nm</text>';
        });
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small class="nc">' + S.f + ' · d = ' + S.d + ' mm · l = ' + fmt(l, 0) + ' mm</small>Biztonság: ' + fmt(Sf, 2) + ' ' + (Sf >= 1.5 ? '— megfelel' : Sf >= 1 ? '— kevés tartalék' : '<span style="color:var(--ix-5)">— megcsúszik</span>') + '</h4>' +
          U.kv([['Túlfedés', fmt(dmin, 0) + ' … ' + fmt(dmax, 0) + ' µm', 'hatásos (−0,8 · ΣRz = −' + fmt(lost, 0) + ' µm): ' + fmt(emin, 0) + ' … ' + fmt(emax, 0) + ' µm'],
            ['Felületi nyomás', 'p = ' + fmt(pmin, 0) + ' … ' + fmt(pmax, 0) + ' MPa', 'p = E · δ<sub>eff</sub> · (1 − Q²) / (2d)'],
            ['Átvihető', 'M = ' + fmt(Mmin, 0) + ' Nm, F<sub>ax</sub> = ' + fmt(Fax, 1) + ' kN', 'M = μ · p · π · d² · l / 2 (a legkisebb túlfedéssel)'],
            ['Agy igénybevétele', 'σ<sub>t</sub> = ' + fmt(sigT, 0) + ' MPa a furatnál', sigT > 355 ? '<b style="color:var(--ix-5)">nagyobb egy S355 agy folyáshatáránál — vastagabb agy (kisebb Q) kell</b>' : 'p · (1 + Q²) / (1 − Q²)'],
            ['Zsugorítás', 'ΔT ≈ ' + fmt(dT, 0) + ' K → kb. ' + fmt(20 + dT, 0) + ' °C', (20 + dT > 400 ? '<b style="color:var(--ix-5)">a jegyzet szerinti 400 °C fölött</b> — kombinált kötés (tengely hűtése) kell' : 'δ<sub>max</sub> + 1‰ · d szerelési játékkal, α ≈ 11·10⁻⁶ 1/K; a jegyzet határa 400 °C')]]) +
          '<p class="ix-note">Tájékoztató számítás: E = 210 GPa, azonos anyag, tömör tengely, egyenletes nyomáseloszlás. A durvább felület (nagyobb Rz) és a vékonyabb agy (Q → 1) látványosan csökkenti a teherbírást.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/20 — kötések csoportosítása (gyakorló)                            */
  /* ================================================================== */
  var KOT = [
    ['Csavarkötés', 1, 0, 'e', 'Oldható; a szorítást az előfeszítés adja — erőzáró.'],
    ['Reteszkötés', 1, 0, 'a', 'Oldható; a retesz alakja viszi a nyomatékot — alakzáró. Axiális biztosítás kell!'],
    ['Siklóretesz', 1, 1, 'a', 'Mozgó (az agy tengelyirányban elcsúszhat), oldható, alakzáró.'],
    ['Bordástengely', 1, 0, 'a', 'Oldható, alakzáró; bordavezetésként mozgó kötés is lehet.'],
    ['Zsugorkötés', 0, 0, 'e', 'Nem oldható (bontása nehézkes); a túlfedésből eredő nyomás és súrlódás tartja — erőzáró.'],
    ['Kúpos szorító kötés', 1, 0, 'e', 'Oldható; a kúpfelületek súrlódása viszi a nyomatékot — erőzáró.'],
    ['Kúpos gyűrűpár', 1, 0, 'e', 'Oldható, erőzáró; a gyűrűk a feszítéskor tengelyre és agyra szorulnak.'],
    ['Poligon kötés', 1, 0, 'a', 'Oldható, alakzáró; horony nélkül, felületi nyomással visz át.'],
    ['Hegesztés', 0, 0, 'm', 'Nem oldható, anyagzáró (anyagfolytonosság).'],
    ['Ragasztás', 0, 0, 'm', 'Nem oldható, anyagzáró; a megszilárduló ragasztó köt.'],
    ['Forrasztás', 0, 0, 'm', 'Nem oldható, anyagzáró; csak a forrasz olvad meg.'],
    ['Szegecselés', 0, 0, 'a', 'Nem oldható; a szegecsszár nyírással és palástnyomással visz át — alakzáró (a zsugorodó szegecs szorítása mellett).'],
    ['Zárt gördülőcsapágy', 0, 1, 'a', 'Mozgó–nem oldható kötés (zárt egység); a gördülőelemek alakjukkal vezetnek.'],
    ['Szilentblokk', 0, 1, 'm', 'Mozgó (rugalmas) – nem oldható; a gumi a fémhez vulkanizálva kötődik — anyagzáró.'],
    ['Csigahajtás', 1, 1, 'a', 'Mozgó–oldható; a fogazat alakja visz át — alakzáró.'],
    ['Sasszeges biztosítás', 1, 0, 'a', 'Oldható, alakzáró biztosítás (a jegyzet ábráján az alakzáró példa).'],
    ['Kontraanya', 1, 0, 'e', 'Oldható, erőzáró biztosítás — meghúzásához két kulcs kell.'],
  ];
  AVIX.def('kotesek', {
    title: 'Kötések csoportosítása — gyakorló',
    sub: 'Oldható-e? Mozgó-e? Erő-, alak- vagy anyagzáró? Válaszolj, és nézd meg az indoklást',
    mount: function (el) {
      var st = U.store('kotesek', { i: 0, ok: 0, n: 0 }), S = st.get(), ans = { o: null, m: null, z: null }, done = false;
      el.innerHTML = '<p class="ix-lead">Minden kötés két kérdésre bontható: <b>oldható-e</b> és <b>mozgó-e</b> — a terhelést pedig <b>erőzáró</b>, <b>alakzáró</b> vagy <b>anyagzáró</b> elv viszi át. A két osztályozás független egymástól.</p>';
      var card = U.h('div'); el.appendChild(card);
      function draw() {
        var k = KOT[S.i % KOT.length];
        card.innerHTML = '<div class="ix-out"><h4><small>' + (S.i % KOT.length + 1) + ' / ' + KOT.length + ' · eredmény: ' + S.ok + ' / ' + S.n + '</small>' + esc(k[0]) + '</h4></div>';
        var r1 = U.h('div', 'ix-row'), r2 = U.h('div', 'ix-row'), r3 = U.h('div', 'ix-row');
        card.appendChild(r1); card.appendChild(r2); card.appendChild(r3);
        U.seg(r1, [['1', 'oldható'], ['0', 'nem oldható']], ans.o, function (v) { ans.o = v; }, 'Oldhatóság');
        U.seg(r2, [['0', 'nem mozgó'], ['1', 'mozgó']], ans.m, function (v) { ans.m = v; }, 'Mozgás');
        U.seg(r3, [['e', 'erőzáró'], ['a', 'alakzáró'], ['m', 'anyagzáró']], ans.z, function (v) { ans.z = v; }, 'Hatáselv');
        var r4 = U.h('div', 'ix-row'); card.appendChild(r4);
        r4.innerHTML = '<button type="button" class="ix-btn" data-a="chk">Ellenőrzés</button><button type="button" class="ix-btn" data-a="next">Következő</button>';
        var fb = U.h('div'); card.appendChild(fb);
        r4.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.getAttribute('data-a') === 'next') { S.i = (S.i + 1) % KOT.length; ans = { o: null, m: null, z: null }; done = false; st.set(S); draw(); return; }
          if (ans.o === null || ans.m === null || ans.z === null) { fb.innerHTML = '<p class="ix-hint">Mindhárom kérdésre válaszolj!</p>'; return; }
          var good = +ans.o === k[1] && +ans.m === k[2] && ans.z === k[3];
          if (!done) { S.n++; if (good) S.ok++; done = true; st.set(S); }
          fb.innerHTML = '<p class="ix-hint" style="border-left-color:' + (good ? 'var(--ix-3)' : 'var(--ix-5)') + '"><b>' + (good ? 'Helyes.' : 'Nem egészen.') + '</b> ' + (k[1] ? 'Oldható' : 'Nem oldható') + ', ' + (k[2] ? 'mozgó' : 'nem mozgó') + ', ' + { e: 'erőzáró', a: 'alakzáró', m: 'anyagzáró' }[k[3]] + '. ' + esc(k[4]) + '</p>';
          card.querySelector('.ix-out small').textContent = (S.i % KOT.length + 1) + ' / ' + KOT.length + ' · eredmény: ' + S.ok + ' / ' + S.n;
        });
      }
      draw();
    },
  });
})();
