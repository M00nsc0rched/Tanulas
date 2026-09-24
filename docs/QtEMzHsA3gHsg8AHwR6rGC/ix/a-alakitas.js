/*
 * Gépész záróvizsga tételtár — interaktív ábrák a képlékenyalakítási tételekhez (A/10–A/12)
 * Értékek: a tételtár kidolgozásai és a tanszéki Gyártástechnológia I–II. jegyzet (Szigeti F.).
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt;

  /* ================================================================== */
  /* A/10 — nyújtás, zömítés: átkovácsolási szám, nyomókúpok             */
  /* ================================================================== */
  AVIX.def('kovacs', {
    title: 'Nyújtás és zömítés',
    sub: 'Térfogat-állandóság · átkovácsolási szám Y = A_kezd/A_vég · szálirány és nyomókúpok',
    mount: function (el) {
      var st = U.store('kovacs', { m: 'ny', a: 200, d: 120, zd: 80, zh: 160, zh1: 80 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Az alakítás térfogat-állandóság mellett történik: V₀ = V₁. <b>Nyújtásnál</b> állítsd a kiinduló négyzet oldalát és a végátmérőt — a szálak (zárványsorok, dúsulások) a nyújtás irányába megnyúlnak. <b>Zömítésnél</b> a súrlódás miatt a szerszám alatt nyomókúp marad, a darab hordósodik.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['ny', 'Nyújtás'], ['zo', 'Zömítés']], S.m, function (v) { S.m = v; st.set(S); show(); P.render(); }, 'Művelet');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.9 : 0.6; }, minH: 260, maxH: 420, label: 'Alakítás vázlata' });
      var gN = U.sliders(el), gZ = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(gN, { label: 'Négyzet a₀', min: 100, max: 400, step: 10, value: S.a, unit: 'mm', dec: 0, onInput: set('a') });
      U.slider(gN, { label: 'Végátmérő d', min: 40, max: 400, step: 5, value: S.d, unit: 'mm', dec: 0, onInput: set('d') });
      U.slider(gZ, { label: 'Kiinduló d₀', min: 40, max: 160, step: 5, value: S.zd, unit: 'mm', dec: 0, onInput: set('zd') });
      U.slider(gZ, { label: 'Kiinduló h₀', min: 40, max: 400, step: 5, value: S.zh, unit: 'mm', dec: 0, onInput: set('zh') });
      U.slider(gZ, { label: 'Zömített h₁', min: 20, max: 400, step: 5, value: S.zh1, unit: 'mm', dec: 0, onInput: set('zh1') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function show() { gN.style.display = S.m === 'ny' ? '' : 'none'; gZ.style.display = S.m === 'zo' ? '' : 'none'; }
      show();
      function streaks(x0, y0, L, H, n, dash, gap, sx, sy) {
        var o = '';
        for (var i = 1; i < n; i++) {
          var y = y0 + H * i / n;
          for (var x = x0 + (i % 2 ? 4 : 12) * sx; x < x0 + L - 2; x += (dash + gap) * sx) o += 'M' + x.toFixed(1) + ',' + y.toFixed(1) + 'h' + Math.min(dash * sx, x0 + L - 2 - x).toFixed(1);
        }
        return o;
      }
      P.draw = function (w, h) {
        var o = '';
        if (S.m === 'ny') {
          var A0 = S.a * S.a, A1 = Math.PI * S.d * S.d / 4, Y = A0 / A1, l0 = 120, l1 = l0 * Y;
          var k = Math.min((w - 40) / Math.max(l0, l1), (h / 2 - 34) / Math.max(S.a, S.d)), x0 = 20;
          var yb = 26, ya = h / 2 + 22;
          o += '<text class="lb sm" x="' + x0 + '" y="' + (yb - 8) + '">kiinduló tuskó: ' + S.a + ' × ' + S.a + ' mm</text>';
          o += '<rect x="' + x0 + '" y="' + yb + '" width="' + (l0 * k).toFixed(1) + '" height="' + (S.a * k).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.25;stroke:var(--ink);stroke-width:1.2"/>';
          o += '<path d="' + streaks(x0, yb, l0 * k, S.a * k, 7, 10, 9, k, k) + '" style="stroke:var(--ix-2);stroke-width:1.6;fill:none"/>';
          o += '<text class="lb sm" x="' + x0 + '" y="' + (ya - 8) + '">nyújtott rúd: Ø' + S.d + ' mm, hossza ' + fmt(Y, 2) + '-szeres</text>';
          o += '<rect x="' + x0 + '" y="' + ya + '" width="' + (l1 * k).toFixed(1) + '" height="' + (S.d * k).toFixed(1) + '" rx="' + (S.d * k * 0.08).toFixed(1) + '" style="fill:var(--ix-1);fill-opacity:.18;stroke:var(--ink);stroke-width:1.2"/>';
          o += '<path d="' + streaks(x0, ya, l1 * k, S.d * k, 7, 10 * Y, 9 * Y, k, k) + '" style="stroke:var(--ix-2);stroke-width:' + Math.max(0.6, 1.6 * Math.sqrt(1 / Y)).toFixed(2) + ';fill:none"/>';
          o += '<path d="M' + (x0 + l1 * k + 6) + ',' + (ya + S.d * k / 2) + 'h14" style="stroke:var(--acc);stroke-width:2"/><path d="M' + (x0 + l1 * k + 22) + ',' + (ya + S.d * k / 2) + 'l-7,-4v8z" style="fill:var(--acc)"/>';
          P.svg.innerHTML = o;
          var q = (A0 - A1) / A0 * 100, msg;
          if (Y < 1) msg = 'Y < 1: a keresztmetszet nő — ez már nem nyújtás, hanem zömítés.';
          else if (Y < 2) msg = 'Kis átkovácsolás: a jegyzet szerint általában Y = 2–10 kell (hengerelt acélnál 2–3, öntött acélnál 3–6).';
          else if (Y <= 3) msg = 'Hengerelt kiinduló anyagnál elegendő (Y = 2–3).';
          else if (Y <= 6) msg = 'Öntött acéltuskónál szükséges tartomány (Y = 3–6): az öntött, egyenlőtlen szövet átkovácsolódik.';
          else if (Y <= 10) msg = 'Nagy átkovácsolás (a szokásos 2–10 tartomány felső része): erős szálasodás.';
          else msg = 'Y > 10: a szokásos tartományon túl — a keresztirányú tulajdonságok már erősen romlanak.';
          out.innerHTML = '<h4><small>A₀ = ' + fmt(A0 / 100, 0) + ' cm² · A₁ = ' + fmt(A1 / 100, 1) + ' cm²</small>Átkovácsolási szám Y = ' + fmt(Y, 2) + '</h4><p>' + msg + '</p>' +
            U.kv([['Alakítás mértéke q = (A₀ − A₁)/A₀', fmt(q, 1) + '%'], ['Logaritmikus alakváltozás φ = ln(l₁/l₀) = ln Y', fmt(Math.log(Y), 2)], ['Hossz (térfogat-állandóság)', 'l₁ = Y · l₀', 'A₀·l₀ = A₁·l₁']]) +
            '<p class="ix-hint">A szálasodás miatt a mechanikai tulajdonságok hosszirányban jobbak, és Y-nal nőnek; keresztirányban romlanak. A jegyzet példája: 200 × 200 mm-es tuskó Ø120 mm-re kovácsolva → Y = 40 000 / 11 310 ≈ 3,54.</p>';
          return;
        }
        // zömítés
        var d0 = S.zd, h0 = S.zh, h1 = Math.min(S.zh1, h0), d1 = d0 * Math.sqrt(h0 / h1), bul = 0.07;
        var kz = Math.min((w - 60) / (d0 + d1 * (1 + 2 * bul) + 40), (h - 60) / Math.max(h0, h1)), yb2 = h - 30, xa = 30, xb = xa + d0 * kz + 40;
        o += '<rect x="' + xa + '" y="' + (yb2 - h0 * kz).toFixed(1) + '" width="' + (d0 * kz).toFixed(1) + '" height="' + (h0 * kz).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.25;stroke:var(--ink);stroke-width:1.2"/>';
        var ln0 = ''; for (var i = 1; i < 6; i++) { var xx = xa + d0 * kz * i / 6; ln0 += 'M' + xx.toFixed(1) + ',' + (yb2 - h0 * kz + 3).toFixed(1) + 'V' + (yb2 - 3); }
        o += '<path d="' + ln0 + '" style="stroke:var(--ix-2);stroke-width:1.4;fill:none"/>';
        o += '<text class="lb sm" x="' + xa + '" y="' + (yb2 - h0 * kz - 8).toFixed(1) + '">h₀/d₀ = ' + fmt(h0 / d0, 2) + '</text>';
        // hordós alak és elhajló szálak
        var cx = xb + d1 * kz * (0.5 + bul), top = yb2 - h1 * kz;
        function X(u, v) { return cx + u * d1 * kz / 2 * (1 + 2 * bul * (1 - Math.pow(2 * v - 1, 2))); }
        var outl = [], v, pts = 24;
        for (i = 0; i <= pts; i++) { v = i / pts; outl.push([X(1, v), top + v * h1 * kz]); }
        for (i = pts; i >= 0; i--) { v = i / pts; outl.push([X(-1, v), top + v * h1 * kz]); }
        o += '<path d="M' + outl.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z" style="fill:var(--ix-1);fill-opacity:.18;stroke:var(--ink);stroke-width:1.2"/>';
        var ln1 = '';
        for (i = 1; i < 6; i++) {
          var u = -1 + 2 * i / 6, seg = [];
          for (var j = 0; j <= 16; j++) { v = j / 16; seg.push(X(u, v).toFixed(1) + ',' + (top + v * h1 * kz).toFixed(1)); }
          ln1 += 'M' + seg.join('L');
        }
        o += '<path d="' + ln1 + '" style="stroke:var(--ix-2);stroke-width:1.4;fill:none"/>';
        // nyomókúpok (50°)
        var r = d1 * kz / 2, hc = Math.min(r * Math.tan(50 * Math.PI / 180), h1 * kz / 2 + 0.01), closed = r * Math.tan(50 * Math.PI / 180) >= h1 * kz / 2;
        o += '<path d="M' + (cx - r) + ',' + top + 'L' + (cx + r) + ',' + top + 'L' + cx + ',' + (top + hc) + 'Z M' + (cx - r) + ',' + yb2 + 'L' + (cx + r) + ',' + yb2 + 'L' + cx + ',' + (yb2 - hc) + 'Z" style="fill:var(--ix-5);fill-opacity:.16;stroke:var(--ix-5);stroke-width:1;stroke-dasharray:4 3"/>';
        // szerszámok
        var sw = d1 * kz * (1 + 2 * bul) + 24;
        o += '<rect x="' + (cx - sw / 2) + '" y="' + (top - 14) + '" width="' + sw + '" height="14" style="fill:var(--ink);fill-opacity:.55"/><rect x="' + (cx - sw / 2) + '" y="' + yb2 + '" width="' + sw + '" height="14" style="fill:var(--ink);fill-opacity:.55"/>';
        o += '<text class="lb sm" x="' + cx + '" y="' + (top - 20) + '" text-anchor="middle">Ø' + fmt(d1, 0) + ' × ' + fmt(h1, 0) + ' mm</text>';
        P.svg.innerHTML = o;
        var buck = h0 / d0 > 3;
        out.innerHTML = '<h4><small>d₀ = ' + d0 + ' mm, h₀ = ' + h0 + ' mm → h₁ = ' + h1 + ' mm</small>' + (buck ? 'Kihajlásveszély: h₀/d₀ > 3' : 'Zömítés: d₁ ≈ ' + fmt(d1, 0) + ' mm') + '</h4>' +
          '<p>' + (buck ? 'A jegyzet szerint l/d > 3-nál a darab zömítéskor kihajlik — előbb rövidebbre kell leszabni, vagy szakaszosan (duzzasztással) kell dolgozni.' : 'A keresztmetszet nő, a magasság csökken (A↑, l↓). A zömítés a teljes tömegre, a duzzasztás helyileg hat; kis kalapáccsal a darab csak a végén vastagodik.') + '</p>' +
          U.kv([['Magasságcsökkenés', fmt((h0 - h1) / h0 * 100, 1) + '%'], ['Logaritmikus alakváltozás φ = ln(h₀/h₁)', fmt(Math.log(h0 / h1), 2)], ['Nyomókúpok (≈ 50°)', closed ? 'záródnak' : 'nem záródnak', closed ? 'a teljes keresztmetszet átkovácsolódik' : 'középen csak kis (rugalmas) alakváltozás — belül durva szövet marad']]) +
          '<p class="ix-hint">A nyomókúp a szerszám és az anyag közötti súrlódás miatt alakul ki (az érintkező felülettel 45–55°-os szögben); az alakváltozás a nyomókúpon kívül megy végbe. Átkovácsoláshoz a kúpoknak a teljes tömegben záródniuk kell. A kúpok itt vázlatosak.</p>';
      };
      P.render();
      U.quiz(el, [
        { q: '200 × 200 mm-es tuskót Ø120 mm-re kovácsolnak. Mennyi az átkovácsolási szám?', opts: ['≈ 3,54', '≈ 1,67', '≈ 2,78', '≈ 5,0'], a: 0, why: 'Y = A_kezd / A_vég = 40 000 / (π·120²/4) = 40 000 / 11 310 ≈ 3,54.' },
        { q: 'Mekkora átkovácsolási szám kell öntött acéltuskónál a jegyzet szerint?', opts: ['3–6', '1–1,5', '2–3', '10–20'], a: 0, why: 'Általában Y = 2–10; öntött acéloknál 3–6, hengerelt acéloknál 2–3.' },
        { q: 'Hogyan változnak a mechanikai tulajdonságok az átkovácsolási számmal?', opts: ['Hosszirányban javulnak, keresztirányban romlanak', 'Minden irányban javulnak', 'Minden irányban romlanak', 'Nem változnak'], a: 0, why: 'A szálasodás miatt anizotróp lesz az anyag: szálirányban jobbak a tulajdonságok.' },
        { q: 'Mikor hajlik ki zömítéskor a darab a jegyzet szerint?', opts: ['l/d > 3 esetén', 'l/d < 1 esetén', 'Ha a hőmérséklet A3 alatt van', 'Soha'], a: 0, why: 'Karcsú darabnál (l/d > 3) a zömítés kihajlást okoz.' },
        { q: 'Mi a feltétele az átkovácsolásnak?', opts: ['A nyomókúpok a teljes tömegben záródjanak', 'A darab hőmérséklete A1 alatt legyen', 'Kis kalapáccsal, sok ütéssel dolgozzunk', 'A darab ne forduljon'], a: 0, why: 'Ha a nyomókúpok csak a felületi rétegben keletkeznek, középen csak rugalmas alakváltozás lép fel: a felület finom, a belső szövet durva marad.' },
      ], { title: 'Gyakorlás: kovácsolás' });
    },
  });

  /* ================================================================== */
  /* A/11 — vágórés, repedések, vágóerő–út diagram                       */
  /* ================================================================== */
  var VMAT = {
    lagy: { n: 'Lágy (lágyacél, réz)', hf: 0.45, rid: false },
    kozep: { n: 'Középkemény acél', hf: 0.3, rid: false },
    kemeny: { n: 'Kemény, rideg', hf: 0.15, rid: true },
  };
  var TGB = Math.tan(5 * Math.PI / 180);
  // a vágóerő–út görbe (F/F_max,képlet a bélyegút/s függvényében) — vázlatos modell a jegyzet leírása szerint
  function cutCurve(m, r) {
    var M = VMAT[m], pk = 1 + 0.18 * Math.max(0, 1 - r) - 0.12 * Math.min(1, Math.max(0, r - 1));
    var xB = M.rid ? M.hf + 0.05 : 0.2, xC = M.hf + 0.1 + (r < 1 ? 0.22 * (1 - r) : 0.05 * Math.min(2, r - 1)), br = r < 1 ? 0.2 * (1 - r) : 0;
    var pts = [], x, F, endC = M.rid ? 0.72 : 0.78;
    for (x = 0; x <= 1.2 + 1e-9; x += 0.005) {
      if (x <= xB) F = pk * (x < 0.06 ? 0.8 * (1 - Math.pow(1 - x / 0.06, 2)) : 0.8 + 0.2 * (x - 0.06) / (xB - 0.06));
      else if (x <= xC) F = pk * (1 - (1 - endC) * (x - xB) / Math.max(0.01, xC - xB));
      else if (x <= xC + br) F = pk * (endC - 0.2 - 0.1 * (x - xC) / Math.max(0.01, br));
      else if (x <= xC + br + 0.04) F = U.lerp(xC + br, pk * (br ? endC - 0.3 : endC), xC + br + 0.04, 0.1, x);
      else F = 0.1;
      pts.push([x, F]);
    }
    var W = 0; for (var i = 1; i < pts.length; i++) if (pts[i][0] <= xC + br + 0.04) W += (pts[i][1] + pts[i - 1][1]) / 2 * 0.005;
    return { pts: pts, pk: pk, c: W / pk, xB: xB, xC: xC, xD: xC + br + 0.04 };
  }
  AVIX.def('vagas', {
    title: 'Vágórés, repedések és vágóerő',
    sub: 'u_opt = (s − h_f)·tg β · vágott felület zónái · vágóerő–út diagram · F_max és W számítása',
    mount: function (el) {
      var st = U.store('vagas', { m: 'kozep', s: 2, ur: 0.06, L: 200, Rm: 400, ferde: 0, al: 3 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A vágóélektől induló két repedés a jegyzet szerint β ≈ 4–6°-os irányban halad. Ha a vágórés optimális, <b>egymásba futnak</b>; ha kisebb, elkerülik egymást (hídfelület), ha nagyobb, a lemez behúzódik, meggörbül, sorjás lesz. <b>Állítsd a vágórést</b>, és figyeld a metszetet, a vágott él zónáit és a vágóerő–út görbét. A metszet vízszintesen 4× nagyított, a görbe vázlatos.</p>';
      U.chips(el, Object.keys(VMAT).map(function (k) { return [k, VMAT[k].n]; }), S.m, function (v) { S.m = v; st.set(S); P.render(); calc(); }, 'Anyag');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1.25 : 0.78; }, minH: 360, maxH: 560, label: 'Vágórés és vágóerő–út diagram' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Vágórés u/s', min: 0.01, max: 0.2, step: 0.005, value: S.ur, fmt: function (v) { return fmt(v * 100, 1) + '%'; }, onInput: function (v) { S.ur = v; st.set(S); P.render(); calc(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var calcBox = U.h('div', 'ix-out'); el.appendChild(calcBox);
      calcBox.innerHTML = '<h4><small>Számoló</small>Vágóerő és munka</h4>';
      var r2 = U.h('div', 'ix-row'); calcBox.appendChild(r2);
      U.seg(r2, [['0', 'Párhuzamos él (kivágás)'], ['1', 'Ferde késű olló']], String(S.ferde), function (v) { S.ferde = +v; st.set(S); calc(); }, 'Vágóél');
      var g2 = U.sliders(calcBox), res = U.h('div'); calcBox.appendChild(res);
      U.slider(g2, { label: 'Lemez s', min: 0.5, max: 8, step: 0.1, value: S.s, unit: 'mm', dec: 1, onInput: function (v) { S.s = v; st.set(S); P.render(); calc(); } });
      U.slider(g2, { label: 'Vágott hossz L', min: 10, max: 2000, step: 10, value: S.L, unit: 'mm', dec: 0, onInput: function (v) { S.L = v; st.set(S); calc(); } });
      U.slider(g2, { label: 'R_m', min: 150, max: 1000, step: 10, value: S.Rm, unit: 'MPa', dec: 0, onInput: function (v) { S.Rm = v; st.set(S); calc(); } });
      U.slider(g2, { label: 'Késszög α', min: 1, max: 10, step: 0.5, value: S.al, unit: '°', dec: 1, onInput: function (v) { S.al = v; st.set(S); calc(); } });
      function uopt() { return (1 - VMAT[S.m].hf) * TGB; }
      P.draw = function (w, h) {
        var M = VMAT[S.m], uo = uopt(), r = S.ur / uo, o = '';
        // --- metszet (felső rész) ---
        var hs = Math.min(150, h * 0.34), ky = hs / 1, kx = ky * 4, y0 = 34, X0 = w * 0.36, hf = M.hf;
        function PX(xm) { return X0 + xm * kx; } function PY(ym) { return y0 + ym * ky; }
        o += '<rect x="14" y="' + PY(0) + '" width="' + (w * 0.62) + '" height="' + hs + '" style="fill:var(--ix-8);fill-opacity:.18"/>';
        // bélyeg (bal felső), vágólap (jobb alsó)
        o += '<path d="M14,8H' + X0 + 'V' + PY(hf) + 'H14Z" style="fill:var(--ix-2);fill-opacity:.35;stroke:var(--ink);stroke-width:1.2"/>';
        o += '<path d="M' + PX(S.ur) + ',' + PY(1) + 'H' + (w * 0.62 + 14) + 'V' + (PY(1) + 26) + 'H' + PX(S.ur) + 'Z" style="fill:var(--ix-2);fill-opacity:.35;stroke:var(--ink);stroke-width:1.2"/>';
        o += '<text class="lb sm" x="20" y="22">bélyeg (kés)</text><text class="lb sm" x="' + (w * 0.62 + 8) + '" y="' + (PY(1) + 18) + '" text-anchor="end">vágólap</text>';
        // repedések (párhuzamosak, dx/dy = tg β)
        var d = S.ur - (1 - hf) * TGB, mid = hf + (1 - hf) * 0.5, c1e = hf + (1 - hf) * 0.62, c2e = 1 - (1 - hf) * 0.62;
        function cx1(y) { return (y - hf) * TGB; } function cx2(y) { return S.ur - (1 - y) * TGB; }
        var meet = Math.abs(d) < 0.12 * uo;
        if (!meet && d < 0) {
          o += '<path d="M' + PX(cx1(c2e)) + ',' + PY(c2e) + 'L' + PX(cx1(c1e)) + ',' + PY(c1e) + 'L' + PX(cx2(c1e)) + ',' + PY(c1e) + 'L' + PX(cx2(c2e)) + ',' + PY(c2e) + 'Z" style="fill:var(--ix-5);fill-opacity:.3"/>';
        }
        o += '<path d="M' + PX(0) + ',' + PY(hf) + 'L' + PX(cx1(meet ? mid : c1e)) + ',' + PY(meet ? mid : c1e) + '" style="stroke:var(--ix-5);stroke-width:2.2;fill:none"/>';
        o += '<path d="M' + PX(S.ur) + ',' + PY(1) + 'L' + PX(cx2(meet ? mid : c2e)) + ',' + PY(meet ? mid : c2e) + '" style="stroke:var(--ix-5);stroke-width:2.2;fill:none"/>';
        var lab = meet ? 'egymásba futnak' : d < 0 ? 'hídfelület' : 'görbülés, sorja';
        o += '<text class="lb sm" x="' + (PX(Math.max(S.ur, uo)) + 14) + '" y="' + PY(mid) + '" style="fill:var(--ix-5)">' + lab + '</text>';
        if (!meet && d > 0) o += '<path d="M' + PX(S.ur * 0.2) + ',' + PY(1) + 'l' + (S.ur * kx * 0.5) + ',0l' + (-S.ur * kx * 0.2) + ',' + Math.min(20, 6 + (r - 1) * 8) + 'z" style="fill:var(--ix-5);fill-opacity:.6"/>';
        o += '<text class="tk" x="' + PX(0) + '" y="' + (PY(1) + 40) + '" text-anchor="middle">u = ' + fmt(S.ur * S.s, 2) + ' mm</text>';
        // vágott él zónái (oszlop jobbra)
        var roll = 0.06 + 0.07 * Math.max(0, r - 1), smooth = hf * U.clamp(1.25 - 0.25 * r, 0.6, 1.4), sor = 0.02 + 0.05 * Math.max(0, r - 1.2);
        smooth = Math.min(smooth, 0.9 - roll); var frac = 1 - roll - smooth;
        var bx = w - 118, zs = [[roll, '--ix-4', 'behúzódás'], [smooth, '--ix-3', 'sima nyírt'], [frac, '--ix-1', 'törési']], yy = PY(0);
        o += '<text class="lb sm" x="' + bx + '" y="22">vágott él</text>';
        zs.forEach(function (z) { o += '<rect x="' + bx + '" y="' + yy.toFixed(1) + '" width="18" height="' + (z[0] * ky).toFixed(1) + '" style="fill:var(' + z[1] + ');fill-opacity:.7"/><text class="sm" x="' + (bx + 24) + '" y="' + (yy + z[0] * ky / 2 + 4).toFixed(1) + '">' + z[2] + ' ' + Math.round(z[0] * 100) + '%</text>'; yy += z[0] * ky; });
        o += '<path d="M' + (bx + 12) + ',' + yy + 'l6,0l0,' + (sor * ky * 2).toFixed(1) + 'z" style="fill:var(--ix-5)"/><text class="sm" x="' + (bx + 24) + '" y="' + (yy + 12) + '">sorja</text>';
        // --- vágóerő–út diagram (alsó rész) ---
        var cv = cutCurve(S.m, r), top = PY(1) + 62, ML = 44, sx = U.scale(0, 1.2, ML, w - 14), sy = U.scale(0, 1.35, h - 30, top);
        o += U.axes({ x0: ML, x1: w - 14, y0: top, y1: h - 30, sx: sx, sy: sy, yt: [0, 0.5, 1], xt: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2], xl: 'bélyegút / s', yl: 'F (rel.)' });
        var ref = cutCurve(S.m, 1);
        o += '<path class="ln th dash" d="' + U.path(ref.pts, sx, sy) + '"/>';
        var area = cv.pts.filter(function (p) { return p[0] <= cv.xD; });
        o += '<path d="' + U.path(area, sx, sy) + 'L' + sx(cv.xD) + ',' + sy(0) + 'L' + sx(0) + ',' + sy(0) + 'Z" style="fill:var(--acc);fill-opacity:.12"/>';
        o += '<path class="ln bd acc" d="' + U.path(cv.pts, sx, sy) + '"/>';
        function yAt(x) { var p = cv.pts[Math.round(x / 0.005)]; return p ? p[1] : 0; }
        [['A', 0.06], ['B', cv.xB], ['C', cv.xC], ['D', cv.xD], ['E', 1.15]].forEach(function (q) { o += '<text class="la sm" x="' + sx(q[1]) + '" y="' + (sy(yAt(q[1])) - 7) + '" text-anchor="middle">' + q[0] + '</text>'; });
        o += '<text class="tk" x="' + (w - 16) + '" y="' + (top + 10) + '" text-anchor="end">szaggatott: optimális vágórés</text>';
        P.svg.innerHTML = o;
        var zmsg = meet ? 'Optimális vágórés: a két repedés egymásba fut — a legjobb vágott felület, a legkisebb vágóerő, a leghosszabb szerszámélettartam.' : d < 0 ? 'Kisebb az optimálisnál: a repedések elkerülik egymást, hídfelület marad, amelyet külön át kell szakítani — a jegyzet szerint F_max és W is nő, a felület szakadozott, a szerszám gyorsan kopik.' : 'Nagyobb az optimálisnál: nő a hajlítónyomaték, a lemez behúzódik és görbül, szélesebb a képlékeny zóna, nagyobb a sorja; F_max és W csökken, a szerszám tovább bírja.';
        out.innerHTML = '<h4><small>u/s = ' + fmt(S.ur * 100, 1) + '% · u_opt/s = (1 − h_f/s)·tg 5° = ' + fmt(uo * 100, 1) + '%</small>' + (meet ? 'Optimális vágórés' : d < 0 ? 'Túl kicsi vágórés' : 'Túl nagy vágórés') + '</h4><p>' + zmsg + '</p>' +
          U.kv([['Legnagyobb erő a képlethez képest', '≈ ' + fmt(cv.pk, 2) + ' × F_képlet'], ['Kitöltési tényező c (a görbe alatti terület)', fmt(cv.c, 2), 'a jegyzet: 0,3 (rideg, nagy rés) … 0,7'], ['h_f (a repedés megindulásáig)', fmt(VMAT[S.m].hf, 2) + '·s', 'képlékenyebb anyag → nagyobb h_f → kisebb u_opt']]);
      };
      function calc() {
        var tau = 0.8 * S.Rm, kv = 1.2, Fp = kv * S.L * S.s * tau, cv = cutCurve(S.m, S.ur / uopt());
        if (S.ferde) {
          var Ff = S.s * S.s * tau / (2 * Math.tan(S.al * Math.PI / 180));
          res.innerHTML = U.kv([['F_max = s²·τ_m / (2·tg α)', fmt(Ff / 1000, 1) + ' kN', 'τ_m = 0,8·R_m = ' + Math.round(tau) + ' MPa; nem függ a vágott hossztól'], ['Párhuzamos éllel ugyanerre a hosszra', fmt(Fp / 1000, 1) + ' kN', 'F = k_v·L·s·τ_m, k_v = 1,2'], ['Munka W ≈ F·L·tg α', fmt(Ff * S.L * Math.tan(S.al * Math.PI / 180) / 1000, 1) + ' J']]) +
            '<p class="ix-hint">A jegyzet szerint α ≤ ρ (a lemez ne csússzon ki), a gyakorlatban 2–4°: nagyobb α → kisebb erő, de a levágott darab torzul, elcsavarodik.</p>';
        } else {
          var Fm = Fp * cv.pk / 1; res.innerHTML = U.kv([['F_max = k_v·L·s·τ_m', fmt(Fp / 1000, 1) + ' kN', 'k_v = 1,2; τ_m = 0,8·R_m = ' + Math.round(tau) + ' MPa (d/s ≥ 2)'], ['A vágórés hatásával (vázlat)', '≈ ' + fmt(Fm / 1000, 1) + ' kN'], ['W = c·F_max·s', fmt(cv.c * Fm * S.s / 1e6 * 1000, 1) + ' J', 'c = ' + fmt(cv.c, 2) + ' a görbéből'], ['Ferde vágóéllel', '≈ ' + fmt(Fp * 0.65 / 1000, 1) + ' kN', '30–40%-kal kisebb csúcserő'], ['Lehúzóerő', '≈ ' + fmt(Fp * 0.1 / 1000, 1) + ' kN', '(0,05–0,15)·F_max, ha d/s > 5']]);
        }
      }
      P.render(); calc();
      U.quiz(el, [
        { q: 'Mi történik a jegyzet szerint, ha a vágórés kisebb az optimálisnál?', opts: ['A repedések elkerülik egymást, hídfelület alakul ki; F_max és W nő', 'F_max csökken, W nő', 'Semmi, csak hosszabb a szerszám élettartama', 'Nagyobb lesz a sorja és a görbülés'], a: 0, why: 'u < u_opt: a hídfelület átszakítása többletenergiát igényel, a felület szakadozott, a szerszám gyorsabban kopik.' },
        { q: 'Hogyan számítjuk az optimális vágórést a jegyzet szerint?', opts: ['u = (s − h_f)·tg β', 'u = s·tg β', 'u = h_f·tg β', 'u = s / 10 mindig'], a: 0, why: 'A kés h_f mélységig hatol be, onnan a két repedés β = 4–6°-os szögben indul; akkor futnak egymásba, ha u = (s − h_f)·tg β.' },
        { q: 'Melyik képlet adja a ferde késű táblaolló vágóerejét?', opts: ['F = s²·τ_m / (2·tg α)', 'F = k_v·L·s·τ_m', 'F = c·F_max·s', 'F = π·d·s·τ_m'], a: 0, why: 'Ferde késnél egyszerre csak egy háromszög alakú keresztmetszet (s²/(2·tg α)) van nyírásban, ezért a vágóerő nem függ a hossztól.' },
        { q: 'Hol van a vágóerő maximuma a bélyegút mentén?', opts: ['Kb. 0,2·s bélyegelmozdulásnál', 'A vágás legelején', 'Pontosan s/2-nél', 'Az áttolás végén'], a: 0, why: 'Az A–B szakaszon a felkeményedés miatt az erő a keresztmetszet csökkenése ellenére nő; a maximum h₀ ≈ 0,2·s-nél van.' },
        { q: 'Mekkora a kitöltési tényező, c?', opts: ['0,3–0,7 (rideg anyag, nagy rés: kisebb)', '1,1–1,3', '0,05–0,1', 'mindig 1'], a: 0, why: 'W = c·F_max·s; c = 0,3 rideg anyagnál, nagy vágórésnél, 0,7 lágy anyagnál, kis vágórésnél.' },
      ], { title: 'Gyakorlás: vágás' });
    },
  });

  /* ================================================================== */
  /* A/11 — sávterv alátéthez: anyagkihozatal, nyomásközéppont          */
  /* ================================================================== */
  AVIX.def('savterv', {
    title: 'Sávterv és anyagkihozatal (alátét)',
    sub: 'Hídszélesség, széltávolság, 1–3 soros elrendezés · ξ = n·A_h/A_ö · nyomásközéppont',
    mount: function (el) {
      var st = U.store('savterv', { D: 40, d: 17, s: 2, k: 1.5, n: 1 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A sorozatszerszámban a sáv lépésenként halad: az 1. állomáson lyukasztás, a 2.-on — a keresőcsap helyrehúzása után — kivágás. <b>Állítsd a méreteket és a sorok számát</b>: a hídszélesség és a széltávolság legalább ≈ s legyen (a jegyzet szerint).</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['1', 'Egysoros'], ['2', 'Kétsoros'], ['3', 'Háromsoros']], String(S.n), function (v) { S.n = +v; st.set(S); P.render(); }, 'Sorok');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.46; }, minH: 230, maxH: 380, label: 'Sávterv' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; if (S.d > S.D - 6) S.d = S.D - 6; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Külső Ø D', min: 12, max: 80, step: 1, value: S.D, unit: 'mm', dec: 0, onInput: set('D') });
      U.slider(g, { label: 'Furat Ø d', min: 3, max: 70, step: 1, value: S.d, unit: 'mm', dec: 0, onInput: set('d') });
      U.slider(g, { label: 'Lemez s', min: 0.5, max: 5, step: 0.1, value: S.s, unit: 'mm', dec: 1, onInput: set('s') });
      U.slider(g, { label: 'Híd = szél', min: 1, max: 3, step: 0.1, value: S.k, fmt: function (v) { return fmt(v, 1) + '·s'; }, onInput: set('k') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var D = S.D, dd = Math.min(S.d, D - 6), a = Math.max(S.k * S.s, 1), v = a, n = S.n;
        var e = D + a, p = (D + a) * Math.sqrt(3) / 2, B = D + 2 * v + (n - 1) * p;
        var steps = 5, Lx = steps * e + e / 2, k = Math.min((w - 30) / Lx, (h - 70) / B), x0 = 16, y0 = 34, o = '';
        o += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (Lx * k).toFixed(1) + '" height="' + (B * k).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.22;stroke:var(--ink);stroke-width:1.2"/>';
        var st1 = 1.5, st2 = 2.5; // állomások a lépések egységében
        for (var row = 0; row < n; row++) {
          var cy = y0 + (v + D / 2 + row * p) * k, off = row % 2 ? e / 2 : 0;
          for (var i = 0; i < steps; i++) {
            var cxm = (i + 0.5) * e + off; if (cxm + D / 2 > Lx) continue;
            var cx = x0 + cxm * k, pos = cxm / e;
            if (pos >= st2 - 0.01 + (off ? 0.5 : 0)) o += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (D / 2 * k).toFixed(1) + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1"/>';
            else {
              o += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (D / 2 * k).toFixed(1) + '" style="fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:4 3"/>';
              if (pos >= st1 - 0.01 + (off ? 0.5 : 0)) o += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (dd / 2 * k).toFixed(1) + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1"/>';
            }
          }
        }
        // állomások (első sor)
        var c1 = x0 + st1 * e * k, c2 = x0 + st2 * e * k, cyy = y0 + (v + D / 2) * k;
        o += '<circle cx="' + c1 + '" cy="' + cyy + '" r="' + (dd / 2 * k + 3) + '" style="fill:none;stroke:var(--ix-2);stroke-width:2.2"/><circle cx="' + c2 + '" cy="' + cyy + '" r="' + (D / 2 * k + 3) + '" style="fill:none;stroke:var(--acc);stroke-width:2.2"/>';
        o += '<circle cx="' + c2 + '" cy="' + cyy + '" r="3.5" style="fill:var(--acc)"/>';
        o += '<text class="lb sm" x="' + (c1 + 16) + '" y="' + (y0 - 8) + '" text-anchor="end" style="fill:var(--ix-2)">1. lyukasztás</text><text class="lb sm" x="' + (c2 - D / 2 * k + 4) + '" y="' + (y0 - 8) + '" style="fill:var(--acc)">2. kivágás + keresőcsap</text>';
        // nyomásközéppont (egy sor esetén)
        var L1 = Math.PI * dd, L2 = Math.PI * D, xs = (L1 * st1 + L2 * st2) / (L1 + L2), xsp = x0 + xs * e * k;
        o += '<path d="M' + xsp + ',' + (y0 + B * k + 4) + 'v14" style="stroke:var(--ix-5);stroke-width:2"/><text class="lb sm" x="' + xsp + '" y="' + (y0 + B * k + 32) + '" text-anchor="middle" style="fill:var(--ix-5)">nyomásközéppont</text>';
        o += '<text class="tk" x="' + (x0 + Lx * k) + '" y="' + (y0 + B * k + 16) + '" text-anchor="end">előtolás →</text>';
        P.svg.innerHTML = o;
        var Ah = Math.PI * D * D / 4, At = Math.PI * (D * D - dd * dd) / 4, xi = n * Ah / (B * e) * 100, xit = n * At / (B * e) * 100;
        out.innerHTML = '<h4><small>' + n + ' soros · B = ' + fmt(B, 1) + ' mm · e = ' + fmt(e, 1) + ' mm</small>Anyagkihozatal ξ = ' + fmt(xi, 1) + '%</h4>' +
          U.kv([['ξ = n·A_h / A_ö', fmt(xi, 1) + '%', 'A_h = π·D²/4 (a külső körvonalon belül)'], ['Tényleges hasznosítás (a furat nélkül)', fmt(xit, 1) + '%'], ['Hídszélesség = széltávolság', fmt(a, 1) + ' mm', a < S.s ? 'kisebb, mint s — túl nagy a nyomás a szerszám palástján!' : 'legalább ≈ s'], ['Nyomásközéppont az 1. állomástól', fmt((xs - st1) * e, 1) + ' mm', 'x_s = ΣL_i·x_i / ΣL_i, a kerületekkel (π·d és π·D)']]) +
          '<p class="ix-hint">Több sorral a kihozatal javul, de a szerszám drágább (a jegyzet: részletes elemzés kell). A nyomásközéppont itt csak az egysoros szerszámra érvényes: a nagyobb kerületű kivágás felé tolódik.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/13 — öntőminta: zsugorodás, ráhagyás, oldalferdeség, színezés     */
  /* ================================================================== */
  var OMAT = { ov: { n: 'Öntöttvas', z: 1, c: '#C0504D', cn: 'vörös' }, al: { n: 'Al-, Cu-öntvény', z: 1.5, c: '#C0504D', cn: 'vörös' }, ac: { n: 'Acélöntvény', z: 2, c: '#3B82C4', cn: 'kék' } };
  AVIX.def('minta', {
    title: 'Az öntőminta méretei és színezése',
    sub: 'Zsugorodási és megmunkálási ráhagyás, oldalferdeség, magfészek — a jegyzet adatai szerint',
    mount: function (el) {
      var st = U.store('minta', { m: 'ov', f: 'homok', mach: 1, n: 50 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A minta nem azonos az alkatrésszel: nagyobb a zsugorodás és a megmunkálási ráhagyás miatt, a függőleges falai ferdék, a furatot mag képezi, amelyet a minta toldatai (magfészkek) támasztanak meg. Egy peremes persely metszetén <b>válaszd az anyagot és a formázást</b>. A ráhagyások a rajzon 6×-osan nagyítottak.</p>';
      U.chips(el, Object.keys(OMAT).map(function (k) { return [k, OMAT[k].n]; }), S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Anyag');
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['homok', 'Homokforma'], ['fem', 'Fémforma']], S.f, function (v) { S.f = v; st.set(S); P.render(); }, 'Formázás');
      U.seg(r1, [['1', 'Furat + talp megmunkált'], ['0', 'Nyers öntvény']], String(S.mach), function (v) { S.mach = +v; st.set(S); P.render(); }, 'Megmunkálás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.95 : 0.55; }, minH: 280, maxH: 420, label: 'Minta és alkatrész metszete' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Darabszám', min: 0, max: 4, step: 0.05, value: Math.log(S.n) / Math.LN10, fmt: function (v) { return Math.round(Math.pow(10, v)) + ' db'; }, onInput: function (v) { S.n = Math.round(Math.pow(10, v)); st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var PT = { D: 80, Df: 140, d: 40, H: 100, tf: 22, cp: 22 };
      P.draw = function (w, h) {
        var M = OMAT[S.m], z = M.z / 100, rh = (S.f === 'homok' ? 3 : 1.5) / 100, E = 6, dr = 2 * Math.PI / 180, mach = !!S.mach;
        var k = Math.min((w - 40) / (PT.Df + 60), (h - 50) / (PT.H + 2 * PT.cp + 20)), cx = w / 2, y0 = h - 30 - PT.cp * k;
        function X(r) { return cx + r * k; } function Y(y) { return y0 - y * k; }
        // minta méretei (a zsugorodás valódi, a rajz eltéréseit E-szeresen nagyítjuk)
        var dz = function (v) { return v * z * E; };
        var raBot = mach ? PT.Df * rh * E : 0, raBore = mach ? PT.d * rh * E / 2 : 0;
        var rF = PT.Df / 2 + dz(PT.Df / 2), rH = PT.D / 2 + dz(PT.D / 2), yT = PT.H + dz(PT.H), yF = PT.tf + dz(PT.tf), yB = -raBot, rC = PT.d / 2 - raBore + dz(PT.d / 2);
        var dF = (yF - yB) * Math.tan(dr) * 2, dH = (yT - yF) * Math.tan(dr) * 2;
        var raw = M.c, yel = '#D9A92B', blk = 'var(--ink)', o = '';
        function seg(pts, col, wd) { return '<path d="M' + pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join('L') + '" style="fill:none;stroke:' + col + ';stroke-width:' + (wd || 4) + ';stroke-linecap:round;stroke-linejoin:round"/>'; }
        [1, -1].forEach(function (sg) {
          function m(p) { return [p[0] * sg, p[1]]; }
          o += seg([[rC, yB], [rF, yB]].map(m), mach ? yel : raw);
          o += seg([[rF, yB], [rF - dF, yF]].map(m), raw);
          o += seg([[rF - dF, yF], [rH, yF]].map(m), raw);
          o += seg([[rH, yF], [rH - dH, yT]].map(m), raw);
          o += seg([[rH - dH, yT], [rC, yT]].map(m), raw);
          o += seg([[rC, yT], [rC, yT + PT.cp], [0, yT + PT.cp]].map(m), blk);
          o += seg([[rC, yB], [rC, yB - PT.cp], [0, yB - PT.cp]].map(m), blk);
        });
        // az alkatrész (szaggatott)
        var part = [[PT.d / 2, 0], [PT.Df / 2, 0], [PT.Df / 2, PT.tf], [PT.D / 2, PT.tf], [PT.D / 2, PT.H], [PT.d / 2, PT.H], [PT.d / 2, 0]];
        [1, -1].forEach(function (sg) { o += '<path d="M' + part.map(function (p) { return X(p[0] * sg).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join('L') + '" style="fill:var(--ix-8);fill-opacity:.18;stroke:var(--muted);stroke-width:1;stroke-dasharray:4 3"/>'; });
        o += '<path d="M' + cx + ',' + (Y(yT + PT.cp) - 8) + 'V' + (Y(yB - PT.cp) + 8) + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/>';
        o += '<text class="lb sm" x="' + X(rC + 4) + '" y="' + Y(yT + PT.cp / 2) + '">magfészek</text>';
        o += '<text class="lb sm" x="' + X(rF + 4) + '" y="' + Y(yF / 2) + '">' + (S.m === 'ac' ? 'nyers acél' : 'nyers öntvény') + '</text>';
        if (mach) o += '<text class="lb sm" x="' + X(-rF) + '" y="' + (Y(yB) + 16) + '" style="fill:#B8860B">megmunkált talp (sárga)</text>';
        o += '<text class="tk" x="' + (w - 8) + '" y="' + (h - 6) + '" text-anchor="end">szaggatott: alkatrész · színes: minta</text>';
        P.svg.innerHTML = o;
        var mat = S.n < 2 ? 'gipsz (egyedi)' : S.n <= 300 ? 'fa (2–300 db)' : 'fém (300 db fölött)';
        out.innerHTML = '<h4><small>' + M.n + ' · ' + (S.f === 'homok' ? 'homokforma' : 'fémforma') + ' · minta anyaga: ' + mat + '</small>Zsugorodási ráhagyás ' + fmt(M.z, 1) + '% · megmunkálási ráhagyás ' + (S.f === 'homok' ? '2–4' : '1–2') + ' mm/100 mm</h4>' +
          U.kv([['Perem Ø140 → minta', fmt(PT.Df * (1 + z), 1) + ' mm', '+' + fmt(PT.Df * z, 1) + ' mm zsugorodás'], ['Magasság 100 → minta', fmt(PT.H * (1 + z) + (mach ? PT.Df * rh : 0), 1) + ' mm', mach ? 'zsugorodás + talpráhagyás' : 'csak zsugorodás'], ['Furat Ø40 → mag', fmt((PT.d - (mach ? PT.d * rh : 0)) * (1 + z), 1) + ' mm', mach ? 'a megmunkált furathoz kisebb mag' : 'nyers furat'], ['Oldalferdeség', '1–3°', 'a függőleges falakon, az élek lekerekítve']]) +
          '<p class="ix-hint">A minta színezése (jegyzet): <b style="color:var(--ink)">fekete</b> a maggal érintkező helyek (magfészek), <b style="color:' + yel + '">sárga</b> a forgácsolt felületek, <b style="color:#C0504D">vörös</b> a nyers öntöttvas-, <b style="color:#3B82C4">kék</b> a nyers acélfelületek.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/12 — vágórés és a vágóelemek tűrésmezői                           */
  /* ================================================================== */
  var MFAK = { '20': '1/20 · lágy (réz, sárgaréz, lágyacél)', '16': '1/16 · középkemény acél', '14': '1/14 · kemény acél', '12': '1/12 · alumínium' };
  AVIX.def('tures', {
    title: 'Bélyeg és vágólap méretezése',
    sub: 'Tűrésmezők kivágásnál és lyukasztásnál · a kopás iránya · z_min = m·s',
    mount: function (el) {
      var st = U.store('tures', { op: 'kiv', dN: 40, T: 0.16, s: 2, m: '20' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Amelyik elem a hasznos méretet adja, az kapja a névleges méretet: <b>kivágásnál a vágólap, lyukasztásnál a bélyeg</b>. A kopás a vágólap nyílását növeli, a bélyeget csökkenti — ezért a vágólapot a legkisebb, a bélyeget a legnagyobb méretre készítik. Az ábra a névleges mérettől való eltérést mutatja (mm).</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['kiv', 'Kivágás'], ['lyuk', 'Lyukasztás']], S.op, function (v) { S.op = v; st.set(S); P.render(); }, 'Művelet');
      U.chips(el, Object.keys(MFAK).map(function (k) { return [k, MFAK[k]]; }), S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Anyag');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.42; }, minH: 230, maxH: 330, label: 'Tűrésmezők' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Névleges d_N', min: 5, max: 120, step: 1, value: S.dN, unit: 'mm', dec: 0, onInput: set('dN') });
      U.slider(g, { label: 'Darabtűrés T', min: 0.04, max: 0.4, step: 0.01, value: S.T, unit: 'mm', dec: 2, onInput: set('T') });
      U.slider(g, { label: 'Lemez s', min: 0.5, max: 5, step: 0.1, value: S.s, unit: 'mm', dec: 1, onInput: set('s') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var T = S.T, Tt = Math.max(0.005, Math.round(T / 4 * 1000) / 1000), z = S.s / (+S.m), kiv = S.op === 'kiv';
        var mdb = kiv ? [-T, 0] : [0, T], v, b;
        if (kiv) { v = [-T, -T + Tt]; b = [-T - z - Tt, -T - z]; } else { b = [T - Tt, T]; v = [T + z, T + z + Tt]; }
        var lo = Math.min(mdb[0], v[0], b[0]) - 0.04, hi = Math.max(mdb[1], v[1], b[1]) + 0.04;
        var sx = U.scale(lo, hi, 70, w - 20), o = '';
        o += '<line x1="' + sx(0) + '" x2="' + sx(0) + '" y1="16" y2="' + (h - 34) + '" style="stroke:var(--ink);stroke-width:1.4"/><text class="tk" x="' + sx(0) + '" y="' + (h - 18) + '" text-anchor="middle">d_N = ' + S.dN + '</text>';
        var rows = [['munkadarab', mdb, '--ix-8', kiv ? 'a darab külső mérete' : 'a lyuk mérete'], ['vágólap', v, '--ix-2', 'nyílás'], ['bélyeg', b, '--ix-1', 'tüske']];
        var rh = (h - 70) / 3;
        rows.forEach(function (r, i) {
          var y = 22 + i * rh, x0 = sx(r[1][0]), x1 = sx(r[1][1]);
          o += '<text class="lb sm" x="6" y="' + (y + rh * 0.45) + '">' + r[0] + '</text>';
          o += '<rect x="' + x0.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" width="' + Math.max(3, x1 - x0).toFixed(1) + '" height="' + (rh * 0.5).toFixed(1) + '" style="fill:var(' + r[2] + ');fill-opacity:.55;stroke:var(--ink);stroke-width:1"/>';
          o += '<text class="tk" x="' + x0.toFixed(1) + '" y="' + (y + rh * 0.5 + 16).toFixed(1) + '" text-anchor="middle">' + fmt(S.dN + r[1][0], 3) + '</text>';
          if (i > 0) {
            var wear = i === 1 ? 1 : -1, ax = i === 1 ? x1 + 6 : x0 - 6, yy = y + 4 + rh * 0.25;
            o += '<path d="M' + ax + ',' + yy + 'h' + (wear * 26) + '" style="stroke:var(--ix-5);stroke-width:2"/><path d="M' + (ax + wear * 30) + ',' + yy + 'l' + (-wear * 7) + ',-4v8z" style="fill:var(--ix-5)"/>';
            o += '<text class="sm" x="' + (ax + wear * 34) + '" y="' + (yy + 4) + '" text-anchor="' + (wear > 0 ? 'start' : 'end') + '" style="fill:var(--ix-5)">kopás</text>';
          }
        });
        // vágórés
        var ya = 22 + 2.55 * rh, za = kiv ? sx(b[1]) : sx(b[1]), zb = kiv ? sx(v[0]) : sx(v[0]);
        o += '<path d="M' + za + ',' + ya + 'H' + zb + '" style="stroke:var(--acc);stroke-width:1.6"/><text class="la sm" x="' + ((za + zb) / 2) + '" y="' + (ya + 14) + '" text-anchor="middle">z_min = ' + fmt(z, 3) + '</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>' + (kiv ? 'Kivágás — a vágólap adja a méretet' : 'Lyukasztás — a bélyeg adja a méretet') + ' · z_min = s/' + S.m + ' = ' + fmt(z, 3) + ' mm · T_b = T_v ≈ T/4 = ' + fmt(Tt, 3) + ' mm</small>' +
          (kiv ? 'Vágólap Ø' + fmt(S.dN - T, 3) + ' (+' + fmt(Tt, 3) + ') · bélyeg Ø' + fmt(S.dN - T - z, 3) + ' (−' + fmt(Tt, 3) + ')' : 'Bélyeg Ø' + fmt(S.dN + T, 3) + ' (−' + fmt(Tt, 3) + ') · vágólap Ø' + fmt(S.dN + T + z, 3) + ' (+' + fmt(Tt, 3) + ')') + '</h4>' +
          '<p>' + (kiv ? 'd_v = d_N − T_mdb, d_b = d_N − T_mdb − z_min. Az új szerszám a darabot a tűrésmező alsó határán vágja; a vágólap kopásával a darab nő, így az élettartam alatt a teljes tűrésmező kihasználható.' : 'd_b = d_N + T_mdb, d_v = d_N + T_mdb + z_min. Az új bélyeg a lyukat a tűrésmező felső határán vágja; kopásával a lyuk csökken — a teljes tűrésmező a kopásra jut.') + '</p>' +
          '<p class="ix-hint">A jegyzet: munkadarab IT 9–12, szerszám IT 6–8; a tűrés anyagba irányuló (vágólap +, bélyeg −). A darabtűrés itt szabadon állítható, a szerszámtűrés a negyede (becslés).</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/12 — nyomásközéppont (húzható kontúrok)                            */
  /* ================================================================== */
  AVIX.def('nyomkp', {
    title: 'Nyomásközéppont számítása',
    sub: 'x_s = ΣL_i·x_i / ΣL_i · húzd a kivágandó körvonalakat a vágólapon',
    mount: function (el) {
      var DEF0 = [{ t: 'c', d: 12, x: 40, y: 70, n: 'lyuk Ø12' }, { t: 'c', d: 12, x: 40, y: 30, n: 'lyuk Ø12' }, { t: 'r', a: 70, b: 40, x: 135, y: 50, n: 'kivágás 70×40' }];
      var st = U.store('nyomkp', { sh: DEF0, s: 2, Rm: 400 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A vágóerő a vágott kerülettel arányos, ezért a nyomásközéppont a körvonalak kerületekkel súlyozott súlypontja. <b>Húzd a körvonalakat</b> a vágólapon (200 × 100 mm): a piros kereszt az eredő erő támadáspontja, ide kell a befogócsap tengelyének kerülnie.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      var reset = U.h('button', 'ix-btn', 'Alaphelyzet'); reset.type = 'button'; r1.appendChild(reset);
      reset.addEventListener('click', function () { S.sh = JSON.parse(JSON.stringify(DEF0)); st.set(S); P.render(); });
      var P = U.plot(el, { ratio: 0.55, minH: 200, maxH: 380, label: 'Vágólap és nyomásközéppont' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var sx, sy, drag = -1;
      function per(q) { return q.t === 'c' ? Math.PI * q.d : 2 * (q.a + q.b); }
      P.draw = function (w, h) {
        sx = U.scale(0, 200, 16, w - 16); sy = U.scale(0, 100, h - 16, 16); var k = (w - 32) / 200, o = '';
        o += '<rect x="' + sx(0) + '" y="' + sy(100) + '" width="' + (200 * k) + '" height="' + (sy(0) - sy(100)) + '" style="fill:var(--ix-2);fill-opacity:.12;stroke:var(--ink);stroke-width:1.2"/>';
        o += '<path d="M' + sx(100) + ',' + sy(0) + 'V' + sy(100) + 'M' + sx(0) + ',' + sy(50) + 'H' + sx(200) + '" class="grid"/>';
        var SL = 0, SX = 0, SY = 0;
        S.sh.forEach(function (q, i) {
          var L = per(q); SL += L; SX += L * q.x; SY += L * q.y;
          if (q.t === 'c') o += '<circle data-i="' + i + '" cx="' + sx(q.x) + '" cy="' + sy(q.y) + '" r="' + (q.d / 2 * k) + '" style="fill:var(--surface);stroke:var(--acc);stroke-width:2;cursor:move"/>';
          else o += '<rect data-i="' + i + '" x="' + sx(q.x - q.a / 2) + '" y="' + sy(q.y + q.b / 2) + '" width="' + (q.a * k) + '" height="' + (q.b * k) + '" style="fill:var(--surface);stroke:var(--acc);stroke-width:2;cursor:move"/>';
          o += '<circle cx="' + sx(q.x) + '" cy="' + sy(q.y) + '" r="2.5" style="fill:var(--acc)"/>';
        });
        var xs = SX / SL, ys = SY / SL;
        o += '<path d="M' + (sx(xs) - 10) + ',' + sy(ys) + 'h20M' + sx(xs) + ',' + (sy(ys) - 10) + 'v20" style="stroke:var(--ix-5);stroke-width:3"/><circle cx="' + sx(xs) + '" cy="' + sy(ys) + '" r="6" style="fill:none;stroke:var(--ix-5);stroke-width:2"/>';
        o += '<text class="lb sm" x="' + (sx(xs) + 10) + '" y="' + (sy(ys) - 10) + '" style="fill:var(--ix-5)">x_s, y_s</text>';
        P.svg.innerHTML = o;
        var tau = 0.8 * S.Rm, F = 1.2 * SL * S.s * tau, e = Math.sqrt(Math.pow(xs - 100, 2) + Math.pow(ys - 50, 2));
        var rows = S.sh.map(function (q) { var L = per(q); return [q.n, fmt(L, 1) + ' mm', 'x = ' + fmt(q.x, 0) + ', y = ' + fmt(q.y, 0) + ' → L·x = ' + fmt(L * q.x, 0) + ', L·y = ' + fmt(L * q.y, 0)]; });
        rows.push(['ΣL', fmt(SL, 1) + ' mm'], ['Nyomásközéppont', 'x_s = ' + fmt(xs, 1) + ' · y_s = ' + fmt(ys, 1) + ' mm'], ['Ha a befogócsap a lap közepén lenne', 'e = ' + fmt(e, 1) + ' mm', 'billentőnyomaték M = ΣF·e ≈ ' + fmt(F * e / 1e6, 2) + ' kNm (s = ' + S.s + ' mm, R_m = ' + S.Rm + ' MPa, ΣF ≈ ' + fmt(F / 1000, 0) + ' kN)']);
        out.innerHTML = '<h4><small>súlyponttétel a kerületekkel</small>x_s = ΣL_i·x_i / ΣL_i = ' + fmt(xs, 1) + ' mm</h4>' + U.kv(rows);
      };
      P.drag(function (x, y, ph) {
        var mx = sx.inv(x), my = sy.inv(y);
        if (ph === 'down') {
          drag = -1;
          S.sh.forEach(function (q, i) { var inside = q.t === 'c' ? Math.hypot(mx - q.x, my - q.y) <= q.d / 2 + 4 : Math.abs(mx - q.x) <= q.a / 2 + 2 && Math.abs(my - q.y) <= q.b / 2 + 2; if (inside) drag = i; });
          return;
        }
        if (drag < 0) return;
        var q = S.sh[drag], hw = q.t === 'c' ? q.d / 2 : q.a / 2, hh = q.t === 'c' ? q.d / 2 : q.b / 2;
        q.x = Math.round(U.clamp(mx, hw, 200 - hw)); q.y = Math.round(U.clamp(my, hh, 100 - hh)); st.set(S); P.draw(P.w, P.h);
      });
      P.render();
    },
  });
})();
