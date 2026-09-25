/*
 * Gépész záróvizsga tételtár — interaktív ábrák a B/09–B/11 tételekhez
 * (élszögrendszerek és működő szögek, alakos kések, hátraesztergált marók, üregelő szerszámok).
 * Források: a tárgy szerszámgeometria-diái és „Alakos forgácsolószerszámok tervezése” jegyzete (ravai-gyűjtemény),
 * Dudás: Megmunkálási eljárások 5. fejezet, Gyártás 2 (dörzsár, κr). Az ábrák saját rajzok.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ---------- kis vektorműveletek ---------- */
  function v3(x, y, z) { return [x, y, z]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.sqrt(dot(a, a)); return l ? mul(a, 1 / l) : a; }

  /* ================================================================== */
  /* B/09 — élszög-meghatározó síkok és az átszámítás                     */
  /* ================================================================== */
  // Koordináták: Pr = xy sík, a feltételezett forgácsolóirány +z, előtolás +x, y a munkadarabtól kifelé.
  function tipGeom(S) {
    var kr = S.kr * RAD, ls = S.ls * RAD, go = S.go * RAD, ao = S.ao * RAD, Z = v3(0, 0, 1), X = v3(1, 0, 0), Y = v3(0, 1, 0);
    var s = v3(Math.cos(kr), Math.sin(kr), 0), o = v3(-Math.sin(kr), Math.cos(kr), 0);
    var e = norm(add(mul(s, Math.cos(ls)), mul(Z, -Math.sin(ls))));
    var dr = add(mul(o, Math.cos(go)), mul(Z, -Math.sin(go)));      // homloklap nyoma Po-ban
    var da = add(mul(Z, -Math.cos(ao)), mul(o, Math.sin(ao)));      // hátlap nyoma Po-ban
    var Nr = cross(e, dr), Na = cross(e, da);
    function rake(n, body) { var d = cross(Nr, n); if (dot(d, body) < 0) d = mul(d, -1); return Math.atan2(-dot(d, Z), dot(d, body)); }
    function flank(n, body) { var d = cross(Na, n); if (dot(d, Z) > 0) d = mul(d, -1); return Math.atan2(dot(d, body), -dot(d, Z)); }
    var out = {
      o: { g: rake(s, o), a: flank(s, o) },
      f: { g: rake(Y, mul(X, -1)), a: flank(Y, mul(X, -1)) },
      p: { g: rake(X, Y), a: flank(X, Y) },
    };
    // élnormál sík: normálisa e; vízszintes irány a test felé, függőleges „fel”
    var h = norm(cross(Z, e)); if (dot(h, o) < 0) h = mul(h, -1);
    var u = norm(cross(e, h)); if (dot(u, Z) < 0) u = mul(u, -1);
    var dn = cross(Nr, e); if (dot(dn, h) < 0) dn = mul(dn, -1);
    var an = cross(Na, e); if (dot(an, u) > 0) an = mul(an, -1);
    out.n = { g: Math.atan2(-dot(dn, u), dot(dn, h)), a: Math.atan2(dot(an, h), -dot(an, u)) };
    ['o', 'f', 'p', 'n'].forEach(function (k) { out[k].g *= DEG; out[k].a *= DEG; out[k].b = 90 - out[k].g - out[k].a; });
    return { s: s, o: o, out: out };
  }
  var PL = { o: ['Po', 'ortogonálsík', 'Pr-re és Ps-re merőleges'], f: ['Pf', 'munkasík', 'tartalmazza az előtolás irányát'], p: ['Pp', 'tengelysík', 'Pr-re és Pf-re merőleges'], n: ['Pn', 'élnormál sík', 'a forgácsolóélre merőleges'] };
  function wedge(o, x0, y0, sz, g, a, lab) {
    // a metszetben: vízszintes Pr-nyom, függőleges forgácsolóirány; a test balra
    var gr = g * RAD, ar = a * RAD, L = sz;
    var pr = [x0 - L * Math.cos(gr), y0 + L * Math.sin(gr)], pa = [x0 - L * Math.sin(ar), y0 + L * Math.cos(ar)];
    o.push('<path d="M' + x0 + ',' + y0 + 'L' + pr[0].toFixed(1) + ',' + pr[1].toFixed(1) + 'L' + (pr[0] + (pa[0] - x0)) .toFixed(1) + ',' + (pr[1] + (pa[1] - y0)).toFixed(1) + 'L' + pa[0].toFixed(1) + ',' + pa[1].toFixed(1) + 'Z" style="fill:var(--ix-8);fill-opacity:.28;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round"/>');
    o.push('<line x1="' + (x0 - L * 1.15) + '" x2="' + (x0 + 20) + '" y1="' + y0 + '" y2="' + y0 + '" style="stroke:var(--muted);stroke-dasharray:6 4"/><text class="tk" x="' + (x0 - L * 1.15) + '" y="' + (y0 - 5) + '">Pr</text>');
    o.push('<line x1="' + x0 + '" x2="' + x0 + '" y1="' + (y0 - 30) + '" y2="' + (y0 + L * 1.1) + '" style="stroke:var(--muted);stroke-dasharray:6 4"/><text class="tk" x="' + (x0 + 4) + '" y="' + (y0 + L * 1.1) + '">Ps</text>');
    o.push('<path d="M' + (x0 + 30) + ',' + (y0 + 40) + 'V' + (y0 - 10) + '" style="stroke:var(--acc);stroke-width:2" marker-end="url(#esA)"/><text class="la" x="' + (x0 + 36) + '" y="' + (y0 + 20) + '">v</text>');
    function arc(r, a0, a1, cls, t, tx, ty) {
      var p0 = [x0 + r * Math.cos(a0), y0 + r * Math.sin(a0)], p1 = [x0 + r * Math.cos(a1), y0 + r * Math.sin(a1)];
      o.push('<path d="M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) + 'A' + r + ',' + r + ' 0 0,' + (a1 > a0 ? 1 : 0) + ' ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + '" style="fill:none;stroke:' + cls + ';stroke-width:1.6"/><text class="lb" x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" style="fill:' + cls + '">' + t + '</text>');
    }
    // γ: a vízszintestől (π) a homloklapig; α: a függőlegestől (π/2) a hátlapig; β köztük
    var ag = Math.PI - gr, aa = Math.PI / 2 + ar;
    arc(L * 0.72, Math.PI, ag, 'var(--ix-2)', 'γ ' + fmt(g, 1) + '°', x0 - L * 0.95, y0 + (g >= 0 ? 16 : -8));
    arc(L * 0.5, Math.PI / 2, aa, 'var(--ix-5)', 'α ' + fmt(a, 1) + '°', x0 - L * 0.1 - 14, y0 + L * 0.66);
    arc(L * 0.3, aa, ag, 'var(--ix-3)', 'β ' + fmt(90 - g - a, 1) + '°', x0 - L * 0.62, y0 + L * 0.42);
    o.push('<text class="lb" x="' + (x0 - L * 1.15) + '" y="' + (y0 - 24) + '">' + lab + '</text>');
  }
  AVIX.def('elszogsik', {
    title: 'Élszög-meghatározó síkok és az átszámítás',
    sub: 'Ugyanaz az él különböző síkokban más homlok- és hátszöget mutat — de mindegyikben α + β + γ = 90°',
    mount: function (el) {
      var st = U.store('elszogsik', { kr: 60, ls: 0, go: 10, ao: 7, pl: 'f' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Esztergakés csúcsa felülnézetben (az alapsíkban, Pr) és a kiválasztott mérősíkban vett metszete. A szerszámot az ortogonálsíkban adjuk meg (γ<sub>o</sub>, α<sub>o</sub>); <b>válts síkot</b>, és állítsd a κ<sub>r</sub>, λ<sub>s</sub> szögeket — a program a síkok geometriájából számol, és összeveti a jegyzet átszámítási képleteivel.</p>';
      var row = U.h('div'); el.appendChild(row);
      U.chips(row, Object.keys(PL).map(function (k) { return [k, PL[k][0] + ' · ' + PL[k][1]]; }), S.pl, function (v) { S.pl = v; st.set(S); P.render(); }, 'Mérősík');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1.05 : 0.5; }, minH: 300, maxH: 420, label: 'Felülnézet és metszet' });
      var g = U.sliders(el);
      [['kr', 'κr elhelyezési', 30, 95, 1], ['ls', 'λs terelő', -12, 12, 1], ['go', 'γo homlok', -10, 25, 1], ['ao', 'αo hát', 3, 15, 1]].forEach(function (d) {
        U.slider(g, { label: d[1], min: d[2], max: d[3], step: d[4], value: S[d[0]], unit: '°', dec: 0, onInput: function (v) { S[d[0]] = v; st.set(S); P.render(); } });
      });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var G = tipGeom(S), narrow = w < 520, o = ['<defs><marker id="esA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" style="fill:var(--acc)"/></marker></defs>'];
        // felülnézet
        var cx = narrow ? w * 0.5 : w * 0.27, cy = narrow ? h * 0.33 : h * 0.55, L = narrow ? Math.min(w, h) * 0.26 : Math.min(w * 0.17, h * 0.38);
        function T(x, y) { return [cx + x * L, cy - y * L]; }
        var s = G.s, kr2 = 12 * RAD, s2 = [-Math.cos(kr2), Math.sin(kr2)];
        var tool = [T(0, 0), T(s[0] * 1.1, s[1] * 1.1), T(s[0] * 1.1 - 1.3, s[1] * 1.1 + 0.3), T(s2[0] * 1.2, s2[1] * 1.2)];
        o.push('<rect x="' + (cx - L * 1.6) + '" y="' + (cy) + '" width="' + (L * 3.2) + '" height="' + (L * 0.5) + '" style="fill:var(--ix-8);fill-opacity:.18"/><text class="tk" x="' + Math.max(4, cx - L * 1.55).toFixed(1) + '" y="' + (cy + L * 0.4).toFixed(1) + '">munkadarab</text>');
        o.push('<path d="' + U.path(tool) + 'Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round"/>');
        o.push('<line x1="' + tool[0][0].toFixed(1) + '" y1="' + tool[0][1].toFixed(1) + '" x2="' + tool[1][0].toFixed(1) + '" y2="' + tool[1][1].toFixed(1) + '" style="stroke:var(--ink);stroke-width:3.2;stroke-linecap:round"/><text class="lb" x="' + ((tool[0][0] + tool[1][0]) / 2 + 8).toFixed(1) + '" y="' + ((tool[0][1] + tool[1][1]) / 2 + 4).toFixed(1) + '">főél</text><text class="tk" x="' + ((tool[0][0] + tool[3][0]) / 2).toFixed(1) + '" y="' + ((tool[0][1] + tool[3][1]) / 2 - 6).toFixed(1) + '">mellékél</text>');
        var traces = { s: [s[0], s[1], 'Ps'], o: [-s[1], s[0], 'Po, Pn'], f: [1, 0, 'Pf'], p: [0, 1, 'Pp'] };
        Object.keys(traces).forEach(function (k) {
          var d = traces[k], on = k === S.pl || (k === 'o' && S.pl === 'n'), ext = d[1] > 0.05 ? Math.min(1.35, (cy - 18) / (L * d[1])) : 1.35, a = T(-d[0] * 1.35, -d[1] * 1.35), b = T(d[0] * ext, d[1] * ext);
          o.push('<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" style="stroke:' + (on ? 'var(--acc)' : 'var(--muted)') + ';stroke-width:' + (on ? 2.4 : 1) + ';stroke-dasharray:' + (k === 's' ? '0' : '6 4') + '"/><text class="' + (on ? 'la' : 'tk') + '" x="' + U.clamp(b[0] + 4, 4, w - 44).toFixed(1) + '" y="' + (b[1] - 3).toFixed(1) + '">' + d[2] + '</text>');
        });
        var fa = T(0.2, -0.3), fb = T(0.9, -0.3);
        o.push('<path d="M' + fa[0].toFixed(1) + ',' + fa[1].toFixed(1) + 'H' + fb[0].toFixed(1) + '" style="stroke:var(--ink);stroke-width:2" marker-end="url(#esA)"/><text class="lb" x="' + ((fa[0] + fb[0]) / 2).toFixed(1) + '" y="' + (fa[1] + 16).toFixed(1) + '">v<tspan style="font-size:9px">f</tspan> előtolás</text>');
        var ka = T(0, 0);
        o.push('<path d="M' + (ka[0] + L * 0.35) + ',' + ka[1] + 'A' + (L * 0.35) + ',' + (L * 0.35) + ' 0 0,0 ' + (ka[0] + L * 0.35 * Math.cos(S.kr * RAD)).toFixed(1) + ',' + (ka[1] - L * 0.35 * Math.sin(S.kr * RAD)).toFixed(1) + '" style="fill:none;stroke:var(--ix-1);stroke-width:1.6"/><text class="lb" x="' + (ka[0] + L * 0.42).toFixed(1) + '" y="' + (ka[1] - 8).toFixed(1) + '" style="fill:var(--ix-1)">κr</text>');
        o.push('<circle cx="' + ka[0] + '" cy="' + ka[1] + '" r="3.5" class="fi"/>');
        // metszet a kiválasztott síkban
        var r = G.out[S.pl], wx = narrow ? w * 0.62 : w * 0.8, wy = narrow ? h * 0.66 : h * 0.3, ws = narrow ? Math.min(w * 0.36, h * 0.24) : Math.min(w * 0.2, h * 0.42);
        wedge(o, wx, wy, ws, r.g, r.a, PL[S.pl][0] + ' metszet');
        P.svg.innerHTML = o.join('');
        var tg = function (d) { return Math.tan(d * RAD); }, kr = S.kr * RAD, ls = S.ls * RAD;
        var chk = {
          o: 'megadott érték',
          f: 'tg γf = tg γo·sin κr − tg λs·cos κr = ' + fmt(Math.atan(tg(S.go) * Math.sin(kr) - Math.tan(ls) * Math.cos(kr)) * DEG, 2) + '°',
          p: 'tg γp = tg γo·cos κr + tg λs·sin κr = ' + fmt(Math.atan(tg(S.go) * Math.cos(kr) + Math.tan(ls) * Math.sin(kr)) * DEG, 2) + '°',
          n: 'tg γn = tg γo·cos λs = ' + fmt(Math.atan(tg(S.go) * Math.cos(ls)) * DEG, 2) + '°',
        };
        out.innerHTML = '<h4><small>' + PL[S.pl][1] + '</small>' + PL[S.pl][0] + ': γ = ' + fmt(r.g, 2) + '°, α = ' + fmt(r.a, 2) + '°, β = ' + fmt(r.b, 2) + '°</h4><p>' + PL[S.pl][0] + ' ' + PL[S.pl][1] + ': ' + PL[S.pl][2] + '. Ellenőrzés a képlettel: ' + chk[S.pl] + '. Minden síkban α + β + γ = 90°, de a három szög síkonként más.</p>' +
          '<table class="ix-tbl"><thead><tr><th>Sík</th><th>γ</th><th>α</th><th>β</th></tr></thead><tbody>' + ['o', 'f', 'p', 'n'].map(function (k) { var q = G.out[k]; return '<tr' + (k === S.pl ? ' class="on"' : '') + '><td>' + PL[k][0] + ' ' + PL[k][1] + '</td><td>' + fmt(q.g, 1) + '°</td><td>' + fmt(q.a, 1) + '°</td><td>' + fmt(q.b, 1) + '°</td></tr>'; }).join('') + '</tbody></table>' +
          '<p class="ix-note">λ<sub>s</sub> = 0-nál tg γ<sub>f</sub> = tg γ<sub>o</sub>·sin κ<sub>r</sub> és tg α<sub>f</sub> = tg α<sub>o</sub>/sin κ<sub>r</sub>: kis κ<sub>r</sub>-nél a munkasíkbeli hátszög erősen megnő. κ<sub>r</sub> = 90°-nál a munkasík és az ortogonálsík egybeesik.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/09 — működő szögek beszúrásnál: előtolás és késmagasság hatása     */
  /* ================================================================== */
  AVIX.def('mukodo', {
    title: 'Működő homlok- és hátszög beszúrásnál',
    sub: 'tg η = f/(π·d): a középpont felé haladva a működő hátszög elfogy — és a késmagasság is számít',
    mount: function (el) {
      var st = U.store('mukodo', { d: 20, f: 0.15, h: 0, a: 8, g: 10 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Beszúrásnál (leszúrásnál) az előtolás sugárirányú, így az eredő forgácsolóirány η szöggel elfordul: <b>γ<sub>fe</sub> = γ<sub>f</sub> + η, α<sub>fe</sub> = α<sub>f</sub> − η</b>. Mivel tg η = f/(π·d), a <b>tengely közelében a működő hátszög elfogy</b>. A középpont fölé állított kés (h &gt; 0) tovább csökkenti: sin θ = 2h/d.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1.05 : 0.5; }, minH: 300, maxH: 420, label: 'Beszúrás és a működő hátszög' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Átmérő d', min: 0.5, max: 60, step: 0.5, value: S.d, unit: 'mm', dec: 1, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Előtolás f', min: 0.02, max: 0.6, step: 0.01, value: S.f, unit: 'mm', dec: 2, onInput: function (v) { S.f = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Késmagasság h', min: -0.5, max: 0.5, step: 0.05, value: S.h, unit: 'mm', dec: 2, onInput: function (v) { S.h = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Hátszög αf', min: 4, max: 14, step: 1, value: S.a, unit: '°', dec: 0, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function work(d) {
        var eta = Math.atan(S.f / (Math.PI * d)) * DEG, q = 2 * S.h / d, th = Math.abs(q) <= 1 ? Math.asin(q) * DEG : (q > 0 ? 90 : -90);
        return { eta: eta, th: th, a: S.a - eta - th, g: S.g + eta + th };
      }
      P.draw = function (w, h) {
        var narrow = w < 520, o = '', cur = work(S.d);
        // bal/felső: keresztmetszet
        var cw = narrow ? w : w * 0.45, ch = narrow ? h * 0.5 : h, R = Math.min(cw, ch) * 0.34, cx = cw * 0.4, cy = ch * 0.52, r = R * S.d / 60;
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R.toFixed(1) + '" style="fill:none;stroke:var(--rule-2);stroke-dasharray:4 4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(1.5, r).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.22;stroke:var(--ink);stroke-width:1.4"/>';
        o += '<line x1="' + (cx - R - 10) + '" x2="' + (cx + R + 40) + '" y1="' + cy + '" y2="' + cy + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/>';
        var hy = cy - S.h * R / 6, tip = [cx + Math.sqrt(Math.max(r * r - (cy - hy) * (cy - hy), 0)), hy];
        // kés a munkadarabtól jobbra: homloklap felül (γ-val lejt), hátlap lefelé, α-val a darabtól elhajolva
        var gL = 60, gr = S.g * RAD, ar = S.a * RAD;
        var pR = [tip[0] + gL * Math.cos(gr), tip[1] + gL * Math.sin(gr)], pA = [tip[0] + gL * Math.sin(ar), tip[1] + gL * Math.cos(ar)];
        o += '<path d="M' + tip[0].toFixed(1) + ',' + tip[1].toFixed(1) + 'L' + pR[0].toFixed(1) + ',' + pR[1].toFixed(1) + 'L' + (pR[0] + pA[0] - tip[0]).toFixed(1) + ',' + (pR[1] + pA[1] - tip[1]).toFixed(1) + 'L' + pA[0].toFixed(1) + ',' + pA[1].toFixed(1) + 'Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round"/>';
        // működő forgácsolóirány: a sugárra merőleges érintő, η + θ-val elfordítva
        var wd = (cur.eta + cur.th) * RAD;
        o += '<line x1="' + tip[0].toFixed(1) + '" y1="' + (tip[1] - 40).toFixed(1) + '" x2="' + tip[0].toFixed(1) + '" y2="' + (tip[1] + 40).toFixed(1) + '" style="stroke:var(--muted);stroke-dasharray:4 3"/>';
        o += '<line x1="' + (tip[0] + 40 * Math.sin(wd)).toFixed(1) + '" y1="' + (tip[1] - 40 * Math.cos(wd)).toFixed(1) + '" x2="' + (tip[0] - 40 * Math.sin(wd)).toFixed(1) + '" y2="' + (tip[1] + 40 * Math.cos(wd)).toFixed(1) + '" style="stroke:var(--acc);stroke-width:1.8"/><text class="la" x="' + (tip[0] - 40 * Math.sin(wd) - 16).toFixed(1) + '" y="' + (tip[1] + 52).toFixed(1) + '">v<tspan style="font-size:9px">e</tspan></text>';
        o += '<text class="tk" x="' + Math.min(tip[0] + 8, cw - 160).toFixed(1) + '" y="' + (tip[1] + gL + 14) + '">kés (radiális előtolás ←)</text>';
        P.svg.innerHTML = o + chart(w, h, narrow, cur);
        var ok = cur.a > 2;
        out.innerHTML = '<h4><small>d = ' + fmt(S.d, 1) + ' mm · η = ' + fmt(cur.eta, 2) + '° · θ = ' + fmt(cur.th, 2) + '°</small>Működő hátszög α<sub>fe</sub> = ' + fmt(cur.a, 2) + '°, homlokszög γ<sub>fe</sub> = ' + fmt(cur.g, 2) + '°</h4>' +
          (ok ? '<p>A működő hátszög még elegendő.</p>' : '<p class="ix-hint" style="border-left-color:var(--ix-5)"><b>A hátfelület nyomja a darabot.</b> A működő hátszög ' + (cur.a <= 0 ? 'negatív' : 'nagyon kicsi') + ': a kés dörzsöl, a leszúrás végén „letöri” a csapot. Megoldás: kisebb előtolás a tengely közelében, nagyobb hátszög, pontos középmagasság.</p>') +
          '<p class="ix-note">Hosszesztergálásnál ugyanez a képlet (tg η = f/(π·d)) nagy emelkedésnél, pl. menetvágásnál jelentős: ott az előtolás a menetemelkedés.</p>';
      };
      function chart(w, h, narrow, cur) {
        var x0 = narrow ? 44 : w * 0.52, x1 = w - 12, y0 = narrow ? h * 0.56 : 20, y1 = h - 36, o = '';
        var sx = U.scale(0.5, 60, x0, x1, true), sy = U.scale(-10, 20, y1, y0);
        o += U.axes({ x0: x0, x1: x1, y0: y0, y1: y1, sx: sx, sy: sy, xt: [0.5, 1, 2, 5, 10, 20, 60], yt: [-10, 0, 10, 20], xl: 'd, mm (log)', yl: 'αfe, °', xgrid: true });
        o += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + sy(0).toFixed(1) + '" y2="' + sy(0).toFixed(1) + '" style="stroke:var(--ix-5);stroke-width:1.2"/>';
        var pts = [];
        for (var q = 0; q <= 200; q++) { var d = 0.5 * Math.pow(120, q / 200); pts.push([sx(d), sy(U.clamp(work(d).a, -10, 20))]); }
        o += '<path d="' + U.path(pts) + '" style="fill:none;stroke:var(--acc);stroke-width:2.2"/>';
        o += '<circle cx="' + sx(S.d).toFixed(1) + '" cy="' + sy(U.clamp(cur.a, -10, 20)).toFixed(1) + '" r="5" class="mk"/>';
        return o;
      }
      P.render();
    },
  });

  /* ================================================================== */
  /* B/09 — az elhelyezési szög hatása a forgácsra és az erőkre           */
  /* ================================================================== */
  AVIX.def('kappar', {
    title: 'Az elhelyezési szög (κr) hatása',
    sub: 'h = f·sin κr, b = a/sin κr; előtolóerő ~ sin κr, passzív (sugárirányú) erő ~ cos κr',
    mount: function (el) {
      var st = U.store('kappar', { kr: 45, a: 3, f: 0.3 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Hosszesztergálás felülnézetben. Azonos fogásmélységnél és előtolásnál a forgácskeresztmetszet (a·f) nem változik, de <b>alakja és az erő iránya igen</b>. A főélre merőleges erőt az előtolás és a sugár irányára bontjuk: κ<sub>r</sub> = 90°-nál a sugárirányú (passzív) erő gyakorlatilag eltűnik — ezért kell karcsú tengelyhez és egyenes furathoz 90°-os él.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.9 : 0.46; }, minH: 260, maxH: 380, label: 'Forgácskeresztmetszet és erők' });
      var g = U.sliders(el);
      U.slider(g, { label: 'κr', min: 15, max: 95, step: 1, value: S.kr, unit: '°', dec: 0, onInput: function (v) { S.kr = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Fogásmélység a', min: 0.5, max: 5, step: 0.1, value: S.a, unit: 'mm', dec: 1, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Előtolás f', min: 0.05, max: 0.8, step: 0.01, value: S.f, unit: 'mm', dec: 2, onInput: function (v) { S.f = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var k = S.kr * RAD, hh = S.f * Math.sin(k), b = S.a / Math.sin(k), o = '', narrow = w < 520;
        // felülnézet: a forgácskeresztmetszet (paralelogramma) nagyítva
        var EX = 5, fe = S.f * EX; // az előtolás irányát 5-szörösen nagyítjuk, hogy a forgács alakja látsszon
        var sc = Math.min((narrow ? w : w * 0.55) / (S.a / Math.tan(k) + fe + 1.5), (narrow ? h * 0.55 : h) / (S.a + 1.5)) * 0.8;
        var ox = 30, oy = (narrow ? h * 0.55 : h) - 30;
        function Q(x, y) { return [(ox + x * sc).toFixed(1), (oy - y * sc).toFixed(1)]; }
        var dx = S.a / Math.tan(k), f0 = S.f; S.f = fe;
        var par = [[0, 0], [S.f, 0], [S.f + dx, S.a], [dx, S.a]];
        o += '<rect x="0" y="' + oy + '" width="' + w + '" height="' + ((narrow ? h * 0.55 : h) - oy) + '" style="fill:var(--ix-8);fill-opacity:.15"/>';
        o += '<path d="M' + par.map(function (p) { return Q(p[0], p[1]).join(','); }).join('L') + 'Z" style="fill:var(--acc);fill-opacity:.35;stroke:var(--acc);stroke-width:1.5"/>';
        var e0 = Q(S.f + dx, S.a), e1 = Q(S.f, 0);
        o += '<line x1="' + e0[0] + '" y1="' + e0[1] + '" x2="' + e1[0] + '" y2="' + e1[1] + '" style="stroke:var(--ink);stroke-width:3"/><text class="lb" x="' + (+e0[0] + 6) + '" y="' + e0[1] + '">főél</text>';
        o += '<text class="tk" x="' + ox + '" y="' + (oy + 14) + '">munkadarab tengelye felé ↓ · előtolás → (×' + EX + ' nagyítva)</text>';
        o += '<text class="sm" x="' + Q(S.f / 2 + dx / 2, S.a / 2)[0] + '" y="' + Q(S.f / 2 + dx / 2, S.a / 2)[1] + '" text-anchor="middle">A = a·f</text>';
        S.f = f0;
        // erőbontás
        var fx = narrow ? w * 0.5 : w * 0.78, fy = narrow ? h * 0.8 : h * 0.5, F = Math.min(w, h) * (narrow ? 0.16 : 0.22);
        var nx = Math.sin(k), ny = -Math.cos(k); // a főélre merőleges (előtolás +x, sugár −y)
        function arr(x0, y0, dx2, dy2, col, t) {
          var x1 = x0 + dx2, y1 = y0 + dy2, a = Math.atan2(dy2, dx2);
          return '<line x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" style="stroke:' + col + ';stroke-width:2.4"/><path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + 'L' + (x1 - 9 * Math.cos(a - 0.4)).toFixed(1) + ',' + (y1 - 9 * Math.sin(a - 0.4)).toFixed(1) + 'L' + (x1 - 9 * Math.cos(a + 0.4)).toFixed(1) + ',' + (y1 - 9 * Math.sin(a + 0.4)).toFixed(1) + 'Z" style="fill:' + col + '"/><text class="lb" x="' + (x1 + 6 * Math.cos(a)).toFixed(1) + '" y="' + (y1 + 6 * Math.sin(a) + 4).toFixed(1) + '" style="fill:' + col + '">' + t + '</text>';
        }
        o += '<circle cx="' + fx + '" cy="' + fy + '" r="3" class="fi"/>';
        o += arr(fx, fy, F * nx, -F * ny, 'var(--ink)', 'F');
        o += arr(fx, fy, F * nx, 0, 'var(--ix-2)', 'Ff');
        if (Math.abs(ny) > 0.02) o += arr(fx, fy, 0, -F * ny, 'var(--ix-5)', 'Fp');
        o += '<path d="M' + (fx + F * nx).toFixed(1) + ',' + fy + 'V' + (fy - F * ny).toFixed(1) + 'M' + fx + ',' + (fy - F * ny).toFixed(1) + 'H' + (fx + F * nx).toFixed(1) + '" style="stroke:var(--muted);stroke-dasharray:3 3"/>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>κr = ' + S.kr + '°</small>h = ' + fmt(hh, 3) + ' mm, b = ' + fmt(b, 2) + ' mm</h4>' +
          U.kv([['Forgácsvastagság h = f·sin κr', fmt(hh, 3) + ' mm', S.kr < 60 ? 'vékony, széles forgács: kisebb fajlagos élterhelés' : 'vastag forgács, rövid élszakasz'], ['Előtolóerő Ff', fmt(Math.sin(k) * 100, 0) + ' %', 'a főélre merőleges erő sin κr-szerese'], ['Passzív (sugárirányú) erő Fp', fmt(Math.abs(Math.cos(k)) * 100, 0) + ' %', S.kr >= 85 ? 'gyakorlatilag nincs — karcsú tengely, egyenes furat' : 'a darabot elhajlítja, a szerszámot eltolja']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/10 — alakos kés profilszámítása (D–D → F–F → N–N)                  */
  /* ================================================================== */
  var AK_PROF = {
    lepcso: { n: 'Lépcsős', p: [[0, 10], [6, 10], [6, 15], [16, 15], [16, 12], [26, 12]] },
    kup: { n: 'Kúpos', p: [[0, 10], [5, 10], [17, 16], [24, 16]] },
    iv: { n: 'Íves (horony)', p: (function () { var a = [[0, 16]]; for (var i = 0; i <= 12; i++) { var t = Math.PI * i / 12; a.push([6 + 6 - 6 * Math.cos(t), 16 - 5 * Math.sin(t)]); } a.push([24, 16]); return a; })() },
  };
  function akCalc(r, S) {
    var rmin = Infinity; AK_PROF[S.pr].p.forEach(function (q) { rmin = Math.min(rmin, q[1]); });
    var g = S.g * RAD, a = S.a * RAD, Hp = rmin * Math.sin(g), gi = Math.asin(U.clamp(Hp / r, -1, 1));
    var C = r * Math.cos(gi) - rmin * Math.cos(g);
    var Pd = C * Math.cos(a + g);
    var R1 = S.R, H = R1 * Math.sin(a + g), B1 = R1 * Math.cos(a + g), Ri = Math.sqrt(H * H + (B1 - C) * (B1 - C));
    return { gi: gi * DEG, C: C, P: Pd, Rk: R1 - Ri, t: r - rmin };
  }
  AVIX.def('alakoskes', {
    title: 'Alakos kés profilja: pontonkénti átszámítás',
    sub: 'Hp = rmin·sin γ, sin γi = Hp/ri, Ci = ri·cos γi − rmin·cos γ, Pi = Ci·cos(α + γ) — hasábkés és körkés',
    mount: function (el) {
      var st = U.store('alakoskes', { pr: 'kup', typ: 'h', g: 12, a: 10, R: 30 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A munkadarab profilja a tengelymetszetben (D–D) adott, a szerszámot a hátfelületre merőleges síkban (N–N) kell elkészíteni. <b>Csak γ = α = 0-nál</b> egyezne a kettő — állítsd a szögeket, és nézd, mennyire tér el a szerszámprofil (folytonos) a munkadarabétól (szaggatott).</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, Object.keys(AK_PROF).map(function (k) { return [k, AK_PROF[k].n]; }), S.pr, function (v) { S.pr = v; st.set(S); P.render(); }, 'Profil');
      U.seg(r1, [['h', 'Hasábos kés'], ['k', 'Körkés']], S.typ, function (v) { S.typ = v; st.set(S); P.render(); }, 'Késtípus');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.95 : 0.5; }, minH: 280, maxH: 400, label: 'Munkadarab- és szerszámprofil' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Homlokszög γ', min: 0, max: 25, step: 1, value: S.g, unit: '°', dec: 0, onInput: function (v) { S.g = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Hátszög α', min: 0, max: 15, step: 1, value: S.a, unit: '°', dec: 0, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Körkés sugara R', min: 20, max: 50, step: 1, value: S.R, unit: 'mm', dec: 0, onInput: function (v) { S.R = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var pr = AK_PROF[S.pr].p, L = pr[pr.length - 1][0], rmin = Infinity, rmax = 0, o = '';
        pr.forEach(function (q) { rmin = Math.min(rmin, q[1]); rmax = Math.max(rmax, q[1]); });
        var gmax = rmax - rmin, x0 = 40, x1 = w - 20, sx = U.scale(0, L, x0, x1), hh = (h - 50) / 2, sy1 = U.scale(0, gmax * 1.25, 30 + hh * 0.9, 30), sy2 = U.scale(0, gmax * 1.25, h - 20, h - 20 - hh * 0.9);
        o += '<text class="lb" x="' + x0 + '" y="18">Munkadarab (D–D): profilmélység g<tspan style="font-size:9px">i</tspan> = r<tspan style="font-size:9px">i</tspan> − r<tspan style="font-size:9px">min</tspan></text>';
        o += '<path d="M' + x0 + ',' + sy1(0) + U.path(pr.map(function (q) { return [sx(q[0]), sy1(q[1] - rmin)]; })).replace('M', 'L') + 'L' + x1 + ',' + sy1(0) + 'Z" style="fill:var(--ix-8);fill-opacity:.25;stroke:var(--ink);stroke-width:1.6"/>';
        o += '<text class="lb" x="' + x0 + '" y="' + (h - 24 - hh * 0.95) + '">Szerszám (N–N): ' + (S.typ === 'h' ? 'profilmélység P<tspan style="font-size:9px">i</tspan>' : 'R − R<tspan style="font-size:9px">i</tspan>') + '</text>';
        // sűrű mintavétel, hogy a kúpos szakasz torzult (görbe) szerszámprofilja is látsszon
        var dense = [];
        pr.forEach(function (q, i) { if (!i) { dense.push(q); return; } var p0 = pr[i - 1]; for (var k = 1; k <= 24; k++) dense.push([p0[0] + (q[0] - p0[0]) * k / 24, p0[1] + (q[1] - p0[1]) * k / 24]); });
        var tp = dense.map(function (q) { var c = akCalc(q[1], S); return [sx(q[0]), sy2(S.typ === 'h' ? c.P : c.Rk)]; });
        o += '<path d="' + U.path(pr.map(function (q) { return [sx(q[0]), sy2(q[1] - rmin)]; })) + '" style="fill:none;stroke:var(--muted);stroke-width:1.4;stroke-dasharray:5 4"/>';
        o += '<path d="M' + x0 + ',' + sy2(0) + U.path(tp).replace('M', 'L') + 'L' + x1 + ',' + sy2(0) + 'Z" style="fill:var(--acc);fill-opacity:.22;stroke:var(--acc);stroke-width:2"/>';
        P.svg.innerHTML = o;
        var seen = {}, rows = [];
        pr.forEach(function (q) { var k = q[1].toFixed(2); if (seen[k]) return; seen[k] = 1; rows.push(q[1]); });
        rows.sort(function (a, b) { return a - b; });
        var mx = 0;
        var tbl = rows.map(function (r) { var c = akCalc(r, S), v = S.typ === 'h' ? c.P : c.Rk; mx = Math.max(mx, Math.abs(c.t - v)); return '<tr><td>' + fmt(r, 2) + '</td><td>' + fmt(c.t, 3) + '</td><td>' + fmt(c.gi, 2) + '°</td><td>' + fmt(c.C, 3) + '</td><td><b>' + fmt(v, 3) + '</b></td></tr>'; }).join('');
        out.innerHTML = '<h4><small>' + (S.typ === 'h' ? 'Hasábos radiális kés' : 'Körkés') + '</small>Legnagyobb eltérés a munkadarab-profiltól: ' + fmt(mx, 3) + ' mm</h4><p>' + (S.typ === 'h' ? '' : 'Középpont-emelés h = R·sin α = ' + fmt(S.R * Math.sin(S.a * RAD), 2) + ' mm · ') + 'H<sub>p</sub> = r<sub>min</sub>·sin γ = ' + fmt(rmin * Math.sin(S.g * RAD), 3) + ' mm</p>' +
          '<table class="ix-tbl"><thead><tr><th>r<sub>i</sub></th><th>g<sub>i</sub></th><th>γ<sub>i</sub></th><th>C<sub>i</sub></th><th>' + (S.typ === 'h' ? 'P<sub>i</sub>' : 'R − R<sub>i</sub>') + '</th></tr></thead><tbody>' + tbl + '</tbody></table>' +
          '<p class="ix-note">γ = 0-nál C<sub>i</sub> = g<sub>i</sub>, csak az elsődleges (hátszög okozta) torzulás marad: P<sub>i</sub> = g<sub>i</sub>·cos α. γ &gt; 0 esetén a homlokszög a nagyobb sugaraknál kisebb (γ<sub>i</sub> &lt; γ) — ez a másodlagos torzulás. Hasábkésnél a homlokfelületet γ<sub>v</sub> = γ + α = ' + (S.g + S.a) + '° szögre köszörüljük.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/10 — tangenciális kés: az élszögek változása                       */
  /* ================================================================== */
  AVIX.def('tangkes', {
    title: 'Tangenciális alakos kés: változó élszögek',
    sub: 'αA = αu + ξA, γA = γu − ξA, cos ξA = 1 − 2g/d — radiális késnél a szögek állandók',
    mount: function (el) {
      var st = U.store('tangkes', { d: 30, g: 2, au: 6, gu: 12, u: 0 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A tangenciális kés csúcsa a <b>legkisebb átmérőhöz húzott érintő</b> mentén halad: az A pontban (külső átmérő) kezd, a B érintési pontban fejez be. Közben a csúcshoz tartozó sugár iránya ξ szöggel elfordul, ezért a működő hát- és homlokszög folyamatosan változik.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1 : 0.5; }, minH: 300, maxH: 400, label: 'Tangenciális kés mozgása' });
      var gs = U.sliders(el);
      U.slider(gs, { label: 'Kés helyzete', min: 0, max: 100, step: 1, value: S.u, unit: '%', dec: 0, onInput: function (v) { S.u = v; st.set(S); P.render(); } });
      U.slider(gs, { label: 'Átmérő d', min: 10, max: 60, step: 1, value: S.d, unit: 'mm', dec: 0, onInput: function (v) { S.d = v; st.set(S); P.render(); } });
      U.slider(gs, { label: 'Profilmélység g', min: 0.5, max: 12, step: 0.5, value: S.g, unit: 'mm', dec: 1, onInput: function (v) { S.g = v; st.set(S); P.render(); } });
      U.slider(gs, { label: 'αu (végpontban)', min: 2, max: 12, step: 1, value: S.au, unit: '°', dec: 0, onInput: function (v) { S.au = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var R = S.d / 2, g = Math.min(S.g, R - 1), rm = R - g, xiA = Math.acos(U.clamp(1 - 2 * g / S.d, -1, 1)), tA = Math.sqrt(R * R - rm * rm);
        var t = tA * (1 - S.u / 100), xi = Math.atan2(t, rm), narrow = w < 520, o = '';
        var cw = narrow ? w : w * 0.5, ch = narrow ? h * 0.55 : h, sc = Math.min(cw, ch) * 0.4 / R, cx = cw * 0.45, cy = ch * 0.55;
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * sc).toFixed(1) + '" style="fill:var(--ix-8);fill-opacity:.2;stroke:var(--ink);stroke-width:1.4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (rm * sc).toFixed(1) + '" style="fill:none;stroke:var(--ink);stroke-dasharray:5 4"/>';
        // érintő: x = rm (függőleges egyenes a középponttól jobbra), a kés felülről lefelé halad
        var X = cx + rm * sc;
        o += '<line x1="' + X.toFixed(1) + '" x2="' + X.toFixed(1) + '" y1="' + (cy - R * sc * 1.2).toFixed(1) + '" y2="' + (cy + 10).toFixed(1) + '" style="stroke:var(--acc);stroke-width:1.4;stroke-dasharray:6 3"/>';
        var ty = cy - t * sc;
        o += '<line x1="' + cx + '" y1="' + cy + '" x2="' + X.toFixed(1) + '" y2="' + ty.toFixed(1) + '" style="stroke:var(--ix-5);stroke-width:1.6"/><text class="lb" x="' + (cx + 10) + '" y="' + (cy - 6) + '" style="fill:var(--ix-5)">ξ</text>';
        o += '<path d="M' + X.toFixed(1) + ',' + ty.toFixed(1) + 'l14,-6 l0,-40 l-14,0 Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/>';
        o += '<circle cx="' + X.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="3.5" style="fill:var(--ix-5)"/><text class="tk" x="' + (X + 18).toFixed(1) + '" y="' + (cy - tA * sc).toFixed(1) + '">A</text><text class="tk" x="' + (X + 18).toFixed(1) + '" y="' + (cy + 4) + '">B</text>';
        // diagram
        var x0 = narrow ? 44 : w * 0.56, x1 = w - 12, y0 = narrow ? h * 0.6 : 20, y1 = h - 36, sx = U.scale(0, 100, x0, x1), vmax = Math.max(S.au + xiA * DEG, S.gu) + 4, vmin = Math.min(S.gu - xiA * DEG, 0) - 2, sy = U.scale(vmin, vmax, y1, y0);
        o += U.axes({ x0: x0, x1: x1, y0: y0, y1: y1, sx: sx, sy: sy, xt: [0, 50, 100], yt: [Math.round(vmin), 0, Math.round(vmax / 2), Math.round(vmax)], xl: 'A → B, %', yl: '°' });
        var pa = [], pg = [];
        for (var q = 0; q <= 100; q += 2) { var tt = tA * (1 - q / 100), x2 = Math.atan2(tt, rm) * DEG; pa.push([sx(q), sy(S.au + x2)]); pg.push([sx(q), sy(S.gu - x2)]); }
        o += '<path d="' + U.path(pa) + '" style="fill:none;stroke:var(--ix-5);stroke-width:2"/><path d="' + U.path(pg) + '" style="fill:none;stroke:var(--ix-2);stroke-width:2"/>';
        o += '<text class="sm" x="' + (x0 + 6) + '" y="' + (sy(S.au + xiA * DEG) - 6).toFixed(1) + '" style="fill:var(--ix-5);font-weight:700">α</text><text class="sm" x="' + (x0 + 6) + '" y="' + (sy(S.gu - xiA * DEG) + 14).toFixed(1) + '" style="fill:var(--ix-2);font-weight:700">γ</text>';
        o += '<line x1="' + sx(S.u).toFixed(1) + '" x2="' + sx(S.u).toFixed(1) + '" y1="' + y0 + '" y2="' + y1 + '" style="stroke:var(--ink)"/>';
        P.svg.innerHTML = o;
        var gam = S.gu - xi * DEG;
        out.innerHTML = '<h4><small>cos ξ<sub>A</sub> = 1 − 2g/d = ' + fmt(1 - 2 * g / S.d, 3) + ' → ξ<sub>A</sub> = ' + fmt(xiA * DEG, 1) + '°</small>Most: ξ = ' + fmt(xi * DEG, 1) + '°, α = ' + fmt(S.au + xi * DEG, 1) + '°, γ = ' + fmt(gam, 1) + '°</h4>' +
          (S.gu - xiA * DEG < 0 ? '<p class="ix-hint" style="border-left-color:var(--ix-5)"><b>Negatív homlokszög a kezdésnél.</b> A mély profil miatt ξ<sub>A</sub> nagyobb a homlokszögnél — a jegyzet szerint tangenciális kést nagy mélységű profilhoz nem szabad használni.</p>' : '<p>Az A pontban a hátszög a legnagyobb, a homlokszög a legkisebb; a B végpontban visszaáll α<sub>u</sub>-ra és γ<sub>u</sub>-ra.</p>');
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/11 — hátraesztergált maró: archimedesi spirális hátfelület        */
  /* ================================================================== */
  AVIX.def('hatraeszt', {
    title: 'Hátraesztergált maró: állandó profil újraélezés után',
    sub: 'he = (πD/z)·tg α; profiloldalon tg αo,pr = (D/Dx)·tg αf,fej·sin κr',
    mount: function (el) {
      var st = U.store('hatraeszt', { D: 80, z: 10, a: 12, re: 0, kr: 30, dx: 90 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A fogak hátfelülete archimedesi spirális: a sugár egyenletesen csökken a szögelfordulással (r = a·φ). Ha a fogat a <b>homlokfelületén</b> élezzük újra, az új él a spirálon kisebb sugáron ül, de a profil (sugárirányú magasság) és a hátszög gyakorlatilag változatlan. <b>Húzd az újraélezés csúszkát.</b></p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.95 : 0.5; }, minH: 280, maxH: 400, label: 'A maró fogai' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Átmérő D', min: 40, max: 120, step: 5, value: S.D, unit: 'mm', dec: 0, onInput: function (v) { S.D = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Fogszám z', min: 6, max: 16, step: 1, value: S.z, dec: 0, onInput: function (v) { S.z = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Hátszög αf,fej', min: 6, max: 16, step: 1, value: S.a, unit: '°', dec: 0, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Újraélezés', min: 0, max: 60, step: 1, value: S.re, unit: '% fog', dec: 0, onInput: function (v) { S.re = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'κr profiloldal', min: 0, max: 90, step: 1, value: S.kr, unit: '°', dec: 0, onInput: function (v) { S.kr = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var R = S.D / 2, ph = 2 * Math.PI / S.z, t = Math.PI * S.D / S.z, he = t * Math.tan(S.a * RAD), hp = R * 0.24, land = 0.62;
        var cx = w / 2, cy = h / 2 + 10, sc = Math.min(w, h) * 0.44 / R, o = '';
        var sh = S.re / 100 * land * ph, body = '';
        for (var k = 0; k < S.z; k++) {
          var a0 = k * ph, orig = [], cut = [];
          for (var s = 0; s <= land * ph + 1e-9; s += ph / 40) { var r = R - he * s / ph; orig.push([cx + r * sc * Math.cos(a0 + s), cy - r * sc * Math.sin(a0 + s)]); if (s >= sh - 1e-9) cut.push([cx + r * sc * Math.cos(a0 + s), cy - r * sc * Math.sin(a0 + s)]); }
          var rf = (R - hp) * sc, ae = a0 + land * ph, an = a0 + ph;
          var poly = [[cx + rf * Math.cos(a0 + sh), cy - rf * Math.sin(a0 + sh)]].concat(cut).concat([[cx + (R - he * land - hp * 0.4) * sc * Math.cos(ae + ph * 0.1), cy - (R - he * land - hp * 0.4) * sc * Math.sin(ae + ph * 0.1)], [cx + rf * Math.cos(an - ph * 0.08), cy - rf * Math.sin(an - ph * 0.08)]]);
          body += '<path d="' + U.path(poly) + 'Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.3;stroke-linejoin:round"/>';
          if (sh > 0) body += '<path d="' + U.path([[cx + rf * Math.cos(a0), cy - rf * Math.sin(a0)]].concat(orig.slice(0, orig.length - cut.length + 1)).concat([[cx + rf * Math.cos(a0 + sh), cy - rf * Math.sin(a0 + sh)]])) + 'Z" style="fill:var(--ix-5);fill-opacity:.25;stroke:var(--ix-5);stroke-width:1;stroke-dasharray:3 2"/>';
        }
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + ((R - hp) * sc).toFixed(1) + '" style="fill:var(--surface-2);stroke:var(--ink);stroke-width:1"/>' + body;
        o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * sc).toFixed(1) + '" style="fill:none;stroke:var(--muted);stroke-dasharray:4 4"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (R * 0.28 * sc).toFixed(1) + '" style="fill:var(--surface-2);stroke:var(--ink)"/>';
        o += '<text class="tk" x="' + (cx + R * sc + 4).toFixed(1) + '" y="' + (cy - 4) + '">D</text>';
        P.svg.innerHTML = o;
        var apr = Math.atan((S.D / (S.D * S.dx / 100)) * Math.tan(S.a * RAD) * Math.sin(S.kr * RAD)) * DEG, Dnew = S.D - 2 * he * sh / ph;
        out.innerHTML = '<h4><small>t = πD/z = ' + fmt(t, 2) + ' mm</small>h<sub>e</sub> = t · tg α = ' + fmt(he, 2) + ' mm</h4>' +
          U.kv([['Újraélezés után az átmérő', fmt(Dnew, 2) + ' mm', 'a profil sugárirányú magassága és a hátszög változatlan (archimedesi spirál)'], ['Hátszög a profiloldalon (κr = ' + S.kr + '°)', fmt(apr, 2) + '°', apr < 3 ? '<b style="color:var(--ix-5)">túl kicsi — ezen a szakaszon tengely- vagy ferde irányú hátraesztergálás kell</b>' : 'megfelelő (sugárirányú hátraesztergálásnál)']]) +
          '<p class="ix-note">Szabályok: mindig a homlokfelületen élezünk, az eredeti homlokszöggel, pontos osztással, minden fogról azonos réteget. A jegyzet szerint a hátraesztergáló kés fejél-homlokszöge γ<sub>f</sub> = 0°, így minden profilpont archimedesi spirálist ír le.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/11 — üregelő szerszám méretezése                                   */
  /* ================================================================== */
  AVIX.def('uregelo', {
    title: 'Üregelő szerszám méretezése',
    sub: 'Forgácstér A0 = πH²/4 ≥ K·L·fz → fogmagasság, osztás, kapcsolási szám, fogszámok, hossz',
    mount: function (el) {
      var st = U.store('uregelo', { d0: 24, D: 25, L: 40, fz: 0.04, K: 3, v: 'A' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Hengeres furat üregelése: a ráhagyást a fogak lépcsőzése (fogankénti emelkedés, f<sub>z</sub>) választja le. A legfontosabb feltétel, hogy a teljes L hosszon leválasztott forgács <b>elférjen a zárt forgácstérben</b>. Állítsd a furat adatait.</p>';
      var r = U.h('div', 'ix-row'); el.appendChild(r);
      U.seg(r, [['A', 'A fogprofil'], ['B', 'B fogprofil']], S.v, function (v) { S.v = v; st.set(S); P.render(); }, 'Fogprofil');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.75 : 0.4; }, minH: 230, maxH: 340, label: 'Üregelő szerszám vázlata' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Előfurat d0', min: 10, max: 60, step: 0.5, value: S.d0, unit: 'mm', dec: 1, onInput: function (v) { S.d0 = v; if (S.D <= v) S.D = v + 0.2; st.set(S); P.render(); } });
      U.slider(g, { label: 'Kész átmérő D', min: 10.2, max: 62, step: 0.1, value: S.D, unit: 'mm', dec: 1, onInput: function (v) { S.D = Math.max(v, S.d0 + 0.1); st.set(S); P.render(); } });
      U.slider(g, { label: 'Üregelt hossz L', min: 10, max: 100, step: 1, value: S.L, unit: 'mm', dec: 0, onInput: function (v) { S.L = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Emelkedés fz', min: 0.01, max: 0.12, step: 0.005, value: S.fz, unit: 'mm/fog', dec: 3, onInput: function (v) { S.fz = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Forgácstérfogati K', min: 1.5, max: 6, step: 0.5, value: S.K, dec: 1, onInput: function (v) { S.K = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var A = (S.D - S.d0) / 2, Ar = S.K * S.L * S.fz, H = Math.ceil(Math.sqrt(4 * Ar / Math.PI) * 10) / 10, t = (S.v === 'A' ? 2.75 : 3) * H;
        var ze = Math.floor(S.L / t) + 1, zt = 3, rest = Math.max(0, A - 1.3 * S.fz), zn = Math.max(1, Math.ceil(rest / S.fz)), zk = 5;
        var tk = 0.7 * t, lw = (1 + zn + zt) * t + zk * tk, total = lw + 70 + 40 + S.L * 0.8;
        var sx = U.scale(0, total, 10, w - 10), y = h * 0.42, rr = Math.min(h * 0.18, 40), o = '';
        var parts = [['befogó', 0, 70, 0.55], ['vezető', 70, 110, 0.85]], x = 110;
        parts.push(['forgácsoló (' + (1 + zn) + ')', x, x + (1 + zn) * t, 1]); x += (1 + zn) * t;
        parts.push(['tisztító (3)', x, x + zt * t, 1]); x += zt * t;
        parts.push(['kalibráló (' + zk + ')', x, x + zk * tk, 1]); x += zk * tk;
        parts.push(['hátsó vezető', x, x + S.L * 0.8, 0.85]);
        var cols = ['var(--ix-8)', 'var(--ix-4)', 'var(--ix-5)', 'var(--ix-1)', 'var(--ix-3)', 'var(--ix-4)'];
        parts.forEach(function (p, i) {
          var hgt = rr * p[3];
          o += '<rect x="' + sx(p[1]).toFixed(1) + '" y="' + (y - hgt).toFixed(1) + '" width="' + Math.max(1, sx(p[2]) - sx(p[1])).toFixed(1) + '" height="' + (2 * hgt).toFixed(1) + '" style="fill:' + cols[i] + ';fill-opacity:.25;stroke:var(--ink);stroke-width:1"/>';
          if (sx(p[2]) - sx(p[1]) > 44 || i >= 2) o += '<text class="tk" x="' + U.clamp((sx(p[1]) + sx(p[2])) / 2, p[0].length * 3.3 + 4, w - p[0].length * 3.3 - 4).toFixed(1) + '" y="' + (y + rr + 14 + (i % 2) * 12).toFixed(1) + '" text-anchor="middle">' + p[0] + '</text>';
        });
        // fogak a forgácsoló részen: lépcsőzés jelzése
        var nT = Math.min(zn + 1, 40);
        for (var i = 0; i < nT; i++) { var xx = sx(110 + i * (1 + zn) * t / nT); o += '<line x1="' + xx.toFixed(1) + '" x2="' + xx.toFixed(1) + '" y1="' + (y - rr).toFixed(1) + '" y2="' + (y - rr * (0.8 - 0.2 * i / nT)).toFixed(1) + '" style="stroke:var(--ink);stroke-width:1"/>'; }
        // fogárok nagyítva
        var zx = w - Math.min(w * 0.36, 180), zy = h - 16, zs = Math.min(w * 0.3, 150) / t;
        var tooth = [[0, 0], [0, -H], [0.35 * t, -H], [t, 0]];
        o += '<path d="M' + tooth.map(function (p) { return (zx + p[0] * zs).toFixed(1) + ',' + (zy + p[1] * zs).toFixed(1); }).join('L') + '" style="fill:none;stroke:var(--ink);stroke-width:1.5"/>';
        o += '<circle cx="' + (zx + 0.55 * t * zs).toFixed(1) + '" cy="' + (zy - H * 0.5 * zs).toFixed(1) + '" r="' + (Math.sqrt(Ar / Math.PI) * zs).toFixed(1) + '" style="fill:var(--acc);fill-opacity:.35;stroke:var(--acc)"/>';
        o += '<text class="tk" text-anchor="end" x="' + (w - 8) + '" y="' + (zy - H * zs - 6).toFixed(1) + '">fogárok ×' + fmt(zs, 0) + ' · kör = A<tspan style="font-size:8px">r</tspan></text>';
        P.svg.innerHTML = o;
        var A0 = Math.PI * H * H / 4;
        out.innerHTML = '<h4><small>ráhagyás A = (D − d<sub>0</sub>)/2 = ' + fmt(A, 2) + ' mm · A<sub>r</sub> = K·L·f<sub>z</sub> = ' + fmt(Ar, 2) + ' mm²</small>Fogmagasság H = ' + fmt(H, 1) + ' mm, osztás t = ' + fmt(t, 2) + ' mm</h4>' +
          U.kv([['Forgácstér', 'A<sub>0</sub> = πH²/4 = ' + fmt(A0, 2) + ' mm² ≥ ' + fmt(Ar, 2) + ' mm²', 'ha kisebb lenne: forgácsbeszorulás, szerszámtörés'], ['Egyszerre dolgozó fogak', ze + ' db', ze < 2 ? '<b style="color:var(--ix-5)">kevés — a szerszám nem vezetett, rezeg; rövidebb osztás vagy hosszabb darab kell</b>' : 'legalább 2–3 fog legyen fogásban'], ['Fogszámok', (1 + zn) + ' forgácsoló + 3 tisztító + ' + zk + ' kalibráló', 'tisztító fogak: 0,7 / 0,4 / 0,2 · f<sub>z</sub>; kalibráló: f<sub>z</sub> = 0'], ['Dolgozó rész hossza', fmt(lw, 0) + ' mm', 'plusz befogó, vezető, hátsó vezető rész']]) +
          '<p class="ix-note">Egyenlőtlen fogosztás a rezgés ellen: t ± Δt (t &lt; 10 mm: Δt = 0,2…0,8 mm). A számpélda szemléltető; a forgácstérfogati tényező anyagfüggő, értékét táblázatból kell venni.</p>';
      };
      P.render();
    },
  });
})();
