/*
 * Gépész záróvizsga tételtár — interaktív ábrák a hegesztési tételekhez (A/04, A/06–A/09)
 * Értékek: a tételtár kidolgozásai és a tanszéki Gyártástechnológia I. (hegesztés) jegyzet (Szigeti F.).
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, esc = U.esc, fmt = U.fmt;

  /* ================================================================== */
  /* Karbonegyenérték (IIW, CET) és előmelegítés                         */
  /* ================================================================== */
  var CEP = {
    S235JR: { C: 0.17, Mn: 0.9, Cr: 0, Mo: 0, V: 0, Ni: 0, Cu: 0.2 },
    S355J2: { C: 0.2, Mn: 1.5, Cr: 0, Mo: 0, V: 0, Ni: 0, Cu: 0.2 },
    S460NL: { C: 0.18, Mn: 1.6, Cr: 0.2, Mo: 0.08, V: 0.15, Ni: 0.6, Cu: 0.2 },
    '16MnCr5': { C: 0.16, Mn: 1.15, Cr: 0.95, Mo: 0, V: 0, Ni: 0, Cu: 0 },
    C45: { C: 0.45, Mn: 0.65, Cr: 0.2, Mo: 0, V: 0, Ni: 0, Cu: 0 },
    '42CrMo4': { C: 0.42, Mn: 0.75, Cr: 1.05, Mo: 0.22, V: 0, Ni: 0, Cu: 0 },
  };
  var CEL = [['C', 0, 0.6, 0.01], ['Mn', 0, 2, 0.05], ['Cr', 0, 2, 0.05], ['Mo', 0, 1, 0.01], ['V', 0, 0.3, 0.01], ['Ni', 0, 3, 0.05], ['Cu', 0, 1, 0.05]];
  function ceIIW(x) { return x.C + x.Mn / 6 + (x.Cr + x.Mo + x.V) / 5 + (x.Ni + x.Cu) / 15; }
  function ceCET(x) { return x.C + (x.Mn + x.Mo) / 10 + (x.Cr + x.Cu) / 20 + x.Ni / 40; }
  function preheat(ce) {
    if (ce <= 0.45) return ['≤ 100 °C', 'Feltétel nélkül hegeszthető (martenzit ≤ 30%, HV10 ≤ 300). Előmelegíteni csak akkor kell, ha a külső hőmérséklet < 5 °C, ha a lemez vastag (a jegyzet: Lv > 20 mm → 100–300 °C; ötvözetlennél s > 40 mm → 100–300 °C), és fűzőhegesztésnél (80–250 °C).'];
    if (ce <= 0.6) return ['100–250 °C', 'Edződésre hajlamos: előmelegítés és szabályozott hőbevitel kell; utána feszültségcsökkentő hőkezelés ajánlott.'];
    if (ce < 0.9) return ['250–350 °C', 'Erősen edződő (közepesen ötvözött, nemesíthető acél): előmelegítés, bázikus elektróda, utóhőkezelés (600–700 °C feszültségcsökkentés).'];
    return ['≈ 400–450 °C', 'A jegyzet szerint Ce ≈ 1%-nál 400–450 °C-os előmelegítés kell (közepesen ötvözött acél: Ce = 0,45% → 100 °C, Ce = 1% → 450 °C).'];
  }

  AVIX.def('ce', {
    title: 'Karbonegyenérték és előmelegítés',
    sub: 'IIW-képlet és CET (MSZ EN 1011-2) · a jegyzet előmelegítési táblázata',
    mount: function (el, opt) {
      var st = U.store('ce', { p: 'S355J2' });
      var X = JSON.parse(JSON.stringify(CEP[st.get().p] || CEP.S355J2));
      el.innerHTML = '<p class="ix-lead">A hidegrepedési (edződési) hajlamot a gyakorlatban az egyenértékű széntartalommal ítélik meg. Válassz acélt, vagy állítsd az összetételt — a mutató, a hegeszthetőség és a szükséges előmelegítés azonnal frissül.</p>';
      var chips = U.chips(el, Object.keys(CEP).map(function (k) { return [k, k]; }), st.get().p, function (v) { X = JSON.parse(JSON.stringify(CEP[v])); st.set({ p: v }); sls.forEach(function (s, i) { s.set(X[CEL[i][0]], true); }); upd(); }, 'Acél');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.3 : 0.16; }, minH: 90, maxH: 130, label: 'CE skála' });
      var g = U.sliders(el), sls = CEL.map(function (c) {
        return U.slider(g, { label: c[0], min: c[1], max: c[2], step: c[3], value: X[c[0]], unit: '%', dec: 2, onInput: function (v) { X[c[0]] = v; chips.set(''); upd(); } });
      });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function () { upd(); };
      function upd() {
        var w = P.w, h = P.h; if (!w) return;
        var ce = ceIIW(X), cet = ceCET(X), sx = U.scale(0, 1.1, 16, w - 16), y = h / 2 - 8, o = '';
        [[0, 0.45, '--ix-3', 'jól hegeszthető'], [0.45, 0.6, '--ix-1', 'előmelegítés 100–250 °C'], [0.6, 1.1, '--ix-5', '250–450 °C']].forEach(function (z) {
          o += '<rect x="' + sx(z[0]) + '" y="' + y + '" width="' + (sx(z[1]) - sx(z[0])) + '" height="16" style="fill:var(' + z[2] + ');fill-opacity:.35"/>';
          o += '<text class="sm" x="' + ((sx(z[0]) + sx(z[1])) / 2) + '" y="' + (y - 6) + '" text-anchor="middle" style="fill:var(--muted)">' + z[3] + '</text>';
        });
        [0, 0.2, 0.45, 0.6, 0.8, 1].forEach(function (t) { o += '<text class="tk" x="' + sx(t) + '" y="' + (y + 32) + '" text-anchor="middle">' + fmt(t, 2) + '</text>'; });
        var cx = sx(Math.min(1.1, ce));
        o += '<path d="M' + cx + ',' + (y - 2) + 'l-7,-9h14z" style="fill:var(--ink)"/><line x1="' + cx + '" x2="' + cx + '" y1="' + (y - 2) + '" y2="' + (y + 18) + '" style="stroke:var(--ink);stroke-width:2.5"/>';
        P.svg.innerHTML = o;
        var ph = preheat(ce), warn = [];
        if (X.C < 0.05 || X.C > 0.25) warn.push('C = 0,05–0,25%');
        if (X.Mn > 1.7) warn.push('Mn ≤ 1,7%'); if (X.Cr > 0.9) warn.push('Cr ≤ 0,9%'); if (X.Mo > 0.75) warn.push('Mo ≤ 0,75%'); if (X.Ni > 2.5) warn.push('Ni ≤ 2,5%'); if (X.V > 0.2) warn.push('V ≤ 0,2%');
        out.innerHTML = '<h4><small>CE (IIW) = C + Mn/6 + (Cr + Mo + V)/5 + (Ni + Cu)/15</small>CE = ' + fmt(ce, 2) + '% · előmelegítés: ' + ph[0] + '</h4><p>' + ph[1] + '</p>' +
          U.kv([['CET = C + (Mn + Mo)/10 + (Cr + Cu)/20 + Ni/40', fmt(cet, 2) + '%', 'MSZ EN 1011-2 szerint; érvényes 0,2–0,5% között'], ['Feltétel nélkül hegeszthető', 'CE ≤ 0,45%', 'ez ≤ 30% martenzitnek, ill. HV10 ≤ 300-nak felel meg'], ['Feszültségcsökkentő hőkezelés', '530–580 °C, 30 perc', 'lassú lehűtés 5–7 °C/perc (közepesen ötvözöttnél 600–700 °C)']]) +
          (warn.length ? '<p class="ix-note">Az IIW-képlet érvényességi tartományán kívül (' + warn.join(', ') + ') — itt csak tájékoztató.</p>' : '<p class="ix-note">Az IIW-képlet ötvözetlen, finomszemcsés és gyengén ötvözött acélokra érvényes (CE = 0,3–0,7% között).</p>');
      }
      P.render();
    },
  });

  /* ================================================================== */
  /* A/06 — hőhatásövezet: csúcshőmérséklet és zónák (C ≈ 0,16%)        */
  /* ================================================================== */
  var TLIQ = 1522, TSOL = 1506, A3C = 873, A1C = 723;
  var HZ = [
    { n: '1. Szilárd-folyékony átmenet', r: 'T<sub>likv</sub>–T<sub>szol</sub>', hi: TLIQ, lo: TSOL, c: '--ix-5', d: 'Igen keskeny sáv, itt a legnagyobb a hűlési sebesség. Edződésre hajlamos acélnál, hidrogén jelenlétében a varrattal párhuzamos repedések várható helye.' },
    { n: '2. Szemcsedurvulási zóna', r: 'T<sub>szol</sub>–1100 °C', hi: TSOL, lo: 1100, c: '--ix-1', d: 'Nagyméretű ausztenitszemcsékből átalakult bomlástermék: a szilárdság csökken, felkeményedés és szívósságcsökkenés lehetséges — a HHÖ legkedvezőtlenebb része.' },
    { n: '3. Normalizálódási zóna', r: '1100 °C–A3', hi: 1100, lo: A3C, c: '--ix-3', d: 'A normalizáló hőkezelésre hasonlít (a hűlés gyorsabb a léghűtésnél): finom szemcse, a szilárdság és az ütőmunka nő — a legkedvezőbb zóna.' },
    { n: '4. Részleges átkristályosodási zóna', r: 'A3–A1', hi: A3C, lo: A1C, c: '--ix-6', d: 'Az α → γ → α átalakulás nem teljes: változó szemcseméret, eredeti és új szövetű szemcsék; átlagos vagy kissé rosszabb mechanikai jellemzők.' },
    { n: '5. Újrakristályosodási és kilágyulási zóna', r: 'A1–450 °C', hi: A1C, lo: 450, c: '--ix-2', d: 'Csak akkor változik, ha a kiindulási állapot erre okot ad: hidegen alakított alapanyagnál megújulás és rekrisztallizáció, hőkezeléssel felkeményített acélnál a martenzit kilágyulása.' },
    { n: '6. Kéktörési (szegregációs) zóna', r: '450–100 °C', hi: 450, lo: 100, c: '--ix-4', d: 'A kis atomsugarú elemek (B, N, C) diffúziós szegregációja: a szilárdság nő, az alakváltozó képesség és a szívósság csökken, repedésveszély — főleg régi, sok N-t tartalmazó acéloknál.' },
  ];
  AVIX.def('haz', {
    title: 'Hőhatásövezet (HHÖ) — zónák és vonalenergia',
    sub: 'Csúcshőmérséklet a varrattól mért távolság függvényében, C ≈ 0,16%-os lágyacélra',
    mount: function (el) {
      var st = U.store('haz', { le: 3, y: 1 });
      var S = st.get();
      el.innerHTML = '<p class="ix-lead">A varrattól távolodva a csúcshőmérséklet csökken, ezért a HHÖ zónákra bomlik (a jegyzet hőmérséklethatárai szerint). <b>Húzd a jelölőt</b> a távolság mentén, és <b>állítsd a vonalenergiát</b>: nagyobb hőbevitelnél szélesebb a HHÖ és lassabb a hűlés. A hőmérsékletprofil szemléltető.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1.0 : 0.6; }, minH: 300, maxH: 480, label: 'HHÖ zónák és csúcshőmérséklet' });
      var g = U.sliders(el);
      var sE = U.slider(g, { label: 'Vonalenergia', min: 2.5, max: 4.3, step: 0.01, value: S.le, fmt: function (v) { return Math.round(Math.pow(10, v) / 10) * 10 + ' J/mm'; }, onInput: function (v) { S.le = v; st.set(S); P.render(); card(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function lam() { return 1.6 * Math.pow(Math.pow(10, S.le) / 1000, 0.7); }
      function tp(y) { return 20 + (TLIQ - 20) * Math.exp(-y / lam()); }
      function yAt(T) { return lam() * Math.log((TLIQ - 20) / (T - 20)); }
      var sx, sy, top, M = { l: 50, r: 14, b: 36 };
      P.draw = function (w, h) {
        top = Math.round(h * 0.3);
        var yMax = yAt(100) * 1.12;
        sx = U.scale(0, yMax, M.l, w - M.r);
        sy = U.scale(0, 1600, h - M.b, top + 26);
        if (S.y > yMax) S.y = yMax * 0.3;
        var o = '';
        // lemez-metszet a zónákkal
        var yb = top - 6, ht = top - 18;
        o += '<rect x="' + M.l + '" y="12" width="' + (w - M.l - M.r) + '" height="' + ht + '" style="fill:var(--ix-8);fill-opacity:.18"/>';
        HZ.forEach(function (z) { var x0 = sx(yAt(z.hi)), x1 = sx(yAt(z.lo)); o += '<rect x="' + x0.toFixed(1) + '" y="12" width="' + Math.max(1.5, x1 - x0).toFixed(1) + '" height="' + ht + '" style="fill:var(' + z.c + ');fill-opacity:.55"/>'; });
        o += '<path d="M' + (M.l - 30) + ',12 Q' + (M.l + 4) + ',12 ' + (M.l + 2) + ',' + (12 + ht * 0.5) + ' Q' + (M.l) + ',' + (12 + ht) + ' ' + (M.l - 30) + ',' + (12 + ht) + 'Z" style="fill:var(--ix-8);fill-opacity:.7;stroke:var(--ink);stroke-width:1"/>';
        o += '<text class="lb sm" x="' + (M.l - 16) + '" y="' + (12 + ht / 2 + 4) + '" text-anchor="middle">varrat</text>';
        o += '<text class="tk" x="' + (w - M.r - 4) + '" y="' + (yb - 4) + '" text-anchor="end">alapanyag</text>';
        // hőmérsékletprofil
        o += U.axes({ x0: M.l, x1: w - M.r, y0: top + 26, y1: h - M.b, sx: sx, sy: sy, yt: [0, 400, 800, 1200, 1600], xt: [], xl: 'távolság a varrat szélétől, mm', yl: 'T, °C' });
        var step = yMax / 8, tick = step < 1 ? 0.5 : step < 2 ? 1 : step < 5 ? 2 : step < 10 ? 5 : 10;
        for (var t = 0; t <= yMax; t += tick) o += '<text class="tk" x="' + sx(t).toFixed(1) + '" y="' + (h - M.b + 15) + '" text-anchor="middle">' + fmt(t, tick < 1 ? 1 : 0) + '</text>';
        HZ.forEach(function (z) { o += '<rect x="' + M.l + '" y="' + sy(z.hi).toFixed(1) + '" width="' + (w - M.l - M.r) + '" height="' + (sy(z.lo) - sy(z.hi)).toFixed(1) + '" style="fill:var(' + z.c + ');fill-opacity:.1"/>'; });
        [[1100, '1100'], [A3C, 'A3'], [A1C, 'A1'], [450, '450'], [100, '100']].forEach(function (a) { o += '<text class="tk" x="' + (w - M.r - 4) + '" y="' + (sy(a[0]) - 3) + '" text-anchor="end">' + a[1] + '</text>'; });
        var pts = []; for (var i = 0; i <= 160; i++) { var yy = yMax * i / 160; pts.push([yy, tp(yy)]); }
        o += '<path class="ln bd" d="' + U.path(pts, sx, sy) + '"/>';
        var cx = sx(S.y), cy = sy(tp(S.y));
        o += '<line x1="' + cx + '" x2="' + cx + '" y1="12" y2="' + (h - M.b) + '" style="stroke:var(--acc);stroke-width:1.3;stroke-dasharray:4 3"/><circle class="mk" cx="' + cx + '" cy="' + cy + '" r="7"/>';
        P.svg.innerHTML = o;
      };
      P.drag(function (x) { S.y = Math.max(0, sx.inv(x)); st.set(S); P.draw(P.w, P.h); card(); });
      function card() {
        var T = tp(S.y), z = null;
        HZ.forEach(function (q) { if (T <= q.hi && T > q.lo) z = q; });
        var width = yAt(100);
        out.innerHTML = z
          ? '<h4><small>' + fmt(S.y, 2) + ' mm · csúcshőmérséklet ≈ ' + Math.round(T) + ' °C · ' + z.r + '</small>' + z.n + '</h4><p>' + z.d + '</p>'
          : '<h4><small>' + fmt(S.y, 1) + ' mm · ≈ ' + Math.round(T) + ' °C</small>' + (T > TLIQ - 1 ? 'Varrat (megolvadt)' : 'Alapanyag — a hőhatás már nem változtat rajta') + '</h4>';
        out.innerHTML += U.kv([['A HHÖ becsült szélessége', fmt(width, 1) + ' mm', 'a jegyzet: néhány mm-től 30–50 mm-ig (nagy vonalenergiájú eljárásoknál)'], ['Vonalenergia', Math.round(Math.pow(10, S.le) / 10) * 10 + ' J/mm', 'E = Φ / v_h; kézi: 500–2000, gépesített: akár 5000 J/mm']]) +
          '<p class="ix-hint">Nagyobb vonalenergia → lassabb hűlés, szélesebb HHÖ, szemcsedurvulás, nagyobb alakváltozás; kisebb → gyors hűlés, edződő acélnál felkeményedés és hidegrepedés.</p>';
      }
      P.render(); card();
    },
  });

  /* ================================================================== */
  /* A/06 — hőforrások: hőáramsűrűség – hőfoltátmérő (jegyzet ábrája)    */
  /* ================================================================== */
  var HF = {
    bki: { n: 'BKI (kézi ív)', eta: 0.75, U: null, I: 150, dh: 3, v: 3 },
    vfi: { n: 'VFI (MAG)', eta: 0.85, U: 26, I: 220, dh: 1.8, v: 6 },
    swi: { n: 'SWI (AWI)', eta: 0.6, U: 12, I: 120, dh: 2.5, v: 2 },
    plazma: { n: 'Plazmaív', eta: 0.6, U: 30, I: 150, dh: 0.5, v: 5 },
    lezer: { n: 'Lézersugár', P: 4000, eta: 0.7, dh: 0.02, v: 30 },
    esugar: { n: 'Elektronsugár', P: 6000, eta: 0.9, dh: 0.1, v: 20 },
  };
  var BLOBS = [['Láng', 3.5, 1.2e2, 1.1, 0.5, '--ix-1'], ['Villamos ív', 1.2, 1.2e3, 0.9, 0.45, '--ix-2'], ['Plazmaív', 0.15, 1.5e3, 0.7, 0.4, '--ix-6'], ['Elektronsugár', 0.08, 5e4, 2.2, 0.35, '--ix-4'], ['Lézersugár', 0.005, 2e6, 0.8, 0.4, '--ix-5']];
  AVIX.def('hofor', {
    title: 'Hőforrások: hőáram, hőáramsűrűség, vonalenergia',
    sub: 'A jegyzet lg q₀ – lg d_h diagramja · számoló a foltszerű hőforrás jellemzőire',
    mount: function (el) {
      var st = U.store('hofor', { k: 'bki' });
      var S = st.get(); if (!HF[S.k]) S.k = 'bki';
      var V = {};
      function load(k) { var p = HF[k]; V = { eta: p.eta, U: p.U, I: p.I || 0, P: p.P || 0, dh: p.dh, v: p.v, beam: !!p.P }; }
      load(S.k);
      el.innerHTML = '<p class="ix-lead">A hegesztő eljárások helye a hőáramsűrűség–hőfoltátmérő síkon (a jegyzet ábrája alapján, vázlatosan). Válassz eljárást vagy állítsd a paramétereket: a pont a számított <b>q = 4Φ / (d<sub>h</sub>²π)</b> értéket mutatja.</p>';
      U.chips(el, Object.keys(HF).map(function (k) { return [k, HF[k].n]; }), S.k, function (v) { S.k = v; st.set(S); load(v); build(); }, 'Eljárás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.9 : 0.55; }, minH: 280, maxH: 440, label: 'lg q – lg d_h diagram' });
      var g = U.h('div'); el.appendChild(g);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function phi() { return V.beam ? V.eta * V.P : V.eta * (V.U == null ? 20 + 0.04 * V.I : V.U) * V.I; }
      function build() {
        g.innerHTML = ''; var s = U.sliders(g);
        if (V.beam) U.slider(s, { label: 'Sugárteljesítmény', min: 500, max: 20000, step: 100, value: V.P, unit: 'W', dec: 0, onInput: function (v) { V.P = v; upd(); } });
        else U.slider(s, { label: 'Áram I', min: 20, max: 500, step: 5, value: V.I, unit: 'A', dec: 0, onInput: function (v) { V.I = v; upd(); } });
        U.slider(s, { label: 'Hőfolt d_h', min: -2.7, max: 1, step: 0.01, value: Math.log10(V.dh), fmt: function (v) { var d = Math.pow(10, v); return fmt(d, d < 0.1 ? 3 : d < 1 ? 2 : 1) + ' mm'; }, onInput: function (v) { V.dh = Math.pow(10, v); upd(); } });
        U.slider(s, { label: 'Sebesség v_h', min: 0.5, max: 100, step: 0.5, value: V.v, unit: 'mm/s', dec: 1, onInput: function (v) { V.v = v; upd(); } });
        upd();
      }
      P.draw = function () { upd(); };
      function upd() {
        var w = P.w, h = P.h; if (!w) return;
        var M = { l: 54, r: 14, t: 14, b: 38 };
        var sx = U.scale(1e-3, 10, M.l, w - M.r, true), sy = U.scale(1, 1e8, h - M.b, M.t, true), o = '';
        var sup = function (e) { return '10' + String(e).replace('-', '⁻').replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }); };
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, xt: [1e-3, 1e-2, 1e-1, 1, 10], yt: [1, 1e2, 1e4, 1e6, 1e8], xgrid: true, xl: 'hőfoltátmérő d_h, mm (log)', yl: 'q₀, W/mm²', xf: function (t) { return sup(Math.round(Math.log10(t))); }, yf: function (t) { return sup(Math.round(Math.log10(t))); } });
        [[1e7, 'túl nagy: elgőzölgés, vágás'], [1e4, '10 kW/mm²: nagy ↑ / normál ↓'], [10, 'túl kicsi: a hő szétterjed']].forEach(function (L) { o += '<line x1="' + M.l + '" x2="' + (w - M.r) + '" y1="' + sy(L[0]) + '" y2="' + sy(L[0]) + '" style="stroke:var(--acc);stroke-width:1.2;stroke-dasharray:5 4"/><text class="la sm" x="' + (w - M.r - 4) + '" y="' + (sy(L[0]) - 5) + '" text-anchor="end">' + L[1] + '</text>'; });
        BLOBS.forEach(function (b) {
          var cx = sx(b[1]), cy = sy(b[2]), rx = b[3] * (sx(10) - sx(1)) / 2, ry = b[4] * (sy(1) - sy(10)) / 2;
          var ang = b[0] === 'Elektronsugár' ? 37 : 0;
          o += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + ang + ' ' + cx + ' ' + cy + ')" style="fill:var(' + b[5] + ');fill-opacity:.18;stroke:var(' + b[5] + ');stroke-width:1.3"/>';
          o += '<text class="lb sm" x="' + cx + '" y="' + (cy - ry - 4) + '" text-anchor="middle">' + b[0] + '</text>';
        });
        var F = phi(), q = 4 * F / (V.dh * V.dh * Math.PI), E = F / V.v;
        var px = sx(U.clamp(V.dh, 1e-3, 10)), py = sy(U.clamp(q, 1, 1e8));
        o += '<circle class="mk" cx="' + px + '" cy="' + py + '" r="8"/>';
        P.svg.innerHTML = o;
        var cls = q < 10 ? 'túl kicsi — nem hegeszthető' : q < 1e4 ? 'normál hőáramsűrűségű (olvasztás + hővezetés)' : q < 1e7 ? 'nagy hőáramsűrűségű (olvasztás + elgőzölögtetés)' : 'túl nagy — elgőzölgés, vágás';
        out.innerHTML = '<h4><small>' + HF[S.k].n + (V.beam ? '' : ' · U = ' + fmt(V.U == null ? 20 + 0.04 * V.I : V.U, 1) + ' V' + (V.U == null ? ' (U = 20 + 0,04·I)' : '')) + '</small>q ≈ ' + (q >= 1e4 ? fmt(q / 1000, 0) + ' kW/mm²' : fmt(q, 0) + ' W/mm²') + ' — ' + cls + '</h4>' +
          U.kv([['Hőáram Φ = η·U·I·cos φ', fmt(F / 1000, 2) + ' kW', V.beam ? 'sugárnál Φ = η·P' : 'egyenáramnál cos φ = 1; η = ' + fmt(V.eta, 2)], ['Hőáramsűrűség q = 4Φ/(d_h²π)', q >= 1e4 ? fmt(q / 1000, 1) + ' kW/mm²' : fmt(q, 0) + ' W/mm²'], ['Vonalenergia E = Φ/v_h', fmt(E, 0) + ' J/mm', V.v > 50 ? 'gyors hőforrás (v_h > 50 mm/s)' : 'normál sebességű hőforrás (v_h < 50 mm/s)']]);
      }
      P.render(); build();
    },
  });

  /* ================================================================== */
  /* A/07–A/08 — ív és áramforrás munkapontja, belső szabályozás         */
  /* ================================================================== */
  var MP = {
    eso: { n: 'BKI / SWI — eső (áramtartó) jelleggörbe', arc: function (I, l) { return 12 + 2 * l + 0.04 * I + 300 / (I + 10); } },
    lapos: { n: 'VFI — lapos (feszültségtartó) jelleggörbe', arc: function (I, l) { return 13 + 1.6 * l + 0.05 * I; } },
  };
  AVIX.def('munkapont', {
    title: 'Ív és áramforrás: a munkapont',
    sub: 'Ívkarakterisztika × gépkarakterisztika · ívhosszváltozás · belső szabályozás',
    mount: function (el, opt) {
      var st = U.store('munkapont', { m: opt.mode || 'eso' });
      var m0 = opt.mode || st.get().m; var S = { m: m0, l: m0 === 'lapos' ? 4 : 3, lref: m0 === 'lapos' ? 4 : 3, set: 150, steep: 1.2, Ug: 32, anim: 0 };
      el.innerHTML = '<p class="ix-lead">A munkapont (M) az ív statikus jelleggörbéjének és az áramforrás gépkarakterisztikájának metszéspontja. Az ívhossz változásakor az ívgörbe feljebb vagy lejjebb tolódik — <b>figyeld, mennyit változik az áram</b>. Kézi vezetésnél (BKI, SWI) meredeken eső, VFI-nél lapos jelleggörbe kell.</p>';
      var seg = U.seg(el, [['eso', 'BKI / SWI (eső)'], ['lapos', 'VFI (lapos)']], S.m, function (v) { S.m = v; st.set({ m: v }); S.l = S.lref = v === 'eso' ? 3 : 4; build(); }, 'Eljárás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.85 : 0.52; }, minH: 260, maxH: 420, label: 'U–I diagram' });
      var ctl = U.h('div'); el.appendChild(ctl);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function mach(I) { return S.m === 'eso' ? 26 - S.steep * (I - S.set) : S.Ug - 0.02 * I; }
      function solve(l) {
        var a = 15, b = 600, f = function (I) { return MP[S.m].arc(I, l) - mach(I); };
        if (f(a) * f(b) > 0) return null;
        for (var i = 0; i < 60; i++) { var c = (a + b) / 2; if (f(a) * f(c) <= 0) b = c; else a = c; }
        return (a + b) / 2;
      }
      function build() {
        ctl.innerHTML = '';
        var g = U.sliders(ctl);
        U.slider(g, { label: 'Ívhossz', min: 1, max: 8, step: 0.1, value: S.l, unit: 'mm', dec: 1, onInput: function (v) { S.l = v; stop(); upd(); } });
        if (S.m === 'eso') {
          U.slider(g, { label: 'Beállított áram', min: 60, max: 300, step: 5, value: S.set, unit: 'A', dec: 0, onInput: function (v) { S.set = v; upd(); } });
          U.slider(g, { label: 'Meredekség', min: 0.2, max: 2.5, step: 0.05, value: S.steep, fmt: function (v) { return fmt(v, 2) + ' V/A'; }, onInput: function (v) { S.steep = v; upd(); } });
        } else {
          U.slider(g, { label: 'Gépfeszültség', min: 18, max: 40, step: 0.5, value: S.Ug, unit: 'V', dec: 1, onInput: function (v) { S.Ug = v; upd(); } });
        }
        var row = U.h('div', 'ix-row'); row.style.marginTop = '8px';
        row.innerHTML = '<button type="button" class="ix-btn">▶ Ívhossz-zavar (+2 mm) és visszaállás</button>';
        row.querySelector('button').addEventListener('click', disturb);
        ctl.appendChild(row);
        upd();
      }
      function stop() { if (S.anim) cancelAnimationFrame(S.anim); S.anim = 0; }
      function disturb() {
        stop();
        S.lref = S.l; var I0 = solve(S.lref); if (!I0) return;
        S.l = S.lref + 2; var t0 = performance.now(), last = t0;
        var k = 0.0004;
        function step(now) {
          var dt = Math.min(50, now - last); last = now;
          var I = solve(S.l); if (!I) { stop(); return; }
          // huzal-/elektródaleolvadás ~ áram; előtolás állandó → dl/dt ∝ (I − I0)
          S.l = Math.max(0.5, S.l + (I - I0) * k * dt / 16 * (S.m === 'eso' ? 0.9 : 1));
          upd();
          if (now - t0 < 6000 && Math.abs(S.l - S.lref) > 0.02) S.anim = requestAnimationFrame(step); else { S.anim = 0; upd(); }
        }
        if (U.reduce) { S.l = S.lref; upd(); return; }
        S.anim = requestAnimationFrame(step);
      }
      P.draw = function () { upd(); };
      function upd() {
        var w = P.w, h = P.h; if (!w) return;
        var M = { l: 44, r: 14, t: 16, b: 38 }, sx = U.scale(0, 450, M.l, w - M.r), sy = U.scale(0, 80, h - M.b, M.t), o = '';
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, xt: [0, 100, 200, 300, 400], yt: [0, 20, 40, 60, 80], xl: 'I, A', yl: 'U, V' });
        var mp = []; for (var I = 0; I <= 450; I += 2) { var u = mach(I); if (u >= 0 && u <= 80) mp.push([I, u]); }
        o += '<path class="ln bd" d="' + U.path(mp, sx, sy) + '" style="stroke:var(--ix-2)"/>';
        var arcs = [[S.lref, 'dash', 0.6], [S.l, '', 1]];
        arcs.forEach(function (a, i) {
          if (i === 0 && Math.abs(S.l - S.lref) < 0.05) return;
          var pts = []; for (var I2 = 15; I2 <= 450; I2 += 3) pts.push([I2, MP[S.m].arc(I2, a[0])]);
          o += '<path class="ln ' + a[1] + '" d="' + U.path(pts.filter(function (p) { return p[1] <= 80; }), sx, sy) + '" style="stroke:var(--ix-5);stroke-width:2.2;opacity:' + a[2] + '"/>';
        });
        var Im = solve(S.l), Iref = solve(S.lref);
        if (Iref && Math.abs(S.l - S.lref) >= 0.05) o += '<circle cx="' + sx(Iref) + '" cy="' + sy(mach(Iref)) + '" r="5" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>';
        if (Im) {
          var x = sx(Im), y = sy(mach(Im));
          o += '<line x1="' + x + '" x2="' + x + '" y1="' + y + '" y2="' + (h - M.b) + '" style="stroke:var(--acc);stroke-dasharray:3 3"/><circle class="mk" cx="' + x + '" cy="' + y + '" r="7"/><text class="la" x="' + (x + 10) + '" y="' + (y - 8) + '">M</text>';
        }
        o += '<text class="lb sm" x="' + (w - M.r - 4) + '" y="' + (M.t + 14) + '" text-anchor="end" style="fill:var(--ix-2)">gépkarakterisztika</text><text class="lb sm" x="' + (w - M.r - 4) + '" y="' + (M.t + 30) + '" text-anchor="end" style="fill:var(--ix-5)">ívkarakterisztika (l = ' + fmt(S.l, 1) + ' mm)</text>';
        P.svg.innerHTML = o;
        var Ip = solve(S.l + 1), Imn = solve(Math.max(0.5, S.l - 1));
        var dI = Ip && Imn ? Math.abs(Imn - Ip) / 2 : null;
        out.innerHTML = '<h4><small>' + MP[S.m].n + '</small>' + (Im ? 'M: I ≈ ' + Math.round(Im) + ' A, U ≈ ' + fmt(mach(Im), 1) + ' V' : 'Nincs metszéspont — az ív kialszik') + '</h4>' +
          U.kv([['1 mm ívhossz-változásra', dI != null ? '≈ ' + Math.round(dI) + ' A áramváltozás' : '—', S.m === 'eso' ? 'eső jelleggörbénél kicsi: a leolvadás egyenletes marad, a kézi ingadozás nem zavar' : 'lapos jelleggörbénél nagy: ez teszi gyorssá a belső szabályozást']]) +
          '<p class="ix-hint">' + (S.m === 'eso'
            ? 'BKI és SWI: kis áramsűrűség (J = 10–30, ill. 5–50 A/mm²), az ívkarakterisztika vízszintes szakasza. Az áramot a hegesztő állítja be, a feszültség „adódik”. Meredeken eső gépkarakterisztika: a rövidzárlati áram közel van a munkaáramhoz (nem hevül túl a gép és az elektróda), és kis Δl-hez kis ΔI tartozik — ezért stabil az ív kézi vezetésnél is.'
            : 'VFI: nagy áramsűrűség, az ívkarakterisztika emelkedő szakasza. A huzalelőtolás állandó (v_he = áll.), a leolvadás az áramtól függ. Ha nő az ívhossz, az áram csökken, lassul a leolvadás, és az ívhossz visszaáll — ez a belső szabályozás. Stabil munkapont feltétele: az ívkarakterisztika meredeksége nagyobb legyen a gépkarakterisztikáénál.') + '</p>';
      }
      P.render(); build();
    },
  });

  /* ================================================================== */
  /* A/07 — elektródák: ISO 2560-A jel, bevonattípusok, áram             */
  /* ================================================================== */
  var E2560 = {
    s: { 35: '355 MPa (Rm 440–570, A ≥ 22%)', 38: '380 MPa (Rm 470–600, A ≥ 20%)', 42: '420 MPa (Rm 500–640, A ≥ 20%)', 46: '460 MPa (Rm 530–680, A ≥ 20%)', 50: '500 MPa (Rm 560–720, A ≥ 18%)' },
    t: { Z: 'nincs követelmény', A: '+20 °C', 0: '0 °C', 2: '−20 °C', 3: '−30 °C', 4: '−40 °C', 5: '−50 °C', 6: '−60 °C' },
    c: { '': 'Mn ≤ 2,0%', Mo: 'Mn ≤ 1,4%, Mo 0,3–0,6%', MnMo: 'Mn 1,4–2,0%, Mo 0,3–0,6%', '1Ni': 'Mn ≤ 1,4%, Ni 0,6–1,2%', '2Ni': 'Mn ≤ 1,4%, Ni 1,8–2,6%', '3Ni': 'Mn ≤ 1,4%, Ni 2,6–3,8%', Mn1Ni: 'Mn 1,4–2,0%, Ni 0,6–1,2%', '1NiMo': 'Mn ≤ 1,4%, Mo 0,3–0,6%, Ni 0,6–1,2%', Z: 'megállapodás szerinti más összetétel' },
    b: { A: 'savas', C: 'cellulóz', R: 'rutilos', RR: 'vastag rutilos', RC: 'rutil-cellulóz', RA: 'rutil-savas', RB: 'rutil-bázikus', B: 'bázikus' },
    r: { 1: 'kihozatal ≤ 105%, váltó- és egyenáram', 2: 'kihozatal ≤ 105%, egyenáram', 3: '105–125%, váltó- és egyenáram', 4: '105–125%, egyenáram', 5: '125–160%, váltó- és egyenáram', 6: '125–160%, egyenáram', 7: '> 160%, váltó- és egyenáram', 8: '> 160%, egyenáram' },
    p: { 1: 'minden hegesztési helyzet', 2: 'minden, kivéve függőlegesen felülről lefelé', 3: 'vízszintes tompa-, vályú- és vízszintes álló sarokvarrat', 4: 'vízszintes tompa- és vályú sarokvarrat', 5: 'függőlegesen lefelé + a 3. jel helyzetei' },
    h: { H5: '≤ 5 ml/100 g', H10: '≤ 10 ml/100 g', H15: '≤ 15 ml/100 g' },
  };
  var BEV = {
    A: { n: 'Savas (A)', d: 'Fe-, Mn-, Ti-, Si-oxid salakképzők; „forró” típus (hőt fejleszt, hígfolyós ömledék), finomcseppes leolvadás; a salak 200 °C-ra hűlve jól eltávolítható. Gázzárványra nem, de melegrepedésre érzékeny; szívós varrat (A ≈ 25%), sima felület. Tompa- és sarokvarrat vízszintes helyzetben; egyen- (+/−) és váltóáram.' },
    R: { n: 'Rutilos (R)', d: 'TiO₂ salakképző → U_gy < 50 V: könnyű ívgyújtás és újragyújtás, stabil, nyugodt, fröcskölésmentes ív, önleváló salak. Minden helyzetben (csak függőlegesen lefelé nem), vékony lemez, legjobb gyökhegesztő elektróda. H₂ = 15–25 ml/100 g → növelt folyáshatárú, fárasztott, −40 °C-on üzemelő szerkezethez nem. Egyenáram (−) vagy váltóáram.' },
    C: { n: 'Cellulóz (C)', d: 'A bevonat 10–30%-a szerves anyag: jó gázvédelem, kevés salak. Forró típus, közepes cseppek, mély beolvadás, gyorsan dermed — gyök- és pozícióhegesztés minden helyzetben, függőlegesen lefelé is (távvezetéki csövek). Sok H₂ (repedésveszély), kellemetlen gáz, gyengébb ívstabilitás. A ≈ 30%. Egyenáram, +.' },
    B: { n: 'Bázikus (B)', d: 'CaF₂ 45%, CaCO₃ 40%, SiO₂ 10%, FeMn 5%; „hideg” típus. Legkevesebb H₂ (≤ 5 ml/100 g, ha 300 °C-on 3 órát szárítják), a Mn MnS-ként megköti a ként → sem hideg-, sem melegrepedés; a legjobb mechanikai tulajdonságok, negatív hőmérsékleten is. Nehéz ívgyújtás (U_gy = 60–70 V), nyugtalan ív, rövid ív (≤ d/2); fordított polaritás. Az elektródák ~2/3-a ilyen; vasporos változat K = 150–200%.' },
  };
  AVIX.def('elektroda', {
    title: 'Bevont elektródák',
    sub: 'MSZ EN ISO 2560-A jel visszafejtése · bevonattípusok · áram és bekapcsolási idő',
    mount: function (el) {
      el.innerHTML = '<p class="ix-lead">Írd be vagy módosítsd az elektróda jelét (a jegyzet példája: <b>E 46 6 Mn1Ni B 4 2 H5</b>), hasonlítsd össze a bevonattípusokat, és számold ki az áramot az elektródaátmérőből.</p>' +
        '<div class="ix-row"><input type="text" value="E 46 6 Mn1Ni B 4 2 H5" aria-label="Elektródajel" spellcheck="false" style="flex:1;min-width:0;min-height:44px;padding:0 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:600 17px var(--mono)"></div>';
      var inp = el.querySelector('input'), dec = U.h('div', 'ix-out'); el.appendChild(dec);
      function parse() {
        var t = inp.value.trim().replace(/^(MSZ\s*)?EN\s*ISO\s*2560-?A\s*[-–]?\s*/i, '').split(/\s+/), i = 0, rows = [], err = '';
        if (t[i] && t[i].toUpperCase() === 'E') { rows.push(['E', 'bevont elektróda, kézi ívhegesztéshez']); i++; } else err = 'Az „E” betűvel kell kezdődnie.';
        if (!err && E2560.s[t[i]]) { rows.push([t[i], 'folyáshatár: ' + E2560.s[t[i]]]); i++; } else if (!err) err = 'Szilárdsági jel: 35, 38, 42, 46 vagy 50.';
        if (!err && E2560.t[String(t[i]).toUpperCase()] !== undefined) { rows.push([t[i], 'KV = 47 J ütőmunka ezen a hőmérsékleten: ' + E2560.t[String(t[i]).toUpperCase()]]); i++; } else if (!err) err = 'Hőmérsékleti jel: Z, A, 0, 2–6.';
        if (!err) {
          if (E2560.c[t[i]] !== undefined && t[i] !== '') { rows.push([t[i], 'ömledék-összetétel: ' + E2560.c[t[i]]]); i++; }
          else rows.push(['—', 'ömledék-összetétel: ' + E2560.c['']]);
          if (E2560.b[String(t[i]).toUpperCase()]) { rows.push([t[i], 'bevonat: ' + E2560.b[String(t[i]).toUpperCase()]]); i++; } else err = 'Bevonattípus: A, C, R, RR, RC, RA, RB, B.';
        }
        if (!err && t[i] && E2560.r[t[i]] && t[i].length === 1) { rows.push([t[i], E2560.r[t[i]]]); i++; }
        if (!err && t[i] && E2560.p[t[i]] && t[i].length === 1) { rows.push([t[i], 'helyzet: ' + E2560.p[t[i]]]); i++; }
        if (!err && t[i] && E2560.h[String(t[i]).toUpperCase()]) { rows.push([t[i], 'diffúzióképes hidrogén: ' + E2560.h[String(t[i]).toUpperCase()]]); i++; }
        dec.innerHTML = '<h4><small>MSZ EN ISO 2560-A</small>' + esc(inp.value) + '</h4>' + (err ? '<p>' + err + '</p>' : U.kv(rows.map(function (r) { return [esc(r[0]), '', esc(r[1])]; })).replace(/<b><\/b><small>/g, '<small style="margin:0;font-size:14px;color:var(--ink-2)">'));
      }
      inp.addEventListener('input', parse); parse();
      var bw = U.h('div'); el.appendChild(bw);
      var bcard = U.h('div', 'ix-out');
      U.chips(bw, Object.keys(BEV).map(function (k) { return [k, BEV[k].n]; }), 'B', function (v) { bcard.innerHTML = '<h4><small>Bevonattípus</small>' + BEV[v].n + '</h4><p>' + BEV[v].d + '</p>'; }, 'Bevonat');
      bw.appendChild(bcard); bcard.innerHTML = '<h4><small>Bevonattípus</small>' + BEV.B.n + '</h4><p>' + BEV.B.d + '</p>';
      var calc = U.h('div', 'ix-out'); el.appendChild(calc);
      calc.innerHTML = '<h4><small>Számoló</small>Hegesztőáram és bekapcsolási idő</h4>';
      var g = U.sliders(calc), res = U.h('div'); calc.appendChild(res);
      var V = { d: 3.2, X: 60, It: 200 };
      function rc() {
        var I1 = 60 * V.d - 70, I2 = 20 * Math.pow(V.d, 1.5);
        res.innerHTML = U.kv([['I ≈ 60·d − 70', Math.round(I1) + ' A'], ['I ≈ 20·d^1,5', Math.round(I2) + ' A'], ['Gyakorlat (PA)', Math.round(40 * V.d) + ' A / ' + Math.round(30 * V.d) + ' A', 'ötvözetlen: 40·d · ötvözött: 30·d'], ['U_ív = 20 + 0,04·I', fmt(20 + 0.04 * I1, 1) + ' V', '≤ 44 V'], ['Megengedett áram X = ' + V.X + '%-nál', Math.round(V.It * Math.sqrt(100 / V.X)) + ' A', 'I_p = I_t·√(100/X), ha a gép 100%-os áramterhelése I_t = ' + V.It + ' A']]);
      }
      U.slider(g, { label: 'Elektróda d', min: 1.6, max: 6, step: 0.1, value: V.d, unit: 'mm', dec: 1, onInput: function (v) { V.d = v; rc(); } });
      U.slider(g, { label: 'Bekapcs. idő X', min: 20, max: 100, step: 5, value: V.X, unit: '%', dec: 0, onInput: function (v) { V.X = v; rc(); } });
      U.slider(g, { label: 'I_t (100%)', min: 80, max: 400, step: 10, value: V.It, unit: 'A', dec: 0, onInput: function (v) { V.It = v; rc(); } });
      rc();
      U.quiz(el, [
        { q: 'Növelt folyáshatárú acél, dinamikus terhelés, −40 °C üzemi hőmérséklet. Melyik bevonat?', opts: ['Bázikus (B)', 'Rutilos (R)', 'Cellulóz (C)', 'Savas (A)'], a: 0, why: 'A bázikus elektróda hidrogéntartalma a legkisebb, a Mn megköti a ként: se hideg-, se melegrepedés, és negatív hőmérsékleten is jó a szívóssága.' },
        { q: 'Távvezeték helyszíni csőhegesztése, függőlegesen lefelé is. Melyik bevonat?', opts: ['Cellulóz (C)', 'Bázikus (B)', 'Savas (A)', 'Vastag rutilos (RR)'], a: 0, why: 'A cellulózos elektróda mély beolvadású, gyorsan dermed, minden helyzetben — függőlegesen lefelé is — hegeszt.' },
        { q: 'Melyik elektródával a legkönnyebb az ívgyújtás?', opts: ['Rutilos', 'Bázikus', 'Cellulóz', 'Mindegyikkel egyformán'], a: 0, why: 'A rutil miatt a gyújtófeszültség 50 V alatti, és a salak melegen jól vezeti az áramot. A bázikusnál 60–70 V kell.' },
        { q: 'Mit jelent a „H5” az elektróda jelében?', opts: ['Legfeljebb 5 ml diffúzióképes H₂ 100 g ömledékben', '5-ös hegesztési helyzet', '5% Ni', '500 MPa folyáshatár'], a: 0, why: 'A 9. tag a hegömledék legnagyobb diffúzióképes hidrogéntartalma: H5, H10, H15.' },
        { q: 'Miért kell eső jelleggörbe BKI-nél?', opts: ['Mert a kézi ívhossz-ingadozás így alig változtatja az áramot', 'Mert így nagyobb a leolvasztási teljesítmény', 'A belső szabályozás miatt', 'Mert a bázikus elektróda csak így olvad le'], a: 0, why: 'Meredeken eső karakterisztikánál Δl-hez kis ΔI tartozik: egyenletes a leolvadás; a rövidzárlati áram is közel van a munkaáramhoz.' },
      ], { title: 'Gyakorlás: BKI' });
    },
  });

  /* ================================================================== */
  /* A/08 — VFI anyagátviteli módok és védőgázok                          */
  /* ================================================================== */
  var GAS = {
    co2: { n: '100% CO₂ (C1)', spray: false },
    m21: { n: 'Ar + 15–25% CO₂ (M21)', spray: true },
    i1: { n: '100% Ar (I1)', spray: true },
  };
  function vfiMode(I, U, d, g) {
    var A = Math.PI * d * d / 4, J = I / A, Jk = g === 'i1' ? 170 : 210;
    if (J > 330 && GAS[g].spray && U > 30) return 'forgo';
    if (GAS[g].spray && J > Jk && U > 24) return 'szort';
    if (U < 19 + 0.02 * I) return 'rovid';
    return g === 'co2' || U > 17 + 0.04 * I ? 'nagycsepp' : 'rovid';
  }
  var VM = {
    rovid: { n: 'Rövidzárlatos (rövid ívű) anyagátmenet', c: '--ix-2', d: 'Kis I és U: a huzal a fürdőbe ütközik, rövidzárlat — a Pinch-erő leválasztja az anyagot, az ív újragyullad. Rövidzárlat-frekvencia 30–200 Hz. A legkisebb hőbevitel: vékony lemez (s < 3 mm), gyökhegesztés, kényszerhelyzet. Hátrány: fröcskölés.' },
    nagycsepp: { n: 'Nagycseppes (átmeneti, vegyes) ív', c: '--ix-1', d: 'Közepes I, nagyobb U: a csepp nagyobb a huzalnál, a gravitáció választja le (1–10 Hz), részben rövidzárlatosan, részben anélkül jut a fürdőbe — erős fröcskölés és füst. CO₂-re jellemző; kb. 4–5 mm-es lemez, vízszintes helyzet. Kerülendő — inkább impulzusos ív!' },
    szort: { n: 'Permetszerű (szórt ívű) anyagátmenet', c: '--ix-3', d: 'I > I_krit (J > ~150–200 A/mm², Al-nál ~80): apró cseppek, 100–1000 Hz, rövidzárlat nélkül — stabil, fröcskölésmentes, ideális. Csak Ar-ban vagy nagy Ar-tartalmú keverékben (≤ 18–25% CO₂), CO₂-ben nem. Nagy hőbevitel, nagy hígfolyós fürdő: vastag lemez PA/PB helyzetben.' },
    forgo: { n: 'Forgóíves anyagátmenet', c: '--ix-4', d: 'Igen nagy áramsűrűség (J > 300 A/mm², P > 20 kW, v_he > 20 m/perc): az ív a saját tengelye körül forog, sok apró csepp; He-tartalmú keverék (T.I.M.E.: 65% Ar + 26,5% He + 8% CO₂ + 0,5% O₂). A beolvadás a széleken mélyebb. Vastag lemez vízszintes helyzetben.' },
  };
  var G14175 = { I1: '100% Ar', I2: '100% He', I3: 'Ar + 0,5–95% He', M12: 'Ar + 0,5–5% CO₂', M13: 'Ar + 0,5–3% O₂', M14: 'Ar + 0,5–5% CO₂ + 0,5–3% O₂', M20: 'Ar + 5–15% CO₂', M21: 'Ar + 15–25% CO₂', M22: 'Ar + 3–10% O₂', M23: 'Ar + 0,5–5% CO₂ + 3–10% O₂', M24: 'Ar + 5–15% CO₂ + 0,5–3% O₂', M25: 'Ar + 5–15% CO₂ + 3–10% O₂', M26: 'Ar + 15–25% CO₂ + 0,5–3% O₂', M27: 'Ar + 15–25% CO₂ + 3–10% O₂', M31: 'Ar + 25–50% CO₂', M32: 'Ar + 10–15% O₂', C1: '100% CO₂', C2: 'CO₂ + 0,5–30% O₂', R1: 'Ar + 0,5–15% H₂ (redukáló)', R2: 'Ar + 15–50% H₂ (redukáló)', N1: '100% N₂', Z: 'a táblázatba nem illő keverék' };
  AVIX.def('vfi', {
    title: 'VFI: anyagátviteli módok és védőgázok',
    sub: 'Vázlatos I–U térkép huzalátmérő és védőgáz szerint · ISO 14175 jel',
    mount: function (el) {
      var S = { I: 180, U: 22, d: 1.2, g: 'm21' };
      el.innerHTML = '<p class="ix-lead">Az anyagátmenet módját a jegyzet szerint az áram (áramsűrűség), a feszültség és a védőgáz dönti el. <b>Húzd a munkapontot</b> a térképen, válts huzalátmérőt vagy gázt. A határok vázlatosak — a lényeg a trend: I ↑ → kisebb csepp, U ↑ → nagyobb csepp, CO₂-ben nincs permetes átmenet.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['0.8', '⌀0,8'], ['1', '⌀1,0'], ['1.2', '⌀1,2'], ['1.6', '⌀1,6']], '1.2', function (v) { S.d = parseFloat(v); draw(); }, 'Huzalátmérő');
      U.chips(el, Object.keys(GAS).map(function (k) { return [k, GAS[k].n]; }), S.g, function (v) { S.g = v; draw(); }, 'Védőgáz');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.85 : 0.5; }, minH: 260, maxH: 400, label: 'Anyagátviteli térkép' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var sx, sy, M = { l: 44, r: 14, t: 16, b: 38 };
      P.draw = function () { draw(); };
      function draw() {
        var w = P.w, h = P.h; if (!w) return;
        sx = U.scale(40, 500, M.l, w - M.r); sy = U.scale(14, 40, h - M.b, M.t);
        // a térkép vízszintes sávokból (soronként összevont szakaszok) — kevés elem, gyors rajz
        var o = '<g shape-rendering="crispEdges">', rows = 40, cols = 92, ch = (h - M.t - M.b) / rows, cw = (w - M.l - M.r) / cols;
        for (var r = 0; r < rows; r++) {
          var y = M.t + r * ch, Uv = sy.inv(y + ch / 2), start = 0, cur = vfiMode(sx.inv(M.l + cw / 2), Uv, S.d, S.g);
          for (var k = 1; k <= cols; k++) {
            var md = k < cols ? vfiMode(sx.inv(M.l + (k + 0.5) * cw), Uv, S.d, S.g) : null;
            if (md !== cur) {
              o += '<rect x="' + (M.l + start * cw).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + ((k - start) * cw + 0.6).toFixed(1) + '" height="' + (ch + 0.6).toFixed(1) + '" style="fill:var(' + VM[cur].c + ');fill-opacity:.24"/>';
              start = k; cur = md;
            }
          }
        }
        o += '</g>';
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, xt: [100, 200, 300, 400, 500], yt: [15, 20, 25, 30, 35, 40], xl: 'hegesztőáram I, A', yl: 'U, V' });
        var Ik = (S.g === 'i1' ? 170 : 210) * Math.PI * S.d * S.d / 4;
        if (GAS[S.g].spray && Ik < 500) o += '<line x1="' + sx(Ik) + '" x2="' + sx(Ik) + '" y1="' + M.t + '" y2="' + (h - M.b) + '" style="stroke:var(--ix-3);stroke-dasharray:5 4;stroke-width:1.4"/><text class="lb sm" x="' + (sx(Ik) + 4) + '" y="' + (M.t + 14) + '" style="fill:var(--ix-3)">I_krit ≈ ' + Math.round(Ik) + ' A</text>';
        o += '<circle class="mk" data-mk cx="' + sx(S.I) + '" cy="' + sy(S.U) + '" r="8"/>';
        P.svg.innerHTML = o;
        card();
      }
      function card() {
        var m = VM[vfiMode(S.I, S.U, S.d, S.g)], J = S.I / (Math.PI * S.d * S.d / 4);
        out.innerHTML = '<h4><small>I = ' + Math.round(S.I) + ' A · U = ' + fmt(S.U, 1) + ' V · J ≈ ' + Math.round(J) + ' A/mm² · ' + GAS[S.g].n + '</small>' + m.n + '</h4><p>' + m.d + '</p>';
      }
      P.drag(function (x, y) {
        S.I = U.clamp(sx.inv(x), 40, 500); S.U = U.clamp(sy.inv(y), 14, 40);
        var mk = P.svg.querySelector('[data-mk]'); if (mk) { mk.setAttribute('cx', sx(S.I)); mk.setAttribute('cy', sy(S.U)); }
        card();
      });
      P.render();
      var gc = U.h('div', 'ix-out'); el.appendChild(gc);
      gc.innerHTML = '<h4><small>MSZ EN ISO 14175</small>Védőgáz-jel visszafejtése</h4><div class="ix-row"><input type="text" value="M21" aria-label="Védőgáz jele" style="flex:1;min-width:0;min-height:40px;padding:0 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:600 16px var(--mono)"></div><div data-o></div>';
      var gi = gc.querySelector('input'), go = gc.querySelector('[data-o]');
      function gd() {
        var k = gi.value.trim().toUpperCase().replace(/^ISO\s*14175\s*[-–]?\s*/, '').split(/[-\s]/)[0];
        var grp = k[0];
        var info = { I: 'I — inert (semleges): nemesgázok és keverékeik', M: 'M — kevert aktív gáz (Ar–CO₂, Ar–O₂, Ar–CO₂–O₂); M1 → M3: egyre erősebben oxidáló', C: 'C — CO₂ vagy CO₂-bázisú: igen erősen oxidáló', R: 'R — redukáló (Ar–H₂)', N: 'N — nitrogéntartalmú, alacsony reakcióképességű (gyökvédő gázok)', O: 'O — 100% O₂', Z: 'Z — egyéb keverék' }[grp];
        go.innerHTML = G14175[k] ? U.kv([['Összetétel', G14175[k]], ['Főcsoport', '', info || '']]).replace(/<b><\/b><small>/g, '<small style="margin:0;font-size:14px;color:var(--ink-2)">') : '<p class="ix-note">Példák: I1, I3, M12, M20, M21, M24, M26, C1, R1. A jegyzet példái: ISO 14175-M25-ArCO-6/4, ISO 14175-I3-ArHe-30, ISO 14175-R1-ArH-5.</p>';
      }
      gi.addEventListener('input', gd); gd();
    },
  });

  /* ================================================================== */
  /* A/09 — varratalak (ψ = b/h1) és krisztallitnövekedés                 */
  /* ================================================================== */
  var FORMA = {
    up: { n: 'Fedettívű (UP)', b: 14, h: 9, h2: 2.5 },
    bki: { n: 'BKI', b: 12, h: 3.5, h2: 1.5 },
    mely: { n: 'Keskeny, mély', b: 6, h: 7.5, h2: 1.2 },
    szeles: { n: 'Széles, sekély', b: 26, h: 3, h2: 1.4 },
  };
  function psiZone(p) {
    if (p < 1.3) return { c: '--ix-5', n: 'Keskeny, mély varrat — nagy melegrepedési hajlam', d: 'A krisztallitok az oldalfalakról indulnak, és a varrat közepén közel 180°-ban nőnek össze. Az utoljára dermedő, szennyezőkben (S, P, C) dúsult sáv a középvonalba kerül — itt nyílik a melegrepedés.' };
    if (p < 3) return { c: '--ix-1', n: 'Csésze alakú varrat, ψ < ψ_min ≈ 3', d: 'A krisztallitok már hegyesszögben nőnek össze, a szennyezők egy része a felszínre jut, de a jegyzet szerinti ψ_min ≈ 3 alatt a melegrepedés még valószínű (a fedettívű hegesztés tartománya: 0,8–2,5).' };
    if (p <= 7) return { c: '--ix-3', n: 'Csésze alakú varrat — kedvező', d: 'A krisztallitok hegyesszögben nőnek össze, a szennyezők jelentős része a varrat felszínére, a salakba jut. A BKI jellemző tartománya ψ = 2,5–5.' };
    return { c: '--ix-2', n: 'Széles, sekély varrat', d: 'A krisztallitok közel párhuzamosan, a felszín felé nőnek: nincs középvonali szennyezősáv, a melegrepedés szempontjából kedvező. Ilyen varrathoz viszont nagy vonalenergia és sok menet kell.' };
  }
  AVIX.def('forma', {
    title: 'Varratalak és melegrepedés',
    sub: 'Belső formatényező ψ = b/h₁ · a krisztallitok összenövése a varrat keresztmetszetében',
    mount: function (el) {
      var st = U.store('forma', { b: 6, h: 7.5, h2: 1.2 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A melegrepedési hajlam a varrat alakjától is függ. Az oszlopos krisztallitok a beolvadási határra merőlegesen, a hőelvezetés irányával szemben nőnek. <b>Állítsd a varratszélességet és a beolvadási mélységet</b>, vagy válassz eljárást, és figyeld, hol nőnek össze a krisztallitok.</p>';
      var chips = U.chips(el, Object.keys(FORMA).map(function (k) { return [k, FORMA[k].n]; }), '', function (v) {
        var f = FORMA[v]; S.b = f.b; S.h = f.h; S.h2 = f.h2; sb.set(S.b, true); sh.set(S.h, true); s2.set(S.h2, true); st.set(S); P.render();
      }, 'Eljárás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.66 : 0.5; }, minH: 250, maxH: 400, label: 'Varrat keresztmetszete' });
      var g = U.sliders(el);
      function set(k) { return function (v) { S[k] = v; chips.set(''); st.set(S); P.render(); }; }
      var sb = U.slider(g, { label: 'Szélesség b', min: 4, max: 30, step: 0.5, value: S.b, unit: 'mm', dec: 1, onInput: set('b') });
      var sh = U.slider(g, { label: 'Beolvadás h₁', min: 1, max: 12, step: 0.5, value: S.h, unit: 'mm', dec: 1, onInput: set('h') });
      var s2 = U.slider(g, { label: 'Dudor h₂', min: 0.5, max: 4, step: 0.1, value: S.h2, unit: 'mm', dec: 1, onInput: set('h2') });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var top = 52, k = Math.min((w - 16) / 36, (h - top - 10) / 20), cx = w / 2, y0 = top + 5 * k;
        function X(x) { return (cx + x * k).toFixed(1); }
        function Y(y) { return (y0 + y * k).toFixed(1); }
        var a = S.b / 2, d = S.h, p = S.b / S.h, z = psiZone(p), o = '';
        // ψ-skála
        var tx = U.scale(0.5, 12, 14, w - 14, true);
        [[0.5, 1.3, '--ix-5'], [1.3, 3, '--ix-1'], [3, 7, '--ix-3'], [7, 12, '--ix-2']].forEach(function (r) {
          o += '<rect x="' + tx(r[0]).toFixed(1) + '" y="20" width="' + (tx(r[1]) - tx(r[0])).toFixed(1) + '" height="8" style="fill:var(' + r[2] + ');fill-opacity:.45"/>';
        });
        [1, 1.3, 3, 7, 10].forEach(function (t) { o += '<text class="tk" x="' + tx(t).toFixed(1) + '" y="40" text-anchor="middle">' + fmt(t, t % 1 ? 1 : 0) + '</text>'; });
        var pm = tx(U.clamp(p, 0.5, 12));
        o += '<path d="M' + pm.toFixed(1) + ',29l-6,-11h12z" style="fill:var(--ink)"/><text class="lb sm" x="' + U.clamp(pm, 30, w - 30).toFixed(1) + '" y="13" text-anchor="middle">ψ = ' + fmt(p, 2) + '</text>';
        // alapanyag (lemez)
        o += '<rect x="' + X(-18) + '" y="' + Y(0) + '" width="' + (36 * k).toFixed(1) + '" height="' + (14 * k).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.2;stroke:var(--rule-2)"/>';
        // varrat: beolvadás (fél-ellipszis) + dudor
        var pool = [], cap = [], i, n = 60;
        for (i = 0; i <= n; i++) { var t = Math.PI * i / n; pool.push([a * Math.cos(t), d * Math.sin(t)]); cap.push([a * Math.cos(t), -S.h2 * Math.sin(t)]); }
        var pd = 'M' + pool.map(function (q) { return X(q[0]) + ',' + Y(q[1]); }).join('L') + 'L' + cap.slice().reverse().map(function (q) { return X(q[0]) + ',' + Y(q[1]); }).join('L') + 'Z';
        o += '<path d="' + pd + '" style="fill:var(' + z.c + ');fill-opacity:.16;stroke:var(--ink);stroke-width:1.4"/>';
        // krisztallitok: a beolvadási határ belső normálisa mentén, a középvonalig vagy a felszínig
        var den = '', m = 26;
        for (i = 1; i < m; i++) {
          var tt = Math.PI / 2 * i / m;
          [-1, 1].forEach(function (sg) {
            var px = sg * a * Math.cos(tt), py = d * Math.sin(tt);
            var nx = -Math.cos(tt) / a * sg, ny = -Math.sin(tt) / d, L = Math.sqrt(nx * nx + ny * ny); nx /= L; ny /= L;
            var qx = px, qy = py, ds = Math.max(0.04, Math.min(a, d) / 60);
            for (var s = 0; s < 800; s++) {
              var ex = qx + nx * ds, ey = qy + ny * ds;
              if (ex * sg <= 0) { qx = 0; break; }
              var capY = Math.abs(ex) < a ? -S.h2 * Math.sqrt(1 - (ex / a) * (ex / a)) : 0;
              if (ey <= capY) break;
              qx = ex; qy = ey;
            }
            den += 'M' + X(px) + ',' + Y(py) + 'L' + X(qx) + ',' + Y(qy);
          });
        }
        o += '<path d="' + den + '" style="fill:none;stroke:var(--ink-2);stroke-width:1;stroke-linecap:round;opacity:.7"/>';
        // szennyezősáv / repedés a középvonalban
        if (p < 3) {
          var yc = d * (p < 1.3 ? 0.78 : 0.45);
          o += '<path d="M' + X(0) + ',' + Y(-S.h2 * 0.6) + 'L' + X(0.12) + ',' + Y(yc * 0.3) + 'L' + X(-0.1) + ',' + Y(yc * 0.6) + 'L' + X(0) + ',' + Y(yc) + '" style="fill:none;stroke:var(--ix-5);stroke-width:' + (p < 1.3 ? 3 : 2) + ';stroke-dasharray:' + (p < 1.3 ? 'none' : '4 3') + '"/>';
          o += '<text class="lb sm" x="' + (+X(0) - 8) + '" y="' + Y(yc + 0.9) + '" text-anchor="end" style="fill:var(--ix-5)">' + (p < 1.3 ? 'melegrepedés' : 'szennyezősáv') + '</text>';
        }
        // méretvonalak
        o += '<line x1="' + X(-a) + '" x2="' + X(a) + '" y1="' + Y(-S.h2 - 1.4) + '" y2="' + Y(-S.h2 - 1.4) + '" style="stroke:var(--acc);stroke-width:1.2"/><text class="la sm" x="' + X(0) + '" y="' + (+Y(-S.h2 - 1.4) - 4) + '" text-anchor="middle">b = ' + fmt(S.b, 1) + ' mm</text>';
        o += '<line x1="' + X(a + 1.2) + '" x2="' + X(a + 1.2) + '" y1="' + Y(0) + '" y2="' + Y(d) + '" style="stroke:var(--acc);stroke-width:1.2"/><text class="la sm" x="' + (+X(a + 1.2) + (+X(a + 1.2) > w - 80 ? -5 : 5)) + '" y="' + Y(d / 2 + 0.4) + '"' + (+X(a + 1.2) > w - 80 ? ' text-anchor="end"' : '') + '>h₁ = ' + fmt(d, 1) + ' mm</text>';
        P.svg.innerHTML = o;
        var ph = S.b / S.h2;
        out.innerHTML = '<h4><small>ψ = b/h₁ = ' + fmt(p, 2) + ' · φ = b/h₂ = ' + fmt(ph, 1) + '</small>' + z.n + '</h4><p>' + z.d + '</p>' +
          U.kv([['Belső formatényező ψ', '0,5–10', 'ψ_min ≈ 3 · BKI 2,5–5 · fedettívű 0,8–2,5'], ['Külső formatényező φ', '5–20', ph < 5 ? 'most kisebb: túl domború varrat, rossz átmenet az alapanyagba' : ph > 20 ? 'most nagyobb: igen lapos varrat' : 'a tartományon belül']]) +
          '<p class="ix-hint">A repedési hajlam csökkenthető a formatényező helyes megválasztásával, előmelegítéssel és az alapanyag-hányad csökkentésével; a finomabb elsődleges szövet (idegen kristálycsírák: Al₂O₃, AlN, Ti-, V-, Zr-nitridek, -karbidok) is segít.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* A/09 — anyagcsoportok hegeszthetősége (a jegyzet adatai)             */
  /* ================================================================== */
  var HG = {
    otv: { n: 'Ötvözetlen, gyengén ötvözött acél', tm: 1500, te: null, opt: [100, 300, 's > 40 mm'], cool: 'normal', post: [650, 'feszültségcsökkentés (vastag darab)'], v: 'jó',
      r: [['Feltétel', 'C < 0,22%, C<sub>e</sub> ≤ 0,45%'], ['Fő veszély', 'kicsi; vastag lemeznél, hidegben, merev befogásnál hidegrepedés'], ['Előmelegítés', 'általában nem kell; s > 40 mm-nél 100–300 °C'], ['Eljárás, hozaganyag', 'minden technológia; rutilos elektróda, bázikus fárasztott, fokozottan igénybe vett, negatív hőmérsékleten üzemelő szerkezethez'], ['Utókezelés', 'szükség esetén feszültségcsökkentés 650 °C-on']] },
    koz: { n: 'Közepesen ötvözött acél', tm: 1500, te: [100, 450], cool: 'lassu', post: [650, 'feszültségcsökkentés 600–700 °C'], v: 'feltételes',
      r: [['Feltétel', 'C<sub>e</sub> = 0,45–1% (E295–E360, S460Q–S960QL, C22–C60 …)'], ['Fő veszély', 'beedződés a HHÖ-ben → hidegrepedés (martenzit + H + feszültség)'], ['Előmelegítés', 'a C<sub>e</sub> és a vastagság szerint: C<sub>e</sub> = 0,45% → 100 °C … C<sub>e</sub> = 1% → 450 °C'], ['Eljárás, hozaganyag', 'bázikus (szárított, H5) elektróda, hidrogénszegény technológia, lassú hűlés'], ['Utókezelés', 'feszültségcsökkentés 600–700 °C-on']] },
    aus: { n: 'Ausztenites Cr-Ni acél', tm: 1450, te: null, cool: 'gyors', ban: [600, 700, 'Cr-karbid kiválás'], v: 'feltételes',
      r: [['Összetétel', 'korrózióálló: C ≤ 0,1%, Cr 17–26%, Ni 8–27% (−200 °C-ig szívós)'], ['Fő veszély', 'lassú hűlésnél 600–700 °C-on Cr-karbid: ridegség, interkrisztallin korrózió; melegrepedés; nagy hőtágulás'], ['Előmelegítés', '<b>tilos</b> — gyorsan kell hűteni'], ['Eljárás, hozaganyag', 'AWI, AFI, BKI; kis hőbevitel: rövid ív, kis áramsűrűség, kis átmérő, Cu alátét; szénacélhoz Cr-Ni párnaréteg'], ['Utókezelés', 'nincs edződés, nincs szemcsedurvulás; Mn-ötvözésűnél kalapálás, H-mentesítés 250–300 °C-on']] },
    fer: { n: 'Ferrites Cr-acél', tm: 1480, te: [300, 400], cool: 'tart', v: 'feltételes',
      r: [['Összetétel', 'C < 0,12%, Cr 15–30%'], ['Fő veszély', 'nem edződik be, de rideg; szemcsedurvulás (Cr-ferrit), nagy zsugorodási feszültség'], ['Előmelegítés', '300–400 °C, amit hegesztés közben is tartani kell'], ['Eljárás, hozaganyag', 'lágyabb, ausztenites hozaganyag; minimális hőbevitel'], ['Utókezelés', 'lassú lehűlés']] },
    mar: { n: 'Martenzites acél', tm: 1480, te: null, cool: 'gyors', ban: [200, 400, 'martenzit képződik'], v: 'rossz',
      r: [['Jelleg', 'önedző acél'], ['Fő veszély', 'a varrat és a HHÖ levegőn is beedződik → rideg, repedésveszélyes'], ['Alkalmazás', 'hegesztett szerkezethez nem alkalmas; javításkor is ritkán hegesztik']] },
    al: { n: 'Alumínium és ötvözetei', tm: 660, te: null, cool: 'normal', ox: [2050, 'Al₂O₃ olvadáspontja 2050 °C'], v: 'feltételes',
      r: [['Fő veszély', 'a szilárd Al₂O₃-hártya összetartja az ömledéket, majd felszakad → átlyukadás; H-porozitás; nagy hővezetés'], ['Megoldás', 'felülettisztítás, folyamatos oxidbontás: AWI (váltóáram), AFI (fordított polaritás)'], ['Lánghegesztés', 'acetiléndús láng + PA1 kloridos folyósítószer — kiszorult'], ['BKI', 'rosszabb, mint a láng (oxid- és salakzárvány); csak javításra']] },
    cu: { n: 'Vörösréz', tm: 1083, te: [600, 700], te2: [300, 500, 'védőgázas'], cool: 'normal', v: 'feltételes',
      r: [['Fő veszély', 'igen jó hővezetés → hidegkötés; H-ridegség; Cu–Cu₂O eutektikum'], ['Előmelegítés', '600–700 °C (védőgázas eljárásnál 300–500 °C is elég)'], ['Eljárás', 'gázhegesztésre nem alkalmas; BKI bázikus elektródával, DC fordított polaritás; AWI, VFI egyenes polaritással, Si-, Mn-dús huzallal']] },
    cuzn: { n: 'Sárgaréz (10–40% Zn)', tm: 950, te: [200, 400], cool: 'normal', ox: [906, 'a Zn forráspontja 906 °C'], v: 'feltételes',
      r: [['Fő veszély', 'a cink 906 °C-on elpárolog: mérgező gőz, porozitás, a varrat Zn-szegény lesz'], ['Előmelegítés', '200–400 °C (kisebb a hővezetése, mint a vörösréznek)'], ['Megoldás', 'oxigéndús láng (ZnO-film a fürdőn), növelt Zn-tartalmú hozaganyag, pl. CuZn40']] },
    ovm: { n: 'Öntöttvas — meleghegesztés', tm: 1150, te: [600, 700], te2: [300, 350, 'gömbgrafitos'], cool: 'nlassu', v: 'kötött',
      r: [['Előmelegítés', 'teljes térfogatban, lassan (30–100 °C/h): lemezgrafitos 600–700 °C, gömbgrafitos 300–350 °C (Mg-kiégés)'], ['Hozaganyag', 'öntöttvas jellegű (3–4% C, 2,5–3,5% Si); s < 20 mm: semleges láng + folyósítószer, s > 20 mm: BKI, egy menetben'], ['Utókezelés', 'újramelegítés és igen lassú hűtés (kemencében, homokban, akár napokig)']] },
    ovf: { n: 'Öntöttvas — félmeleg', tm: 1150, te: [200, 250], cool: 'lassu', v: 'kötött',
      r: [['Előmelegítés', '200–250 °C (vagy helyi előmelegítés 600–700 °C-ra)'], ['Alkalmazás', 'nagy tömegű, szimmetrikus alkatrészek'], ['Hozaganyag', 'Ni vagy NiCu elektróda'], ['Utókezelés', 'lassú hűlés']] },
    ovh: { n: 'Öntöttvas — hideghegesztés', tm: 1150, te: null, cool: 'szakasz', v: 'kötött',
      r: [['Elv', 'előmelegítés és utóhőkezelés nélkül; a leggyakoribb, legolcsóbb'], ['Hozaganyag', 'Ni-alapú, bázikus bevonatú: Fe–Ni (51/49, 36/64 invar), tiszta Ni, Monel (70 Ni + 30 Cu); első párnaréteg tiszta Ni'], ['Technológia', '30–50 mm-es szakaszok, 1–2 perc szünet, a darab legfeljebb kézmeleg; rövid ív, fordított polaritás; a varratot melegen kalapálják; a repedés végét kifúrják'], ['Vastag fal', 's > 20–25 mm: M6–M20 szegcsavarok']] },
  };
  AVIX.def('hegtab', {
    title: 'Anyagcsoportok hegesztési technológiája',
    sub: 'Előmelegítés, hűlés és utókezelés vázlatos hőciklusa anyagcsoportonként (a jegyzet adatai)',
    mount: function (el) {
      var st = U.store('hegtab', { g: 'koz' }), cur = st.get().g;
      if (!HG[cur]) cur = 'koz';
      el.innerHTML = '<p class="ix-lead">Válassz anyagcsoportot: a görbe a hegesztés vázlatos hőciklusát mutatja (előmelegítés → ív → hűlés → utókezelés), alatta a jegyzet szerinti technológiai szabályok. Az időtengely csak szemléltető.</p>';
      U.chips(el, Object.keys(HG).map(function (k) { return [k, HG[k].n]; }), cur, function (v) { cur = v; st.set({ g: v }); P.render(); }, 'Anyagcsoport');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.46; }, minH: 240, maxH: 360, label: 'Hegesztési hőciklus' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var M = { l: 46, r: 14, t: 14, b: 30 };
      P.draw = function (w, h) {
        var G = HG[cur], sx = U.scale(0, 10, M.l, w - M.r), sy = U.scale(0, 2200, h - M.b, M.t), o = '';
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, yt: [0, 500, 1000, 1500, 2000], xt: [], xl: 'idő (vázlatos)', yl: 'T, °C' });
        function band(r, c, lab, dash) {
          o += '<rect x="' + M.l + '" y="' + sy(r[1]).toFixed(1) + '" width="' + (w - M.l - M.r) + '" height="' + Math.max(2, sy(r[0]) - sy(r[1])).toFixed(1) + '" style="fill:var(' + c + ');fill-opacity:' + (dash ? '.08' : '.18') + '"/>';
          o += '<text class="lb sm" x="' + (w - M.r - 4) + '" y="' + (sy(r[1]) - 3).toFixed(1) + '" text-anchor="end" style="fill:var(' + c + ')">' + lab + '</text>';
        }
        if (G.te) band(G.te, '--ix-1', 'előmelegítés ' + G.te[0] + '–' + G.te[1] + ' °C');
        if (G.te2) band(G.te2, '--ix-1', G.te2[2] + ': ' + G.te2[0] + '–' + G.te2[1] + ' °C', true);
        if (G.opt) band(G.opt, '--ix-1', G.opt[2] + ': ' + G.opt[0] + '–' + G.opt[1] + ' °C', true);
        if (G.ban) band(G.ban, '--ix-5', G.ban[2] + ' ' + G.ban[0] + '–' + G.ban[1] + ' °C');
        if (G.ox) o += '<line x1="' + M.l + '" x2="' + (w - M.r) + '" y1="' + sy(G.ox[0]) + '" y2="' + sy(G.ox[0]) + '" style="stroke:var(--ix-5);stroke-width:1.4;stroke-dasharray:6 4"/><text class="lb sm" x="' + (M.l + 6) + '" y="' + (sy(G.ox[0]) - 4) + '" style="fill:var(--ix-5)">' + G.ox[1] + '</text>';
        o += '<line x1="' + M.l + '" x2="' + (w - M.r) + '" y1="' + sy(G.tm) + '" y2="' + sy(G.tm) + '" class="ln th dot"/><text class="tk" x="' + (w - M.r - 4) + '" y="' + (sy(G.tm) + 13) + '" text-anchor="end">olvadás ≈ ' + G.tm + ' °C</text>';
        // hőciklus
        var Te = G.te ? (G.te[0] + G.te[1]) / 2 : 20, Tp = G.tm * 1.06, pts = [[0, 20]], i, t;
        if (G.te) { pts.push([1.2, Te], [2.3, Te]); } else pts.push([2.3, 20]);
        if (G.cool === 'szakasz') {
          // hideghegesztés: rövid szakaszok, köztük szünet (legfeljebb kézmeleg)
          [2.3, 3.9, 5.5].forEach(function (t0) {
            pts.push([t0 + 0.12, Tp]);
            for (i = 1; i <= 14; i++) { t = i / 14 * 1.2; pts.push([t0 + 0.12 + t, 20 + 40 + (Tp - 60) * Math.exp(-t * 6)]); }
            pts.push([t0 + 1.6, 45]);
          });
          pts.push([10, 25]);
        } else {
          pts.push([2.45, Tp]);
          var floor = G.cool === 'tart' ? Te : 20, kk = { gyors: 5, normal: 2.6, lassu: 1.2, nlassu: 0.9, tart: 3 }[G.cool];
          for (i = 1; i <= 40; i++) { t = i / 40 * 3.5; pts.push([2.45 + t, floor + (Tp - floor) * Math.exp(-t * kk)]); }
          var tEnd = 5.95, Tnow = floor + (Tp - floor) * Math.exp(-3.5 * kk);
          if (G.cool === 'tart') { pts.push([6.4, Te]); for (i = 1; i <= 12; i++) { t = i / 12 * 3.6; pts.push([6.4 + t, 20 + (Te - 20) * Math.exp(-t * 0.8)]); } }
          else if (G.post) { pts.push([6.6, Tnow < 60 ? 20 : Tnow], [7.4, G.post[0]], [8.4, G.post[0]]); for (i = 1; i <= 10; i++) { t = i / 10 * 1.6; pts.push([8.4 + t, 20 + (G.post[0] - 20) * Math.exp(-t * 1.1)]); } }
          else if (G.cool === 'nlassu') { for (i = 1; i <= 16; i++) { t = i / 16 * 4; pts.push([tEnd + t, 20 + (Tnow - 20) * Math.exp(-t * 0.35)]); } }
          else pts.push([10, 20 + (Tnow - 20) * 0.2]);
        }
        o += '<path class="ln bd acc" d="' + U.path(pts, sx, sy) + '"/>';
        if (G.post) o += '<text class="la sm" x="' + (w - M.r - 4) + '" y="' + (sy(G.post[0]) - 8) + '" text-anchor="end">' + G.post[1] + '</text>';
        o += '<text class="la sm" x="' + sx(2.5) + '" y="' + (sy(Tp) - 6) + '">ív</text>';
        if (G.cool === 'szakasz') o += '<text class="lb sm" x="' + sx(7.5) + '" y="' + (sy(250)) + '" text-anchor="middle">30–50 mm-es szakaszok,</text><text class="lb sm" x="' + sx(7.5) + '" y="' + (sy(250) + 14) + '" text-anchor="middle">köztük 1–2 perc szünet</text>';
        P.svg.innerHTML = o;
        var vc = { 'jó': '--ix-3', feltételes: '--ix-1', 'kötött': '--ix-1', rossz: '--ix-5' }[G.v];
        out.innerHTML = '<h4><small>Hegeszthetőség: <b style="color:var(' + vc + ')">' + G.v + '</b></small>' + G.n + '</h4>' + U.kv(G.r.map(function (r) { return [r[0], '', r[1]]; })).replace(/<b><\/b><small>/g, '<small style="margin:0;font-size:14px;color:var(--ink-2)">');
      };
      P.render();
      U.quiz(el, [
        { q: 'Ausztenites Cr-Ni acélt hegesztesz. Mi a helyes hőkezelési stratégia?', opts: ['Nincs előmelegítés, gyors hűtés, kis hőbevitel', 'Előmelegítés 300–400 °C-ra', 'Előmelegítés a C<sub>e</sub> szerint, lassú hűlés', 'Hegesztés után 650 °C-os hőntartás'], a: 0, why: 'Lassú hűlésnél 600–700 °C között Cr-karbidok válnak ki (ridegség, korrózió), ezért tilos előmelegíteni, és gyorsan kell hűteni.' },
        { q: 'Ferrites Cr-acélnál mi a teendő?', opts: ['300–400 °C-os előmelegítés, ausztenites hozaganyag', 'Tilos előmelegíteni', 'Öntöttvas jellegű hozaganyag', 'Semmi, feltétel nélkül hegeszthető'], a: 0, why: 'A ferrites Cr-acél nem edződik be, de rideg és szemcsedurvulásra hajlamos: előmelegítés 300–400 °C-ra, lágyabb ausztenites hozaganyag, minimális hőbevitel.' },
        { q: 'Miért repedésérzékeny a keskeny, mély (ψ ≈ 1) varrat?', opts: ['A krisztallitok középen közel 180°-ban nőnek össze, ott dúsulnak a szennyezők', 'Mert nagy a hőbevitele', 'Mert a hidrogén nem tud távozni', 'Mert túl sok benne a mangán'], a: 0, why: 'Az utoljára dermedő, szennyezőkben dús sáv a varrat középvonalába kerül; a jegyzet szerint ψ_min ≈ 3.' },
        { q: 'Mi a sárgaréz hegesztésének fő gondja?', opts: ['A cink 906 °C-on elpárolog (mérgező gőz)', 'Az Al₂O₃-hártya', 'A Cr-karbid kiválás', 'Az önedzés'], a: 0, why: 'Oxigéndús lánggal (ZnO-film) és növelt Zn-tartalmú hozaganyaggal (pl. CuZn40) csökkentik a párolgást.' },
        { q: 'Mi jellemzi az öntöttvas hideghegesztését?', opts: ['Ni-alapú elektróda, rövid szakaszok, kalapálás, a darab legfeljebb kézmeleg', 'Előmelegítés 600–700 °C-ra', 'Öntöttvas jellegű hozaganyag, lassú hűtés napokig', 'Oxigéndús láng'], a: 0, why: 'Előmelegítés nélkül, Fe–Ni, tiszta Ni vagy Monel elektródával, 30–50 mm-es szakaszokban, szünetekkel; a varratot melegen kalapálják.' },
        { q: 'Mi a kén szerepe a melegrepedésben?', opts: ['986 °C-on olvadó Fe–FeS eutektikumot képez; a Mn MnS-ként megköti', 'Szilárdságnövelő, a repedést nem befolyásolja', 'Csak a hidegrepedést növeli', 'Megköti a hidrogént'], a: 0, why: 'A kristályhatárokon maradó alacsony olvadáspontú eutektikum a dermedés végén repedést okoz; S < 0,03% kívánatos, a Mn (1–2%) kizárja a Fe–FeS képződését.' },
        { q: 'Közepesen ötvözött acél, C<sub>e</sub> = 1%. Mekkora előmelegítés kell a jegyzet szerint?', opts: ['≈ 450 °C', '≈ 100 °C', 'Nem kell', '600–700 °C'], a: 0, why: 'A jegyzet szerint C<sub>e</sub> = 0,45% → 100 °C, C<sub>e</sub> = 1% → 450 °C; utána feszültségcsökkentés 600–700 °C-on.' },
      ], { title: 'Gyakorlás: hegeszthetőség' });
    },
  });
})();
