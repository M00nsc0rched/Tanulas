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
        var xr = w < 520 ? w * 0.5 : w * 0.62;
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
        o += '<line x1="' + gx0 + '" x2="' + gx1 + '" y1="' + hy(hm) + '" y2="' + hy(hm) + '" class="ln th dash"/><text class="tk" x="' + Math.min(gx0, w - 122) + '" y="' + (gy1 - 4) + '">h a fogásív mentén</text><text class="tk" x="' + gx1 + '" y="' + (hy(hm) - 3) + '" text-anchor="end">közepes</text>';
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
  /* A/17 — köszörűkorong jelölése, szerkezete; egyenértékű forgácsvastagság */
  /* ================================================================== */
  var SZEM = { '1A': 'normál korund, 94% Al₂O₃', '2A': 'mikrokristályos korund, 96% Al₂O₃', '6A': 'nemes korund, 99% Al₂O₃', '1C': 'fekete szilícium-karbid, 96% SiC', '2C': 'zöld szilícium-karbid, 98% SiC', 'CBN': 'köbös bórnitrid (acélokhoz, edzett acélhoz)', 'D': 'gyémánt (keményfémhez, kerámiához, nemvas anyagokhoz — vasat nem!)' };
  var KOT = { V: ['keramikus', 35, 'rideg, ütésre érzékeny, a korongok ~60%-a'], S: ['szilikát (vízüveg)', 30, 'kis szilárdság, vékony, nagy felületű darabokhoz'], R: ['gumi', 60, 'rugalmas, ütésálló, fényesít; vágókorong 100 m/s'], B: ['műgyanta', 45, 'a korongok ~30%-a; vágókorong 80 m/s'], E: ['sellak', 30, 'ritka, víztaszító'], MG: ['magnezit', 25, 'hőérzékeny anyagokhoz'] };
  function kemCat(c) { var i = c.charCodeAt(0) - 65; return i < 4 ? 'igen lágy' : i < 7 ? 'nagyon lágy' : i < 11 ? 'lágy' : i < 15 ? 'közepes' : i < 19 ? 'kemény' : i < 23 ? 'nagyon kemény' : 'igen kemény'; }
  AVIX.def('korong', {
    title: 'Köszörűkorong jelölése és szerkezete',
    sub: 'Szemcseanyag · szemcsenagyság · keménység (A–Z) · szerkezetszám · kötőanyag · q, h_eq, P_c',
    mount: function (el) {
      var st = U.store('korong', { txt: '1 350×40×127 – 6A 46 L 5 V 35', a: 0.02, vw: 20, vc: 30, b: 20, ds: 350, dw: 60 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Írd be vagy módosítsd a korong jelét (a tételtár példája: <b>6A 46 L 5 V</b>): az ábra a szemcsék méretét, sűrűségét és a kötés erősségét mutatja. Kemény anyaghoz <b>lágy</b> korong kell — a tompa szemcse kitörjön (önélezés).</p>' +
        '<div class="ix-row"><input type="text" aria-label="Korongjel" spellcheck="false" style="flex:1;min-width:0;min-height:44px;padding:0 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:600 16px var(--mono)"></div>';
      var inp = el.querySelector('input'); inp.value = S.txt;
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.55 : 0.32; }, minH: 170, maxH: 230, label: 'Korongszerkezet' });
      var dec = U.h('div', 'ix-out'); el.appendChild(dec);
      var calc = U.h('div', 'ix-out'); el.appendChild(calc);
      calc.innerHTML = '<h4><small>Számoló (palástköszörülés)</small>Sebességhányados és forgácsvastagság</h4>';
      var g = U.sliders(calc), res = U.h('div'); calc.appendChild(res);
      function set(k) { return function (v) { S[k] = v; st.set(S); rc(); }; }
      U.slider(g, { label: 'Fogásvétel a', min: 0.002, max: 0.1, step: 0.001, value: S.a, unit: 'mm', dec: 3, onInput: set('a') });
      U.slider(g, { label: 'v_w', min: 6, max: 40, step: 1, value: S.vw, unit: 'm/min', dec: 0, onInput: set('vw') });
      U.slider(g, { label: 'v_c', min: 15, max: 80, step: 1, value: S.vc, unit: 'm/s', dec: 0, onInput: set('vc') });
      U.slider(g, { label: 'Munkadarab d_w', min: 10, max: 300, step: 5, value: S.dw, unit: 'mm', dec: 0, onInput: set('dw') });
      var K = null;
      function parse() {
        S.txt = inp.value; st.set(S);
        var t = inp.value.toUpperCase().replace(/[–—-]/g, ' ');
        var m = t.match(/(1A|2A|6A|9A|1C|2C|CBN|\bD\b)\s*(\d{1,4})\s*([A-Z])\s*(\d{1,2})?\s*(V|S|R|B|E|MG)?\s*(\d{2,3})?\s*$/);
        if (!m) { K = null; dec.innerHTML = '<p class="ix-note">Nem értelmezhető jel. Formátum: szemcseanyag szemcsenagyság keménység szerkezetszám kötőanyag [sebesség], pl. 6A 46 L 5 V 35 vagy 2C 60 H 8 V.</p>'; P.render(); return; }
        K = { sz: m[1], n: +m[2], k: m[3], s: m[4] != null ? +m[4] : 5, kt: m[5] || 'V', v: m[6] ? +m[6] : null };
        var kt = KOT[K.kt] || KOT.V, vol = Math.max(0, 62 - 2 * K.s), mm = 25.4 / K.n;
        dec.innerHTML = '<h4><small>' + (SZEM[K.sz] || K.sz) + '</small>' + K.sz + ' ' + K.n + ' ' + K.k + ' ' + K.s + ' ' + K.kt + (K.v ? ' ' + K.v : '') + '</h4>' +
          U.kv([['Szemcsenagyság ' + K.n, K.n <= 24 ? 'durva' : K.n <= 60 ? 'közepes' : K.n <= 220 ? 'finom' : 'igen finom', 'a szita 1 collra eső nyílásszáma — szemcse ≈ ' + fmt(mm * 0.6, 2) + ' mm (becslés)'], ['Keménység ' + K.k, kemCat(K.k), 'a szemcse kitörési ellenállása, nem a szemcse keménysége'], ['Szerkezetszám ' + K.s, vol + '% szemcsetérfogat', '62 − 2·' + K.s + ' (a jegyzet szabálya); nagyobb szám = nyitottabb, több pórus'], ['Kötőanyag ' + K.kt, kt[0], kt[2] + ' · tipikus v_c ≈ ' + kt[1] + ' m/s'], ['Kerületi sebesség', K.v ? K.v + ' m/s' : '—', K.v && K.v > kt[1] + 20 ? 'a kötőanyag szokásos értékénél jóval nagyobb — különleges (erősített) korong kell' : '']]) +
          '<p class="ix-hint">' + (K.sz === 'D' ? 'Gyémánt vashoz nem jó: vas jelenlétében 600–700 °C fölött grafitosodik — acélhoz CBN kell.' : kemCat(K.k).indexOf('lágy') >= 0 ? 'Lágy korong: kemény anyaghoz (edzett acél, keményfém) — a tompa szemcsék könnyen kitörnek.' : kemCat(K.k).indexOf('kemény') >= 0 ? 'Kemény korong: lágy, szívós anyaghoz — a szemcsék sokáig bent maradnak, jobb a profiltartás.' : 'Közepes keménység: általános célú korong.') + '</p>';
        P.render();
      }
      P.draw = function (w, h) {
        if (!K) { P.svg.innerHTML = ''; return; }
        var o = '', vol = Math.max(0.1, (62 - 2 * K.s) / 100), r = U.clamp(90 / K.n * 6, 2.2, 16), area = (w - 20) * (h - 20), nG = Math.round(area * vol / (Math.PI * r * r) * 0.55);
        var hard = U.clamp((K.k.charCodeAt(0) - 65) / 25, 0, 1), seed = 7, pts = [];
        function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
        o += '<rect x="10" y="10" width="' + (w - 20) + '" height="' + (h - 20) + '" rx="8" style="fill:var(--surface);stroke:var(--rule-2)"/>';
        for (var i = 0; i < Math.min(nG, 700); i++) pts.push([14 + rnd() * (w - 28), 14 + rnd() * (h - 28)]);
        // kötőhidak (a keménységgel vastagodnak)
        var bw = 0.6 + hard * 3.2, br = '';
        pts.forEach(function (p, i) { for (var j = i + 1; j < Math.min(pts.length, i + 12); j++) { var q = pts[j], dd = Math.hypot(p[0] - q[0], p[1] - q[1]); if (dd < r * 3.2) br += 'M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + 'L' + q[0].toFixed(1) + ',' + q[1].toFixed(1); } });
        o += '<path d="' + br + '" style="stroke:var(--ix-1);stroke-width:' + bw.toFixed(2) + ';stroke-linecap:round;opacity:.7"/>';
        var col = K.sz === 'D' ? '--ix-2' : K.sz === 'CBN' ? '--ix-4' : /C$/.test(K.sz) ? '--ix-3' : '--ix-8';
        o += pts.map(function (p) { var s = r * (0.7 + rnd() * 0.6); return '<path d="M' + (p[0] - s).toFixed(1) + ',' + p[1].toFixed(1) + 'L' + p[0].toFixed(1) + ',' + (p[1] - s * 0.8).toFixed(1) + 'L' + (p[0] + s * 0.9).toFixed(1) + ',' + (p[1] + s * 0.2).toFixed(1) + 'L' + (p[0] + s * 0.1).toFixed(1) + ',' + (p[1] + s * 0.9).toFixed(1) + 'Z" style="fill:var(' + col + ');stroke:var(--ink);stroke-width:.6"/>'; }).join('');
        o += '<text class="lb sm" x="16" y="' + (h - 16) + '">szemcsék: ' + K.n + ' · kötéshidak: ' + K.k + ' · pórus: ' + (38 + 2 * K.s) + '%</text>';
        P.svg.innerHTML = o;
      };
      function rc() {
        var vwms = S.vw / 60, q = S.vc / vwms, heq = S.a * vwms / S.vc, deq = S.ds * S.dw / (S.ds + S.dw);
        var kc = 12000 * Math.pow(Math.max(heq, 1e-5) / 0.001, -0.25), Fcb = kc * S.b * heq * 4.5;
        res.innerHTML = U.kv([['q = v_c / v_w', fmt(q, 0), q < 60 ? 'kisebb a szokásos 60–150-nél' : q > 150 ? 'nagyobb a szokásos 60–150-nél' : 'a szokásos 60–150 tartományban'], ['h_eq = a·v_w/v_c', fmt(heq * 1000, 3) + ' µm', 'egyenértékű forgácsvastagság'], ['d_eq = d_s·d_w/(d_s + d_w)', fmt(deq, 1) + ' mm', 'külső hengeres köszörülés, d_s = 350 mm'], ['Beszúró köszörülés, b = 20 mm', 'F_c ≈ ' + fmt(Fcb, 0) + ' N', 'F_c = k_c·b·h_eq·K_γ, K_γ = 4,5; F_p ≈ (1,5–3)·F_c; P_c = F_c·v_c/10³ ≈ ' + fmt(Fcb * S.vc / 1000, 2) + ' kW']]) +
          '<p class="ix-hint">A k_c köszörülésnél igen nagy (tízezres N/mm² nagyságrend, itt becsült érték), mert a forgács rendkívül vékony és a szemcsék erősen negatív homlokszöggel dolgoznak. Előköszörülés a = 0,02–0,1 mm, simítás 0,002–0,01 mm.</p>';
      }
      inp.addEventListener('input', parse); parse(); rc();
    },
  });

  /* ================================================================== */
  /* A/18 — kúpesztergálás: félkúpszög, nyereg-elállítás, módszerválasztás */
  /* ================================================================== */
  var KMOD = { ferde: 'Ferde élű kés', szan: 'Késszán-elállítás', nyereg: 'Szegnyereg-elállítás', vonal: 'Kúpvonalzó' };
  AVIX.def('kup', {
    title: 'Kúpesztergálás',
    sub: 'tg α = (D − d)/(2l) · szegnyereg-elállítás e = L·(D − d)/(2l) · melyik módszer alkalmas?',
    mount: function (el) {
      var st = U.store('kup', { m: 'nyereg', D: 40, d: 36, l: 120, L: 200 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Add meg a kúp méreteit: a számoló megadja a félkúpszöget, a kúposságot és a szegnyereg elállítását, a módszerek pedig a jegyzet korlátai szerint zöldek vagy pirosak. <b>Válts módszert</b> a gép beállításának vázlatához (a szögek nagyítva).</p>';
      var chips = U.chips(el, Object.keys(KMOD).map(function (k) { return [k, KMOD[k]]; }), S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Módszer');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.36; }, minH: 200, maxH: 290, label: 'Kúpesztergálás vázlata' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; if (S.d >= S.D) S.d = S.D - 0.5; if (S.L < S.l) S.L = S.l; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Nagy átmérő D', min: 10, max: 120, step: 0.5, value: S.D, unit: 'mm', dec: 1, onInput: set('D') });
      U.slider(g, { label: 'Kis átmérő d', min: 5, max: 118, step: 0.5, value: S.d, unit: 'mm', dec: 1, onInput: set('d') });
      U.slider(g, { label: 'Kúphossz l', min: 5, max: 400, step: 5, value: S.l, unit: 'mm', dec: 0, onInput: set('l') });
      U.slider(g, { label: 'Darabhossz L', min: 5, max: 800, step: 5, value: S.L, unit: 'mm', dec: 0, onInput: set('L') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function ok(m, a, l) {
        if (m === 'ferde') return l <= 25 ? [1, 'rövid kúp — a kés éle a félkúpszögben áll'] : [0, 'csak rövid (≈ 25 mm alatti) kúphoz; hosszabbnál rezeg, rossz a felület'];
        if (m === 'szan') return l <= 100 ? [1, 'bármilyen szög; kézi előtolás → egyenetlenebb felület'] : [0, 'a kúp hosszabb a késszán útjánál (≈ 100 mm)'];
        if (m === 'nyereg') return a <= 2 ? [1, 'kis kúpszög, hosszú darab csúcsok között; belső kúphoz nem használható'] : [0, 'a jegyzet szerint csak kb. 1–2° félkúpszögig (max. 1:25)'];
        return a <= 12 ? [1, 'gépi előtolás, pontos, ismételhető'] : a <= 16 ? [1, 'a határ közelében (a jegyzet: max. 8–16°)'] : [0, 'a jegyzet szerint legfeljebb 8–16°'];
      }
      P.draw = function (w, h) {
        var a = Math.atan((S.D - S.d) / (2 * S.l)), ad = a * 180 / Math.PI, e = S.L * (S.D - S.d) / (2 * S.l), o = '';
        [].forEach.call(chips.el.children, function (b) { var r = ok(b.getAttribute('data-v'), ad, S.l); b.style.borderColor = r[0] ? 'var(--ix-3)' : 'var(--ix-5)'; });
        var ex = Math.max(1, Math.min(6, 8 / Math.max(ad, 0.3))), x0 = 60, x1 = w - 40, yc = h * 0.45;
        var lx = (x1 - x0), kR = Math.min(h * 0.28, 60) / (S.D / 2), rD = S.D / 2 * kR, rd = (S.D / 2 - (S.D - S.d) / 2 * ex) * kR;
        rd = Math.max(rd, rD * 0.2);
        var cl = x0 + lx * (1 - Math.min(1, S.l / S.L));
        // tokmány és csúcsok
        o += '<rect x="' + (x0 - 40) + '" y="' + (yc - rD - 16) + '" width="34" height="' + (2 * rD + 32) + '" style="fill:var(--ink);fill-opacity:.55"/>';
        var tilt = S.m === 'nyereg' ? Math.min(18, e * ex * kR) : 0;
        o += '<path d="M' + x0 + ',' + (yc - rD) + 'L' + cl + ',' + (yc - rD) + 'L' + x1 + ',' + (yc - rd + tilt * 0) + 'L' + x1 + ',' + (yc + rd) + 'L' + cl + ',' + (yc + rD) + 'L' + x0 + ',' + (yc + rD) + 'Z" style="fill:var(--ix-8);fill-opacity:.28;stroke:var(--ink);stroke-width:1.3"' + (tilt ? ' transform="rotate(' + (-Math.atan(tilt / lx) * 180 / Math.PI).toFixed(2) + ' ' + x0 + ' ' + yc + ')"' : '') + '/>';
        o += '<line x1="' + (x0 - 50) + '" x2="' + (x1 + 30) + '" y1="' + yc + '" y2="' + yc + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/><text class="tk" x="' + (x1 + 30) + '" y="' + (yc - 4) + '" text-anchor="end">gép tengelye</text>';
        o += '<path d="M' + (x1 + 28) + ',' + (yc - 8 - tilt) + 'L' + (x1 + 6) + ',' + (yc - tilt) + 'L' + (x1 + 28) + ',' + (yc + 8 - tilt) + 'Z" style="fill:var(--ink);fill-opacity:.55"/>';
        // a módszer mechanizmusa
        var ty = yc - rD - 6;
        if (S.m === 'nyereg') {
          o += '<path d="M' + (x1 + 34) + ',' + yc + 'v' + (-tilt) + '" style="stroke:var(--ix-5);stroke-width:2.5"/><text class="lb sm" x="' + (x1 + 36) + '" y="' + (yc - tilt / 2 + 4) + '" style="fill:var(--ix-5)">e</text>';
          o += '<path d="M' + cl + ',' + (ty - 14) + 'H' + x1 + '" style="stroke:var(--acc);stroke-width:2"/><path d="M' + x1 + ',' + (ty - 14) + 'l-8,-4v8z" style="fill:var(--acc)"/><text class="la sm" x="' + ((cl + x1) / 2) + '" y="' + (ty - 20) + '" text-anchor="middle">a kés a gép tengelyével párhuzamosan halad</text>';
        } else if (S.m === 'vonal') {
          o += '<path d="M' + cl + ',' + (yc + rD + 30) + 'L' + x1 + ',' + (yc + rd + 30) + '" style="stroke:var(--ix-2);stroke-width:6;stroke-linecap:round"/><text class="lb sm" x="' + cl + '" y="' + (yc + rD + 50) + '">kúpvonalzó a félkúpszögben</text>';
          o += '<path d="M' + cl + ',' + (ty - 10) + 'L' + x1 + ',' + (yc - rd - 16) + '" style="stroke:var(--acc);stroke-width:2"/><text class="la sm" x="' + ((cl + x1) / 2) + '" y="' + (ty - 18) + '" text-anchor="middle">gépi előtolás a vonalzó szerint</text>';
        } else if (S.m === 'szan') {
          var sx0 = (cl + x1) / 2, sy0 = ty - 26, ang = -Math.atan((rD - rd) / (x1 - cl)) * 180 / Math.PI;
          o += '<rect x="' + (sx0 - 60) + '" y="' + (sy0 - 8) + '" width="120" height="16" rx="3" style="fill:var(--ix-4);fill-opacity:.4;stroke:var(--ink)" transform="rotate(' + (-ang).toFixed(2) + ' ' + sx0 + ' ' + sy0 + ')"/><text class="lb sm" x="' + sx0 + '" y="' + (sy0 - 16) + '" text-anchor="middle">késszán α-ra fordítva — kézi előtolás</text>';
        } else {
          var tx = (cl + x1) / 2, tyy = yc - (rD + rd) / 2;
          o += '<path d="M' + (cl + 6) + ',' + (yc - rD - 3) + 'L' + (x1 - 6) + ',' + (yc - rd - 3) + 'L' + tx + ',' + (tyy - 44) + 'Z" style="fill:var(--ix-1);fill-opacity:.6;stroke:var(--ink)"/><text class="lb sm" x="' + tx + '" y="' + (tyy - 50) + '" text-anchor="middle">ferde élű kés — egy beszúrással</text>';
        }
        o += '<text class="tk" x="' + x0 + '" y="' + (h - 8) + '">a kúpszög a rajzon ' + fmt(ex, 1) + '×-esen nagyítva</text>';
        P.svg.innerHTML = o;
        var r = ok(S.m, ad, S.l), xk = S.l / (S.D - S.d);
        out.innerHTML = '<h4><small>' + KMOD[S.m] + ': ' + (r[0] ? 'alkalmas' : 'nem alkalmas') + '</small>α = ' + fmt(ad, 2) + '° (félkúpszög)</h4><p>' + r[1] + '.</p>' +
          U.kv([['tg α = (D − d)/(2l)', fmt((S.D - S.d) / (2 * S.l), 4)], ['Kúposság C = (D − d)/l', '1 : ' + fmt(xk, xk < 10 ? 1 : 0)], ['Szegnyereg-elállítás e = L·(D − d)/(2l)', fmt(e, 2) + ' mm', 'L = ' + S.L + ' mm teljes darabhossz'], ['Kúpvonalzó beállítása', fmt(ad, 2) + '°', 'a jegyzet: legfeljebb 8–16°']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/19 — menetesztergálás: cserekerekek, több bekezdés                 */
  /* ================================================================== */
  var ZS = [20, 24, 25, 40, 45, 50, 55, 60, 65, 70, 71, 75, 80, 85, 90, 95, 100, 105, 110, 113, 120, 127];
  function cserekerek(i) {
    var b2 = null, b4 = null, a, b, c, d, r, e;
    for (a = 0; a < ZS.length; a++) for (b = 0; b < ZS.length; b++) {
      if (a === b) continue; r = ZS[a] / ZS[b]; e = Math.abs(r - i) / i;
      if (!b2 || e < b2.e) b2 = { z: [ZS[a], ZS[b]], e: e, r: r };
      for (c = 0; c < ZS.length; c++) { if (c === a || c === b) continue; for (d = 0; d < ZS.length; d++) { if (d === a || d === b || d === c) continue; r = ZS[a] * ZS[c] / (ZS[b] * ZS[d]); e = Math.abs(r - i) / i; if (!b4 || e < b4.e - 1e-12) b4 = { z: [ZS[a], ZS[b], ZS[c], ZS[d]], e: e, r: r }; } }
    }
    return { b2: b2, b4: b4 };
  }
  AVIX.def('menet', {
    title: 'Menetesztergálás: cserekerekek és bekezdések',
    sub: 'P_m·n_m = P_v·n_v → i_cs = z₁z₃/(z₂z₄) a szabványos kerékkészletből · P_h = n·P',
    mount: function (el) {
      var st = U.store('menet', { P: 2.5, v: 6, n: 1, inch: 0, tpi: 8 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A főorsó egy fordulata alatt a késnek éppen egy menetemelkedésnyit kell haladnia: ezt a vezérorsó és a <b>cserekerekek</b> áttétele adja. Adj meg menetemelkedést (vagy hüvelykes menetet) — a számoló kikeresi a szabványos kerékkészletből a legjobb két- és négykerekes áttételt. A 127-es kerék a hüvelykes menetekhez kell.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['0', 'Metrikus (P mm)'], ['1', 'Hüvelykes (menet/coll)']], String(S.inch), function (v) { S.inch = +v; st.set(S); show(); P.render(); }, 'Menetrendszer');
      U.seg(r1, [['3', 'P_v = 3'], ['6', 'P_v = 6'], ['12', 'P_v = 12 mm']], String(S.v), function (v) { S.v = +v; st.set(S); P.render(); }, 'Vezérorsó');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.34; }, minH: 200, maxH: 280, label: 'Menetprofil és kerékhajtás' });
      var g = U.sliders(el);
      var sP = U.slider(g, { label: 'Emelkedés P', min: 0.5, max: 12, step: 0.05, value: S.P, unit: 'mm', dec: 2, onInput: function (v) { S.P = v; st.set(S); P.render(); } });
      var sT = U.slider(g, { label: 'Menet/coll', min: 2, max: 40, step: 1, value: S.tpi, dec: 0, onInput: function (v) { S.tpi = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Bekezdések n', min: 1, max: 4, step: 1, value: S.n, dec: 0, onInput: function (v) { S.n = v; st.set(S); P.render(); } });
      function show() { sP.el.style.display = S.inch ? 'none' : ''; sT.el.style.display = S.inch ? '' : 'none'; }
      show();
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var memo = {};
      P.draw = function (w, h) {
        var pitch = S.inch ? 25.4 / S.tpi : S.P, Ph = pitch * S.n, i = Ph / S.v, key = i.toFixed(6);
        var res = memo[key] || (memo[key] = cserekerek(i)), o = '';
        // menetprofil (tengelymetszet, felső oldal), bekezdésenként más szín
        var x0 = 16, x1 = w * 0.62, yb = h * 0.62, depth = Math.min(40, h * 0.18), per = Math.max(22, Math.min(70, (x1 - x0) / 7)), cols = ['--ix-2', '--ix-1', '--ix-3', '--ix-4'];
        o += '<rect x="' + x0 + '" y="' + yb + '" width="' + (x1 - x0) + '" height="' + (h - yb - 10) + '" style="fill:var(--ix-8);fill-opacity:.25"/>';
        for (var k = 0, x = x0; x < x1 - per; k++, x += per) {
          var c = cols[k % S.n];
          o += '<path d="M' + x + ',' + yb + 'L' + (x + per * 0.5) + ',' + (yb - depth) + 'L' + (x + per) + ',' + yb + 'Z" style="fill:var(' + c + ');fill-opacity:.55;stroke:var(--ink);stroke-width:1"/>';
        }
        o += '<path d="M' + (x0 + per * 0.5) + ',' + (yb - depth - 10) + 'h' + per + '" style="stroke:var(--ink);stroke-width:1.2"/><text class="lb sm" x="' + (x0 + per) + '" y="' + (yb - depth - 14) + '" text-anchor="middle">P</text>';
        if (S.n > 1) o += '<path d="M' + (x0 + per * 0.5) + ',' + (yb - depth - 30) + 'h' + (per * S.n) + '" style="stroke:var(--acc);stroke-width:1.6"/><text class="la sm" x="' + (x0 + per * (0.5 + S.n / 2)) + '" y="' + (yb - depth - 34) + '" text-anchor="middle">P_h = ' + S.n + '·P</text>';
        o += '<text class="tk" x="' + x0 + '" y="' + (h - 16) + '">egy szín = egy bekezdés</text>';
        // kerékhajtás (4 kerék)
        var z = res.b4.z, gx = w * 0.7, gy = 30, R = function (zz) { return Math.min(w * 0.06, 34) * Math.sqrt(zz / 60); };
        var c1 = [gx, gy + R(z[0])], c2 = [gx, c1[1] + R(z[0]) + R(z[1])], c3 = [gx + R(z[1]) + R(z[2]) + 4, c2[1]], c4 = [c3[0], c3[1] + R(z[2]) + R(z[3])];
        [[c1, z[0], 'z₁'], [c2, z[1], 'z₂'], [c3, z[2], 'z₃'], [c4, z[3], 'z₄']].forEach(function (q, j) {
          o += '<circle cx="' + q[0][0].toFixed(1) + '" cy="' + q[0][1].toFixed(1) + '" r="' + R(q[1]).toFixed(1) + '" style="fill:var(' + (j % 2 ? '--ix-8' : '--ix-1') + ');fill-opacity:.3;stroke:var(--ink)"/><text class="lb sm" x="' + q[0][0].toFixed(1) + '" y="' + (q[0][1] + 4).toFixed(1) + '" text-anchor="middle">' + q[2] + '=' + q[1] + '</text>';
        });
        o += '<text class="tk" x="' + (gx - 20) + '" y="' + (c1[1] - R(z[0]) - 6) + '">főorsó felől</text><text class="tk" x="' + (c4[0]) + '" y="' + Math.min(h - 6, c4[1] + R(z[3]) + 14) + '" text-anchor="middle">vezérorsó felé</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>' + (S.inch ? S.tpi + ' menet/coll → P = 25,4/' + S.tpi + ' = ' + fmt(pitch, 4) + ' mm' : 'P = ' + fmt(pitch, 2) + ' mm') + (S.n > 1 ? ' · ' + S.n + ' bekezdés → P_h = ' + fmt(Ph, 3) + ' mm' : '') + '</small>i_cs = P_h/P_v = ' + fmt(i, 5) + '</h4>' +
          U.kv([['Négy kerék z₁·z₃/(z₂·z₄)', res.b4.z[0] + '·' + res.b4.z[2] + ' / (' + res.b4.z[1] + '·' + res.b4.z[3] + ')', 'áttétel ' + fmt(res.b4.r, 5) + ' · hiba ' + (res.b4.e < 1e-9 ? 'pontos' : fmt(res.b4.e * 100, 3) + '%')], ['Két kerék z₁/z₂', res.b2.z[0] + ' / ' + res.b2.z[1], 'áttétel ' + fmt(res.b2.r, 5) + ' · hiba ' + (res.b2.e < 1e-9 ? 'pontos' : fmt(res.b2.e * 100, 3) + '%')], ['Bekezdések osztása', S.n > 1 ? '360°/' + S.n + ' = ' + fmt(360 / S.n, 1) + '°' : '—', S.n > 1 ? 'főorsó-elforgatás, vagy késszán-elállítás P = ' + fmt(pitch, 3) + ' mm-rel, vagy osztó menesztőtárcsa' : 'egy bekezdésű menet']]) +
          '<p class="ix-hint">A cserekerekek a jegyzet szabványos készletéből: 20, 24, 25, 40 … 120, 127 (minden kerék egyszer). A valós gépen a kerekek összeférhetőségét (tengelytáv) is ellenőrizni kell.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/20 — pontossági osztályok; RP rétegvastagság és lépcsőhatás        */
  /* ================================================================== */
  var PCL = [
    { n: 'Finommegmunkálás', e: 'esztergálás, marás', t: '< 50 µm', ra: 1.6, c: '--ix-8', f: 'általános gépek, HSS/HM szerszám' },
    { n: 'Precíziós', e: 'finomesztergálás, köszörülés', t: '< 25 µm', ra: 0.24, c: '--ix-2', f: 'merev gép, pontos befogás, jó szerszámállapot' },
    { n: 'Nagypontosságú', e: 'leppelés, finomköszörülés', t: '< 10 µm', ra: 0.13, c: '--ix-3', f: 'hőstabil környezet, finom abrazív' },
    { n: 'Ultraprecíziós', e: 'mikroforgácsolás, mikroköszörülés', t: '< 1 µm', ra: 0.1, c: '--ix-1', f: 'gyémánt egykristály (vashoz CBN), rezgésszigetelt, klimatizált (20 ± 0,5 °C) csarnok, v_c 200–2000 m/min, f 0,5–10 µm/ford' },
    { n: 'Nanotechnológia', e: 'polírozás, elektrokémiai polírozás', t: '< 0,1 µm', ra: 0.01, c: '--ix-4', f: 'atomi–molekuláris léptékű anyagleválasztás' },
  ];
  AVIX.def('pontossag', {
    title: 'A megmunkálási pontosság tartományai',
    sub: 'Finom → precíziós → nagypontosságú → ultraprecíziós → nanotechnológia (R_a logaritmikus skálán)',
    mount: function (el) {
      var st = U.store('pontossag', { ra: 0.2 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A tételtár táblázata logaritmikus skálán: minden osztály nagyjából egy nagyságrenddel kisebb érdességet ér el. <b>Húzd a jelölőt</b> (vagy koppints egy sávra): a kártya megmutatja, milyen eljárás és milyen feltételek kellenek.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.6 : 0.3; }, minH: 190, maxH: 240, label: 'Pontossági osztályok' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var sx;
      function cls(ra) { for (var i = PCL.length - 1; i >= 0; i--) if (ra <= PCL[i].ra * 1.0001) return i; return 0; }
      P.draw = function (w, h) {
        sx = U.scale(0.003, 6, 20, w - 20, true); var o = '', rh = (h - 60) / PCL.length;
        PCL.forEach(function (p, i) {
          var y = 14 + i * rh, x0 = sx(i < PCL.length - 1 ? PCL[i + 1].ra : 0.003), x1 = sx(p.ra), cur = cls(S.ra) === i;
          o += '<rect x="' + x0.toFixed(1) + '" y="' + y + '" width="' + (x1 - x0).toFixed(1) + '" height="' + (rh - 6) + '" rx="4" style="fill:var(' + p.c + ');fill-opacity:' + (cur ? '.7' : '.3') + ';stroke:var(--ink);stroke-width:' + (cur ? 1.5 : .5) + '"/>';
          var inT = x1 + 10 + p.n.length * 6.6 > w; o += '<text class="lb sm" x="' + (inT ? x1 - 6 : x1 + 6).toFixed(1) + '" y="' + (y + rh / 2).toFixed(1) + '"' + (inT ? ' text-anchor="end"' : '') + '>' + p.n + '</text>';
        });
        [0.01, 0.1, 1].forEach(function (t) { o += '<line x1="' + sx(t) + '" x2="' + sx(t) + '" y1="10" y2="' + (h - 40) + '" class="grid"/><text class="tk" x="' + sx(t) + '" y="' + (h - 26) + '" text-anchor="middle">' + fmt(t, t < 0.1 ? 2 : t < 1 ? 1 : 0) + '</text>'; });
        o += '<text class="tk" x="' + (w - 20) + '" y="' + (h - 10) + '" text-anchor="end">R_a, µm (log) — a finomabb balra</text>';
        o += '<line x1="' + sx(S.ra) + '" x2="' + sx(S.ra) + '" y1="8" y2="' + (h - 38) + '" style="stroke:var(--acc);stroke-width:2"/><circle class="mk" cx="' + sx(S.ra) + '" cy="' + (h - 38) + '" r="7"/>';
        P.svg.innerHTML = o;
        var p = PCL[cls(S.ra)];
        out.innerHTML = '<h4><small>R_a ≈ ' + fmt(S.ra, S.ra < 0.1 ? 3 : 2) + ' µm · méretpontosság ' + p.t + '</small>' + p.n + '</h4>' + U.kv([['Jellemző eljárás', p.e], ['Feltételek', '', p.f]]).replace(/<b><\/b><small>/g, '<small style="margin:0;font-size:14px;color:var(--ink-2)">');
      };
      P.drag(function (x) { S.ra = U.clamp(sx.inv(x), 0.004, 5); st.set(S); P.draw(P.w, P.h); });
      P.render();
    },
  });

  AVIX.def('retegek', {
    title: 'Rapid Prototyping: rétegvastagság és lépcsőhatás',
    sub: 'CAD → STL → szeletelés → rétegről rétegre építés · vékonyabb réteg = pontosabb, de lassabb',
    mount: function (el) {
      var st = U.store('retegek', { t: 1.5 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Az RP a modellt vízszintes szeletekre bontja, és rétegről rétegre építi fel. Ferde és ívelt felületen ezért <b>lépcső</b> marad. Állítsd a rétegvastagságot egy 40 mm átmérőjű félgömbön: a lépcső a sík tetején és a függőleges oldalon nem látszik, a lapos lejtőn a legnagyobb.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.4; }, minH: 200, maxH: 300, label: 'Rétegek' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Rétegvastagság', min: 0.05, max: 4, step: 0.05, value: S.t, unit: 'mm', dec: 2, onInput: function (v) { S.t = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var R = 20, k = Math.min((w - 40) / (2 * R), (h - 40) / R), cx = w / 2, yb = h - 20, t = S.t, n = Math.ceil(R / t), o = '', steps = '', dev = 0;
        for (var i = 0; i < n; i++) {
          var z0 = i * t, z1 = Math.min(R, z0 + t), r = Math.sqrt(Math.max(0, R * R - z0 * z0)); // a réteg alsó síkjának sugarát építjük (kívülről befoglaló)
          steps += '<rect x="' + (cx - r * k).toFixed(1) + '" y="' + (yb - z1 * k).toFixed(1) + '" width="' + (2 * r * k).toFixed(1) + '" height="' + ((z1 - z0) * k).toFixed(1) + '" style="fill:var(--ix-1);fill-opacity:' + (i % 2 ? '.45' : '.3') + ';stroke:var(--ink);stroke-width:.4"/>';
          dev = Math.max(dev, Math.sqrt(r * r + z1 * z1) - R); // a lépcső csúcsának távolsága a gömbfelülettől
        }
        o += steps + '<path d="M' + (cx - R * k) + ',' + yb + 'A' + (R * k) + ',' + (R * k) + ' 0 0 1 ' + (cx + R * k) + ',' + yb + '" style="fill:none;stroke:var(--ix-2);stroke-width:2;stroke-dasharray:5 3"/>';
        o += '<line x1="' + (cx - R * k - 10) + '" x2="' + (cx + R * k + 10) + '" y1="' + yb + '" y2="' + yb + '" style="stroke:var(--ink)"/><text class="tk" x="' + Math.min(cx + R * k + 6, w - 76) + '" y="' + (yb - 6) + '">tárgyasztal</text><text class="lb sm" x="' + (cx - R * k) + '" y="16" style="fill:var(--ix-2)">szaggatott: CAD-modell</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>' + n + ' réteg · rétegvastagság ' + fmt(t, 2) + ' mm</small>Legnagyobb eltérés a felülettől ≈ ' + fmt(dev, 2) + ' mm</h4>' +
          U.kv([['Építési idő (relatív)', '∝ rétegszám = ' + n, 'kétszer vékonyabb réteg ≈ kétszer hosszabb építés'], ['Lépcső a lejtőn', 'a réteg vastagságával arányos', 'a vízszintes tetőn és a függőleges oldalon nincs, a lapos lejtőn a legnagyobb'], ['STL', 'háromszögháló', 'a felületet síklapokkal közelíti — ez is eltérést okoz']]) +
          '<p class="ix-hint">Az RP additív eljárás: CAD → STL → építési helyzet és támaszok → szeletelés → rétegenkénti építés → támasz eltávolítása, utókezelés. A tételtárban: LOM (rétegkivágás), 3D Printing (porágy + kötőanyag, ≈ 0,1 mm-es réteg), kikeményítéses eljárások.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/21 — lefejtés fogasléc-profillal: evolvens fog, alámetszés          */
  /* ================================================================== */
  AVIX.def('evolvens', {
    title: 'Lefejtés: a fogasléc burkolja az evolvens fogat',
    sub: 'MAAG-kés / csigamaró elve · osztó-, alap-, fej- és lábkör · alámetszés és profileltolás (α = 20°)',
    mount: function (el) {
      var st = U.store('evolvens', { z: 20, x: 0, m: 4, ph: 0.3, env: 1 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A lefejtő eljárásoknál a szerszám egyenes oldalú <b>fogasléc-profil</b> (MAAG-fésűskés, a csigamaró metszete), amely a munkadarab osztókörén csúszás nélkül gördül le: a szerszám egymás utáni helyzetei <b>burkolják</b> az evolvens fogat. Csökkentsd a fogszámot 17 alá: a szerszám feje belevág a fogtőbe (<b>alámetszés</b>) — ezt pozitív profileltolás szünteti meg.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['1', 'Burkolás mutatása'], ['0', 'Csak a fog']], String(S.env), function (v) { S.env = +v; st.set(S); P.render(); }, 'Nézet');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.85 : 0.5; }, minH: 260, maxH: 400, label: 'Lefejtés fogaslécprofillal' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Fogszám z', min: 6, max: 60, step: 1, value: S.z, dec: 0, onInput: set('z') });
      U.slider(g, { label: 'Profileltolás x', min: -0.5, max: 1, step: 0.05, value: S.x, dec: 2, onInput: set('x') });
      U.slider(g, { label: 'Gördítés', min: -1, max: 1, step: 0.01, value: S.ph, dec: 2, onInput: set('ph') });
      U.slider(g, { label: 'Modul m', min: 1, max: 10, step: 0.5, value: S.m, unit: 'mm', dec: 1, onInput: set('m') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var al = 20 * Math.PI / 180, ta = Math.tan(al), uid = 'ev' + Math.round(Math.random() * 1e6);
      P.draw = function (w, h) {
        var z = S.z, x = S.x, r = z / 2, rb = r * Math.cos(al), ra = r + 1 + x, rf = r - 1.25 + x, vref = r + x;
        var W = 3.4, k = Math.min((w - 20) / (2 * W), (h - 20) / 4.2), cx = w / 2, cy = 10 + (ra + 0.9 - r) * k;
        function X(u) { return (cx + u * k).toFixed(1); } function Y(v) { return (cy - (v - r) * k).toFixed(1); }
        function rot(p, f) { var c = Math.cos(f), s = Math.sin(f); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }
        function rack(f) {
          var s = r * f, polys = [], w0 = Math.PI / 4;
          for (var t = -3; t <= 2; t++) {
            var uc = (t + 0.5) * Math.PI;
            var pts = [[uc - (w0 + 1.6 * ta), vref + 1.6], [uc - (w0 - 1.25 * ta), vref - 1.25], [uc + (w0 - 1.25 * ta), vref - 1.25], [uc + (w0 + 1.6 * ta), vref + 1.6]];
            polys.push(pts.map(function (p) { return rot([p[0] + s, p[1]], f); }));
          }
          return polys;
        }
        function poly(pp) { return 'M' + pp.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join('L') + 'Z'; }
        var o = '<defs><clipPath id="' + uid + '"><rect x="0" y="0" width="' + w + '" height="' + h + '"/></clipPath></defs><g clip-path="url(#' + uid + ')">';
        // nyers tárcsa (fejkör)
        o += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="' + (ra * k).toFixed(1) + '" style="fill:var(--ix-2);fill-opacity:.35;stroke:var(--ink);stroke-width:1"/>';
        // a szerszám helyzetei (burkolás)
        var fmax = (W + 3) / r, env = '';
        for (var i = 0; i <= 70; i++) { var f = -fmax + 2 * fmax * i / 70; rack(f).forEach(function (pp) { env += poly(pp); }); }
        o += '<path d="' + env + '" style="fill:var(--surface);stroke:' + (S.env ? 'var(--ix-5)' : 'none') + ';stroke-width:.35;stroke-opacity:.2"/>';
        // körök
        [[r, 'osztókör', '6 4'], [rb, 'alapkör', '2 3'], [rf, 'lábkör', '1 0']].forEach(function (c) {
          o += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="' + (c[0] * k).toFixed(1) + '" style="fill:none;stroke:var(--ink);stroke-width:1;stroke-dasharray:' + c[2] + '"/>';
          o += '<text class="tk" x="' + (w - 6) + '" y="' + (Number(Y(c[0])) - 3) + '" text-anchor="end">' + c[1] + '</text>';
        });
        // az aktuális szerszámhelyzet
        var cur = rack(S.ph * 1.2 / Math.max(1, r / 6));
        o += '<path d="' + cur.map(poly).join('') + '" style="fill:var(--ix-1);fill-opacity:.12;stroke:var(--ix-1);stroke-width:1.8"/>';
        o += '</g>';
        o += '<text class="lb sm" x="8" y="' + (h - 8) + '">narancs: a szerszám (fogasléc) egy helyzete</text>';
        P.svg.innerHTML = o;
        var zmin = 2 * (1 - x) / Math.pow(Math.sin(al), 2), under = z < zmin - 1e-9, xmin = (17 - z) / 17, m = S.m;
        out.innerHTML = '<h4><small>z = ' + z + ', x = ' + fmt(x, 2) + ', α = 20° · határfogszám z_min = 2(1 − x)/sin²α ≈ ' + fmt(zmin, 1) + '</small>' + (under ? 'Alámetszés! A szerszám feje belevág a fogtőbe' : 'Nincs alámetszés') + '</h4>' +
          (under ? '<p>Megoldás: pozitív profileltolás, legalább x ≥ (17 − z)/17 ≈ ' + fmt(Math.max(0, xmin), 2) + ' — a szerszámot kijjebb kell állítani.</p>' : '') +
          U.kv([['Osztókör d = z·m', fmt(z * m, 1) + ' mm'], ['Alapkör d_b = d·cos α', fmt(z * m * Math.cos(al), 2) + ' mm', 'Dudás jelölése: r_a'], ['Fejkör d_a = d + 2m(1 + x)', fmt(z * m + 2 * m * (1 + x), 2) + ' mm', 'Dudás jelölése: r_f (x = 0-nál r + m)'], ['Lábkör d_f = d − 2m(1,25 − x)', fmt(z * m - 2 * m * (1.25 - x), 2) + ' mm'], ['Osztás p = m·π', fmt(m * Math.PI, 2) + ' mm']]) +
          '<p class="ix-hint">Ugyanaz a fogasléc-szerszám minden fogszámú, azonos modulú kerékhez jó — ezért termelékeny a lefejtés; a profilozó marónál viszont fogszám-csoportonként (8–15 darabos készlet) más szerszám kell.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/22 — null-fokos MAAG-köszörülés: az evolvens a gördülő egyenesből  */
  /* ================================================================== */
  AVIX.def('maag', {
    title: 'Null-fokos MAAG-fogköszörülés elve',
    sub: 'Alapkör-szegmens + acélszalag · a tányérkorong síkja érinti az alapkört · az érintkezési pont evolvenst ír le',
    mount: function (el) {
      var st = U.store('maag', { th: 0.6, z: 24 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A MAAG-gépen a kerék tengelyére alapkör sugarú szegmens van erősítve, erről acélszalagok tekerednek le — így a kerék csúszás nélkül gördül. A null-fokos gépen a tányérkorong köszörülő síkja <b>érinti az alapkört</b>, ezért a korong és a fog érintkezési pontja a gördülés közben pontosan <b>evolvenst</b> ír le (az evolvens: az alapkörön csúszás nélkül legördülő egyenes pontjának pályája). Görgesd a kereket!</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.85 : 0.5; }, minH: 250, maxH: 380, label: 'MAAG-köszörülés' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Legördülés', min: 0, max: 1, step: 0.01, value: Math.min(1, S.th), fmt: function (v) { return Math.round(v * 100) + '%'; }, onInput: function (v) { S.th = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Fogszám z', min: 12, max: 60, step: 1, value: S.z, dec: 0, onInput: function (v) { S.z = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var z = S.z, r = z / 2, al = 20 * Math.PI / 180, rb = r * Math.cos(al), ra = r + 1, o = '';
        var k = Math.min((w - 40) / 8.5, (h - 30) / 4.6), cx = 20 + 1.5 * k, cy = 14 + (ra + 0.4) * k;
        function X(x) { return (cx + x * k).toFixed(1); } function Y(y) { return (cy - y * k).toFixed(1); }
        // az evolvens az alapkör (0, rb) pontjából indul, jobbra
        function inv(t) { return [rb * Math.sin(t) - rb * t * Math.cos(t), rb * Math.cos(t) + rb * t * Math.sin(t)]; }
        var tmax = Math.sqrt(ra * ra / (rb * rb) - 1), pts = [];
        for (var i = 0; i <= 60; i++) pts.push(inv(tmax * i / 60));
        o += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="' + (rb * k).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.15;stroke:var(--ink);stroke-dasharray:2 3"/>';
        o += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="' + (ra * k).toFixed(1) + '" style="fill:none;stroke:var(--muted);stroke-dasharray:6 4"/>';
        o += '<text class="tk" x="' + X(-0.2) + '" y="' + (Number(Y(rb)) + 14) + '" text-anchor="end">alapkör</text><text class="tk" x="' + X(-0.2) + '" y="' + (Number(Y(ra)) - 4) + '" text-anchor="end">fejkör</text>';
        o += '<path d="M' + pts.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join('L') + '" style="fill:none;stroke:var(--ix-2);stroke-width:2.5"/>';
        var t = Math.min(1, S.th) * tmax, T = [rb * Math.sin(t), rb * Math.cos(t)], Pp = inv(t), dir = [Math.cos(t), -Math.sin(t)];
        // a legördült szalag (egyenes szakasz T-től P-ig) és a korong síkja (érintő egyenes)
        var L0 = rb * t + 1.2;
        o += '<path d="M' + X(T[0] - dir[0] * L0) + ',' + Y(T[1] - dir[1] * L0) + 'L' + X(T[0] + dir[0] * 1.2) + ',' + Y(T[1] + dir[1] * 1.2) + '" style="stroke:var(--ix-1);stroke-width:7;stroke-opacity:.35"/>';
        o += '<path d="M' + X(T[0]) + ',' + Y(T[1]) + 'L' + X(Pp[0]) + ',' + Y(Pp[1]) + '" style="stroke:var(--ix-5);stroke-width:2"/>';
        o += '<path d="M' + X(0) + ',' + Y(0) + 'L' + X(T[0]) + ',' + Y(T[1]) + '" style="stroke:var(--muted);stroke-dasharray:3 3"/>';
        o += '<circle cx="' + X(T[0]) + '" cy="' + Y(T[1]) + '" r="4" style="fill:var(--ink)"/><circle class="mk" cx="' + X(Pp[0]) + '" cy="' + Y(Pp[1]) + '" r="6"/>';
        o += '<text class="lb sm" x="' + (w - 8) + '" y="' + (h - 10) + '" text-anchor="end" style="fill:var(--ix-1)">narancs sáv: a tányérkorong síkja (érinti az alapkört)</text>';
        o += '<text class="lb sm" x="' + (Number(X(Pp[0])) + 8) + '" y="' + (Number(Y(Pp[1])) + 4) + '" style="fill:var(--acc)">érintkezési pont</text>';
        var pe = inv(tmax); o += '<text class="lb sm" x="' + (Number(X(pe[0])) + 8) + '" y="' + (Number(Y(pe[1])) + 12) + '" style="fill:var(--ix-2)">evolvens fogoldal</text>';
        P.svg.innerHTML = o;
        var arc = rb * t;
        out.innerHTML = '<h4><small>z = ' + z + ', m = 1 · alapkör r_b = r·cos 20° = ' + fmt(rb, 2) + '</small>Legördült ív = szalaghossz = ' + fmt(arc, 2) + ' (r_b·θ)</h4>' +
          '<p>A piros szakasz (a letekert szalag, T–P) mindig ugyanolyan hosszú, mint az alapkörről legördült ív — ez az evolvens definíciója. A korong síkja a gördülés alatt helyben marad, csak az érintkezési pont vándorol rajta a fogtőtől a fejig.</p>' +
          U.kv([['MAAG (null-fokos)', 'pontos, kis teljesítmény', 'tányérkorongok pontszerű érintkezéssel, szárazon; a jegyzet szerint ≈ 2–3 perc/fog'], ['NILES', '≈ 2× termelékenyebb', 'kettős-kúpos korong, körasztal + ágyszán adja a gördülést; ≈ 1 perc/fog'], ['Reishauer (csigakorong)', 'folytonos lefejtés', 'm ≤ 8 mm-ig teliből; modulonként külön korong']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/23 — kúpkerékpár: osztókúpok, áttétel, síkkerék                     */
  /* ================================================================== */
  AVIX.def('kupkerek', {
    title: 'Kúpkerékpár geometriája',
    sub: 'Σ = δ₁ + δ₂ · i = d₂/d₁ = sin δ₂/sin δ₁ · kúptávolság · közös síkkerék',
    mount: function (el) {
      var st = U.store('kupkerek', { z1: 18, z2: 36, m: 4, S: 90 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A két kúpkerék osztókúpja egy közös csúcsban találkozik, és egymáson csúszás nélkül gördül. Állítsd a fogszámokat és a tengelyszöget: a vázlat az osztókúpokat, a számoló a félkúpszögeket, a kúptávolságot és a <b>közös síkkerék</b> fogszámát adja (a síkkerék osztókúpja 90°-os — ezen gördül le mindkét kerék).</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.72 : 0.5; }, minH: 230, maxH: 380, label: 'Osztókúpok' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Fogszám z₁', min: 8, max: 60, step: 1, value: S.z1, dec: 0, onInput: set('z1') });
      U.slider(g, { label: 'Fogszám z₂', min: 8, max: 90, step: 1, value: S.z2, dec: 0, onInput: set('z2') });
      U.slider(g, { label: 'Tengelyszög Σ', min: 45, max: 135, step: 5, value: S.S, unit: '°', dec: 0, onInput: set('S') });
      U.slider(g, { label: 'Modul m', min: 1, max: 10, step: 0.5, value: S.m, unit: 'mm', dec: 1, onInput: set('m') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var i = S.z2 / S.z1, Sg = S.S * Math.PI / 180, d1a = Math.atan2(Math.sin(Sg), i + Math.cos(Sg)), d2a = Sg - d1a;
        var d1 = S.m * S.z1, d2 = S.m * S.z2, Re = d1 / (2 * Math.sin(d1a)), o = '';
        // befoglaló téglalap a modell koordinátáiban (O = origó), ebből méretarány és eltolás
        var bx = [0], by = [0];
        [[0, d1a], [Sg, d2a]].forEach(function (c) { [c[0] + c[1], c[0] - c[1]].forEach(function (a) { bx.push(Re * Math.cos(a)); by.push(Re * Math.sin(a)); }); });
        var x0m = Math.min.apply(null, bx), x1m = Math.max.apply(null, bx), y0m = Math.min.apply(null, by), y1m = Math.max.apply(null, by);
        var k = Math.min((w - 60) / (x1m - x0m), (h - 40) / (y1m - y0m)), ox = 30 - x0m * k + ((w - 60) - (x1m - x0m) * k) / 2, oy = 20 + y1m * k;
        // 1. kerék tengelye vízszintes, a 2. kerék tengelye Σ szöggel elforgatva (a csúcs O)
        function pt(a, L) { return [ox + L * k * Math.cos(a), oy - L * k * Math.sin(a)]; }
        var a1 = 0, a2 = Sg, gen = d1a; // közös alkotó: a1 + δ1 irányban
        var G = pt(gen, Re), A1 = pt(a1, Re * Math.cos(d1a)), A2 = pt(a2, Re * Math.cos(d2a));
        function cone(ax, dl, col) {
          var P1 = pt(ax + dl, Re), P2 = pt(ax - dl, Re), C = pt(ax, Re * Math.cos(dl));
          return '<path d="M' + ox + ',' + oy + 'L' + P1[0].toFixed(1) + ',' + P1[1].toFixed(1) + 'L' + P2[0].toFixed(1) + ',' + P2[1].toFixed(1) + 'Z" style="fill:var(' + col + ');fill-opacity:.22;stroke:var(' + col + ');stroke-width:1.6"/>' +
            '<path d="M' + ox + ',' + oy + 'L' + C[0].toFixed(1) + ',' + C[1].toFixed(1) + '" style="stroke:var(--muted);stroke-dasharray:8 3 2 3"/>';
        }
        o += cone(a1, d1a, '--ix-2') + cone(a2, d2a, '--ix-1');
        // síkkerék: az alkotóra merőleges síkban, a közös alkotó körül (90°-os osztókúp) — nyomvonala
        o += '<path d="M' + ox + ',' + oy + 'L' + G[0].toFixed(1) + ',' + G[1].toFixed(1) + '" style="stroke:var(--ink);stroke-width:2.5"/>';
        o += '<circle cx="' + ox + '" cy="' + oy + '" r="4" style="fill:var(--ink)"/><text class="lb sm" x="' + (ox - 6) + '" y="' + (oy - 8) + '" text-anchor="end">O</text>';
        var L1 = pt(-d1a * 0.45, Re * 0.6), L2 = pt(Sg + d2a * 0.45, Re * 0.6); o += '<text class="lb sm" x="' + L1[0].toFixed(1) + '" y="' + Math.max(L1[1] + 4, 12).toFixed(1) + '" text-anchor="middle" style="fill:var(--ix-2)">1. kerék, δ₁ = ' + fmt(d1a * 180 / Math.PI, 1) + '°</text>';
        o += '<text class="lb sm" x="' + L2[0].toFixed(1) + '" y="' + Math.max(L2[1] + 4, 12).toFixed(1) + '" text-anchor="middle" style="fill:var(--ix-1)">2. kerék, δ₂ = ' + fmt(d2a * 180 / Math.PI, 1) + '°</text>';
        o += '<text class="lb sm" x="' + ((ox + G[0]) / 2 + 8).toFixed(1) + '" y="' + ((oy + G[1]) / 2).toFixed(1) + '">közös alkotó, R_e</text>';
        P.svg.innerHTML = o;
        var zp = S.z1 / Math.sin(d1a), zv1 = S.z1 / Math.cos(d1a), zv2 = S.z2 / Math.cos(d2a);
        out.innerHTML = '<h4><small>Σ = ' + S.S + '° · z₁ = ' + S.z1 + ', z₂ = ' + S.z2 + ' · m = ' + fmt(S.m, 1) + ' mm</small>i = z₂/z₁ = ' + fmt(i, 3) + (S.S === 90 ? ' = tg δ₂' : '') + '</h4>' +
          U.kv([['δ₁ (tg δ₁ = sin Σ/(i + cos Σ))', fmt(d1a * 180 / Math.PI, 2) + '°'], ['δ₂ = Σ − δ₁', fmt(d2a * 180 / Math.PI, 2) + '°'], ['Osztókörök d = m·z', fmt(d1, 1) + ' / ' + fmt(d2, 1) + ' mm'], ['Kúptávolság R_e = d/(2·sin δ)', fmt(Re, 2) + ' mm'], ['Közös síkkerék fogszáma z_p = z/sin δ', fmt(zp, 2), S.S === 90 ? '90°-nál √(z₁² + z₂²)' : 'nem egész szám is lehet — képzelt síkkerék'], ['Virtuális (helyettesítő) fogszám z_v = z/cos δ', fmt(zv1, 1) + ' / ' + fmt(zv2, 1), 'a hátkúpon kiterített homlokkerék (Tredgold-közelítés): alámetszés ellenőrzéséhez']]) +
          '<p class="ix-hint">A fogméret a csúcs felé arányosan csökken. A süllyesztett fogkúp állandó fejhézagot ad (állandó szerszám-lekerekítés miatt); a külső fogcsúcsokat 0,2–0,4 mm-es sugárral lekerekítik.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/24 — csigahajtás: bekezdésszám, emelkedési szög, hatásfok          */
  /* ================================================================== */
  AVIX.def('csiga', {
    title: 'Csigahajtás: bekezdések, emelkedési szög, hatásfok',
    sub: 'i = z₂/z₁ · tg γ = z₁/q · η = tg γ / tg(γ + ρ′) · önzárás γ < ρ′',
    mount: function (el) {
      var st = U.store('csiga', { z1: 1, z2: 40, q: 10, m: 4, mu: 0.06 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A csiga olyan, mint egy több bekezdésű menet: a bekezdésszám (z₁) növelésével nő az emelkedési szög és a hatásfok, de csökken az áttétel. <b>Állítsd a bekezdések számát és a súrlódást</b>: kis emelkedési szögnél a hajtás önzáró lehet (a kerék nem hajtja vissza a csigát), cserébe rossz a hatásfoka.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.95 : 0.5; }, minH: 280, maxH: 400, label: 'Csiga és hatásfok' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; st.set(S); P.render(); }; }
      U.slider(g, { label: 'Bekezdések z₁', min: 1, max: 4, step: 1, value: S.z1, dec: 0, onInput: set('z1') });
      U.slider(g, { label: 'Kerék fogszáma z₂', min: 20, max: 80, step: 1, value: S.z2, dec: 0, onInput: set('z2') });
      U.slider(g, { label: 'Átmérőhányados q', min: 6, max: 20, step: 0.5, value: S.q, dec: 1, onInput: set('q') });
      U.slider(g, { label: 'Súrlódás μ', min: 0.02, max: 0.15, step: 0.005, value: S.mu, dec: 3, onInput: set('mu') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var ga = Math.atan(S.z1 / S.q), rho = Math.atan(S.mu / Math.cos(20 * Math.PI / 180)), eta = Math.tan(ga) / Math.tan(ga + rho), o = '';
        // csiga oldalnézete: a menetek γ-val dőlnek, bekezdésenként más szín
        var top = 16, H = Math.min(90, h * 0.3), x0 = 20, x1 = w - 20, cyc = top + H / 2, p = 22, cols = ['--ix-2', '--ix-1', '--ix-3', '--ix-4'];
        o += '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + H + '" rx="6" style="fill:var(--ix-8);fill-opacity:.2;stroke:var(--ink)"/>';
        var dx = Math.tan(ga) * H * 1.6; // a menetvonal vízszintes eltolódása a hengeren át (nagyítva)
        o += '<clipPath id="csc"><rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + H + '"/></clipPath><g clip-path="url(#csc)">';
        for (var x = x0 - 3 * p * S.z1 - dx, j = 0; x < x1 + p; x += p, j++) {
          o += '<path d="M' + x.toFixed(1) + ',' + (top + H) + 'L' + (x + dx).toFixed(1) + ',' + top + '" style="stroke:var(' + cols[j % S.z1] + ');stroke-width:5;stroke-linecap:round;stroke-opacity:.85"/>';
        }
        o += '</g><text class="tk" x="' + x0 + '" y="' + (top + H + 14) + '">' + (w < 520 ? 'egy szín = egy bekezdés (a dőlés nagyítva)' : 'csiga oldalnézete — egy szín = egy bekezdés (a dőlés nagyítva)') + '</text>';
        // hatásfok–emelkedési szög görbe
        var gy0 = h - 32, gy1 = top + H + 34, gx0 = 44, gx1 = w - 16, sx = U.scale(0, 45, gx0, gx1), sy = U.scale(0, 1, gy0, gy1), pts = [];
        for (var d = 0.2; d <= 45; d += 0.5) { var gg = d * Math.PI / 180; pts.push([d, Math.max(0, Math.tan(gg) / Math.tan(gg + rho))]); }
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: sx, sy: sy, yt: [0, 0.5, 1], xt: [0, 10, 20, 30, 40], xl: 'emelkedési szög γ, °', yl: 'η' });
        o += '<rect x="' + gx0 + '" y="' + gy1 + '" width="' + (sx(rho * 180 / Math.PI) - gx0).toFixed(1) + '" height="' + (gy0 - gy1) + '" style="fill:var(--ix-5);fill-opacity:.12"/><text class="lb sm" x="' + (gx0 + 4) + '" y="' + (gy1 + 14) + '" style="fill:var(--ix-5)">önzáró</text>';
        o += '<path class="ln bd acc" d="' + U.path(pts, sx, sy) + '"/>';
        var gd = ga * 180 / Math.PI;
        o += '<circle class="mk" cx="' + sx(gd) + '" cy="' + sy(eta) + '" r="6"/>';
        P.svg.innerHTML = o;
        var d1 = S.q * S.m, d2 = S.z2 * S.m, self = ga < rho;
        out.innerHTML = '<h4><small>z₁ = ' + S.z1 + ', z₂ = ' + S.z2 + ', q = ' + fmt(S.q, 1) + ', m = ' + fmt(S.m, 1) + ' mm · ρ′ = arctg(μ/cos α_n) ≈ ' + fmt(rho * 180 / Math.PI, 2) + '°</small>i = ' + fmt(S.z2 / S.z1, 1) + ' · γ = ' + fmt(gd, 2) + '° · η ≈ ' + Math.round(eta * 100) + '%</h4>' +
          '<p>' + (self ? 'γ < ρ′: <b>önzáró</b> — a kerék a csigát nem tudja visszahajtani (emelőknél előnyös), de a hatásfok 50% alatti.' : 'γ > ρ′: nem önzáró — a hajtás visszafelé is működhet.') + (gd > 6 ? ' A jegyzet szerint ZA (archimédeszi) csigát csak γ₀ ≤ 6°-ig célszerű alkalmazni.' : '') + '</p>' +
          U.kv([['Csiga osztóátmérő d₁ = q·m', fmt(d1, 1) + ' mm'], ['Csigakerék osztóátmérő d₂ = z₂·m', fmt(d2, 1) + ' mm'], ['Tengelytáv a = (d₁ + d₂)/2', fmt((d1 + d2) / 2, 1) + ' mm'], ['Menetemelkedés p_z = z₁·π·m', fmt(S.z1 * Math.PI * S.m, 2) + ' mm'], ['Hatásfok η = tg γ / tg(γ + ρ′)', Math.round(eta * 100) + '%', 'a csiga hajt; a nagy csúszás miatt hő keletkezik — bronz kerék, edzett acél csiga, jó kenés']]) +
          '<p class="ix-hint">A csigakereket a működő csiga másával, csigamaróval lefejtve készítik — ezért illeszkedik pontosan a kapcsolódó fogfelület.</p>';
      };
      P.render();
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
