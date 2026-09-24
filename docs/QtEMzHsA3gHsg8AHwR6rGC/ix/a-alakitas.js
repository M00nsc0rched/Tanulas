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
})();
