/*
 * Gépész záróvizsga tételtár — interaktív ábrák a forgácsolási tételekhez (A/14–A/24)
 * Értékek: a tételtár kidolgozásai, a tanszéki Gyártástechnológia II. (forgácsolás) jegyzet és
 * Dudás Illés: Megmunkálási eljárások. A k_c1.1 és z anyagjellemzők tájékoztató szakirodalmi értékek.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt;

  // Kienzle-állandók (tájékoztató értékek) és Taylor-kitevő (MSZ 3904, a jegyzet táblázata)
  var ANY = {
    s235: { n: 'S235 (lágyacél)', kc: 1780, z: 0.17, Rm: 400, k: -4, ac: true },
    c45: { n: 'C45', kc: 2220, z: 0.14, Rm: 650, k: -4, ac: true },
    c42: { n: '42CrMo4', kc: 2500, z: 0.26, Rm: 900, k: -4, ac: true },
    gjl: { n: 'EN-GJL-250', kc: 1150, z: 0.26, Rm: 250, k: -7, ac: false },
    al: { n: 'Al-ötvözet', kc: 700, z: 0.25, Rm: 250, k: -2.5, ac: false },
  };

  /* ================================================================== */
  /* A/14 — technológiai adatok, forgácsolóerő, elméleti érdesség        */
  /* ================================================================== */
  AVIX.def('forgadat', {
    title: 'Esztergálás technológiai adatai',
    sub: 'n, v_f, forgácskeresztmetszet · F_c = k_c·f·a_p, F_p, F_f, P_c · R_max = f²/(8r) · Taylor-éltartam',
    mount: function (el) {
      var st = U.store('forgadat', { a: 'c45', D: 60, vc: 180, f: 0.2, ap: 2, r: 0.8, g: 6, kap: 90 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Állítsd a forgácsolási adatokat: a számoló a jegyzet képleteivel adja a fordulatszámot, a forgácsolóerőt és a teljesítményt, az ábra pedig a csúcssugaras kés nyomait — az elméleti érdességet. Figyeld meg: az <b>előtolás négyzetesen</b> rontja a felületet, a <b>sebesség</b> főleg az éltartamot rövidíti.</p>';
      U.chips(el, Object.keys(ANY).map(function (k) { return [k, ANY[k].n]; }), S.a, function (v) { S.a = v; st.set(S); P.render(); }, 'Anyag');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.5 : 0.28; }, minH: 150, maxH: 220, label: 'Elméleti érdességprofil' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Átmérő D', min: 10, max: 300, step: 1, value: S.D, unit: 'mm', dec: 0, onInput: set('D') });
      U.slider(g, { label: 'v_c', min: 20, max: 400, step: 5, value: S.vc, unit: 'm/min', dec: 0, onInput: set('vc') });
      U.slider(g, { label: 'Előtolás f', min: 0.05, max: 0.8, step: 0.01, value: S.f, unit: 'mm/ford', dec: 2, onInput: set('f') });
      U.slider(g, { label: 'Fogásmélység a_p', min: 0.2, max: 8, step: 0.1, value: S.ap, unit: 'mm', dec: 1, onInput: set('ap') });
      U.slider(g, { label: 'Csúcssugár r_ε', min: 0.2, max: 2.4, step: 0.2, value: S.r, unit: 'mm', dec: 1, onInput: set('r') });
      U.slider(g, { label: 'Elhelyezési szög κ', min: 45, max: 95, step: 5, value: S.kap, unit: '°', dec: 0, onInput: set('kap') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var M = ANY[S.a], f = S.f, r = S.r, Rmax = f * f / (8 * r) * 1000, o = ''; // µm
        // érdességprofil: 5 előtolásnyi szakasz, a mélység nagyítva
        var n = 5, sx = U.scale(0, n * f, 16, w - 16), depthPx = Math.min(h - 50, 20 + Rmax * 2.2), y0 = 26, sc = Rmax > 0 ? depthPx / Rmax : 1;
        var pts = [];
        for (var i = 0; i <= 400; i++) {
          var x = n * f * i / 400, xm = ((x % f) + f) % f - f / 2, yv = r - Math.sqrt(Math.max(0, r * r - xm * xm)); // mm
          pts.push([sx(x), y0 + (Rmax / 1000 - yv) * 1000 * sc]);
        }
        o += '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'L' + (w - 16) + ',' + (h - 10) + 'L16,' + (h - 10) + 'Z" style="fill:var(--ix-8);fill-opacity:.35;stroke:var(--ink);stroke-width:1.4"/>';
        o += '<line x1="16" x2="' + (w - 16) + '" y1="' + y0 + '" y2="' + y0 + '" class="ln th dash"/><line x1="16" x2="' + (w - 16) + '" y1="' + (y0 + depthPx) + '" y2="' + (y0 + depthPx) + '" class="ln th dash"/>';
        o += '<text class="la sm" x="' + (w - 20) + '" y="' + (y0 + depthPx / 2 + 4) + '" text-anchor="end">R_max ≈ ' + fmt(Rmax, Rmax < 10 ? 2 : 1) + ' µm</text>';
        o += '<path d="M' + sx(f) + ',' + (y0 - 12) + 'H' + sx(2 * f) + '" style="stroke:var(--acc);stroke-width:1.4"/><text class="la sm" x="' + ((sx(f) + sx(2 * f)) / 2) + '" y="' + (y0 - 16) + '" text-anchor="middle">f</text>';
        o += '<text class="tk" x="18" y="' + (h - 14) + '">a mélység erősen nagyítva</text>';
        P.svg.innerHTML = o;
        var nrev = 1000 * S.vc / (Math.PI * S.D), vf = nrev * f, kap = S.kap * Math.PI / 180, hh = f * Math.sin(kap), b = S.ap / Math.sin(kap);
        var Kg = M.ac ? (109 - 1.5 * S.g) / 100 : (103 - 1.5 * S.g) / 100, Kv = Math.pow(100 / S.vc, 0.1), kc = M.kc * Math.pow(hh, -M.z) * Kg * Kv;
        var Fc = kc * b * hh, Pc = Fc * S.vc / 60000, Tr = Math.pow(S.vc / 100, M.k);
        out.innerHTML = '<h4><small>' + M.n + ' · k_c1.1 = ' + M.kc + ' N/mm², z = ' + fmt(M.z, 2) + ' (tájékoztató)</small>F_c ≈ ' + fmt(Fc / 1000, 2) + ' kN · P_c ≈ ' + fmt(Pc, 1) + ' kW</h4>' +
          U.kv([['Fordulatszám n = 1000·v_c/(π·D)', Math.round(nrev) + ' 1/min'], ['Előtolási sebesség v_f = n·f', Math.round(vf) + ' mm/min'], ['Forgácskeresztmetszet A = f·a_p', fmt(f * S.ap, 2) + ' mm²', 'h = f·sin κ = ' + fmt(hh, 3) + ' mm, b = a_p/sin κ = ' + fmt(b, 2) + ' mm'], ['k_c = k_c1.1·h^−z·K_γ·K_v', Math.round(kc) + ' N/mm²', 'K_γ = ' + fmt(Kg, 2) + ' (γ = 6°), K_v = (100/v_c)^0,1 = ' + fmt(Kv, 2)], ['F_p ≈ F_c/3 · F_f ≈ F_c/8', fmt(Fc / 3000, 2) + ' kN · ' + fmt(Fc / 8000, 2) + ' kN'], ['Elméleti érdesség', 'R_max ≈ ' + fmt(Rmax, 1) + ' µm', 'R_a ≈ R_z/4,5 ≈ ' + fmt(Rmax / 4.5, 2) + ' µm'], ['Éltartam a 100 m/min-hez képest', '× ' + fmt(Tr, Tr < 0.1 ? 3 : 2), 'T = C_v·v_c^k, k = ' + fmt(M.k, 1) + ' (MSZ 3904)']]) +
          '<p class="ix-hint">Nagyolás: nagy a_p és f (IT11–14, R_a 25–100 µm); simítás: kis f, kis a_p, nagyobb r_ε (IT7–10, R_a 0,8–6,3 µm). Hűtés-kenéssel az erő 10–15%-kal kisebb.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/15 — fúrás és furatbővítés: erő, nyomaték, teljesítmény            */
  /* ================================================================== */
  var CSUCS = { s235: 118, c45: 118, c42: 118, gjl: 110, al: 135 };
  AVIX.def('furat', {
    title: 'Fúrás és furatbővítés számítása',
    sub: 'a_p = d/2 vagy (d − d_e)/2 · F_c = k_c·f·d/4 · M_c = k_c·f·d²/8 · P_c · csúcsszög anyag szerint',
    mount: function (el) {
      var st = U.store('furat', { a: 'c45', d: 20, de: 0, f: 0.2, vc: 25, L: 40, hm: 0 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A csigafúró két éllel dolgozik (z = 2, f<sub>z</sub> = f/2). <b>Állítsd az átmérőt és az előfuratot</b>: furatbővítésnél kisebb a fogásmélység, ezért kisebb a nyomaték — M<sub>f</sub> = M<sub>c</sub>·(1 − (d<sub>e</sub>/d)²). A csúcsszög a munkadarab anyagától függ (a jegyzet táblázata).</p>';
      U.chips(el, Object.keys(ANY).map(function (k) { return [k, ANY[k].n]; }), S.a, function (v) { S.a = v; st.set(S); P.render(); }, 'Anyag');
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['0', 'HSS fúró'], ['1', 'HM fúró']], String(S.hm), function (v) { S.hm = +v; st.set(S); P.render(); }, 'Szerszámanyag');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.7 : 0.4; }, minH: 220, maxH: 320, label: 'Fúrás metszete' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; if (S.de > S.d - 2) S.de = Math.max(0, S.d - 2); st.set(S); P.render(); }; }
      U.slider(g, { label: 'Átmérő d', min: 3, max: 50, step: 0.5, value: S.d, unit: 'mm', dec: 1, onInput: set('d') });
      U.slider(g, { label: 'Előfurat d_e', min: 0, max: 45, step: 0.5, value: S.de, fmt: function (v) { return v ? fmt(v, 1) + ' mm' : 'telibe'; }, onInput: set('de') });
      U.slider(g, { label: 'Előtolás f', min: 0.03, max: 0.5, step: 0.01, value: S.f, unit: 'mm/ford', dec: 2, onInput: set('f') });
      U.slider(g, { label: 'v_c', min: 5, max: 250, step: 5, value: S.vc, unit: 'm/min', dec: 0, onInput: set('vc') });
      U.slider(g, { label: 'Furathossz L', min: 5, max: 200, step: 5, value: S.L, unit: 'mm', dec: 0, onInput: set('L') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var M = ANY[S.a], ang = CSUCS[S.a], kr = ang / 2 * Math.PI / 180, d = S.d, de = Math.min(S.de, d - 2), o = '';
        var k = Math.min((w * 0.5) / (d * 1.6), (h - 40) / (d * 1.9)), cx = w * 0.3, top = 16, yd = top + d * 0.9 * k;
        // munkadarab metszete a furattal
        o += '<rect x="' + (cx - d * 0.8 * k) + '" y="' + (yd - d * 0.1 * k) + '" width="' + (d * 1.6 * k) + '" height="' + (h - yd - 8 + d * 0.1 * k) + '" style="fill:var(--ix-8);fill-opacity:.22"/>';
        if (de > 0) o += '<rect x="' + (cx - de / 2 * k) + '" y="' + (yd - d * 0.1 * k) + '" width="' + (de * k) + '" height="' + (h - yd - 8 + d * 0.1 * k) + '" style="fill:var(--surface);stroke:var(--muted);stroke-dasharray:4 3"/>';
        // fúró: palást és csúcs
        var tipY = yd + d / 2 / Math.tan(kr) * k;
        o += '<path d="M' + (cx - d / 2 * k) + ',' + top + 'V' + yd + 'L' + cx + ',' + tipY + 'L' + (cx + d / 2 * k) + ',' + yd + 'V' + top + 'Z" style="fill:var(--ix-2);fill-opacity:.3;stroke:var(--ink);stroke-width:1.4"/>';
        // forgácsoló élszakasz (bővítésnél csak a gyűrűn)
        var r0 = de / 2, yA = yd + (d / 2 - r0) / Math.tan(kr) * k;
        o += '<path d="M' + (cx + r0 * k) + ',' + yA + 'L' + (cx + d / 2 * k) + ',' + yd + '" style="stroke:var(--ix-5);stroke-width:4;stroke-linecap:round"/><path d="M' + (cx - r0 * k) + ',' + yA + 'L' + (cx - d / 2 * k) + ',' + yd + '" style="stroke:var(--ix-5);stroke-width:4;stroke-linecap:round"/>';
        if (!de) o += '<circle cx="' + cx + '" cy="' + tipY + '" r="4" style="fill:var(--ix-1)"/><text class="lb sm" x="' + (cx + 8) + '" y="' + (tipY + 4) + '" style="fill:var(--ix-1)">keresztél</text>';
        o += '<text class="la sm" x="' + cx + '" y="' + (tipY + 18) + '" text-anchor="middle">2κ_r = ' + ang + '°</text>';
        // méretek
        var xr = w * 0.62;
        o += '<text class="lb sm" x="' + xr + '" y="30">a_p = ' + fmt(de ? (d - de) / 2 : d / 2, 2) + ' mm</text>';
        o += '<text class="lb sm" x="' + xr + '" y="50">f_z = f/2 = ' + fmt(S.f / 2, 3) + ' mm</text>';
        o += '<text class="lb sm" x="' + xr + '" y="70">h = f_z·sin κ_r = ' + fmt(S.f / 2 * Math.sin(kr), 3) + ' mm</text>';
        o += '<text class="tk" x="' + xr + '" y="92">piros: forgácsoló élszakasz</text>';
        P.svg.innerHTML = o;
        var n = 1000 * S.vc / (Math.PI * d), vf = S.f * n, hh = S.f / 2 * Math.sin(59 * Math.PI / 180);
        var Kv = Math.pow(100 / S.vc, 0.1), Kg = (109 - 1.5 * 20) / 100, Ks = S.hm ? 1 : 1.2, Ke = de ? 1.1 : 1.15, kc = M.kc * Math.pow(hh, -M.z) * Kv * Kg * Ks * Ke;
        var Fc = kc * S.f * d / 4, Mc = kc * S.f * d * d / 8000, Mf = Mc * (1 - Math.pow(de / d, 2)), Mw = de ? Mf : Mc, Pc = Mw * 2 * Math.PI * n / 60000, tg = (S.L + 0.3 * d + 2) / vf;
        out.innerHTML = '<h4><small>' + (de ? 'furatbővítés Ø' + fmt(de, 1) + ' → Ø' + fmt(d, 1) : 'telibefúrás Ø' + fmt(d, 1)) + ' · ' + (S.hm ? 'HM' : 'HSS') + ' · n ≈ ' + Math.round(n) + ' 1/min</small>M = ' + fmt(Mw, 2) + ' Nm · P_c = ' + fmt(Pc, 2) + ' kW (motor ≈ ' + fmt(Pc / 0.7, 2) + ' kW)</h4>' +
          U.kv([['k_c (K_v·K_γ·K_s·K_elj)', Math.round(kc) + ' N/mm²', 'K_s = ' + fmt(Ks, 1) + ', K_elj = ' + fmt(Ke, 2) + ', γ = 20°, κ_r = 59°'], ['F_c = k_c·f·d/4 (egy élre)', fmt(Fc, 0) + ' N', 'F_f ≈ F_c a keresztél miatt (telibefúrásnál)'], ['M_c = k_c·f·d²/(8·10³)', fmt(Mc, 2) + ' Nm', de ? 'bővítés: M_f = M_c·(1 − (d_e/d)²) = ' + fmt(Mf, 2) + ' Nm' : 'telibefúrás'], ['v_f = f·n', Math.round(vf) + ' mm/min'], ['Gépi főidő t_g = (y₁ + L + y₂)/(f·n)', fmt(tg, 2) + ' perc', 'ráfutás ≈ 0,3·d + 2 mm']]) +
          '<p class="ix-hint">A furat hossza szerint (jegyzet): rövid l/d &lt; 0,5, normál 0,5–3, hosszú 3–10, mély &gt; 10. Telibefúrás Ø25–30 mm-ig; fölötte előfúrás és bővítés.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/16 — palástmarás: egyen- és ellenirányú, közepes forgácsvastagság */
  /* ================================================================== */
  AVIX.def('maras', {
    title: 'Palástmarás: egyen- és ellenirányú',
    sub: 'Vessző alakú forgács · h = f_z·√(a/d), h_max ≈ 2h · ψ = z·√(a·d)/(d·π) · F_e és P_c',
    mount: function (el) {
      var st = U.store('maras', { m: 'ellen', a: 'c45', d: 80, z: 8, fz: 0.12, ae: 6, b: 40, vc: 30 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A marófog forgácsvastagsága a fogásív mentén változik: <b>ellenirányú</b> marásnál nulláról nő (a fog belépéskor csúszik, dörzsöl, a darabot emeli), <b>egyenirányúnál</b> a legvastagabb résszel lép be és leszorítja a darabot — de csak holtjátékmentes asztalon. A forgácsvastagság a rajzon nagyítva látszik.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['ellen', 'Ellenirányú'], ['egy', 'Egyenirányú']], S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Marási mód');
      var play = U.h('button', 'ix-btn', '❚❚ Megállítás'); play.type = 'button'; r1.appendChild(play);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.48; }, minH: 250, maxH: 380, label: 'Palástmarás' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Maró d', min: 40, max: 160, step: 5, value: S.d, unit: 'mm', dec: 0, onInput: set('d') });
      U.slider(g, { label: 'Fogszám z', min: 4, max: 20, step: 1, value: S.z, dec: 0, onInput: set('z') });
      U.slider(g, { label: 'f_z', min: 0.03, max: 0.3, step: 0.01, value: S.fz, unit: 'mm', dec: 2, onInput: set('fz') });
      U.slider(g, { label: 'Fogásmélység a', min: 1, max: 20, step: 0.5, value: S.ae, unit: 'mm', dec: 1, onInput: set('ae') });
      U.slider(g, { label: 'Szélesség b', min: 5, max: 120, step: 5, value: S.b, unit: 'mm', dec: 0, onInput: set('b') });
      U.slider(g, { label: 'v_c', min: 10, max: 300, step: 5, value: S.vc, unit: 'm/min', dec: 0, onInput: set('vc') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var th = 0, running = !U.reduce, last = 0;
      play.textContent = running ? '❚❚ Megállítás' : '▶ Forgatás';
      play.addEventListener('click', function () { running = !running; play.textContent = running ? '❚❚ Megállítás' : '▶ Forgatás'; if (running) { last = 0; requestAnimationFrame(tick); } });
      function tick(t) {
        if (!running) return;
        if (!el.isConnected || el.offsetParent === null) { running = false; play.textContent = '▶ Forgatás'; return; }
        if (last && t - last < 33) { requestAnimationFrame(tick); return; }
        var dt = last ? (t - last) / 1000 : 0; last = t; th += dt * 0.9; draw(P.w, P.h); requestAnimationFrame(tick);
      }
      var M, n, fe, amp;
      function draw(w, h) {
        if (!w) return;
        var R = S.d / 2, a = Math.min(S.ae, R * 0.9), up = S.m === 'ellen';
        var k = Math.min((w * 0.62) / (S.d * 1.25), (h - 30) / (S.d * 1.15)), cx = w * 0.34, cy = 14 + R * k, yb = cy + R * k, yw = yb - a * k;
        var pe = Math.acos((R - a) / R); // fogásív vége (a függőlegestől mérve)
        var o = '';
        // munkadarab: balra a megmunkált (alacsonyabb), jobbra a még meg nem munkált felület
        var arc = [];
        for (var i = 0; i <= 30; i++) { var p = pe * i / 30; arc.push([cx + R * k * Math.sin(p), cy + R * k * Math.cos(p)]); }
        o += '<path d="M0,' + yb + 'L' + cx + ',' + yb + 'L' + arc.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L') + 'L' + w + ',' + yw + 'L' + w + ',' + h + 'L0,' + h + 'Z" style="fill:var(--ix-8);fill-opacity:.28;stroke:var(--ink);stroke-width:1"/>';
        // vessző alakú forgács (nagyítva, radiálisan kifelé)
        amp = Math.min(R * k * 0.22, 24);
        var chipOut = [], chipIn = [];
        for (i = 0; i <= 40; i++) {
          var ph = pe * i / 40, hh = Math.sin(ph) / Math.sin(pe);
          chipIn.push([cx + R * k * Math.sin(ph), cy + R * k * Math.cos(ph)]);
          chipOut.push([cx + (R * k + hh * amp) * Math.sin(ph), cy + (R * k + hh * amp) * Math.cos(ph)]);
        }
        o += '<path d="M' + chipIn.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L') + 'L' + chipOut.reverse().map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L') + 'Z" style="fill:var(--ix-1);fill-opacity:.55;stroke:var(--ix-1)"/>';
        // maró
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * k) + '" style="fill:var(--ix-2);fill-opacity:.2;stroke:var(--ink);stroke-width:1.4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (R * k * 0.25) + '" style="fill:var(--surface);stroke:var(--ink)"/>';
        var dir = up ? 1 : -1, contact = -1;
        for (i = 0; i < S.z; i++) {
          var ang = dir * th + i * 2 * Math.PI / S.z, ca = Math.cos(ang), sa = Math.sin(ang); // ang: a függőleges lefelé iránytól, jobbra pozitív
          var angN = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), inArc = angN <= pe;
          if (inArc) contact = angN;
          var tx = cx + R * k * sa, ty = cy + R * k * ca, bx = cx + (R * k - 12) * sa, by = cy + (R * k - 12) * ca;
          var nx = ca, ny = -sa; // érintő irány
          o += '<path d="M' + tx.toFixed(1) + ',' + ty.toFixed(1) + 'L' + (bx + nx * 6 * dir).toFixed(1) + ',' + (by + ny * 6 * dir).toFixed(1) + 'L' + (bx - nx * 4 * dir).toFixed(1) + ',' + (by - ny * 4 * dir).toFixed(1) + 'Z" style="fill:' + (inArc ? 'var(--ix-5)' : 'var(--ink)') + '"/>';
        }
        // forgásirány és előtolás
        o += '<text class="lb sm" x="' + (cx - R * k * 0.2) + '" y="' + (cy + 4) + '" text-anchor="middle">' + (up ? '↺' : '↻') + ' n</text>';
        o += '<path d="M' + (w - 20) + ',' + (yw + 22) + 'h-44" style="stroke:var(--acc);stroke-width:2"/><path d="M' + (w - 66) + ',' + (yw + 22) + 'l8,-4v8z" style="fill:var(--acc)"/><text class="la sm" x="' + (w - 20) + '" y="' + (yw + 40) + '" text-anchor="end">v_f (munkadarab)</text>';
        // erőhatás a munkadarabra
        if (contact >= 0) {
          var px = cx + R * k * Math.sin(contact), py = cy + R * k * Math.cos(contact), fy = up ? -1 : 1;
          o += '<path d="M' + px + ',' + py + 'v' + (fy * 26) + '" style="stroke:var(--ix-5);stroke-width:2.5"/><path d="M' + px + ',' + (py + fy * 30) + 'l-5,' + (-fy * 8) + 'h10z" style="fill:var(--ix-5)"/>';
          o += '<text class="lb sm" x="' + (px + 8) + '" y="' + (py + fy * 22) + '" style="fill:var(--ix-5)">' + (up ? 'emeli a darabot' : 'leszorítja') + '</text>';
        }
        // h(φ) grafikon
        var gx0 = w * 0.7, gx1 = w - 10, gy0 = h - 18, gy1 = gy0 - Math.min(90, h * 0.32);
        var hx = U.scale(0, pe, gx0, gx1), hy = U.scale(0, 1.05, gy0, gy1), pts = [];
        for (i = 0; i <= 30; i++) { var q = pe * i / 30, xx = up ? q : pe - q; pts.push([hx(q), hy(Math.sin(xx) / Math.sin(pe))]); }
        o += '<rect x="' + (gx0 - 6) + '" y="' + (gy1 - 16) + '" width="' + (gx1 - gx0 + 12) + '" height="' + (gy0 - gy1 + 32) + '" rx="6" style="fill:var(--surface);fill-opacity:.92;stroke:var(--rule)"/>';
        o += '<path d="M' + gx0 + ',' + gy1 + 'V' + gy0 + 'H' + gx1 + '" class="ax" style="fill:none"/><path d="M' + pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L') + '" class="ln acc"/>';
        var hm = (1 - Math.cos(pe)) / (pe * Math.sin(pe));
        o += '<line x1="' + gx0 + '" x2="' + gx1 + '" y1="' + hy(hm) + '" y2="' + hy(hm) + '" class="ln th dash"/><text class="tk" x="' + gx0 + '" y="' + (gy1 - 4) + '">h a fogásív mentén</text><text class="tk" x="' + gx1 + '" y="' + (hy(hm) - 3) + '" text-anchor="end">közepes</text>';
        o += '<text class="tk" x="' + gx0 + '" y="' + (gy0 + 12) + '">' + (up ? 'belépés' : 'belépés') + '</text><text class="tk" x="' + gx1 + '" y="' + (gy0 + 12) + '" text-anchor="end">kilépés</text>';
        P.svg.innerHTML = o;
      }
      P.draw = function (w, h) {
        draw(w, h);
        M = ANY[S.a] || ANY.c45;
        var hmean = S.fz * Math.sqrt(S.ae / S.d), psi = S.z * Math.sqrt(S.ae * S.d) / (S.d * Math.PI), kc = M.kc * Math.pow(hmean, -M.z) * Math.pow(100 / S.vc, 0.1);
        n = 1000 * S.vc / (Math.PI * S.d); var vf = S.fz * S.z * n; fe = kc * S.ae * S.fz * S.b * S.z / (S.d * Math.PI);
        var Pc = kc * S.ae * S.b * vf / 6e7, Q = S.ae * S.b * vf / 1000;
        out.innerHTML = '<h4><small>' + (S.m === 'ellen' ? 'ellenirányú' : 'egyenirányú') + ' · C45 · n ≈ ' + Math.round(n) + ' 1/min · v_f ≈ ' + Math.round(vf) + ' mm/min</small>F_e ≈ ' + fmt(fe / 1000, 2) + ' kN · P_c ≈ ' + fmt(Pc, 2) + ' kW</h4>' +
          U.kv([['Közepes forgácsvastagság h = f_z·√(a/d)', fmt(hmean, 3) + ' mm', 'h_max ≈ 2h = ' + fmt(2 * hmean, 3) + ' mm'], ['Kapcsolószám ψ = z·√(a·d)/(d·π)', fmt(psi, 2), psi < 1 ? 'ψ < 1: időnként egy fog sem forgácsol — erős erőhullámzás' : 'ψ > 1: az erő nem esik nullára, de hullámzik'], ['k_c = k_c1.1·h^−z·K_v', Math.round(kc) + ' N/mm²'], ['Fogosztás t = d·π/z', fmt(S.d * Math.PI / S.z, 1) + ' mm'], ['Anyagleválasztás Q = a·b·v_f', fmt(Q, 1) + ' cm³/min', S.m === 'egy' ? 'egyenirányúnál a jegyzet szerint 50–70%-kal nagyobb is lehet' : '']]) +
          '<p class="ix-hint">' + (S.m === 'ellen' ? 'Ellenirányú: bármilyen gépen (a csavarorsó holtjátéka nem érvényesül), de a fog belépéskor megcsúszik — gyorsabb élkopás; az erő emeli a darabot, rossz befogásnál rezgés.' : 'Egyenirányú: a fog vastag forgáccsal lép be, nem csúszik, kevésbé kopik, a darabot az asztalra szorítja; holtjátékos gépen az asztal megugrik — fogtörés.') + '</p>';
      };
      P.render();
      if (running) requestAnimationFrame(tick);
    },
  });

  /* ================================================================== */
  /* A/14 — a munkadarab lehajlása a befogás szerint                      */
  /* ================================================================== */
  var BEF = {
    t: { n: 'Tokmány (lebegve)', K: 3, x: 1 },
    tc: { n: 'Tokmány + csúcs', K: 102, x: 0.6 },
    cc: { n: 'Két csúcs között', K: 48, x: 0.5 },
  };
  AVIX.def('lehajlas', {
    title: 'Befogás és lehajlás',
    sub: 'f = F_p·l³/(K·E·I), Δd = 2f · a befogás módja az l/d arány szerint',
    mount: function (el) {
      var st = U.store('lehajlas', { b: 'tc', l: 300, d: 40, Fc: 2000 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A passzív erő (F_p ≈ F_c/3) lehajlítja a munkadarabot, ezért a késnél kevesebbet fog: a darab ott vastagabb lesz. <b>Válassz befogást</b>, és állítsd a hosszt és az átmérőt — a lehajlás a hossz köbével nő.</p>';
      U.chips(el, Object.keys(BEF).map(function (k) { return [k, BEF[k].n]; }), S.b, function (v) { S.b = v; st.set(S); P.render(); }, 'Befogás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.55 : 0.32; }, minH: 170, maxH: 250, label: 'Lehajlás' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Hossz l', min: 50, max: 1200, step: 10, value: S.l, unit: 'mm', dec: 0, onInput: set('l') });
      U.slider(g, { label: 'Átmérő d', min: 10, max: 150, step: 1, value: S.d, unit: 'mm', dec: 0, onInput: set('d') });
      U.slider(g, { label: 'F_c', min: 200, max: 8000, step: 100, value: S.Fc, unit: 'N', dec: 0, onInput: set('Fc') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var B = BEF[S.b], I = Math.PI * Math.pow(S.d, 4) / 64, E = 210000, Fp = S.Fc / 3, f = Fp * Math.pow(S.l, 3) / (B.K * E * I), ld = S.l / S.d;
        var x0 = 40, x1 = w - 30, yc = h / 2, amp = Math.min(h * 0.3, 8 + Math.sqrt(f) * 60), o = '';
        // lehajlási alak (vázlat)
        var pts = [];
        for (var i = 0; i <= 60; i++) {
          var u = i / 60, yv;
          if (S.b === 't') yv = u * u * (3 - u) / 2; else if (S.b === 'cc') yv = Math.sin(Math.PI * u); else yv = (u * u * (1 - u)) / 0.148 * 1.0;
          pts.push([x0 + u * (x1 - x0), yc + yv * amp]);
        }
        var halfD = Math.min(h * 0.18, 6 + S.d * 0.25);
        o += '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + (p[1] - halfD).toFixed(1); }).join('L') + 'L' + pts.slice().reverse().map(function (p) { return p[0].toFixed(1) + ',' + (p[1] + halfD).toFixed(1); }).join('L') + 'Z" style="fill:var(--ix-8);fill-opacity:.3;stroke:var(--ink);stroke-width:1.2"/>';
        o += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + yc + '" y2="' + yc + '" class="ln th dash"/>';
        o += '<rect x="' + (x0 - 26) + '" y="' + (yc - halfD - 14) + '" width="26" height="' + (2 * halfD + 28) + '" style="fill:var(--ink);fill-opacity:.55"/>';
        if (S.b !== 't') o += '<path d="M' + (x1 + 22) + ',' + (yc - 10) + 'L' + x1 + ',' + yc + 'L' + (x1 + 22) + ',' + (yc + 10) + 'Z" style="fill:var(--ink);fill-opacity:.55"/>';
        if (S.b === 'cc') o += '<path d="M' + (x0 - 26) + ',' + (yc - 10) + 'L' + x0 + ',' + yc + 'L' + (x0 - 26) + ',' + (yc + 10) + 'Z" style="fill:var(--surface)"/>';
        var xm = x0 + B.x * (x1 - x0) * (S.b === 'tc' ? 1.07 : 1);
        o += '<path d="M' + xm + ',' + (yc - halfD - 30) + 'v18" style="stroke:var(--ix-5);stroke-width:2.5"/><path d="M' + xm + ',' + (yc - halfD - 10) + 'l-5,-8h10z" style="fill:var(--ix-5)"/><text class="lb sm" x="' + (xm + 6) + '" y="' + (yc - halfD - 20) + '" style="fill:var(--ix-5)">F_p</text>';
        o += '<text class="tk" x="' + x0 + '" y="' + (h - 8) + '">a lehajlás nagyítva, vázlatos alak</text>';
        P.svg.innerHTML = o;
        var rec = ld < 3.5 ? 'tokmány (lebegve)' : ld < 8 ? 'tokmány + csúcs' : ld <= 12 ? 'csúcsok között (vagy tokmány + csúcs)' : 'csúcsok között + báb';
        out.innerHTML = '<h4><small>l/d = ' + fmt(ld, 1) + ' · a jegyzet ajánlása: ' + rec + '</small>f = ' + fmt(f * 1000, f < 0.01 ? 2 : 1) + ' µm · Δd = 2f = ' + fmt(2 * f * 1000, 1) + ' µm</h4>' +
          U.kv([['K (' + B.n + ')', String(B.K), 'K = 48 két csúcs, 102 tokmány + csúcs, 3 csak tokmány'], ['I = π·d⁴/64', fmt(I, 0) + ' mm⁴'], ['F_p ≈ F_c/3', fmt(Fp, 0) + ' N']]) +
          (2 * f > 0.05 ? '<p class="ix-note">Az átmérőhiba nagyobb 50 µm-nél — merevebb befogás (csúcs, báb), kisebb fogásmélység vagy két fogás kell.</p>' : '');
      };
      P.render();
    },
  });
})();
