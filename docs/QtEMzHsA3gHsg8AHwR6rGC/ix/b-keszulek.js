/*
 * Gépész záróvizsga tételtár — interaktív ábrák a B/12–B/13 tételekhez
 * (helyzetmeghatározás, helyzetmeghatározási hiba, szorítási elvek, szorítóelemek).
 * Források: Kun–Lőska–Nagy: Készüléktervezés (2019), Stampfer: Készülékek (PTE), a tárgy készülékes jegyzete.
 * Az ábrák saját rajzok; a számpéldák szemléltető adatokkal, a jegyzetek összefüggéseivel számolnak.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ================================================================== */
  /* B/12 — hatpont-törvény: lekötött szabadságfokok                      */
  /* ================================================================== */
  var DOFS = [['tx', 'x menti eltolás'], ['ty', 'y menti eltolás'], ['tz', 'z menti eltolás'], ['rx', 'x körüli elfordulás'], ['ry', 'y körüli elfordulás'], ['rz', 'z körüli elfordulás']];
  var HP = {
    hasab: {
      n: 'Hasáb', els: [
        { k: 'b3', n: 'Fő bázissík — 3 pont', dof: ['tz', 'rx', 'ry'], at: [[18, 14, 0], [82, 14, 0], [50, 48, 0]], on: 1 },
        { k: 'v2', n: 'Vezetősík — 2 pont', dof: ['ty', 'rz'], at: [[22, 0, 20], [78, 0, 20]], on: 1 },
        { k: 'u1', n: 'Ütköző — 1 pont', dof: ['tx'], at: [[0, 30, 20]], on: 1 },
        { k: 'b4', n: '4. pont a bázissíkon', dof: ['tz', 'rx', 'ry'], at: [[82, 48, 0]] },
      ], box: [100, 60, 36],
    },
    tengely: {
      n: 'Tengely (külső hengeres)', els: [
        { k: 'hp', n: 'Hosszú prizma (4)', dof: ['ty', 'tz', 'ry', 'rz'], at: [[20, 0, -20], [60, 0, -20], [100, 0, -20]], on: 1 },
        { k: 'kp', n: 'Keskeny prizma (2)', dof: ['ty', 'tz'], at: [[60, 0, -20]] },
        { k: 'ut', n: 'Homlokütköző (1)', dof: ['tx'], at: [[0, 0, 0]], on: 1 },
        { k: 'tj', n: 'Tájolás, pl. horony + csap (1)', dof: ['rx'], at: [[60, 0, 20]], on: 1 },
        { k: 'ku', n: 'Kúp az ellenkúppal (5)', dof: ['tx', 'ty', 'tz', 'ry', 'rz'], at: [[0, 0, 0], [8, 0, 0]] },
      ], cyl: [120, 20],
    },
    tarcsa: {
      n: 'Tárcsa (furattal)', els: [
        { k: 'rt', n: 'Rövid tüske (2)', dof: ['ty', 'tz'], at: [[12, 0, 0]], on: 1 },
        { k: 'va', n: 'Váll / síkülék (3)', dof: ['tx', 'ry', 'rz'], at: [[24, 0, 26], [24, 22, -13], [24, -22, -13]], on: 1 },
        { k: 'ht', n: 'Hosszú tüske (4)', dof: ['ty', 'tz', 'ry', 'rz'], at: [[0, 0, 0], [24, 0, 0]] },
        { k: 'vk', n: 'Kis váll, ütköző (1)', dof: ['tx'], at: [[24, 0, 14]] },
        { k: 'tc', n: 'Tájolócsap (1)', dof: ['rx'], at: [[12, 0, 28]], on: 1 },
      ], cyl: [24, 40], bore: 10,
    },
  };
  AVIX.def('hatpont', {
    title: 'Hatpont-törvény: melyik elem mit köt le?',
    sub: 'Kapcsold be a helyzetmeghatározó elemeket — alul-, pontosan vagy túlhatározott a munkadarab?',
    mount: function (el) {
      var st = U.store('hatpont', { b: 'hasab', on: null }), S = st.get();
      function defaults() { var o = {}; HP[S.b].els.forEach(function (e) { o[e.k] = !!e.on; }); return o; }
      if (!S.on || !S.on.__b || S.on.__b !== S.b) { S.on = defaults(); S.on.__b = S.b; }
      el.innerHTML = '<p class="ix-lead">A szabad testnek 6 szabadságfoka van (3 eltolás, 3 elfordulás), és egy megtámasztási pont egyet köt le. <b>Válassz testet, és kapcsold az elemeket</b>: minden szabadságfoknak pontosan egyszer kell kötöttnek lennie. Ha valamit kétszer kötünk le, a darab <b>túlhatározott</b> (feszül, bizonytalanul fekszik fel).</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, Object.keys(HP).map(function (k) { return [k, HP[k].n]; }), S.b, function (v) { S.b = v; S.on = defaults(); S.on.__b = v; st.set(S); drawBtns(); P.render(); }, 'Munkadarab');
      var btns = U.h('div', 'ix-chips'); el.appendChild(btns);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.45; }, minH: 240, maxH: 340, label: 'Munkadarab és szabadságfokok' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function drawBtns() {
        btns.innerHTML = HP[S.b].els.map(function (e) { return '<button type="button" data-k="' + e.k + '" aria-pressed="' + !!S.on[e.k] + '">' + esc(e.n) + '</button>'; }).join('');
      }
      btns.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b) return; var k = b.getAttribute('data-k'); S.on[k] = !S.on[k]; st.set(S); drawBtns(); P.render(); });
      drawBtns();
      P.draw = function (w, h) {
        var B = HP[S.b], cnt = {}, o = '', narrow = w < 520;
        DOFS.forEach(function (d) { cnt[d[0]] = 0; });
        B.els.forEach(function (e) { if (S.on[e.k]) e.dof.forEach(function (d) { cnt[d]++; }); });
        var sc = Math.min(w * 0.5, h * 0.85) / 150, cx = narrow ? w * 0.4 : w * 0.36, cy = h * (B.box ? 0.9 : 0.8);
        // izometrikus vetület a (−x, −y, +z) irányból: az x = 0 és y = 0 lap (az ülékek oldala) látszik
        function Q(p) { return [cx + (p[1] - p[0]) * 0.87 * sc, cy - (p[0] + p[1]) * 0.5 * sc - p[2] * sc]; }
        function poly(pts, sty) { return '<path d="M' + pts.map(function (p) { var q = Q(p); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L') + 'Z" style="' + sty + '"/>'; }
        if (B.box) {
          var X = B.box[0], Y = B.box[1], Z = B.box[2];
          // látható lapok: y = 0 (elöl-bal), x = 0 (elöl-jobb helyett): a nézet (−1,−1,+1) felől
          o += poly([[0, 0, 0], [X, 0, 0], [X, 0, Z], [0, 0, Z]], 'fill:var(--surface);stroke:var(--ink);stroke-width:1.4');
          o += poly([[0, 0, 0], [0, Y, 0], [0, Y, Z], [0, 0, Z]], 'fill:var(--surface-2);stroke:var(--ink);stroke-width:1.4');
          o += poly([[0, 0, Z], [X, 0, Z], [X, Y, Z], [0, Y, Z]], 'fill:var(--surface);stroke:var(--ink);stroke-width:1.4');
        } else {
          var L = B.cyl[0], R = B.cyl[1], ring = function (x, r) { var a = []; for (var i = 0; i <= 48; i++) { var t = 2 * Math.PI * i / 48; a.push([x, r * Math.cos(t), r * Math.sin(t)]); } return a; };
          var back = ring(L, R), front = ring(0, R);
          o += poly(back, 'fill:var(--surface-2);stroke:var(--muted);stroke-width:1;stroke-dasharray:4 3');
          // palást: a két kör összekötése a szélső pontoknál
          var qa = Q([0, 0, R]), qb = Q([L, 0, R]), qc = Q([L, 0, -R]), qd = Q([0, 0, -R]);
          var ys = [Q([0, -R, 0]), Q([L, -R, 0]), Q([L, R, 0]), Q([0, R, 0])];
          o += '<path d="M' + qa[0].toFixed(1) + ',' + qa[1].toFixed(1) + 'L' + qb[0].toFixed(1) + ',' + qb[1].toFixed(1) + 'M' + qd[0].toFixed(1) + ',' + qd[1].toFixed(1) + 'L' + qc[0].toFixed(1) + ',' + qc[1].toFixed(1) + 'M' + ys[0][0].toFixed(1) + ',' + ys[0][1].toFixed(1) + 'L' + ys[1][0].toFixed(1) + ',' + ys[1][1].toFixed(1) + 'M' + ys[3][0].toFixed(1) + ',' + ys[3][1].toFixed(1) + 'L' + ys[2][0].toFixed(1) + ',' + ys[2][1].toFixed(1) + '" style="stroke:var(--ink);stroke-width:1.2"/>';
          o += poly(front, 'fill:var(--surface);stroke:var(--ink);stroke-width:1.5');
          if (B.bore) o += poly(ring(0, B.bore), 'fill:var(--surface-2);stroke:var(--ink);stroke-width:1.2');
          var ax0 = Q([-15, 0, 0]), ax1 = Q([L + 15, 0, 0]);
          o += '<line x1="' + ax0[0].toFixed(1) + '" y1="' + ax0[1].toFixed(1) + '" x2="' + ax1[0].toFixed(1) + '" y2="' + ax1[1].toFixed(1) + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/>';
        }
        // elemek jelölése
        B.els.forEach(function (e, i) {
          if (!S.on[e.k]) return;
          var over = e.dof.some(function (d) { return cnt[d] > 1; }), col = over ? 'var(--ix-5)' : 'var(--ix-' + (i % 4 + 2) + ')';
          e.at.forEach(function (p) { var q = Q(p); o += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="5" style="fill:' + col + ';stroke:var(--surface);stroke-width:1.5"/>'; });
          var q0 = Q(e.at[0]);
          o += '<text class="sm" x="' + (q0[0] + 7).toFixed(1) + '" y="' + (q0[1] - 6).toFixed(1) + '" style="fill:' + col + ';font-weight:700">' + (i + 1) + '</text>';
        });
        // szabadságfok-triád
        var tx0 = narrow ? w * 0.78 : w * 0.8, ty0 = h * 0.5, AL = Math.min(w, h) * 0.16;
        var axes = { x: [-0.87, -0.5], y: [0.87, -0.5], z: [0, -1] };
        ['x', 'y', 'z'].forEach(function (a) {
          var d = axes[a], ct = cnt['t' + a], cr = cnt['r' + a];
          var colT = ct === 0 ? 'var(--acc)' : ct > 1 ? 'var(--ix-5)' : 'var(--rule-2)', colR = cr === 0 ? 'var(--acc)' : cr > 1 ? 'var(--ix-5)' : 'var(--rule-2)';
          var x1 = tx0 + d[0] * AL, y1 = ty0 + d[1] * AL, an = Math.atan2(d[1], d[0]);
          o += '<line x1="' + tx0 + '" y1="' + ty0 + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" style="stroke:' + colT + ';stroke-width:' + (ct === 1 ? 2 : 3) + '"/><path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + 'L' + (x1 - 9 * Math.cos(an - 0.4)).toFixed(1) + ',' + (y1 - 9 * Math.sin(an - 0.4)).toFixed(1) + 'L' + (x1 - 9 * Math.cos(an + 0.4)).toFixed(1) + ',' + (y1 - 9 * Math.sin(an + 0.4)).toFixed(1) + 'Z" style="fill:' + colT + '"/>';
          var mx = tx0 + d[0] * AL * 0.62, my = ty0 + d[1] * AL * 0.62, rr = 10;
          o += '<ellipse cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" rx="' + rr + '" ry="' + (rr * 0.45) + '" transform="rotate(' + (an * DEG + 90).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ')" style="fill:none;stroke:' + colR + ';stroke-width:' + (cr === 1 ? 1.5 : 2.6) + '"/>';
          o += '<text class="lb" x="' + (x1 + d[0] * 10).toFixed(1) + '" y="' + (y1 + d[1] * 10 + 4).toFixed(1) + '" text-anchor="middle">' + a + '</text>';
        });
        o += narrow ? '<text class="tk" x="' + (w - 8) + '" y="' + (h - 24) + '" text-anchor="end">nyíl: eltolás</text><text class="tk" x="' + (w - 8) + '" y="' + (h - 10) + '" text-anchor="end">ellipszis: elfordulás</text>' : '<text class="tk" x="' + (w - 8) + '" y="' + (h - 10) + '" text-anchor="end">nyíl: eltolás · ellipszis: elfordulás</text>';
        P.svg.innerHTML = o;
        var free = DOFS.filter(function (d) { return cnt[d[0]] === 0; }), over = DOFS.filter(function (d) { return cnt[d[0]] > 1; }), n = DOFS.length - free.length;
        var verdict = over.length ? 'Túlhatározott' : free.length ? 'Alulhatározott' : 'Pontosan meghatározott';
        out.innerHTML = '<h4><small>' + n + ' / 6 szabadságfok kötött</small>' + verdict + '</h4>' +
          (over.length ? '<p class="ix-hint" style="border-left-color:var(--ix-5)"><b>Kétszer kötött:</b> ' + over.map(function (d) { return d[1]; }).join(', ') + '. A darab feszül, a felfekvés bizonytalan — el kell hagyni egy elemet, vagy mozgó üléket kell alkalmazni.</p>' : '') +
          (free.length ? '<p><b>Szabad:</b> ' + free.map(function (d) { return d[1]; }).join(', ') + '. ' + (free.length === 1 && free[0][0] === 'rx' ? 'A tengely körüli elfordulást a tájolás köti le — ha a megmunkálás forgásszimmetrikus, erre nincs is szükség.' : '') + '</p>' : '') +
          '<ol style="margin:6px 0 0 18px;font-size:14px;line-height:1.5">' + HP[S.b].els.filter(function (e) { return S.on[e.k]; }).map(function (e) { return '<li>' + esc(e.n) + ': ' + e.dof.join(', ') + '</li>'; }).join('') + '</ol>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/12 — prizmás központosítás hibája                                  */
  /* ================================================================== */
  AVIX.def('prizma', {
    title: 'Prizmás központosítás hibája',
    sub: 'Az átmérő szórása a tengelyt, a felső és az alsó alkotót eltérő mértékben mozdítja el',
    mount: function (el) {
      var st = U.store('prizma', { b: 90, d: 40, td: 0.1, ref: 'O' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A prizma a függőleges szimmetriasíkot hibátlanul állítja be, a munkadarab <b>magassági helyzete</b> viszont az átmérőtől függ. A rajzon a legkisebb és a legnagyobb darab látható (a tűrés a jobb láthatóság kedvéért nagyítva). <b>Válaszd ki, honnan van a méret megadva</b> — ettől függ a helyzetmeghatározási hiba.</p>';
      var r = U.h('div', 'ix-row'); el.appendChild(r);
      U.seg(r, [['60', '60°'], ['90', '90°'], ['120', '120°']], String(S.b), function (v) { S.b = +v; st.set(S); P.render(); }, 'Prizmaszög');
      U.seg(r, [['O', 'tengelytől'], ['A', 'felső alkotótól'], ['B', 'alsó alkotótól']], S.ref, function (v) { S.ref = v; st.set(S); P.render(); }, 'Méretbázis');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.85 : 0.5; }, minH: 260, maxH: 360, label: 'Prizmás befogás' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Átmérő d', min: 10, max: 80, step: 1, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Tűrés Td', min: 0.01, max: 0.5, step: 0.01, value: S.td, unit: 'mm', dec: 2, onInput: function (v) { S.td = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var hb = S.b / 2 * RAD, s = Math.sin(hb), EX = Math.max(1, 0.12 * S.d / S.td), o = '';
        var r0 = S.d / 2, rmin = r0 - S.td / 2 * EX, rmax = r0 + S.td / 2 * EX;
        var sc = Math.min(w * 0.5 / (2 * rmax / Math.cos(hb) + 10), (h - 40) / (rmax / s + rmax + 10)), ax = w * 0.4, ay = h - 20;
        function Y(v) { return ay - v * sc; }
        var wv = (rmax / s + rmax) * Math.tan(hb) * 1.05;
        o += '<path d="M' + (ax - wv * sc - 20).toFixed(1) + ',' + (ay + 16) + 'L' + (ax - wv * sc - 20).toFixed(1) + ',' + Y((rmax / s + rmax) * 1.05).toFixed(1) + 'L' + (ax - wv * sc).toFixed(1) + ',' + Y((rmax / s + rmax) * 1.05).toFixed(1) + 'L' + ax + ',' + ay + 'L' + (ax + wv * sc).toFixed(1) + ',' + Y((rmax / s + rmax) * 1.05).toFixed(1) + 'L' + (ax + wv * sc + 20).toFixed(1) + ',' + Y((rmax / s + rmax) * 1.05).toFixed(1) + 'L' + (ax + wv * sc + 20).toFixed(1) + ',' + (ay + 16) + 'Z" style="fill:url(#pzH);stroke:var(--ink);stroke-width:1.4"/>';
        o = '<defs><pattern id="pzH" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style="stroke:var(--muted);stroke-width:1"/></pattern></defs>' + o;
        [[rmin, 'var(--ix-2)', 'd_min'], [rmax, 'var(--ix-1)', 'd_max']].forEach(function (c) {
          var hc = c[0] / s;
          o += '<circle cx="' + ax + '" cy="' + Y(hc).toFixed(1) + '" r="' + (c[0] * sc).toFixed(1) + '" style="fill:' + c[1] + ';fill-opacity:.12;stroke:' + c[1] + ';stroke-width:1.8"/>';
          o += '<circle cx="' + ax + '" cy="' + Y(hc).toFixed(1) + '" r="3" style="fill:' + c[1] + '"/>';
        });
        // méretvonalak jobb oldalon
        function dim(xm, v0, v1, lab, on) {
          var l = '<line x1="' + (xm - 6) + '" x2="' + (xm + 6) + '" y1="';
          return '<line x1="' + xm + '" x2="' + xm + '" y1="' + Y(v0).toFixed(1) + '" y2="' + Y(v1).toFixed(1) + '" style="stroke:' + (on ? 'var(--acc)' : 'var(--muted)') + ';stroke-width:' + (on ? 3 : 1.5) + '"/>' +
            l + Y(v0).toFixed(1) + '" y2="' + Y(v0).toFixed(1) + '" style="stroke:var(--muted)"/>' + l + Y(v1).toFixed(1) + '" y2="' + Y(v1).toFixed(1) + '" style="stroke:var(--muted)"/>' +
            '<text class="' + (on ? 'la' : 'tk') + '" x="' + (xm + 9) + '" y="' + ((Y(v0) + Y(v1)) / 2 + 4).toFixed(1) + '">' + lab + '</text>';
        }
        var hmin = rmin / s, hmax = rmax / s, xr = ax + rmax * sc + 24;
        o += dim(xr, hmin + rmin, hmax + rmax, 'Δ_A', S.ref === 'A');
        o += dim(xr + 44, hmin, hmax, 'Δ_O', S.ref === 'O');
        o += dim(xr, hmin - rmin, hmax - rmax, 'Δ_B', S.ref === 'B');
        [[hmin + rmin, hmax + rmax], [hmin, hmax], [hmin - rmin, hmax - rmax]].forEach(function (p) { p.forEach(function (v) { o += '<line x1="' + ax + '" x2="' + (xr + 50) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" style="stroke:var(--rule-2);stroke-width:.8;stroke-dasharray:2 3"/>'; }); });
        P.svg.innerHTML = o;
        var dO = S.td / (2 * s), dA = S.td / 2 * (1 / s + 1), dB = S.td / 2 * (1 / s - 1), cur = { O: dO, A: dA, B: dB }[S.ref];
        out.innerHTML = '<h4><small>β = ' + S.b + '°, T<sub>d</sub> = ' + fmt(S.td, 2) + ' mm (a rajzon ×' + fmt(EX, 0) + ')</small>Helyzetmeghatározási hiba: ' + fmt(cur * 1000, 0) + ' µm</h4>' +
          U.kv([['Tengely', 'Δ_O = T_d/(2·sin(β/2)) = ' + fmt(dO * 1000, 0) + ' µm', ''], ['Felső alkotó', 'Δ_A = (T_d/2)(1/sin(β/2) + 1) = ' + fmt(dA * 1000, 0) + ' µm', 'a legnagyobb'], ['Alsó alkotó', 'Δ_B = (T_d/2)(1/sin(β/2) − 1) = ' + fmt(dB * 1000, 0) + ' µm', 'a legkisebb — ha lehet, innen adjuk meg a méretet']]) +
          '<p class="ix-note">A jegyzet szerint a keskeny prizma 2, a hosszú prizma 4 szabadságfokot köt le. Nagyobb prizmaszög kisebb tengelyhibát ad, de gyengébben vezet.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/12 — kétlyuk-bázis tájolás szöghibája                              */
  /* ================================================================== */
  AVIX.def('ketlyuk', {
    title: 'Kétlyuk-bázis tájolás: központosító csap és tájolócsap',
    sub: 'A fix tájolócsapok mindig hibával tájolnak: tg Δφ = (S1 + S2)/(2L)',
    mount: function (el) {
      var st = U.store('ketlyuk', { L: 80, s1: 20, s2: 30, tl: 40, romb: 'n' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A darabot a nagyobb furaton egy hengeres <b>központosító csap</b>, a másikon a <b>tájolócsap</b> határozza meg. A csapok és furatok közötti hézag miatt a darab kissé elfordulhat. A legrosszabb eset: a furatok a felső, a csapok az alsó határméreten, és a két furat ellentétes irányba mozdul.</p>';
      var r = U.h('div', 'ix-row'); el.appendChild(r);
      U.seg(r, [['n', 'Két hengeres csap'], ['i', 'Tájolócsap lapítva (rombusz)']], S.romb, function (v) { S.romb = v; st.set(S); P.render(); }, 'Tájolócsap');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.6 : 0.34; }, minH: 200, maxH: 280, label: 'Kétlyuk-bázis tájolás' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Tengelytáv L', min: 20, max: 300, step: 5, value: S.L, unit: 'mm', dec: 0, onInput: function (v) { S.L = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Hézag S1 (közp.)', min: 5, max: 100, step: 1, value: S.s1, unit: 'µm', dec: 0, onInput: function (v) { S.s1 = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Hézag S2 (tájoló)', min: 5, max: 150, step: 1, value: S.s2, unit: 'µm', dec: 0, onInput: function (v) { S.s2 = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Tengelytáv-tűrés', min: 0, max: 200, step: 5, value: S.tl, unit: 'µm', dec: 0, onInput: function (v) { S.tl = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var phi = Math.atan((S.s1 + S.s2) / 1000 / (2 * S.L)), o = '', cy = h / 2, x1 = w * 0.18, x2 = w * 0.82, R = Math.min(h * 0.22, 40), ex = R * 0.35;
        var ang = Math.atan((ex + ex * S.s2 / Math.max(S.s1, 1)) / (x2 - x1));
        // munkadarab (elforgatott lap) és a furatok
        var mx = (x1 + x2) / 2;
        o += '<g transform="rotate(' + (-ang * DEG).toFixed(2) + ' ' + mx.toFixed(1) + ' ' + cy + ')"><rect x="' + (x1 - R * 1.8) + '" y="' + (cy - R * 1.8) + '" width="' + (x2 - x1 + R * 3.6) + '" height="' + (R * 3.6) + '" rx="10" style="fill:var(--ix-8);fill-opacity:.18;stroke:var(--ink);stroke-width:1.4"/>';
        o += '<circle cx="' + x1 + '" cy="' + cy + '" r="' + R + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.4"/><circle cx="' + x2 + '" cy="' + cy + '" r="' + (R * 0.8) + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.4"/>';
        o += '<line x1="' + (x1 - R * 1.6) + '" x2="' + (x2 + R * 1.6) + '" y1="' + cy + '" y2="' + cy + '" style="stroke:var(--ix-5);stroke-width:1.4;stroke-dasharray:8 3"/></g>';
        // csapok (fix, a készülékben)
        o += '<circle cx="' + x1 + '" cy="' + (cy + ex * 0.5) + '" r="' + (R - ex) + '" style="fill:var(--ix-2);fill-opacity:.35;stroke:var(--ix-2);stroke-width:1.6"/>';
        if (S.romb === 'i') o += '<path d="M' + (x2 - R * 0.2) + ',' + (cy - ex * 0.5 - (R * 0.8 - ex)) + 'h' + (R * 0.4) + 'l0,' + (2 * (R * 0.8 - ex)) + 'h' + (-R * 0.4) + 'Z" style="fill:var(--ix-3);fill-opacity:.4;stroke:var(--ix-3);stroke-width:1.6"/>';
        else o += '<circle cx="' + x2 + '" cy="' + (cy - ex * 0.5) + '" r="' + (R * 0.8 - ex) + '" style="fill:var(--ix-3);fill-opacity:.35;stroke:var(--ix-3);stroke-width:1.6"/>';
        o += '<line x1="' + (x1 - R * 1.6) + '" x2="' + (x2 + R * 1.6) + '" y1="' + cy + '" y2="' + cy + '" style="stroke:var(--muted);stroke-dasharray:4 4"/>';
        o += '<text class="tk" x="' + x1 + '" y="' + (h - 8) + '" text-anchor="middle">központosító csap</text><text class="tk" x="' + x2 + '" y="' + (h - 8) + '" text-anchor="middle">tájolócsap</text><text class="la" x="' + (mx + 10) + '" y="' + (cy - 10) + '">Δφ (nagyítva)</text>';
        P.svg.innerHTML = o;
        var fit = S.romb === 'i' ? true : (S.s1 + S.s2) >= S.tl;
        out.innerHTML = '<h4><small>tg Δφ = (S₁ + S₂)/(2L) = (' + S.s1 + ' + ' + S.s2 + ') µm / (2·' + S.L + ' mm)</small>Δφ = ' + fmt(phi * DEG * 60, 2) + '′ (szögperc)</h4>' +
          U.kv([['Helyzethiba 100 mm-en', fmt(100 * Math.tan(phi) * 1000, 1) + ' µm', 'a tájolt irány menti eltérés'], ['Felhelyezhetőség', fit ? 'rendben' : '<b style="color:var(--ix-5)">nem minden darab tehető fel</b>', S.romb === 'i' ? 'a lapított (rombusz) csap a tengelytáv-tűrés irányában szabadon enged' : 'két hengeres csapnál S₁ + S₂ ≥ a tengelytávok tűrése kell — különben lapított tájolócsap']]) +
          '<p class="ix-note">A jegyzet szerint a fix tájolócsapok mindig hibával tájolnak; a mozgó tájolószerkezetek (prizmás, ékes, excenteres) a méretszórást követve hiba nélkül tájolnak.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/13 — szorítási elvek: határoló vonalon belül, ülékre szorítás      */
  /* ================================================================== */
  var SZ = { W: 160, H: 100, sup: [[22, 18], [138, 18], [80, 86]], side: [[45, 0], [115, 0]], end: [[0, 50]] };
  AVIX.def('szorelv', {
    title: 'Szorítási elvek: határoló vonalon belül, ülékek felé',
    sub: 'Húzd a szorítás helyét: hogyan oszlik meg a terhelés a három támaszon? Hova mutat a forgácsolóerő?',
    mount: function (el) {
      var st = U.store('szorelv', { px: 80, py: 45, fv: 'ulek', F: 800, mu: 0.15 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Hasáb felülnézetben: három alsó támasz (A, B, C), két oldalsó és egy homlokülék. A szorítóerő a támaszháromszögön (határoló vonalon) <b>belül</b> legyen, és közel egy támaszhoz (kis hajlítókar). <b>Húzd a szorítás pontját</b>, és váltsd a forgácsolóerő irányát.</p>';
      var r = U.h('div', 'ix-row'); el.appendChild(r);
      U.seg(r, [['ulek', 'F<sub>v</sub> ülékek felé'], ['el', 'F<sub>v</sub> ülékektől el']], S.fv, function (v) { S.fv = v; st.set(S); P.render(); }, 'Forgácsolóerő iránya');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.5; }, minH: 250, maxH: 360, label: 'Szorítás felülnézetben' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Forgácsolóerő Fv', min: 100, max: 3000, step: 50, value: S.F, unit: 'N', dec: 0, onInput: function (v) { S.F = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Súrlódás μ', min: 0.08, max: 0.3, step: 0.01, value: S.mu, dec: 2, onInput: function (v) { S.mu = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var geo = null;
      P.drag(function (x, y) { if (!geo) return; S.px = U.clamp((x - geo.ox) / geo.sc, -20, SZ.W + 20); S.py = U.clamp((geo.oy - y) / geo.sc, -20, SZ.H + 20); st.set(S); P.render(); });
      P.draw = function (w, h) {
        var sc = Math.min((w - 60) / (SZ.W + 40), (h - 50) / (SZ.H + 40)), ox = (w - SZ.W * sc) / 2, oy = h - 30 - 10 * sc, o = '';
        geo = { sc: sc, ox: ox, oy: oy };
        function X(v) { return (ox + v * sc).toFixed(1); }
        function Y(v) { return (oy - v * sc).toFixed(1); }
        o += '<rect x="' + X(0) + '" y="' + Y(SZ.H) + '" width="' + (SZ.W * sc).toFixed(1) + '" height="' + (SZ.H * sc).toFixed(1) + '" rx="4" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/>';
        var A = SZ.sup[0], B = SZ.sup[1], C = SZ.sup[2];
        o += '<path d="M' + X(A[0]) + ',' + Y(A[1]) + 'L' + X(B[0]) + ',' + Y(B[1]) + 'L' + X(C[0]) + ',' + Y(C[1]) + 'Z" style="fill:var(--ix-3);fill-opacity:.12;stroke:var(--ix-3);stroke-dasharray:5 4"/>';
        // baricentrikus reakciók
        var det = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]);
        var la = ((B[1] - C[1]) * (S.px - C[0]) + (C[0] - B[0]) * (S.py - C[1])) / det, lb = ((C[1] - A[1]) * (S.px - C[0]) + (A[0] - C[0]) * (S.py - C[1])) / det, lc = 1 - la - lb;
        var lam = [la, lb, lc], names = ['A', 'B', 'C'];
        SZ.sup.forEach(function (p, i) {
          var neg = lam[i] < 0;
          o += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="8" style="fill:' + (neg ? 'var(--ix-5)' : 'var(--ix-3)') + ';fill-opacity:.8"/><text class="lb" x="' + X(p[0]) + '" y="' + (+Y(p[1]) + 4) + '" text-anchor="middle" style="fill:var(--surface);stroke:none;font-size:11px">' + names[i] + '</text>';
        });
        SZ.side.concat(SZ.end).forEach(function (p, i) { var isEnd = i >= SZ.side.length; o += '<rect x="' + (+X(p[0]) - (isEnd ? 12 : 5)) + '" y="' + (+Y(p[1]) - (isEnd ? 5 : 0)) + '" width="' + (isEnd ? 12 : 10) + '" height="' + (isEnd ? 10 : 12) + '" style="fill:var(--ix-2);fill-opacity:.7"/>'; });
        // forgácsolóerő
        var fy = S.fv === 'ulek' ? -1 : 1, fx0 = SZ.W * 0.5, fy0 = SZ.H * 0.5;
        o += '<line x1="' + X(fx0) + '" y1="' + Y(fy0) + '" x2="' + X(fx0) + '" y2="' + Y(fy0 + fy * 28) + '" style="stroke:var(--ix-1);stroke-width:3"/><path d="M' + X(fx0) + ',' + Y(fy0 + fy * 34) + 'l-6,' + (fy > 0 ? 10 : -10) + 'l12,0Z" style="fill:var(--ix-1)"/><text class="lb" x="' + (+X(fx0) + 8) + '" y="' + Y(fy0 + fy * 20) + '" style="fill:var(--ix-1)">F<tspan dy="3" style="font-size:.75em">v</tspan></text>';
        // szorítás pontja
        var inside = lam.every(function (l) { return l >= 0; });
        o += '<circle cx="' + X(S.px) + '" cy="' + Y(S.py) + '" r="11" style="fill:' + (inside ? 'var(--acc)' : 'var(--ix-5)') + ';fill-opacity:.85;stroke:var(--surface);stroke-width:2"/><text class="lb" x="' + (+X(S.px) + 14) + '" y="' + (+Y(S.py) - 8) + '">F<tspan dy="3" style="font-size:.75em">sz</tspan></text>';
        o += '<text class="tk" text-anchor="middle" x="' + (w / 2) + '" y="' + (+Y(0) + 20) + '">ülékek (kék) · alsó támaszok A, B, C</text>';
        P.svg.innerHTML = o;
        var dmin = Math.min.apply(null, SZ.sup.map(function (p) { return Math.hypot(p[0] - S.px, p[1] - S.py); }));
        var req = S.fv === 'ulek' ? 0 : 2 * S.F / (2 * S.mu);
        out.innerHTML = '<h4><small>Támaszreakciók a szorítóerő arányában</small>' + (inside ? 'A szorítás a határoló vonalon belül van' : '<span style="color:var(--ix-5)">Billenés: a darab leemelkedik a(z) ' + names.filter(function (_, i) { return lam[i] < 0; }).join(', ') + ' támaszról</span>') + '</h4>' +
          U.kv([['A · B · C', lam.map(function (l) { return fmt(l * 100, 0) + ' %'; }).join(' · '), 'negatív érték: a támasz húzást kellene felvegyen — ilyet nem tud'], ['Hajlítókar (legközelebbi támasz)', fmt(dmin, 0) + ' mm', dmin < 20 ? 'kicsi — jó' : 'nagy: a darab hajlik, rezeg; közvetlenül a szorítás alá tegyünk támaszt'], ['Szükséges szorítóerő', S.fv === 'ulek' ? 'kicsi (csak a helyzetet tartja)' : fmt(req, 0) + ' N', S.fv === 'ulek' ? 'az ülékek veszik fel a forgácsolóerőt (alakzárás) — ez az ülékre szorítás elve' : 'F_sz = k·F_v/(2μ), k = 2: csak a súrlódás tart']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/13 — kézi szorítóelemek: ék, csavar, excenter, szorítóvas         */
  /* ================================================================== */
  var SCR = { M8: [8, 1.25], M10: [10, 1.5], M12: [12, 1.75], M16: [16, 2] };
  AVIX.def('szorito', {
    title: 'Kézi szorítóelemek: ék, csavar, excenter, szorítóvas',
    sub: 'Mekkora szorítóerő érhető el kézi erővel, és önzáró-e? (Stampfer: Készülékek)',
    mount: function (el) {
      var st = U.store('szorito', { m: 'csavar', FA: 100, lA: 150, mu: 0.12, a: 8, sz: 'M12', veg: 'saru', D: 50, dd: 16, e: 3, lay: '1', F: 4000, l1: 60, l2: 60, Fv: 800 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Az erőnövelő elemek többsége az <b>önzáró lejtő</b> változata. A kézi aktiváló erő legfeljebb kb. 150 N. Válassz szorítóelemet, és vesd össze az elérhető szorítóerőt a szükségessel (F<sub>sz</sub> = k·F<sub>v</sub>/(2μ), k = 2).</p>';
      var r = U.h('div', 'ix-row'); el.appendChild(r);
      U.seg(r, [['ek', 'Ék'], ['csavar', 'Csavar'], ['exc', 'Excenter'], ['vas', 'Szorítóvas']], S.m, function (v) { S.m = v; st.set(S); build(); }, 'Szorítóelem');
      var box = U.h('div'); el.appendChild(box);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.5 : 0.28; }, minH: 160, maxH: 220, label: 'Szorítóerő összevetése' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function sl(g, k, lab, mn, mx, stp, unit, dec) { U.slider(g, { label: lab, min: mn, max: mx, step: stp, value: S[k], unit: unit, dec: dec, onInput: function (v) { S[k] = v; st.set(S); P.render(); } }); }
      function build() {
        box.innerHTML = '';
        var g = U.sliders(box);
        if (S.m !== 'vas') sl(g, 'FA', 'Kézi erő FA', 20, 150, 5, 'N', 0);
        if (S.m === 'ek') { sl(g, 'a', 'Ékszög α', 1, 20, 0.5, '°', 1); sl(g, 'mu', 'Súrlódás μ', 0.05, 0.2, 0.01, '', 2); }
        if (S.m === 'csavar') {
          var rr = U.h('div', 'ix-row'); box.insertBefore(rr, g);
          U.seg(rr, Object.keys(SCR).map(function (k) { return [k, k]; }), S.sz, function (v) { S.sz = v; st.set(S); P.render(); }, 'Menet');
          U.seg(rr, [['gomb', 'gömbvég'], ['henger', 'hengeres vég'], ['saru', 'nyomósaru'], ['anya', 'anya']], S.veg, function (v) { S.veg = v; st.set(S); P.render(); }, 'Végződés');
          sl(g, 'lA', 'Erőkar lA', 40, 300, 5, 'mm', 0); sl(g, 'mu', 'Súrlódás μ', 0.08, 0.2, 0.01, '', 2);
        }
        if (S.m === 'exc') { sl(g, 'D', 'Tárcsa D', 30, 90, 1, 'mm', 0); sl(g, 'dd', 'Csap d', 8, 30, 1, 'mm', 0); sl(g, 'e', 'Excentricitás e', 1, 10, 0.5, 'mm', 1); sl(g, 'lA', 'Erőkar lA', 40, 250, 5, 'mm', 0); sl(g, 'mu', 'Súrlódás μ', 0.05, 0.2, 0.01, '', 2); }
        if (S.m === 'vas') {
          var r2 = U.h('div', 'ix-row'); box.insertBefore(r2, g);
          U.seg(r2, [['1', 'erő a támasz és a darab között'], ['2', 'erő a végén, támasz középen'], ['3', 'erő a végén, darab középen']], S.lay, function (v) { S.lay = v; st.set(S); P.render(); }, 'Elrendezés');
          sl(g, 'F', 'Bevezetett erő F', 500, 15000, 100, 'N', 0); sl(g, 'l1', 'l1', 20, 150, 5, 'mm', 0); sl(g, 'l2', 'l2', 20, 150, 5, 'mm', 0);
        }
        sl(g, 'Fv', 'Forgácsolóerő Fv', 100, 3000, 50, 'N', 0);
        P.render();
      }
      function calc() {
        var res = { Fs: 0, lock: null, txt: '' };
        if (S.m === 'ek') {
          var rho = Math.atan(S.mu), a = S.a * RAD;
          res.Fs = S.FA / (Math.tan(a + rho) + Math.tan(rho));
          res.lock = a <= 2 * rho; res.txt = 'F<sub>A</sub> = F<sub>s</sub>·[tg(α + ρ) + tg ρ], ρ = arctg μ = ' + fmt(rho * DEG, 2) + '°; önzárás: α ≤ 2ρ = ' + fmt(2 * rho * DEG, 1) + '°';
        } else if (S.m === 'csavar') {
          var d = SCR[S.sz][0], Pp = SCR[S.sz][1], d2 = d - 0.6495 * Pp, al = Math.atan(Pp / (Math.PI * d2)), rn = Math.atan(S.mu / Math.cos(30 * RAD));
          var de = { gomb: 0, henger: 0.4 * d, saru: 0.8 * d, anya: 1.4 * d }[S.veg];
          res.Fs = 2 * S.FA * S.lA / (d2 * Math.tan(al + rn) + S.mu * de);
          res.lock = al <= rn; res.txt = 'F<sub>s</sub> = 2F<sub>A</sub>l<sub>A</sub> / [d<sub>2</sub>·tg(α + ρ<sub>n</sub>) + μ·d<sub>e</sub>]; d<sub>2</sub> = ' + fmt(d2, 2) + ' mm, α = ' + fmt(al * DEG, 2) + '°, ρ<sub>n</sub> = ' + fmt(rn * DEG, 2) + '°';
        } else if (S.m === 'exc') {
          var lim = S.mu * (S.D + S.dd) / 2;
          res.Fs = S.FA * S.lA / (S.e + lim); res.lock = S.e <= lim;
          res.txt = 'F<sub>s</sub> = F<sub>A</sub>l<sub>A</sub> / (e + μD/2 + μd/2); önzárás: e ≤ ' + fmt(lim, 2) + ' mm (a jegyzet ajánlása: e ≈ D/15 = ' + fmt(S.D / 15, 2) + ' mm); szorítási út legfeljebb 2e = ' + fmt(2 * S.e, 1) + ' mm';
        } else {
          res.Fs = S.lay === '1' ? S.F * S.l1 / (S.l1 + S.l2) : S.lay === '2' ? S.F * S.l1 / S.l2 : S.F * (S.l1 + S.l2) / S.l2;
          res.txt = S.lay === '1' ? 'F<sub>s</sub> = F·l<sub>1</sub>/(l<sub>1</sub> + l<sub>2</sub>) — l<sub>1</sub> a támasz és az erő, l<sub>2</sub> az erő és a darab távolsága' : S.lay === '2' ? 'F<sub>s</sub> = F·l<sub>1</sub>/l<sub>2</sub> — kétkarú emelő, l<sub>1</sub> az erő, l<sub>2</sub> a darab karja' : 'F<sub>s</sub> = F·L/l — egykarú emelő, L = l<sub>1</sub> + l<sub>2</sub> a teljes, l = l<sub>2</sub> a darab karja';
        }
        return res;
      }
      P.draw = function (w, h) {
        // szükséges szorítóerő: k = 2, két súrlódó felület, a darab és a támaszok között μ_d = 0,15
        var R = calc(), req = 2 * S.Fv / (2 * 0.15), mx = Math.max(R.Fs, req), sx = U.scale(0, mx, 150, w - 76), o = '';
        [['Elérhető F<tspan dy="3" style="font-size:.75em">s</tspan>', R.Fs, R.Fs >= req ? 'var(--ix-3)' : 'var(--ix-5)'], ['Szükséges F<tspan dy="3" style="font-size:.75em">sz</tspan>', req, 'var(--ix-8)']].forEach(function (b, i) {
          var y = 30 + i * 50;
          o += '<text class="lb" x="10" y="' + (y + 20) + '">' + b[0] + '</text><rect x="150" y="' + y + '" width="' + Math.max(1, sx(b[1]) - 150).toFixed(1) + '" height="30" rx="4" style="fill:' + b[2] + ';fill-opacity:.7"/><text class="lb" x="' + (sx(b[1]) + 6).toFixed(1) + '" y="' + (y + 20) + '">' + fmt(b[1], 0) + ' N</text>';
        });
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>' + { ek: 'Ékszorítás', csavar: 'Csavarszorítás', exc: 'Excenteres szorítás', vas: 'Szorítóvas' }[S.m] + '</small>F<sub>s</sub> = ' + fmt(R.Fs, 0) + ' N' + (R.lock == null ? '' : R.lock ? ' — önzáró' : ' — <span style="color:var(--ix-5)">nem önzáró!</span>') + '</h4><p>' + R.txt + '</p>' +
          '<p class="ix-note">Szükséges: F<sub>sz</sub> = k·F<sub>v</sub>/(2μ<sub>d</sub>), k = 2, μ<sub>d</sub> = 0,15 a darab és a támaszok között. ' + (R.Fs >= req ? 'A szorítóerő elegendő.' : 'Kevés a szorítóerő: nagyobb erőkar, más szorítóelem — vagy inkább úgy kell elrendezni a darabot, hogy a forgácsolóerőt az ülékek vegyék fel.') + (S.m === 'ek' ? ' A gyakorlatban 1:10…1:20 lejtést alkalmaznak (≈ 2,9–5,7°).' : '') + '</p>';
      };
      build();
    },
  });

  /* ================================================================== */
  /* B/13 — gépi szorítás: hidraulikus, pneumatikus, vákuumos, mágneses */
  /* ================================================================== */
  AVIX.def('gepiszor', {
    title: 'Gépi szorítás: hidraulikus, pneumatikus, vákuumos, mágneses',
    sub: 'F = p·A (hidraulika, pneumatika), Fg = 9·A (vákuum, A cm²-ben), mágneses erő a felületi érdesség szerint',
    mount: function (el) {
      var st = U.store('gepiszor', { m: 'hidr', p: 100, D: 32, pp: 6, Dp: 63, A: 400, Fm: 8000, ra: '063', Fv: 800, mu: 0.15 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A gépi szorítás egyenletes, beállítható és ismételhető erőt ad, rövid mellékidővel. <b>Válassz energiaforrást</b>, és nézd meg, elég-e az erő a forgácsolóerő ellen.</p>';
      var r = U.h('div', 'ix-row'); el.appendChild(r);
      U.seg(r, [['hidr', 'Hidraulikus'], ['pneu', 'Pneumatikus'], ['vak', 'Vákuumos'], ['mag', 'Mágneses']], S.m, function (v) { S.m = v; st.set(S); build(); }, 'Szorító');
      var box = U.h('div'); el.appendChild(box);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function sl(g, k, lab, mn, mx, stp, unit, dec) { U.slider(g, { label: lab, min: mn, max: mx, step: stp, value: S[k], unit: unit, dec: dec, onInput: function (v) { S[k] = v; st.set(S); upd(); } }); }
      function build() {
        box.innerHTML = '';
        var g = U.sliders(box);
        if (S.m === 'hidr') { sl(g, 'p', 'Nyomás p', 20, 500, 10, 'bar', 0); sl(g, 'D', 'Dugattyú D', 10, 63, 1, 'mm', 0); }
        if (S.m === 'pneu') { sl(g, 'pp', 'Nyomás p', 3, 8, 0.5, 'bar', 1); sl(g, 'Dp', 'Dugattyú D', 20, 160, 1, 'mm', 0); }
        if (S.m === 'vak') sl(g, 'A', 'Felfekvő felület A', 10, 2000, 10, 'cm²', 0);
        if (S.m === 'mag') {
          sl(g, 'Fm', 'Névleges húzóerő', 1000, 30000, 500, 'N', 0);
          var rr = U.h('div', 'ix-row'); box.appendChild(rr);
          U.seg(rr, [['063', 'Ra ≈ 0,63 µm'], ['2', 'Ra ≈ 2 µm'], ['16', 'Ra ≈ 16 µm (nagyolt)']], S.ra, function (v) { S.ra = v; st.set(S); upd(); }, 'Felfekvő felület');
        }
        var g2 = U.sliders(box);
        sl(g2, 'Fv', 'Forgácsolóerő Fv', 100, 5000, 50, 'N', 0); sl(g2, 'mu', 'Súrlódás μ', 0.08, 0.3, 0.01, '', 2);
        upd();
      }
      function upd() {
        var F, txt, note;
        if (S.m === 'hidr') { F = S.p / 10 * Math.PI * S.D * S.D / 4; txt = 'F = p·A = ' + fmt(S.p / 10, 1) + ' MPa · π·' + S.D + '²/4 mm²'; note = 'Nagy nyomás (akár több száz bar) → kis hengerrel nagy erő; merev készülék és ellenőrzött nyomás kell. Nyomásesés, szivárgás közvetlenül csökkenti az erőt.'; }
        else if (S.m === 'pneu') { F = 0.85 * S.pp / 10 * Math.PI * S.Dp * S.Dp / 4; txt = 'F = η·p·A = 0,85 · ' + fmt(S.pp / 10, 2) + ' MPa · π·' + S.Dp + '²/4 mm² (η ≈ 0,85 tájékoztató)'; note = 'Központi energiaellátás, egyszerű átvitel, gyors működés; az összenyomható közeg miatt kisebb és rugalmasabb erő.'; }
        else if (S.m === 'vak') { F = 9 * S.A; txt = 'F<sub>g</sub> = 9·A = 9 · ' + S.A + ' cm²'; note = 'Kismerevségű, nem ferromágneses darabhoz is; nem sík felfekvésű darab is befogható. Kis felületnél az erő kevés.'; }
        else { var f = { '063': 1, '2': 0.9, '16': 0.65 }[S.ra]; F = S.Fm * f; txt = 'F = F<sub>névl</sub> · ' + fmt(f * 100, 0) + ' % (a felfekvő felület érdessége szerint)'; note = 'A húzóerő ötvözött anyagnál, légrésnél, rozsdás vagy festett felületnél jelentősen kisebb. Megmunkálás után lemágnesezés kell.'; }
        var req = S.Fv / S.mu; // k = 2, két súrlódó felület
        var ok = S.m === 'mag' || S.m === 'vak' ? F * S.mu >= 2 * S.Fv : F >= req;
        var need = S.m === 'mag' || S.m === 'vak' ? 2 * S.Fv / S.mu : req;
        out.innerHTML = '<h4><small>Szorítóerő</small>F = ' + fmt(F, 0) + ' N — ' + (ok ? 'elegendő' : '<span style="color:var(--ix-5)">kevés</span>') + '</h4><p>' + txt + '</p>' +
          U.kv([['Szükséges', fmt(need, 0) + ' N', S.m === 'mag' || S.m === 'vak' ? 'egy súrlódó felület (a lap): F ≥ k·F<sub>v</sub>/μ, k = 2' : 'két súrlódó felület: F<sub>sz</sub> = k·F<sub>v</sub>/(2μ), k = 2'], ['Megjegyzés', '', note]]);
      }
      build();
    },
  });
})();
