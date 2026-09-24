/*
 * Gépész záróvizsga tételtár — interaktív ábrák az anyagismereti tételekhez (A/01–A/05)
 * Értékek: a tételtár kidolgozásai és a tanszéki Anyagismeret jegyzet (Szigeti F.).
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, esc = U.esc, fmt = U.fmt;

  /* ================================================================== */
  /* A/01 — kérgesítő eljárások: keménységprofil + eljárásválasztó       */
  /* ================================================================== */
  // Vázlatos profil: HV(x) = mag + (felület − mag) / (1 + (x/d)^6)
  var KP = [
    { k: 'lang', n: 'Lángedzés', c: '--ix-1', hv: [600, 700], core: 270, d: [1.5, 5],
      rows: [['Elv', 'gázlángos (C₂H₂) felületi hevítés Ac3 fölé, azonnali vízhűtés; a felületegységre jutó teljesítmény ~1/10-e az indukciósnak'],
        ['Kéreg', '1,5–5 (6) mm — 1,5 mm alá nem vihető, pontosan nem szabályozható'],
        ['Anyag', 'edzhető, nemesített acél (C > 0,3%): 41CrMo4, 38Cr4, Cf35'],
        ['Utókezelés', 'megeresztés 150–200 °C'],
        ['Mikor?', 'nagy méret, kis darabszám, az össz-felülethez képest kicsi edzendő felület: nagy fogas- és lánckerék, szánvezeték, csúszólap']] },
    { k: 'ind', n: 'Indukciós edzés', c: '--ix-2', hv: [600, 700], core: 270, d: [0.2, 3],
      rows: [['Elv', 'örvényáram és hiszterézisveszteség az induktorban; hevítés 8–10 s, hőntartás nincs, vízhűtés'],
        ['Kéreg', 'középfrekvencia 2,5–10 kHz → 2–3 mm; nagyfrekvencia 400–500 kHz → 0,2–2 mm (szkinhatás: f ↑ → kéreg ↓)'],
        ['Anyag', 'nemesíthető szerkezeti acél (C > 0,35%): 41CrMo4, 38Cr4, Cf35'],
        ['Utókezelés', 'megeresztés 150–200 °C (gyakran szintén induktorban)'],
        ['Mikor?', 'tömeggyártás, pontos kéregmélység: fogaskerék, csap, forgattyús csap, vezetőléc; impulzusedzés (27 MHz, 2–4 ms): fűrészfog, vágóél']] },
    { k: 'lez', n: 'Lézeredzés', c: '--ix-4', hv: [620, 750], core: 270, d: [0.1, 1.5],
      rows: [['Elv', 'nagy energiasűrűségű sugár; a hideg mag hővezetése edz (önedződés), külön hűtőközeg nem kell'],
        ['Kéreg', '0,1–1,5 mm, átfedéssel vagy folyamatos pályán'],
        ['Anyag', 'edzhető acél; a felületet sötét, hőálló abszorpciós réteggel vonják be (cinkfoszfát, MoS₂: ~90%)'],
        ['Előny', 'tiszta, pontos, furat és horony is edzhető, kicsi a vetemedés'],
        ['Korlát', 'jelentős beruházás; elektronsugárral ugyanez vákuumban']] },
    { k: 'betet', n: 'Betétedzés', c: '--ix-3', hv: [850, 900], core: 380, d: [0.1, 2],
      rows: [['Elv', 'cementálás (C-dúsítás 0,6–1,1%-ra, opt. 0,8%) 830–960 °C-on, 8–24 h, majd edzés + megeresztés 150–200 °C'],
        ['Kéreg', '0,1–2 mm (más forrás: 0,1–3 mm); szilárd közegben ~0,1–0,15 mm/óra'],
        ['Anyag', 'betétben edzhető acél, C < 0,2%: C10, C15, 16MnCr5'],
        ['Változatok', 'A. közvetlen · B. kéregedzés · C. magedzés · D. kettős edzés (magfinomítás + lágyítás 650–700 °C + kéregedzés)'],
        ['Mikor?', 'nagy felületi nyomás és ütés: hajtómű-fogaskerék, tengely, csap — utána rendszerint köszörülni kell']] },
    { k: 'nitr', n: 'Nitridálás', c: '--ix-6', hv: [1000, 1200], core: 300, d: [0.3, 0.5],
      rows: [['Elv', 'gáznitrálás ammóniában, 500–550 °C, 48–96 h (2NH₃ → 3H₂ + 2N); ötvözőnitridek adják a keménységet'],
        ['Kéreg', '0,3–0,5 mm (48 óra → ~0,5 mm); ~1150 HV, kb. 30%-kal keményebb a betétedzettnél'],
        ['Anyag', 'nitridképzőkkel (Al, Cr, Mo, V) ötvözött nemesíthető acél, C = 0,25–0,4%'],
        ['Előny', 'nincs utólagos edzés, nem vetemedik (~0,02 mm dagadás), keménység 500 °C-ig megmarad, korrózióvédelem'],
        ['Előtte', 'nemesítés, készre munkálás, tisztítás, zsírtalanítás']] },
    { k: 'krom', n: 'Kromálás', c: '--ix-5', hv: [1200, 1350], core: 250, d: [0.03, 0.1],
      rows: [['Elv', 'Cr-diffúzió CrCl₂-gázban vagy más Cr-leadó közegben, 8–15 h hőntartás'],
        ['Kéreg', '≤ 0,1 mm; 250–1350 HV az alapacél C-tartalmától függően (az ábra a nagy C-tartalmú esetet mutatja)'],
        ['Anyag', 'kis C-tartalmú acél → korrózió- és hőálló kéreg (25–60% Cr: saválló acél kiváltása); nagy C → krómkarbidok, kopásálló (forgácsoló szerszám)'],
        ['Rokonai', 'alitálás (Al, 850–1100 °C, hőállóság: égők, kazáncsövek), szilikálás (Si, sav- és hőállóság)']] },
  ];
  function prof(p, x, d) { return p.core + ((p.hv[0] + p.hv[1]) / 2 - p.core) / (1 + Math.pow(x / d, 6)); }

  var KQ = [
    { q: 'Ø800 mm-es lánckerék fogai, néhány darab, C45 acél. Melyik felületkeményítés?', opts: ['Lángedzés', 'Indukciós edzés', 'Nitridálás', 'Betétedzés'], a: 0,
      why: 'Nagy méret, kis darabszám: a lángedzés berendezése olcsó és a darabhoz igazítható; 1,5–5 mm-es kéreg elég, a C45 eleve edzhető.' },
    { q: 'Vezérműtengely-bütykök, évi 200 000 db, 42CrMo4, pontosan tartandó kéregmélység.', opts: ['Indukciós edzés', 'Lángedzés', 'Cementálás edzés nélkül', 'Kromálás'], a: 0,
      why: 'Tömeggyártás, pontos és automatizálható kéreg: indukciós edzés; a drága berendezés a nagy darabszámnál térül meg.' },
    { q: 'Hajtómű-fogaskerék, nagy felületi nyomás és ütés, kis C-tartalmú (≈ 0,16%) ötvözött acél.', opts: ['Betétedzés', 'Indukciós edzés', 'Lágynitrálás', 'Alitálás'], a: 0,
      why: 'Kis C-tartalmú acél közvetlenül nem edzhető keményre — előbb szenet kell bevinni (cementálás), majd edzeni: vastag kemény kéreg + szívós mag.' },
    { q: 'Szerszám csúszófelülete: 0,01 mm-es mérettartás, üzem közben ~400 °C-on is kopik.', opts: ['Nitridálás', 'Betétedzés', 'Lángedzés', 'Közönséges edzés'], a: 0,
      why: 'Nitridálás után nem kell edzeni, a darab csak ~0,02 mm-t dagad, és a nitridek keménysége 500 °C-ig megmarad.' },
    { q: 'Ötvözetlen acélalkatrész: nem a nagy keménység, hanem a kifáradási határ és az ütésállóság a cél.', opts: ['Lágynitrálás', 'Keménynitrálás', 'Kromálás', 'Lézeredzés'], a: 0,
      why: 'A lágynitrálás vasnitrideket hoz létre (ciánsófürdő, 520–570 °C, 2–5 h): ötvözetlen acélon is működik, növeli a szívósságot és a kifáradási határt. A keménynitráláshoz nitridképző ötvözők kellenének.' },
    { q: 'Olaj- és gázégő alkatrésze: magas hőmérsékleten se reveljen (ötvözetlen acél).', opts: ['Alitálás', 'Szilikálás', 'Betétedzés', 'Indukciós edzés'], a: 0,
      why: 'Az alitálás Al-mal dúsítja a felületet (850–1100 °C): C-mentes Al-ferrit és Al₂O₃-hártya képződik — hőállóságot ad.' },
    { q: 'Kis C-tartalmú acél kérge legyen sav- és korrózióálló, drága saválló acél helyett.', opts: ['Kromálás', 'Nitrocementálás', 'Lángedzés', 'Bemártó edzés'], a: 0,
      why: 'A 25–60% Cr-tartalmú kromált kéreg savaknak is jól ellenáll, így erősen ötvözött saválló acél kiváltható.' },
    { q: 'Nagy értékű darab furatának helyi edzése, minimális vetemedéssel, külön hűtőközeg nélkül.', opts: ['Lézeredzés', 'Lángedzés', 'Betétedzés', 'Közönséges edzés'], a: 0,
      why: 'A lézersugár irányítható (furat, horony is), a hideg mag önedződéssel hűt — nem kell hűtőközeg, kicsi a deformáció.' },
    { q: 'Golyó, kúp, térgörbe felületű kis alkatrész felületi edzése.', opts: ['Bemártó (fürdős) edzés', 'Lángedzés', 'Indukciós edzés', 'Kromálás'], a: 0,
      why: 'A só- vagy fémfürdőbe mártásnál (fürdő ≥ Ac3 + 100 °C) az alkalmazhatóságot nem korlátozza a darab alakja.' },
    { q: 'Szalagfűrész fogainak helyi edzése úgy, hogy a lap ne vetemedjen.', opts: ['Impulzusedzés', 'Lángedzés', 'Nitridálás', 'Betétedzés kettős edzéssel'], a: 0,
      why: 'Az impulzusedzés nagy fajlagos teljesítményű indukciós edzés (27 MHz, 2–4 ms, levegőhűtés): a hevített térfogat kicsi, ezért nem vetemedik.' },
    { q: 'Cementált, nagy igénybevételű fogaskerék: a mag és a kéreg is legyen finomszemcsés.', opts: ['Kettős edzés', 'Közvetlen edzés', 'Kéregedzés', 'Magedzés'], a: 0,
      why: 'Kettős edzés: magfinomítás, lágyítás 650–700 °C-on, majd kéregedzés és megeresztés — így mindkét zóna finom szövetű.' },
    { q: 'Olcsó, kis igénybevételű cementált csap — melyik edzési változat elég?', opts: ['Közvetlen edzés a cementálás hőmérsékletéről', 'Kettős edzés', 'Magedzés', 'Nitridálás'], a: 0,
      why: 'A közvetlen edzés gazdaságos és egyszerű; a kéreg és a mag durvaszemcsés marad, ezért csak kis igénybevételhez jó.' },
  ];

  AVIX.def('kereg', {
    title: 'Kérgesítő eljárások összevetése',
    sub: 'Keménységprofil a mélység függvényében · eljárásválasztó gyakorló',
    mount: function (el) {
      var st = U.store('kereg', { sel: 'betet' });
      var S = { sel: st.get().sel || 'betet', x: 0.5 };
      el.innerHTML = '<p class="ix-lead">Hogyan fut le a keménység a felülettől befelé? A görbék <b>vázlatosak</b>: a sávok a jegyzetben megadott kéregvastagság-tartományt, a szintek a jellemző felületi és magkeménységet mutatják. <b>Húzd az ujjad az ábrán</b> egy adott mélységhez, vagy válassz eljárást.</p>';
      var chips = U.chips(el, KP.map(function (p) {
        return [p.k, '<i style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:var(' + p.c + ')"></i>' + p.n];
      }).concat([['all', 'Mind']]), S.sel, function (v) { S.sel = v; st.set({ sel: v }); draw(); card(); }, 'Eljárás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.95 : 0.6; }, minH: 280, maxH: 460, label: 'Keménység–mélység görbék' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      U.quiz(el, KQ, { title: 'Gyakorlás: melyik eljárást választanád?', intro: 'Rövid gyakorlati esetek — minden válasz után megjelenik az indoklás a jegyzet alapján.' });

      var sx, sy, M = { l: 46, r: 14, t: 16, b: 40 };
      P.draw = function (w, h) {
        sx = U.scale(0.01, 10, M.l, w - M.r, true);
        sy = U.scale(0, 1400, h - M.b, M.t);
        draw();
      };
      function draw() {
        if (!sx) return;
        var w = P.w, h = P.h, o = '';
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, xt: [0.01, 0.03, 0.1, 0.3, 1, 3, 10], yt: [0, 200, 400, 600, 800, 1000, 1200, 1400],
          xgrid: true, xl: 'mélység a felülettől, mm (log)', yl: 'HV', xf: function (t) { return fmt(t); } });
        KP.forEach(function (p) {
          var on = S.sel === 'all' || S.sel === p.k;
          var op = on ? 1 : 0.14;
          var lo = [], hi = [], mid = [];
          for (var i = 0; i <= 120; i++) {
            var x = Math.pow(10, -2 + i * 3 / 120);
            lo.push([x, prof(p, x, p.d[0])]); hi.push([x, prof(p, x, p.d[1])]);
            mid.push([x, prof(p, x, Math.sqrt(p.d[0] * p.d[1]))]);
          }
          var band = U.path(lo.concat(hi.slice().reverse()), sx, sy) + 'Z';
          o += '<path d="' + band + '" style="fill:var(' + p.c + ');fill-opacity:' + (on ? 0.22 : 0.05) + '"/>';
          o += '<path class="ln" d="' + U.path(mid, sx, sy) + '" style="stroke:var(' + p.c + ');stroke-width:' + (S.sel === p.k ? 3 : 2) + ';opacity:' + op + '"/>';
          if (on) {
            var y = sy(prof(p, S.x, Math.sqrt(p.d[0] * p.d[1])));
            o += '<circle cx="' + sx(S.x).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5" style="fill:var(' + p.c + ');stroke:var(--surface-2);stroke-width:2"/>';
          }
        });
        var cx = sx(S.x).toFixed(1);
        o += '<line x1="' + cx + '" x2="' + cx + '" y1="' + M.t + '" y2="' + (h - M.b) + '" style="stroke:var(--acc);stroke-width:1.2;stroke-dasharray:4 3"/>';
        o += '<g><rect x="' + (+cx - 30) + '" y="' + (h - M.b + 3) + '" width="60" height="18" rx="4" style="fill:var(--acc)"/><text x="' + cx + '" y="' + (h - M.b + 15.5) + '" text-anchor="middle" style="fill:var(--surface);font-weight:600;font-family:var(--mono);font-size:11px">' + fmt(S.x, S.x < 0.1 ? 3 : S.x < 1 ? 2 : 1) + ' mm</text></g>';
        P.svg.innerHTML = o;
      }
      P.drag(function (x) { S.x = U.clamp(sx.inv(x), 0.01, 10); draw(); card(); });
      function card() {
        var list = S.sel === 'all' ? KP : KP.filter(function (p) { return p.k === S.sel; });
        var h = '';
        if (S.sel === 'all') {
          h = '<h4><small>' + fmt(S.x, S.x < 0.1 ? 3 : 2) + ' mm mélységben</small>Becsült keménység eljárásonként</h4><table class="ix-tbl"><tr><th>Eljárás</th><th>HV (vázlatos)</th><th>Kéreg</th></tr>' +
            list.map(function (p) {
              return '<tr><td><i style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:var(' + p.c + ')"></i>' + p.n + '</td><td><b>' + Math.round(prof(p, S.x, Math.sqrt(p.d[0] * p.d[1])) / 10) * 10 + '</b></td><td>' + fmt(p.d[0]) + '–' + fmt(p.d[1]) + ' mm</td></tr>';
            }).join('') + '</table>';
        } else {
          var p = list[0];
          var v = Math.round(prof(p, S.x, Math.sqrt(p.d[0] * p.d[1])) / 10) * 10;
          h = '<h4><small>' + fmt(S.x, S.x < 0.1 ? 3 : 2) + ' mm mélységben ≈ ' + v + ' HV</small>' + p.n + '</h4>' +
            U.kv(p.rows.map(function (r) { return [r[0], '', r[1]]; })).replace(/<b><\/b><small>/g, '<small style="margin:0;font-size:14px;color:var(--ink-2)">');
        }
        out.innerHTML = h + '<p class="ix-note">A görbe alakja szemléltető; a felületi és a magkeménység, valamint a kéregvastagság tartománya a jegyzet adata (láng/indukció/lézer: HRC 55–62 ≈ 600–750 HV).</p>';
      }
      P.render(); card();
    },
  });

  /* ================================================================== */
  /* A/02 — megeresztési görbék (jegyzet: 1 órás hőntartás után)         */
  /* ================================================================== */
  function curve(pts) {
    return function (t) {
      if (t <= pts[0][0]) return pts[0][1];
      for (var i = 1; i < pts.length; i++) if (t <= pts[i][0]) return U.lerp(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], t);
      return pts[pts.length - 1][1];
    };
  }
  var TEMPER = {
    meleg: {
      n: 'Melegalakító acélok és C40', ymax: 750, yt: [0, 100, 200, 300, 400, 500, 600, 700],
      s: [
        { n: 'X40CrMoV5-1 (K13)', c: '--ix-1', al: true, f: curve([[0, 650], [100, 648], [200, 630], [300, 613], [350, 612], [400, 620], [450, 633], [500, 652], [530, 660], [555, 655], [580, 632], [600, 595], [625, 525], [650, 445], [675, 365], [690, 310]]) },
        { n: 'X32CrMoV12-28 (K14)', c: '--ix-2', al: true, f: curve([[0, 615], [100, 612], [200, 607], [300, 602], [400, 600], [450, 602], [500, 604], [550, 590], [600, 545], [650, 430], [690, 320]]) },
        { n: 'C40 (ötvözetlen)', c: '--ix-8', al: false, f: curve([[0, 560], [100, 552], [150, 542], [200, 505], [250, 435], [300, 385], [350, 350], [400, 325], [450, 300], [500, 280], [550, 255], [600, 225], [650, 195], [700, 155]]) },
      ],
    },
    gyors: {
      n: 'Gyorsacélok és C100', ymax: 1300, yt: [0, 200, 400, 600, 800, 1000, 1200],
      s: [
        { n: 'HS2-9-1-8 (R11)', c: '--ix-5', al: true, f: curve([[0, 1150], [100, 1148], [150, 1140], [200, 1100], [250, 1035], [300, 1000], [350, 1010], [400, 1060], [450, 1120], [500, 1160], [530, 1162], [555, 1150], [580, 1110], [600, 1035], [625, 900], [650, 760], [675, 620], [690, 540]]) },
        { n: 'HS6-5-3', c: '--ix-4', al: true, f: curve([[0, 1050], [100, 1050], [150, 1040], [200, 985], [250, 925], [300, 900], [350, 912], [400, 950], [450, 1000], [500, 1040], [530, 1050], [555, 1040], [580, 1010], [600, 955], [625, 865], [650, 745], [700, 610]]) },
        { n: 'C100 (ötvözetlen)', c: '--ix-8', al: false, f: curve([[0, 980], [50, 975], [100, 950], [150, 890], [200, 800], [250, 720], [300, 650], [350, 590], [400, 540], [450, 500], [500, 460], [550, 420], [600, 380], [650, 320], [700, 240]]) },
      ],
    },
  };
  function temperNote(g, t) {
    if (t < 150) return 'Edzett állapot közelében: nagy keménység, de rideg és feszültséges martenzit — így nem használható.';
    if (t <= 250) return g === 'gyors'
      ? 'Ötvözetlen acélnál ez a feszültségmentesítés tartománya (180–240 °C). A gyorsacél itt még nem éri el a szekunder keményedést — ezt a hőmérsékletet nála nem használják.'
      : 'Ötvözetlen és gyengén ötvözött szerszámacélt itt eresztenek meg (180–240 °C feszültségmentesítés): a keménység alig csökken. Melegalakító acélhoz ez kevés — üzem közben tovább lágyulna.';
    if (t < 400) return 'Martenzitbomlás: az ötvözetlen acél keménysége rohamosan esik (250 °C fölött). Az erősen ötvözött acél is lágyul kissé — a keménységgörbe völgye itt van. Kalapácsot, fűrészfogat (szívósság kell) 400–450 °C-on eresztenek meg.';
    if (t < 480) return 'Az erősen ötvözött acél keménysége újra nő: kiválnak a finom, diszperz ötvözőkarbidok (VC, Mo₂C), és a maradék ausztenit is átalakul. Az ötvözetlen acél tovább lágyul — kalapács, fűrészfog megeresztése (400–450 °C).';
    if (t <= 575) return 'Szekunder keményedés — a csúcs kb. 500–550 °C-on. Gyorsacélt és erősen ötvözött melegalakító acélt itt eresztenek meg, 2–3-szor egymás után (a maradék ausztenit minden ciklusban tovább alakul). A melegalakító szerszám üzemi hőmérséklete ennél maradjon kisebb.';
    return 'Túlmegeresztés: a karbidok koagulálnak, a keménység meredeken esik — a szerszám kilágyul. Ezért a gyorsacél „csak” kb. 600 °C-ig tartja meg a keménységét.';
  }

  AVIX.def('megeresztes', {
    title: 'Megeresztési görbék',
    sub: 'Keménység a megeresztési hőmérséklet függvényében · szekunder keményedés',
    mount: function (el) {
      var st = U.store('megeresztes', { g: 'gyors', t: 540 });
      var S = st.get(); if (!TEMPER[S.g]) S.g = 'gyors';
      el.innerHTML = '<p class="ix-lead">A jegyzet két diagramja (1 órás hőntartás után): az ötvözetlen acél keménysége a megeresztéssel <b>monoton csökken</b>, az erősen ötvözötté előbb csökken, majd kb. 500–550 °C-on <b>újra nő</b> (szekunder keményedés). <b>Húzd az ujjad az ábrán</b> vagy a csúszkát.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['gyors', 'Gyorsacélok'], ['meleg', 'Melegalakító acélok']], S.g, function (v) { S.g = v; st.set(S); draw(); card(); }, 'Diagram');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.85 : 0.52; }, minH: 260, maxH: 420, label: 'Keménység–megeresztési hőmérséklet diagram' });
      var sl = U.sliders(el);
      var sT = U.slider(sl, { label: 'Megeresztés', min: 20, max: 700, step: 5, value: S.t, unit: '°C', dec: 0, onInput: function (v) { S.t = v; st.set(S); draw(); card(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var sx, sy, M = { l: 48, r: 14, t: 16, b: 38 };
      P.draw = function (w, h) { draw(); };
      function draw() {
        var w = P.w, h = P.h, D = TEMPER[S.g];
        if (!w) return;
        sx = U.scale(0, 700, M.l, w - M.r); sy = U.scale(0, D.ymax, h - M.b, M.t);
        var o = '';
        // sávok: feszültségmentesítés, szekunder keményedés
        o += '<rect x="' + sx(180) + '" y="' + M.t + '" width="' + (sx(240) - sx(180)) + '" height="' + (h - M.b - M.t) + '" style="fill:var(--ix-8);fill-opacity:.12"/>';
        o += '<rect x="' + sx(500) + '" y="' + M.t + '" width="' + (sx(560) - sx(500)) + '" height="' + (h - M.b - M.t) + '" style="fill:var(--acc);fill-opacity:.12"/>';
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, xt: [0, 100, 200, 300, 400, 500, 600, 700], yt: D.yt, xl: 'megeresztési hőmérséklet, °C', yl: 'HV' });
        o += '<text class="sm" x="' + (sx(210)) + '" y="' + (M.t + 12) + '" text-anchor="middle" style="fill:var(--muted)">180–240</text>';
        o += '<text class="sm la" x="' + (sx(530)) + '" y="' + (M.t + 12) + '" text-anchor="middle">szekunder</text>';
        D.s.forEach(function (c, i) {
          var pts = []; for (var t = 0; t <= 700; t += 5) pts.push([t, c.f(t)]);
          o += '<path class="ln" d="' + U.path(pts, sx, sy) + '" style="stroke:var(' + c.c + ');stroke-width:' + (c.al ? 2.6 : 2) + (c.al ? '' : ';stroke-dasharray:6 4') + '"/>';
        });
        var x = sx(S.t);
        o += '<line x1="' + x + '" x2="' + x + '" y1="' + M.t + '" y2="' + (h - M.b) + '" style="stroke:var(--acc);stroke-width:1.2;stroke-dasharray:4 3"/>';
        D.s.forEach(function (c) { o += '<circle cx="' + x + '" cy="' + sy(c.f(S.t)) + '" r="4.5" style="fill:var(' + c.c + ');stroke:var(--surface-2);stroke-width:2"/>'; });
        o += '<g><rect x="' + (x - 28) + '" y="' + (h - M.b + 3) + '" width="56" height="18" rx="4" style="fill:var(--acc)"/><text x="' + x + '" y="' + (h - M.b + 15.5) + '" text-anchor="middle" style="fill:var(--surface);font-weight:600;font-family:var(--mono);font-size:11px">' + Math.round(S.t) + ' °C</text></g>';
        P.svg.innerHTML = o;
      }
      P.drag(function (x) { S.t = Math.round(U.clamp(sx.inv(x), 20, 700) / 5) * 5; sT.set(S.t, true); st.set(S); draw(); card(); });
      function card() {
        var D = TEMPER[S.g];
        out.innerHTML = '<h4><small>' + Math.round(S.t) + ' °C, 1 óra</small>' + D.n + '</h4><table class="ix-tbl"><tr><th>Acél</th><th>HV</th></tr>' +
          D.s.map(function (c) { return '<tr><td><i style="display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:7px;vertical-align:4px;background:var(' + c.c + ')"></i>' + c.n + '</td><td><b>' + Math.round(c.f(S.t) / 5) * 5 + '</b></td></tr>'; }).join('') +
          '</table><p class="ix-hint">' + temperNote(S.g, S.t) + '</p><p class="ix-note">A görbék a jegyzet ábráiról leolvasott, közelítő értékek.</p>';
      }
      P.render(); card();
    },
  });

  /* ================================================================== */
  /* A/02 — szerszámacél-kereső (jegyzet táblázatai, MSZ EN ISO 4957)     */
  /* ================================================================== */
  // [EN jel, régi MSZ, lágyítás °C, edzés °C, átedzhető Ø olaj/levegő mm, megeresztett min. HV, lágyított max. HV]
  var SZA = {
    hideg: {
      n: 'Hidegalakító', d: 'Szobahőmérsékleten dolgozó, forgácsolás nélkül alakító szerszámok (húzás, hajlítás, kivágás, lyukasztás, zömítés). Martenzites alapszövetbe ágyazott kemény karbidok; edzés + 180–240 °C-os feszültségmentesítés.',
      r: [['90MnCrV8', 'M1', '720–760', '750–790', '60 / –', 850, 229, 'Mn-ötvözés: kicsi alakváltozás hőkezeléskor → tagolt, méretpontos szerszám: ollókés, kivágó-lyukasztó szerszám, idomszer.'],
        ['50WCrV8', '≈ W5', '740–760', '880–920', '30 / –', 620, 229, 'Cr-W, kisebb C: a C nagy része karbidban, lágy martenzit → igen szívós; ütésszerű terhelés: kalapács, vágó, lyukasztó.'],
        ['60WCrV8', 'W6', '760–780', '840–890', '40 / –', 660, 241, 'Cr-W, szívós — ütő igénybevételű szerszámok (kalapács, vágó, lyukasztó).'],
        ['95MnWCr5', '', '760–800', '800–840', '60 / –', 870, 241, 'Mn–W–Cr ötvözés, jó átedzhetőség, nagy keménység.'],
        ['102Cr6', 'K4', '760–800', '820–860', '30 / –', 870, 223, 'Cr-ötvözésű hipereutektoidos: finom Cr-karbid → köszörülés után kiváló felület: kés, penge, dörzsár; gördülőcsapágyacél is.'],
        ['105V', '', '770–800', '780–820', '– / –', 790, 223, 'V-ötvözésű, kis átedzhetőségű szerszámacél.'],
        ['X153CrMoV12', 'K8', '800–850', '1020–1050', '100 / 30', 850, 255, 'Ledeburitos (~25% Cr₇C₃-karbid): a karbidhálót melegalakítással össze kell törni; nagy teljesítményű kivágó, fejező, üregelő, mélyhúzó, menetmángorló szerszám.'],
        ['X210Cr12', 'K1', '–', '940–970', '100 / –', 800, 248, 'Ledeburitos Cr-acél: igen kopásálló, mélyen átedzhető.'],
        ['X210CrW12-1', '', '800–850', '1010–1030', '120 / 40', 870, 255, 'Ledeburitos Cr-W acél: kopásálló, mélyen átedzhető.']],
    },
    meleg: {
      n: 'Melegalakító', d: '200 °C fölött dolgozó szerszámok (kovács-, sajtoló-, nyomásos öntő-). Fe- és Mn-karbid itt koagulál, ezért stabilabb karbidképzők (Cr, Mo, V, W) kellenek; szívósság miatt C ≤ 0,6%; magas hőmérsékletű megeresztés (szekunder keményedés).',
      r: [['38CrCoWV18-17-17', 'W3', '780–850', '980–1080', '400 / 50', 500, 235, 'Cr-W-V típus: Cr- és W-karbidok miatt 600–650 °C-on is kemény; drága → szerszámbetét, rúd- és csősajtolás, melegsorjázás, zömítés, süllyesztékes kovácsolás.'],
        ['X30WCrV9-3', 'W2', '810–830', '1080–1150', '– / –', 510, 240, 'Cr-W-V típusú melegalakító acél.'],
        ['X35CrWMoV5-1', '', '850–880', '1000–1050', '– / –', 510, 229, 'Cr-W-Mo-V ötvözés.'],
        ['X32CrMoV12-28', 'K14', '710–750', '1010–1050', '– / –', 470, 229, 'Cr-Mo-V: a drágább Cr-W acélok kiváltására; szívós, hőfáradásálló, légedzésű.'],
        ['X40CrMoV5-1', 'K13', '800–840', '1000–1050', '200 / –', 550, 235, 'Cr-Mo-V, a legelterjedtebb melegalakító acél: igen szívós, termikus kifáradásnak ellenáll, légedzésű (mérsékelt alakváltozás); nyomásos öntőforma.'],
        ['50CrMoV13-15', '', '780–850', '1000–1050', '– / –', 570, 223, 'Cr-Mo-V ötvözés.'],
        ['X37CrMoV5-1', 'K12', '800–840', '1000–1050', '– / –', 560, 229, 'Cr-Mo-V ötvözés.'],
        ['X38CrMoV5-3', '', '850–880', '980–1020', '– / –', 480, 240, 'Cr-Mo-V ötvözés.'],
        ['55NiCrMoV7', 'NK2', '680–720', '830–870', '300 / 45', 460, 248, 'Ni-Cr: v_krit erősen csökken → átlagos méretben légedzésű; a legolcsóbb, nagy tömegű, tagolt kovács- és sajtolószerszám, T_üzemi < 300 °C.']],
    },
    gyors: {
      n: 'Gyorsacél (HSS)', d: 'Forgácsoló szerszámok; 600 °C-ig megtartják keménységüket. C = 0,7–1,4%, Cr 3,5–4,5%, W/Mo (egymást helyettesítik), V (VC, kiválásos keményedés), Co (keménység, hővezetés). Lépcsős hevítés, edzés 1140–1280 °C, többszöri megeresztés ~550 °C-on.',
      r: [['HS0-4-1', '', '750–780', '1180–1220', '', 760, null, ''],
        ['HS1-4-2', '', '760–790', '1180–1220', '', 780, null, ''],
        ['HS1-8-1', '', '790–820', '1180–1220', '', 800, null, ''],
        ['HS2-9-1-8', 'R11', '770–820', '1180–1220', '', 1100, null, 'Co-ötvözésű, a legkeményebb (1100 HV); hideg képlékenyalakító szerszám is: folyató-, húzóbélyeg, finomkivágó.'],
        ['HS2-9-2', '', '780–810', '1190–1230', '', 800, null, ''],
        ['HS3-3-2', '', '760–790', '1180–1220', '', 800, null, ''],
        ['HS6-5-2', 'R6', '800–850', '1190–1230', '', 1000, null, 'A legelterjedtebb W-Mo gyorsacél: fúró, maró, menetfúró, dörzsár.'],
        ['HS6-5-2-5', 'R8', '770–820', '1200–1240', '', 1000, null, 'Co-ötvözésű; hideg képlékenyalakító szerszám is (folyató-, húzóbélyeg).'],
        ['HS6-5-3', '', '870–900', '1160–1180', '', 830, null, ''],
        ['HS6-5-3-8', '', '870–900', '1140–1180', '', 900, null, ''],
        ['HS6-6-2', 'R12', '800–850', '1180–1220', '', 1020, null, ''],
        ['HS6-5-4', 'R13', '800–850', '1200–1240', '', 1020, null, ''],
        ['HS10-4-3-10', 'R14', '770–840', '1210–1250', '', 1020, null, 'Szívós, magasabb hőmérsékleten is éltartó — nagyobb keménységű anyagok forgácsolása.'],
        ['HS18-0-1', 'R3', '800–850', '1240–1280', '', 950, null, 'A klasszikus W-gyorsacél (18% W); nagyobb keménységű anyagok forgácsolása.']],
    },
  };
  function hsDecode(s) {
    var m = String(s).toUpperCase().replace(/\s/g, '').match(/^HS(\d+(?:[.,]\d+)?)-(\d+(?:[.,]\d+)?)-(\d+(?:[.,]\d+)?)(?:-(\d+(?:[.,]\d+)?))?$/);
    if (!m) return null;
    var n = function (v) { return v == null ? 0 : parseFloat(v.replace(',', '.')); };
    return { W: n(m[1]), Mo: n(m[2]), V: n(m[3]), Co: n(m[4]) };
  }

  AVIX.def('szacel', {
    title: 'Szerszámacél-kereső',
    sub: 'A jegyzet hőkezelési táblázatai · HS-jel dekódoló · gyakorló',
    mount: function (el) {
      var st = U.store('szacel', { g: 'hideg', i: 0 });
      var S = st.get(); if (!SZA[S.g]) S = { g: 'hideg', i: 0 };
      el.innerHTML = '<p class="ix-lead">A jegyzet táblázatai (MSZ EN ISO 4957) csoportonként. <b>Koppints egy acélra</b> a részletekért; a gyorsacél jelét lent vissza is fejtheted.</p>';
      U.chips(el, [['hideg', 'Hidegalakító'], ['meleg', 'Melegalakító'], ['gyors', 'Gyorsacél']], S.g, function (v) { S.g = v; S.i = 0; st.set(S); render(); }, 'Csoport');
      var box = U.h('div'); el.appendChild(box);
      var dec = U.h('div', 'ix-out');
      dec.innerHTML = '<h4><small>Gyorsacél-jel visszafejtése</small>HS W-Mo-V-Co</h4><div class="ix-row"><input type="text" value="HS6-5-2-5" aria-label="Gyorsacél jele" style="flex:1;min-width:0;min-height:40px;padding:0 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:600 16px var(--mono)"></div><div data-o></div>';
      el.appendChild(dec);
      var inp = dec.querySelector('input'), dout = dec.querySelector('[data-o]');
      function showDec() {
        var d = hsDecode(inp.value);
        if (!d) { dout.innerHTML = '<p class="ix-note">Formátum: HS + a W, Mo, V és (ha van) Co tömegszázaléka kötőjellel, pl. HS18-0-1 vagy HS2-9-1-8.</p>'; return; }
        var known = null;
        SZA.gyors.r.forEach(function (r) { if (r[0] === inp.value.toUpperCase().replace(/\s/g, '')) known = r; });
        dout.innerHTML = U.kv([['W (wolfram)', fmt(d.W) + '%', 'erős karbidképző: melegkeménység, megeresztésállóság'], ['Mo (molibdén)', fmt(d.Mo) + '%', 'a W-ot helyettesíti (≈ fele annyi Mo)'], ['V (vanádium)', fmt(d.V) + '%', 'igen kemény VC → kiválásos (szekunder) keményedés'],
          ['Co (kobalt)', d.Co ? fmt(d.Co) + '%' : '—', d.Co ? 'keménység ↑, hővezetés javul, finomabb kiválások' : 'nincs Co-ötvözés'], ['Cr (króm)', '3,5–4,5%', 'minden gyorsacélban: átedzhetőség'], ['C', '0,7–1,4%', 'karbidképzés + az ágyazó szövet']]) +
          (known ? '<p class="ix-hint"><b>' + known[0] + (known[1] ? ' (MSZ ' + known[1] + ')' : '') + ':</b> edzés ' + known[3] + ' °C, lágyítás ' + known[2] + ' °C, megeresztve min. ' + known[5] + ' HV.' + (known[7] ? ' ' + known[7] : '') + '</p>' : '');
      }
      inp.addEventListener('input', showDec);
      function render() {
        var G = SZA[S.g];
        var h = '<p class="ix-note" style="margin:0 0 6px;font-size:13.5px;color:var(--ink-2)">' + G.d + '</p><div class="tscroll" style="margin:8px 0 0"><table class="ix-tbl" style="min-width:520px"><tr><th>EN jel</th><th>MSZ</th><th>Lágyítás °C</th><th>Edzés °C</th>' +
          (S.g !== 'gyors' ? '<th>Ø olaj/lev. mm</th>' : '') + '<th>Megeresztve min. HV</th></tr>';
        G.r.forEach(function (r, i) {
          h += '<tr data-i="' + i + '" class="' + (i === S.i ? 'on' : '') + '" style="cursor:pointer"><td><b>' + r[0] + '</b></td><td>' + (r[1] || '') + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td>' + (S.g !== 'gyors' ? '<td>' + r[4] + '</td>' : '') + '<td>' + r[5] + '</td></tr>';
        });
        h += '</table></div>';
        var r = G.r[S.i] || G.r[0];
        h += '<div class="ix-out"><h4><small>' + G.n + (r[1] ? ' · régi MSZ jel: ' + r[1] : '') + '</small>' + r[0] + '</h4>' +
          U.kv([['Lágyítás', r[2] + ' °C'], ['Edzés', r[3] + ' °C'], ['Megeresztve', 'min. ' + r[5] + ' HV']].concat(r[6] ? [['Lágyítva', 'max. ' + r[6] + ' HV', 'így forgalmazzák — forgácsolható']] : []).concat(S.g !== 'gyors' ? [['Átedzhető Ø', r[4] + ' mm', 'olajban / levegőn']] : [])) +
          (r[7] ? '<p class="ix-hint">' + r[7] + '</p>' : '') + '</div>';
        box.innerHTML = h;
      }
      box.addEventListener('click', function (e) {
        var tr = e.target.closest('tr[data-i]'); if (!tr) return;
        S.i = +tr.getAttribute('data-i'); st.set(S); render();
        if (S.g === 'gyors') { inp.value = SZA.gyors.r[S.i][0]; showDec(); }
      });
      render(); showDec();
      U.quiz(el, [
        { q: 'Kivágószerszám, tagolt alak, a hőkezeléskor minimális alakváltozás kell. Melyik acél?', opts: ['90MnCrV8 (M1)', '55NiCrMoV7 (NK2)', 'HS18-0-1 (R3)', 'C45'], a: 0, why: 'A Mn-ötvözésű hidegalakító acél (M1) hőkezeléskor alig változtat alakot — tagolt, méretpontos szerszámokhoz (olló, kivágó, idomszer).' },
        { q: 'Kalapács, vágó, lyukasztó — ütésszerű igénybevétel. Melyik csoport?', opts: ['Cr-W (W5, W6)', 'Ledeburitos Cr (K8)', 'Gyorsacél', 'Ni-Cr melegalakító'], a: 0, why: 'A W5/W6 kisebb C-tartalmú: a C nagy része karbidban kötött, az ágyazó martenzit „lágy” → igen szívós.' },
        { q: 'Nyomásos öntőforma (Al-ötvözethez), hőfáradás. Melyik acél?', opts: ['X40CrMoV5-1 (K13)', '102Cr6 (K4)', '90MnCrV8 (M1)', 'HS6-5-2 (R6)'], a: 0, why: 'A Cr-Mo-V melegalakító acél igen szívós, a termikus kifáradásnak jól ellenáll, légedzésű — a legelterjedtebb melegalakító acél.' },
        { q: 'Nagy tömegű, tagolt süllyeszték, olcsó acél kell, üzemi hőmérséklet 300 °C alatt.', opts: ['Ni-Cr (NK, NK2)', 'Cr-W-V (W3)', 'Gyorsacél', 'Ledeburitos Cr (K8)'], a: 0, why: 'A Ni-Cr acélok a legolcsóbb melegalakító acélok; a v_krit erősen csökken, így légedzésűek.' },
        { q: 'Mit jelent a HS6-5-2-5 jel?', opts: ['6% W, 5% Mo, 2% V, 5% Co', '6% Cr, 5% Mo, 2% V, 5% W', '0,6% C, 5% W, 2% Mo, 5% V', '6% Mo, 5% W, 2% Co, 5% V'], a: 0, why: 'HS után a W, Mo, V és Co tömegszázaléka; a Cr (3,5–4,5%) minden gyorsacélban benne van, ezért nem írják ki.' },
        { q: 'Miért kell a ledeburitos (K8, K9) acélt erősen melegen alakítani?', opts: ['A karbideutektikum hálóját össze kell törni', 'A szekunder keményedés miatt', 'A dekarbonizáció elkerülése miatt', 'A maradék ausztenit miatt'], a: 0, why: 'A kristályosodás karbideutektikummal zárul, amely hálót képez; összetörés nélkül a hálós karbid lerontaná a szívósságot.' },
        { q: 'Mekkora a gyorsacélok edzési hőmérséklete a jegyzet táblázata szerint?', opts: ['1140–1280 °C', '780–860 °C', '1000–1050 °C', '550–600 °C'], a: 0, why: 'A karbidok egy részének fel kell oldódnia az ausztenitben — ezért szokatlanul magas; óvatos, lépcsős hevítés kell (rossz hővezetés).' },
        { q: 'Melyik ötvöző javítja a gyorsacél hővezetését is?', opts: ['Co', 'Cr', 'V', 'Mn'], a: 0, why: 'A jegyzet szerint a Co-ötvözés célja a keménység növelése, a hővezetés javítása és a diszperz karbidok méretének csökkentése.' },
      ], { title: 'Gyakorlás: szerszámacél-választás' });
    },
  });

  /* ================================================================== */
  /* A/04 — acéljel-dekódoló (MSZ EN 10027-1 / -2, a jegyzet szerint)     */
  /* ================================================================== */
  var MAIN = {
    S: 'szerkezeti acél', P: 'nyomástartó edények acélja (pressure)', L: 'csővezeték-acél', E: 'gépacél (engine)', B: 'betonacél', R: 'sínacél (rail)',
  };
  var EXTRA = {
    W: 'időjárásálló (weather)', L: 'kis hőmérsékletű alkalmazásokhoz (low temperature)', M: 'termomechanikusan hengerelt', H: 'nagy hőmérsékletű alkalmazásokhoz (high temperature)',
    N: 'normalizált vagy szabályozott hőmérsékleten hengerelt', X: 'nagy és kis hőmérsékletre', C: 'különleges hidegalakíthatóságú', Q: 'nemesített (quality)', G: 'egyéb megkülönböztető jel',
  };
  var IMP = { J: 27, K: 40, L: 60 }, IMPT = { R: '+20 °C', O: '0 °C', '0': '0 °C', 2: '−20 °C', 3: '−30 °C', 4: '−40 °C', 5: '−50 °C', 6: '−60 °C' };
  var FACT = { Cr: 4, Co: 4, Mn: 4, Si: 4, W: 4, Ni: 4, Al: 10, Be: 10, Cu: 10, Mo: 10, Nb: 10, Pb: 10, Ta: 10, Ti: 10, V: 10, Zr: 10, Ce: 100, N: 100, P: 100, S: 100, B: 1000 };
  var ELNAME = { Cr: 'króm', Co: 'kobalt', Mn: 'mangán', Si: 'szilícium', W: 'wolfram', Ni: 'nikkel', Al: 'alumínium', Be: 'berillium', Cu: 'réz', Mo: 'molibdén', Nb: 'nióbium', Pb: 'ólom', Ta: 'tantál', Ti: 'titán', V: 'vanádium', Zr: 'cirkónium', Ce: 'cérium', N: 'nitrogén', P: 'foszfor', S: 'kén', B: 'bór' };
  var NUMS = { '1.0037': 'S235JR', '1.0038': 'S235JR', '1.0570': 'S355J2G3', '1.0577': 'S355J2', '1.0503': 'C45', '1.1191': 'C45E', '1.7225': '42CrMo4', '1.7131': '16MnCr5', '1.4301': 'X5CrNi18-10', '1.4401': 'X5CrNiMo17-12-2', '1.2379': 'X153CrMoV12', '1.2344': 'X40CrMoV5-1', '1.3343': 'HS6-5-2', '1.3355': 'HS18-0-1', '1.2842': '90MnCrV8' };
  var GRP = [[[0, 0], 'nyersvasak és ferroötvözetek (főcsoport 0)'], [[1, 1], 'általános rendeltetésű acél, Rm < 500 MPa'], [[2, 2], 'nem hőkezelésre szánt egyéb szerkezeti acél, Rm < 500 MPa'], [[3, 9], 'ötvözetlen minőségi acél'], [[10, 19], 'ötvözetlen nemesacél (11–13: szerkezeti, nyomástartó és gépacélok; 15–18: szerszámacélok)'], [[20, 29], 'ötvözött szerszámacél'], [[30, 39], 'egyéb ötvözött acél (32–33: gyorsacélok)'], [[40, 49], 'korrózióálló és hőálló acél (40–45: korrózióálló)'], [[50, 89], 'ötvözött szerkezeti, gép- és nyomástartó acél']];
  function tokEl(s) { // elemjelek szétbontása (kis- és nagybetűt is elfogad)
    var out = [], i = 0, two = ['Cr', 'Co', 'Mn', 'Si', 'Ni', 'Al', 'Be', 'Cu', 'Mo', 'Nb', 'Pb', 'Ta', 'Ti', 'Zr', 'Ce'], one = ['W', 'V', 'N', 'P', 'S', 'B'];
    while (i < s.length) {
      var t2 = s.substr(i, 2).toLowerCase(), f = null;
      two.forEach(function (e) { if (e.toLowerCase() === t2) f = e; });
      if (f) { out.push(f); i += 2; continue; }
      one.forEach(function (e) { if (e.toLowerCase() === s[i].toLowerCase()) f = e; });
      if (!f) return null;
      out.push(f); i++;
    }
    return out;
  }
  function decodeSteel(raw) {
    var s = String(raw).trim().replace(/\s+/g, '').replace(/^EN/i, '');
    var parts = [], m, cast = false;
    if (!s) return null;
    // számjel
    if ((m = s.match(/^([0-2])\.(\d{2})(\d{2,3})$/))) {
      var g = +m[2], gd = '';
      GRP.forEach(function (x) { if (g >= x[0][0] && g <= x[0][1]) gd = x[1]; });
      parts.push([m[1], 'anyagfőcsoport', m[1] === '1' ? 'acél' : m[1] === '0' ? 'nyersvas, ferroötvözet' : 'nemvas nehézfém']);
      parts.push([m[2], 'acélcsoport', gd || '—']);
      parts.push([m[3], 'sorszám', 'az acélcsoporton belül']);
      return { kind: 'Számjel (MSZ EN 10027-2)', parts: parts, note: NUMS[s] ? 'Ez a számjel a(z) ' + NUMS[s] + ' rövid jelnek felel meg.' : 'A számjel gépi feldolgozásra, nyilvántartásra szolgál; a jellemzőkre a rövid jel utal.' };
    }
    if (/^G[-]?/i.test(s) && /^G[-]?(X|HS|C\d|\d)/i.test(s)) { cast = true; parts.push(['G', 'kezdő jel', 'öntvény (acélöntvény)']); s = s.replace(/^G[-]?/i, ''); }
    // gyorsacél
    if ((m = s.match(/^HS(\d+(?:[.,]\d)?)-(\d+(?:[.,]\d)?)-(\d+(?:[.,]\d)?)(?:-(\d+(?:[.,]\d)?))?$/i))) {
      parts.push(['HS', 'főjel', 'gyorsacél (high speed)'], [m[1], 'W', m[1] + '% wolfram'], [m[2], 'Mo', m[2] + '% molibdén'], [m[3], 'V', m[3] + '% vanádium']);
      if (m[4]) parts.push([m[4], 'Co', m[4] + '% kobalt']);
      return { kind: 'Vegyi összetétellel megadott acél — gyorsacél', parts: parts, note: 'A Cr (3,5–4,5%) minden gyorsacélban benne van, a C 0,7–1,4% — ezeket nem írják ki.' };
    }
    // erősen ötvözött (X)
    if ((m = s.match(/^X(\d{1,3})([A-Za-z]+)([\d,.]+(?:-[\d,.]+)*)$/))) {
      var els = tokEl(m[2]); if (!els) return { err: 'Ismeretlen ötvözőjel: ' + m[2] };
      var vals = m[3].split('-');
      parts.push(['X', 'főjel', 'erősen ötvözött acél: legalább egy ötvöző > 5% (a gyorsacélok kivételével)'], [m[1], 'C × 100', 'C ≈ ' + fmt(+m[1] / 100, 2) + '%']);
      els.forEach(function (e, i) { parts.push([e, 'ötvöző', ELNAME[e] + (vals[i] ? ' ≈ ' + vals[i] + '% (a szám közvetlenül a %-ot adja)' : ' (mennyiség nincs megadva)')]); });
      return { kind: 'Vegyi összetétellel megadott acél — erősen ötvözött (X)', parts: parts, note: 'Az ötvözők csökkenő mennyiség szerinti sorrendben; X-es jelnél nincs szorzótényező.' };
    }
    // ötvözetlen, Mn < 1% (C…)
    if ((m = s.match(/^C(\d{1,3})([A-Z]*)$/i))) {
      parts.push(['C', 'főjel', 'ötvözetlen acél, Mn < 1%'], [m[1], 'C × 100', 'C ≈ ' + fmt(+m[1] / 100, 2) + '% (középérték)']);
      if (m[2]) parts.push([m[2].toUpperCase(), 'kiegészítő jel', m[2].toUpperCase() === 'E' ? 'előírt legnagyobb S-tartalom' : m[2].toUpperCase() === 'R' ? 'előírt S-tartomány' : 'kiegészítő jel']);
      return { kind: 'Vegyi összetétellel megadott acél — ötvözetlen', parts: parts, note: +m[1] <= 20 ? 'Kis C-tartalom: betétben edzhető acél (pl. C10, C15).' : +m[1] >= 22 && +m[1] <= 60 ? 'Nemesíthető ötvözetlen acél (C22–C60).' : '' };
    }
    // gyengén ötvözött (szorzótényezős)
    if ((m = s.match(/^(\d{1,3})([A-Za-z]+?)([\d,.]+(?:-[\d,.]+)*)?$/))) {
      var el2 = tokEl(m[2]); if (!el2) return { err: 'Ismeretlen ötvözőjel: ' + m[2] };
      var v2 = m[3] ? m[3].split('-') : [];
      parts.push([m[1], 'C × 100', 'C ≈ ' + fmt(+m[1] / 100, 2) + '%']);
      el2.forEach(function (e, i) {
        var d = ELNAME[e];
        if (v2[i]) { var val = parseFloat(v2[i].replace(',', '.')) / FACT[e]; d += ' ≈ ' + fmt(val, val < 0.1 ? 3 : 2) + '% (' + v2[i] + ' ÷ ' + FACT[e] + ')'; }
        else d += ' — a mennyisége nincs kiírva';
        parts.push([e, 'ötvöző', d]);
      });
      return { kind: 'Vegyi összetétellel megadott acél — gyengén ötvözött (egy ötvöző sem > 5%)', parts: parts, note: 'Szorzótényezők: ×4 Cr, Co, Mn, Si, W, Ni · ×10 Al, Be, Cu, Mo, Nb, Pb, Ta, Ti, V, Zr · ×100 Ce, N, P, S · ×1000 B.' };
    }
    // tulajdonságra garantált (S, P, L, E, B, R)
    if ((m = s.match(/^([SPLEBR])(\d{2,4})(.*)$/i))) {
      var L0 = m[1].toUpperCase();
      parts.push([L0, 'főjel', MAIN[L0]], [m[2], L0 === 'R' ? 'Rm' : 'ReH', (L0 === 'R' ? 'garantált szakítószilárdság: ' : 'garantált legkisebb folyáshatár: ') + m[2] + ' MPa (a vastagságtól függően)']);
      var r = m[3].toUpperCase(), note = '';
      while (r.length) {
        var q = r.match(/^([JKL])([R0O2-6])/);
        if (q) { parts.push([q[0], 'ütőmunka', 'KV ≥ ' + IMP[q[1]] + ' J ' + IMPT[q[2]] + '-on']); r = r.slice(2); continue; }
        q = r.match(/^G([1-4])/);
        if (q) { parts.push([q[0], 'dezoxidálás', q[1] === '1' ? 'csillapítatlan' : q[1] === '2' ? 'nem csillapítatlan' : 'teljesen csillapított']); r = r.slice(2); continue; }
        q = r.match(/^[+]?([A-Z])/);
        if (q && EXTRA[q[1]]) { parts.push([q[1], 'kiegészítő jel', EXTRA[q[1]]]); r = r.slice(q[0].length); continue; }
        parts.push([r, '?', 'nem ismert kiegészítő jel']); break;
      }
      if (L0 === 'S' && /J[R02O]|K2/.test(m[3].toUpperCase())) note = 'A JR, J0, J2, K2 csoportú általános rendeltetésű szerkezeti acélok a jegyzet szerint minden eljárással hegeszthetők.';
      if (L0 === 'E') note = 'Gépacélnál a C-tartalomra nincs előírás, és C > 0,2% is lehet → edzési repedés veszélye, előmelegítéssel hegeszthető.';
      if (L0 === 'S' && /N|M/.test(m[3].toUpperCase())) note = 'Finomszemcsés, hegeszthető szerkezeti acél (MSZ EN 10113): az M és ML jelűek karbonegyenértéke kisebb; KV −20 °C-on 40 J (M, N), −50 °C-on 27 J (ML, NL).';
      return { kind: 'Mechanikai vagy fizikai tulajdonságra garantált acél (MSZ EN 10027-1)', parts: parts, note: note };
    }
    return { err: 'Nem ismert jelformátum.' };
  }

  AVIX.def('acjel', {
    title: 'Acéljel-dekódoló',
    sub: 'MSZ EN 10027-1 rövid jel és -2 számjel, a jegyzet jelölési szabályaival',
    mount: function (el) {
      el.innerHTML = '<p class="ix-lead">Írj be egy acéljelet, vagy válassz egy példát — a dekódoló a jegyzet szabályai szerint részeire bontja (főjel, folyáshatár, ütőmunka, kiegészítő jelek; vegyi összetételnél a szorzótényezők).</p>' +
        '<div class="ix-row"><input type="text" value="S355J2G3" aria-label="Acéljel" spellcheck="false" autocapitalize="off" style="flex:1;min-width:0;min-height:44px;padding:0 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:600 18px var(--mono)"></div>';
      var inp = el.querySelector('input');
      U.chips(el, ['S235JR', 'S355J2G3', 'S275NL', 'S355J0C', 'P265GH', 'E295', 'B500', 'C45E', '42CrMo4', '16MnCr5', '28Mn6', 'X5CrNi18-10', 'GX10CrNi18-9', 'HS6-5-2-5', '1.4301'].map(function (x) { return [x, x]; }), 'S355J2G3', function (v) { inp.value = v; run(); }, 'Példák');
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function run() {
        var d = decodeSteel(inp.value);
        if (!d) { out.innerHTML = '<p class="ix-note">Írj be egy jelet.</p>'; return; }
        if (d.err) { out.innerHTML = '<h4><small>Nem sikerült</small>' + esc(inp.value) + '</h4><p>' + esc(d.err) + ' Támogatott formák: S/P/L/E/B/R + szám + jelek; C45; 42CrMo4; X5CrNi18-10; HS6-5-2-5; G…; 1.xxxx.</p>'; return; }
        out.innerHTML = '<h4><small>' + esc(d.kind) + '</small>' + esc(inp.value.trim()) + '</h4>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px">' + d.parts.map(function (p, i) {
            return '<span style="display:inline-flex;flex-direction:column;align-items:center;padding:6px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--rule-2)"><b style="font:700 17px var(--mono);color:var(--ix-' + ((i % 6) + 1) + ')">' + esc(p[0]) + '</b><small style="font:600 10.5px var(--mono);color:var(--muted);text-transform:uppercase;letter-spacing:.05em">' + esc(p[1]) + '</small></span>';
          }).join('') + '</div>' +
          U.kv(d.parts.map(function (p) { return [esc(p[0]), '', esc(p[2])]; })).replace(/<b><\/b><small>/g, '<small style="margin:0;font-size:14px;color:var(--ink-2)">') +
          (d.note ? '<p class="ix-hint">' + esc(d.note) + '</p>' : '');
      }
      inp.addEventListener('input', run);
      run();
      U.quiz(el, [
        { q: 'Mit garantál az E295 jel?', opts: ['Gépacél, legalább 295 MPa folyáshatár', 'Vegyi összetétel: 0,295% C', 'Szerkezeti acél, 295 MPa szakítószilárdság', 'Elektrotechnikai acél'], a: 0, why: 'Az E (gépacél), S, P, B főjeleknél a szám a garantált folyáshatár MPa-ban; a vegyi összetétellel megadott acélok jele C…, szám+elemek, X… vagy HS….' },
        { q: 'Mit jelent a J2 az S235J2 jelben?', opts: ['KV ≥ 27 J −20 °C-on', 'KV ≥ 40 J +20 °C-on', '2% Ni', 'Második minőségi osztály'], a: 0, why: 'J = 27 J, K = 40 J, L = 60 J; R = +20 °C, 0 = 0 °C, 2 = −20 °C … 6 = −60 °C.' },
        { q: 'Mennyi a Cr-tartalom a 42CrMo4 acélban?', opts: ['≈ 1%', '4%', '0,4%', '42%'], a: 0, why: 'Gyengén ötvözött acélnál a Cr szorzótényezője 4, így 4 ÷ 4 = 1%; a C ≈ 0,42%.' },
        { q: 'Mit jelent az X5CrNi18-10?', opts: ['C ≈ 0,05%, Cr 18%, Ni 10%', 'C ≈ 5%, Cr 18%, Ni 10%', 'C ≈ 0,05%, Cr 4,5%, Ni 2,5%', 'Gyorsacél'], a: 0, why: 'Az X erősen ötvözött acélt jelöl: a C-szám a C százszorosa, az ötvözők értéke közvetlenül %.' },
        { q: 'Melyik jel jelöl teljesen csillapított acélt?', opts: ['G3 / G4', 'G1', 'JR', 'W'], a: 0, why: 'A jegyzet szerint G3, G4: teljesen csillapított acél, G1: csillapítatlan.' },
        { q: 'Mit jelent az NL az S275NL jelben?', opts: ['Normalizált, kis hőmérsékletű alkalmazásra (KV −50 °C-on)', 'Nikkellel ötvözött', 'Nemesített, nagy hőmérsékletre', 'Nem hegeszthető'], a: 0, why: 'N: normalizált / szabályozott hőmérsékleten hengerelt; L: kis hőmérsékletű alkalmazás — ML, NL jelnél 27 J −50 °C-on.' },
      ], { title: 'Gyakorlás: acéljelek' });
    },
  });

  /* ================================================================== */
  /* A/05 — hőkezelési ciklusok (a jegyzet T–t ábrái szerint, C45-re)     */
  /* ================================================================== */
  // pts: [idő (relatív 0–100), T °C]; ann: [x0, x1, T, felirat] hőntartás; cool: [x, T, felirat]
  var CYC = {
    fesz: { n: 'Feszültségcsökkentő izzítás', g: 'kiegyenlítő', pts: [[0, 20], [22, 620], [48, 620], [82, 110], [92, 20]], hold: [[22, 48, 620, '1–2 h']], cool: [[66, 330, 'kemencében lassan'], [88, 60, 'levegő']],
      d: 'Cél: az öntés, kovácsolás, hengerlés, hegesztés, hidegalakítás, forgácsolás, egyengetés után visszamaradó feszültségek csökkentése. A szilárdság és a szövet nem változik. Legfeljebb 650 °C (Ac1 alatt); alacsonyabb hőmérséklet + hosszabb hőntartás a kedvezőbb. Edzés előtt, kovácsolt daraboknál nagyolás után.' },
    ujra: { n: 'Újrakristályosítás', g: 'kiegyenlítő', pts: [[0, 20], [20, 600], [55, 600], [85, 20]], hold: [[20, 55, 600, '2–5 h']], cool: [[74, 250, 'levegőn']],
      d: 'Cél: a hidegalakítással járó ridegedés (Rm, ReH, HB ↑; A, Z ↓) és szemcsetorzulás megszüntetése, új szemcsék. 500 °C fölött; a hőfokot és az időt az alakítás mértéke szerint kell választani (magasabb hőfokhoz rövidebb hőntartás). Szövet: ferrit–szemcsés perlit. Kritikus (5–15%-os) alakításnál durva szemcse!' },
    norm: { n: 'Normalizálás', g: 'kiegyenlítő', pts: [[0, 20], [20, 850], [32, 850], [75, 20]], hold: [[20, 32, 850, '10–30 perc']], cool: [[58, 380, 'levegőn']],
      d: 'Átkristályosító izzítás: GSK fölé 30–50 °C-kal. Cél: acélöntvények, alakított és hegesztett acélok túlhevített, durvaszemcsés, egyenlőtlen szemcseszerkezetének javítása (finom ferrit–perlit). A szemcsedurvítás és a diffúziós hőkezelés után is ezzel finomítanak vissza.' },
    diff: { n: 'Diffúziós hőkezelés', g: 'kiegyenlítő', pts: [[0, 20], [16, 1250], [62, 1250], [88, 250], [96, 20]], hold: [[16, 62, 1250, '15–48 h']], cool: [[78, 640, 'kemencében'], [94, 120, 'levegő']],
      d: 'Homogenizálás: az öntéskor eltérő gyorsasággal dermedt részek összetétel- és szemcsefinomság-különbségét, dúsulásait egyenlíti ki. A szolidusz alatt kb. 100 °C-kal; minél magasabb a hőmérséklet és hosszabb a hőntartás, annál tökéletesebb (de a szemcse durvulhat → utána normalizálás). Lényegesen javítja az öntvény szívósságát.' },
    klagy: { n: 'Teljes kilágyítás', g: 'lágyító', pts: [[0, 20], [20, 705], [50, 705], [90, 120]], hold: [[20, 50, 705, '2–4 h']], cool: [[74, 360, 'kemencében']],
      d: 'Az Ac1 alatt (680 °C – Ac1): a perlit cementitlemezei gömbszerűvé alakulnak (szemcsés perlit, szferoidit). Forgácsoláskor a lágy ferritbe ágyazott cementitgömbök „kigördülnek” a szerszám éle elől; képlékenyalakításnál is kisebb az ellenállás. A hőmérséklet a C- és az ötvözőtartalomtól függ.' },
    norml: { n: 'Normalizáló lágyítás', g: 'lágyító', pts: [[0, 20], [13, 850], [26, 850], [36, 690], [66, 690], [88, 120], [96, 20]], hold: [[13, 26, 850, '3–3,5 h'], [36, 66, 690, '5–6 h']], cool: [[31, 790, 'levegőn'], [80, 400, 'kemence / levegő']],
      d: 'Ötvözött, hipoeutektoidos acéloknál: Ac3 + 30–50 °C-ról levegőn hűtik 680–700 °C-ig, ott hosszan tartják → szemcsés perlit. Előnyös képlékenyalakításnál és egyes kis sebességű forgácsolásoknál.' },
    izo: { n: 'Izotermális lágyítás', g: 'lágyító', pts: [[0, 20], [13, 850], [26, 850], [29, 650], [62, 650], [86, 120], [96, 20]], hold: [[13, 26, 850, '3–3,5 h'], [29, 62, 650, '3–8 h']], cool: [[33, 770, 'gyors hűtés'], [78, 390, 'kemence / levegő']],
      d: 'Az Ac3 fölé (30–50 °C-kal) hevítés után gyors hűtés az Ac1 alá (600–700 °C), és hőntartás, amíg az ausztenit szemcsés perlitté alakul. A jegyzet ajánlása: kis sebességű forgácsolás (fogazás, bordamarás, üregelés) előtt.' },
    aus: { n: 'Ausztenitre lágyítás', g: 'lágyító', pts: [[0, 20], [22, 1050], [45, 1050], [49, 20]], hold: [[22, 45, 1050, 'karbidoldás']], cool: [[58, 520, 'víz / olaj (gyorsan)']],
      d: 'Korrózió- és saválló, hő- és kopásálló, nagy Mn-tartalmú acélok megmunkálás előtt: a γ-mezőbe hevítés (Cr-Ni, Cr-Ni-Mo: 1050 °C; Fe-Mn-C: 1000 °C), a karbidok teljes feloldása, majd gyors hűtés, hogy ne váljanak ki újra.' },
    durv: { n: 'Szemcsedurvító hőkezelés', g: 'egyéb', pts: [[0, 20], [18, 1000], [42, 1000], [48, 420], [80, 20]], hold: [[18, 42, 1000, '1–2 h']], cool: [[50, 700, 'olaj'], [70, 180, 'levegő']],
      d: 'Ac3 fölött, 950–1100 °C: szándékos szemcsedurvítás a jobb forgácstörésért kis sebességű megmunkálásnál (fúrás, üregelés, gyalulás). Utána normalizálni KELL (szívósság). A tanszéki jegyzetekben nem szerepel — a másik forrás adata.' },
    pat: { n: 'Patentírozás', g: 'egyéb', pts: [[0, 20], [15, 900], [26, 900], [29, 480], [58, 480], [74, 20]], hold: [[15, 26, 900, 'ausztenitesítés'], [29, 58, 480, 'ólomfürdő: átalakulásig']], cool: [[70, 200, 'levegő']],
      d: 'Huzalok (0,5–1% C) a húzási fokozatok között: ausztenitesítés 850–980 (1100) °C, gyors hűtés 400–520 °C-os ólom- vagy sófürdőbe, hőntartás a teljes átalakulásig → ferritmentes szorbit: nagy szilárdság + továbbhúzhatóság. Rugóhuzal, hangszerhúr.' },
  };

  AVIX.def('hociklus', {
    title: 'Hőkezelési ciklusok (hőmérséklet–idő)',
    sub: 'A jegyzet T–t ábrái szerint · A1 és A3 egy C45-ös acélra berajzolva',
    mount: function (el) {
      var st = U.store('hociklus', { k: 'klagy' });
      var S = st.get(); if (!CYC[S.k]) S = { k: 'klagy' };
      el.innerHTML = '<p class="ix-lead">Válassz eljárást: a görbe a hevítést, a hőntartást és a hűtést mutatja a jegyzet ábráinak megfelelően (az időtengely szemléltető, nem arányos). A szaggatott vonalak: A1 = 723 °C és egy 0,45% C-os acél A3 ≈ 805 °C-os pontja.</p>';
      var groups = [['kiegyenlítő', 'Kiegyenlítő'], ['lágyító', 'Lágyító'], ['egyéb', 'Egyéb']];
      var chipsWrap = U.h('div'); el.appendChild(chipsWrap);
      groups.forEach(function (g) {
        var lab = U.h('div', 'ix-note', g[1] + ':'); lab.style.margin = '6px 0 4px'; chipsWrap.appendChild(lab);
        U.chips(chipsWrap, Object.keys(CYC).filter(function (k) { return CYC[k].g === g[0]; }).map(function (k) { return [k, CYC[k].n]; }), S.k, function (v) { S.k = v; st.set(S); [].forEach.call(chipsWrap.querySelectorAll('.ix-chips button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); }); draw(); }, g[1]);
      });
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.75 : 0.45; }, minH: 240, maxH: 380, label: 'Hőmérséklet–idő diagram' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var M = { l: 48, r: 14, t: 18, b: 38 };
      P.draw = function () { draw(); };
      function draw() {
        var w = P.w, h = P.h; if (!w) return;
        var c = CYC[S.k], sx = U.scale(0, 100, M.l, w - M.r), sy = U.scale(0, 1300, h - M.b, M.t), o = '';
        o += U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, yt: [0, 200, 400, 600, 800, 1000, 1200], xt: [], yl: 'T, °C', xl: 't (idő, szemléltető)' });
        [[723, 'A1 723 °C'], [805, 'A3 ≈ 805 °C (C45)']].forEach(function (a, i) {
          o += '<line x1="' + M.l + '" x2="' + (w - M.r) + '" y1="' + sy(a[0]) + '" y2="' + sy(a[0]) + '" style="stroke:var(--acc);stroke-width:1;stroke-dasharray:5 4;opacity:.7"/><text class="tk" x="' + (w - M.r - 4) + '" y="' + (sy(a[0]) + (i ? -5 : 13)) + '" text-anchor="end" style="fill:var(--acc)">' + a[1] + '</text>';
        });
        o += '<path class="ln bd" d="' + U.path(c.pts, sx, sy) + '" style="stroke:var(--ix-2);stroke-width:3"/>';
        c.hold.forEach(function (hh) {
          var x0 = sx(hh[0]), x1 = sx(hh[1]), y = sy(hh[2]);
          o += '<path d="M' + x0 + ',' + (y - 8) + 'v-6H' + x1 + 'v6" style="fill:none;stroke:var(--ink);stroke-width:1.2"/><text class="lb sm" x="' + ((x0 + x1) / 2) + '" y="' + (y - 18) + '" text-anchor="middle">' + hh[3] + '</text>';
          o += '<text class="tk" x="' + (M.l - 6) + '" y="' + (y + 3.5) + '" text-anchor="end" style="fill:var(--ix-2);font-weight:600">' + hh[2] + '</text>';
        });
        c.cool.forEach(function (cc) { o += '<text class="la sm" x="' + sx(cc[0]) + '" y="' + sy(cc[1]) + '">' + cc[2] + '</text>'; });
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>' + c.g + ' hőkezelés</small>' + c.n + '</h4><p>' + c.d + '</p>';
      }
      P.render();
      U.quiz(el, [
        { q: 'Hidegen húzott huzalt kell tovább alakítani — mi a teendő?', opts: ['Újrakristályosítás (köztes lágyítás)', 'Szemcsedurvítás', 'Edzés', 'Diffúziós hőkezelés'], a: 0, why: 'Az újrakristályosítás megszünteti az alakítási keményedést: új, torzulásmentes szemcsék nőnek. (Nagy szilárdságú huzalnál patentírozás is szóba jön.)' },
        { q: 'Melyik eljárásnál nem változik a szövet és a szilárdság?', opts: ['Feszültségcsökkentő izzítás', 'Teljes kilágyítás', 'Normalizálás', 'Patentírozás'], a: 0, why: 'A feszültségcsökkentő izzítás Ac1 alatt (≤ 650 °C) csak a maradó feszültségeket csökkenti.' },
        { q: 'Öntvény dúsulásait, inhomogenitását kell kiegyenlíteni. Melyik hőkezelés?', opts: ['Diffúziós hőkezelés (homogenizálás)', 'Feszültségcsökkentés', 'Lágyítás', 'Ausztenitre lágyítás'], a: 0, why: 'A diffúziós hőkezelés a szolidusz alatt kb. 100 °C-kal, 15–48 óráig tart; utána normalizálni kell a szemcsedurvulás miatt.' },
        { q: 'Mi a különbség az izotermális és a teljes kilágyítás között?', opts: ['Az izotermálisnál Ac3 fölé hevítenek, majd gyorsan 600–700 °C-ra hűtenek és ott tartják', 'Az izotermális az Ac1 alatt marad végig', 'A teljes kilágyítás vízhűtéses', 'Nincs különbség'], a: 0, why: 'A teljes kilágyítás Ac1 alatt (680–723 °C) gömbösít; az izotermálisnál ausztenitesítés után izoterm átalakulással jön létre a szemcsés perlit.' },
        { q: 'Mi a patentírozás célszövete?', opts: ['Ferritmentes szorbit', 'Martenzit', 'Durva lemezes perlit', 'Bainit + maradék ausztenit'], a: 0, why: 'A 400–520 °C-os izoterm fürdőben finomlemezes szorbit keletkezik: nagy szilárdság és továbbhúzhatóság.' },
        { q: 'Cr-Ni korrózióálló acélt kell megmunkálni. Melyik lágyítás?', opts: ['Ausztenitre lágyítás 1050 °C-ról gyors hűtéssel', 'Teljes kilágyítás 700 °C-on', 'Normalizáló lágyítás', 'Szemcsedurvítás'], a: 0, why: 'A γ-mezőben a karbidok feloldódnak, a gyors hűtés megakadályozza újbóli kiválásukat.' },
      ], { title: 'Gyakorlás: melyik hőkezelés?' });
    },
  });

  /* ================================================================== */
  /* A/03 — szakítóvizsgálat                                            */
  /* ================================================================== */
  // Jellemző (tankönyvi nagyságrendű) értékek — a görbe alakja szemléltető.
  var SZMAT = {
    lagy: { n: 'Kis C-tartalmú acél', E: 210000, eh: 285, el: 265, lud: 1.6, rm: 420, ag: 20, a: 30, rp: null,
      d: 'Határozott folyású anyag: a felső folyáshatár (ReH) után az erő visszaesik, és a folyás közel állandó erőn (ReL) zajlik (Lüders-sávok).' },
    nemes: { n: 'Nemesített acél', E: 210000, eh: null, rp: 700, rm: 900, ag: 7, a: 14,
      d: 'Nincs éles folyáshatár → az egyezményes Rp0,2 a mérvadó (0,2% maradó nyúláshoz tartozó feszültség).' },
    al: { n: 'Alumíniumötvözet', E: 70000, eh: null, rp: 250, rm: 300, ag: 9, a: 12,
      d: 'Kisebb rugalmassági modulus (≈ 70 GPa), nincs éles folyáshatár → Rp0,2.' },
    ov: { n: 'Szürke öntöttvas', E: 110000, eh: null, rp: null, rm: 220, ag: 0.5, a: 0.5,
      d: 'Rideg anyag: gyakorlatilag maradó nyúlás és kontrakció nélkül szakad (A ≈ 0,5%).' },
  };
  function szCurve(m) {
    // mérnöki σ–ε görbe pontjai: [ε %, σ MPa, szakasz]
    var pts = [], i, e;
    if (m.eh) {
      var ee = m.eh / m.E * 100;
      for (i = 0; i <= 10; i++) pts.push([ee * i / 10, m.eh * i / 10, 'I']);
      pts.push([ee + 0.05, m.el, 'IIa']);
      for (e = ee + 0.1; e <= m.lud; e += 0.1) pts.push([e, m.el + (Math.sin(e * 23) * 3), 'IIa']);
      for (e = m.lud; e <= m.ag; e += 0.25) { var k = (e - m.lud) / (m.ag - m.lud); pts.push([e, m.el + (m.rm - m.el) * (1 - Math.pow(1 - k, 2.2)), 'IIb']); }
      for (e = m.ag; e <= m.a; e += 0.25) { var q = (e - m.ag) / (m.a - m.ag); pts.push([e, m.rm - (m.rm - m.el * 0.95) * Math.pow(q, 1.8), 'III']); }
      return pts;
    }
    if (!m.rp) { // rideg
      for (e = 0; e <= m.a; e += m.a / 30) pts.push([e, m.rm * (1 - Math.pow(1 - e / m.a, 1.6)), e < m.a * 0.35 ? 'I' : 'IIb']);
      return pts;
    }
    var ep = m.rp / m.E * 100;
    for (i = 0; i <= 10; i++) pts.push([ep * 0.8 * i / 10, m.rp * 0.8 * i / 10, 'I']);
    for (e = ep * 0.8; e <= m.ag; e += Math.max(0.05, m.ag / 80)) {
      var s = Math.min(m.rm, m.rp * 0.8 + (m.rm - m.rp * 0.8) * (1 - Math.exp(-(e - ep * 0.8) / (m.ag * 0.18))));
      pts.push([e, s, e < ep + 0.2 ? 'I' : 'IIb']);
    }
    for (e = m.ag; e <= m.a; e += 0.2) { var r = (e - m.ag) / (m.a - m.ag); pts.push([e, m.rm - m.rm * 0.25 * Math.pow(r, 1.8), 'III']); }
    return pts;
  }
  var SZSEC = {
    I: ['I. Rugalmas alakváltozás', 'Az erő és a megnyúlás arányos (Hooke-törvény, σ = E·ε); tehermentesítéskor a próbatest visszanyeri eredeti hosszát. Az egyezményes rugalmassági határ az az erő (F0,02 / F0,002), amely 0,02, illetve szigorúbban 0,002% maradó nyúlást okoz.'],
    IIa: ['II. a) Határozott folyás', 'Megindul a maradó alakváltozás (az atomsíkok elcsúsznak egymáson) — a feszültség közel állandó. FeH / FeL: felső és alsó folyáshatár.'],
    IIb: ['II. b) Egyenletes nyúlás (keményedés)', 'Egyenletes képlékeny alakváltozás és alakítási keményedés: a megnyúlás növeléséhez egyre nagyobb erő kell, egészen a legnagyobb erőig (Fm).'],
    III: ['III. Kontrakció', 'Helyi alakváltozás (befűződés); az erő azért csökken, mert a keresztmetszet csökken. Szakadás az Fu erőnél.'],
  };

  AVIX.def('szakitas', {
    title: 'Szakítóvizsgálat',
    sub: 'A szakítódiagram szakaszai · jellemzők számítása mért adatokból',
    mount: function (el) {
      var st = U.store('szakitas', { m: 'lagy', e: 10 });
      var S = st.get(); if (!SZMAT[S.m]) S = { m: 'lagy', e: 10 };
      el.innerHTML = '<p class="ix-lead">A jegyzet szerinti szakaszok (I. rugalmas, II. a) folyás, II. b) egyenletes nyúlás, III. kontrakció). <b>Húzd a jelölőt a görbén</b>, és válts anyagot. A görbék jellemző, szemléltető értékekkel készültek.</p>';
      U.chips(el, Object.keys(SZMAT).map(function (k) { return [k, SZMAT[k].n]; }), S.m, function (v) { S.m = v; S.e = Math.min(S.e, SZMAT[v].a); st.set(S); pts = szCurve(SZMAT[S.m]); draw(); card(); }, 'Anyag');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.5; }, minH: 250, maxH: 400, label: 'Mérnöki feszültség–nyúlás diagram' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var pts = szCurve(SZMAT[S.m]);
      var sx, sy, M = { l: 50, r: 16, t: 18, b: 38 };
      function at(e) { for (var i = 1; i < pts.length; i++) if (pts[i][0] >= e) return pts[i]; return pts[pts.length - 1]; }
      P.draw = function () { draw(); };
      function draw() {
        var w = P.w, h = P.h, m = SZMAT[S.m]; if (!w) return;
        var xmax = S.m === 'ov' ? 1 : 35;
        sx = U.scale(0, xmax, M.l, w - M.r); sy = U.scale(0, 1000, h - M.b, M.t);
        var o = U.axes({ x0: M.l, x1: w - M.r, y0: M.t, y1: h - M.b, sx: sx, sy: sy, xt: S.m === 'ov' ? [0, 0.25, 0.5, 0.75, 1] : [0, 5, 10, 15, 20, 25, 30, 35], yt: [0, 200, 400, 600, 800, 1000], xl: 'fajlagos nyúlás ε, %', yl: 'σ = F/S₀, MPa' });
        var cols = { I: '--ix-2', IIa: '--ix-6', IIb: '--ix-3', III: '--ix-5' };
        for (var i = 1; i < pts.length; i++) o += '<line x1="' + sx(pts[i - 1][0]).toFixed(1) + '" y1="' + sy(pts[i - 1][1]).toFixed(1) + '" x2="' + sx(pts[i][0]).toFixed(1) + '" y2="' + sy(pts[i][1]).toFixed(1) + '" style="stroke:var(' + cols[pts[i][2]] + ');stroke-width:3;stroke-linecap:round"/>';
        var lab = function (x, y, t) { return '<text class="lb sm" x="' + sx(x).toFixed(1) + '" y="' + (sy(y) - 8).toFixed(1) + '" text-anchor="middle">' + t + '</text>'; };
        if (m.eh) o += lab(m.eh / m.E * 100 + 0.3, m.eh, 'ReH') + lab(m.lud, m.el - 45, 'ReL');
        if (m.rp) o += lab(m.rp / m.E * 100 + 0.2 + (S.m === 'ov' ? 0 : 1.2), m.rp - 30, 'Rp0,2');
        o += lab(m.ag, m.rm + 4, 'Rm');
        o += '<line x1="' + sx(m.a) + '" x2="' + sx(m.a) + '" y1="' + sy(0) + '" y2="' + (sy(at(m.a)[1]) + 6) + '" style="stroke:var(--muted);stroke-dasharray:3 3"/><text class="tk" x="' + sx(m.a) + '" y="' + (sy(0) - 6) + '" text-anchor="middle">A</text>';
        var p = at(S.e);
        o += '<circle class="mk" cx="' + sx(p[0]).toFixed(1) + '" cy="' + sy(p[1]).toFixed(1) + '" r="7"/>';
        P.svg.innerHTML = o;
      }
      P.drag(function (x) { S.e = U.clamp(sx.inv(x), 0, SZMAT[S.m].a); st.set(S); draw(); card(); });
      function card() {
        var m = SZMAT[S.m], p = at(S.e), sec = SZSEC[p[2]];
        out.innerHTML = '<h4><small>ε = ' + fmt(p[0], p[0] < 1 ? 2 : 1) + '% · σ ≈ ' + Math.round(p[1]) + ' MPa</small>' + sec[0] + '</h4><p>' + sec[1] + '</p>' +
          U.kv([[m.eh ? 'ReH / ReL' : 'Rp0,2', m.eh ? m.eh + ' / ' + m.el + ' MPa' : (m.rp ? m.rp + ' MPa' : '— (rideg)')], ['Rm', m.rm + ' MPa'], ['A (szakadási nyúlás)', fmt(m.a) + '%'], ['E', fmt(m.E / 1000) + ' GPa', 'a rugalmas szakasz meredeksége']]) +
          '<p class="ix-hint">' + m.d + '</p>';
      }
      // Számoló a mért adatokból
      var calc = U.h('div', 'ix-out');
      calc.innerHTML = '<h4><small>Mért adatokból</small>Szakítóvizsgálati jellemzők számítása</h4>';
      el.appendChild(calc);
      var sl = U.sliders(calc), V = { d0: 10, L0: 100, FeH: 22, Fm: 33, Lu: 130, du: 6 };
      var res = U.h('div'); calc.appendChild(res);
      function rc() {
        var S0 = Math.PI * V.d0 * V.d0 / 4, Su = Math.PI * V.du * V.du / 4;
        res.innerHTML = U.kv([['S₀ = πd₀²/4', fmt(S0, 1) + ' mm²'], ['ReH = FeH/S₀', Math.round(V.FeH * 1000 / S0) + ' MPa'], ['Rm = Fm/S₀', Math.round(V.Fm * 1000 / S0) + ' MPa'],
          ['A = (Lu − L₀)/L₀ · 100', fmt((V.Lu - V.L0) / V.L0 * 100, 1) + '%'], ['Z = (S₀ − Su)/S₀ · 100', fmt((S0 - Su) / S0 * 100, 1) + '%'], ['τ_ny ≈ 0,8·Rm', Math.round(0.8 * V.Fm * 1000 / S0) + ' MPa', 'nyírószilárdság közelítése']]) +
          '<p class="ix-note">Szabványos hengeres próbatest a jegyzet szerint: d₀ = 10 mm, L₀ = 100 mm.</p>';
      }
      U.slider(sl, { label: 'FeH', min: 5, max: 60, step: 0.5, value: V.FeH, unit: 'kN', dec: 1, onInput: function (v) { V.FeH = v; rc(); } });
      U.slider(sl, { label: 'Fm', min: 5, max: 80, step: 0.5, value: V.Fm, unit: 'kN', dec: 1, onInput: function (v) { V.Fm = v; rc(); } });
      U.slider(sl, { label: 'Lu', min: 100, max: 150, step: 0.5, value: V.Lu, unit: 'mm', dec: 1, onInput: function (v) { V.Lu = v; rc(); } });
      U.slider(sl, { label: 'du', min: 3, max: 10, step: 0.1, value: V.du, unit: 'mm', dec: 1, onInput: function (v) { V.du = v; rc(); } });
      rc();
      P.render(); card();
    },
  });

  /* ================================================================== */
  /* A/03 — keménységmérés                                               */
  /* ================================================================== */
  AVIX.def('kemenyseg', {
    title: 'Keménységmérés',
    sub: 'Brinell · Vickers · Rockwell · Poldi — számoló a jegyzet képleteivel',
    mount: function (el) {
      var st = U.store('kemenyseg', { m: 'hb' });
      var S = st.get();
      el.innerHTML = '<p class="ix-lead">Válassz eljárást, és állítsd a mért értéket — a lenyomat vázlata és a keménység azonnal frissül. A jegyzet feltételeit (lenyomatméret, próbatest-vastagság) is ellenőrzi.</p>';
      U.seg(el, [['hb', 'Brinell'], ['hv', 'Vickers'], ['hr', 'Rockwell'], ['po', 'Poldi']], S.m, function (v) { S.m = v; st.set(S); build(); }, 'Eljárás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.36; }, minH: 190, maxH: 280, label: 'Lenyomat vázlata' });
      var sl = U.h('div'); el.appendChild(sl);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var V = { D: 10, F: 3000, d: 4, hvF: 30, d1: 0.35, e: 0.12, sc: 'C', HBe: 200, de: 3.5, dx: 4 };
      function build() {
        sl.innerHTML = '';
        var g = U.sliders(sl);
        if (S.m === 'hb') {
          U.slider(g, { label: 'Golyó D', min: 1, max: 10, step: 1, value: V.D, unit: 'mm', dec: 0, onInput: function (v) { V.D = [1, 2.5, 5, 10].reduce(function (a, b) { return Math.abs(b - v) < Math.abs(a - v) ? b : a; }); upd(); } });
          U.slider(g, { label: 'Terhelés', min: 30, max: 3000, step: 10, value: V.F, unit: 'kp', dec: 0, onInput: function (v) { V.F = v; upd(); } });
          U.slider(g, { label: 'Lenyomat d', min: 0.2, max: 7, step: 0.01, value: V.d, unit: 'mm', dec: 2, onInput: function (v) { V.d = v; upd(); } });
        } else if (S.m === 'hv') {
          U.slider(g, { label: 'Terhelés', min: 1, max: 100, step: 1, value: V.hvF, unit: 'kp', dec: 0, onInput: function (v) { V.hvF = v; upd(); } });
          U.slider(g, { label: 'Átló d', min: 0.05, max: 1.2, step: 0.005, value: V.d1, unit: 'mm', dec: 3, onInput: function (v) { V.d1 = v; upd(); } });
        } else if (S.m === 'hr') {
          U.seg(sl, [['C', 'HRC (gyémántkúp)'], ['B', 'HRB (golyó)']], V.sc, function (v) { V.sc = v; upd(); }, 'Skála');
          g = U.sliders(sl);
          U.slider(g, { label: 'Maradó e', min: 0, max: 0.26, step: 0.001, value: V.e, unit: 'mm', dec: 3, onInput: function (v) { V.e = v; upd(); } });
        } else {
          U.slider(g, { label: 'Etalon HB', min: 100, max: 400, step: 1, value: V.HBe, unit: '', dec: 0, onInput: function (v) { V.HBe = v; upd(); } });
          U.slider(g, { label: 'd etalon', min: 1.5, max: 6, step: 0.01, value: V.de, unit: 'mm', dec: 2, onInput: function (v) { V.de = v; upd(); } });
          U.slider(g, { label: 'd vizsgált', min: 1.5, max: 6, step: 0.01, value: V.dx, unit: 'mm', dec: 2, onInput: function (v) { V.dx = v; upd(); } });
        }
        upd();
      }
      P.draw = function () { upd(); };
      function upd() {
        var w = P.w, h = P.h; if (!w) return;
        var o = '', cx = w / 2, sy0 = h * 0.55, rows = [], hint = '', ok = true;
        o += '<rect x="' + (cx - w * 0.42) + '" y="' + sy0 + '" width="' + (w * 0.84) + '" height="' + (h - sy0 - 10) + '" style="fill:var(--ix-8);fill-opacity:.22"/><line x1="' + (cx - w * 0.42) + '" x2="' + (cx + w * 0.42) + '" y1="' + sy0 + '" y2="' + sy0 + '" style="stroke:var(--ink);stroke-width:1.4"/>';
        if (S.m === 'hb' || S.m === 'po') {
          var D = S.m === 'hb' ? V.D : 10, d = S.m === 'hb' ? V.d : V.dx;
          if (d >= D) d = D * 0.99;
          var sc = (h * 0.42) / D, R = D / 2 * sc, hh = (D - Math.sqrt(D * D - d * d)) / 2;
          o += '<circle cx="' + cx + '" cy="' + (sy0 + hh * sc - R) + '" r="' + R + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5;fill-opacity:.85"/>';
          o += '<path d="M' + (cx - d / 2 * sc) + ',' + sy0 + ' A' + R + ',' + R + ' 0 0 0 ' + (cx + d / 2 * sc) + ',' + sy0 + '" style="fill:var(--acc);fill-opacity:.25;stroke:var(--acc);stroke-width:2"/>';
          o += '<line x1="' + (cx - d / 2 * sc) + '" x2="' + (cx + d / 2 * sc) + '" y1="' + (sy0 + hh * sc + 14) + '" y2="' + (sy0 + hh * sc + 14) + '" style="stroke:var(--acc);stroke-width:1.2"/><text class="la sm" x="' + cx + '" y="' + (sy0 + hh * sc + 28) + '" text-anchor="middle">d = ' + fmt(d, 2) + ' mm</text>';
          o += '<text class="lb sm" x="' + cx + '" y="' + (sy0 + hh * sc - R - 6) + '" text-anchor="middle">F</text><path d="M' + cx + ',' + (sy0 + hh * sc - 2 * R - 2) + 'V' + (sy0 + hh * sc - 2 * R + 18) + '" style="stroke:var(--ink);stroke-width:2"/>';
          if (S.m === 'hb') {
            var HB = 0.102 * 2 * (V.F * 9.80665) / (Math.PI * V.D * (V.D - Math.sqrt(V.D * V.D - V.d * V.d)));
            if (V.d >= V.D) HB = NaN;
            var lo = 0.24 * V.D, hi = 0.6 * V.D; ok = V.d > lo && V.d < hi;
            rows = [['HB = 0,102 · 2F / [πD(D − √(D² − d²))]', isFinite(HB) ? Math.round(HB) + ' HB' : '—', 'F newtonban (1 kp = 9,807 N)'], ['F/D² terhelési fok', fmt(V.F / (V.D * V.D), 1), 'acélhoz 30'], ['Lenyomat mélysége h', fmt((V.D - Math.sqrt(Math.max(0, V.D * V.D - V.d * V.d))) / 2, 3) + ' mm', 'a próbatest ennél ≥ 10-szer vastagabb legyen (h < 0,1·s)'], ['Rm ≈ 3,5 · HB', isFinite(HB) ? Math.round(3.5 * HB) + ' MPa' : '—', 'közelítés acélra']];
            hint = ok ? 'A lenyomat az érvényes tartományban van (0,24D < d < 0,6D).' : 'Érvénytelen mérés: a lenyomatnak 0,24D < d < 0,6D között kell lennie (' + fmt(lo, 2) + '–' + fmt(hi, 2) + ' mm) — válassz más golyót vagy terhelést.';
            hint += ' Jelölés pl.: <b>' + (isFinite(HB) ? Math.round(HB) : '…') + ' HBW ' + fmt(V.D) + '/' + V.F + '</b> (keményfém golyó; acélgolyónál HBS).';
          } else {
            var HBx = V.HBe * (V.de * V.de) / (V.dx * V.dx);
            rows = [['HBx = HBe · de² / dx²', Math.round(HBx) + ' HB'], ['Rm ≈ 3,5 · HB', Math.round(3.5 * HBx) + ' MPa']];
            hint = 'Egy kalapácsütés: a golyó egyszerre nyom lenyomatot a vizsgált darabba és az ismert keménységű etalonba — helyszínen, beépített alkatrészen is mérhető, de pontatlanabb, mint a laborban.';
          }
        } else if (S.m === 'hv') {
          var sc2 = (h * 0.5) / 1.2, a = V.d1 / Math.SQRT2 * sc2, dep = V.d1 / 7 * sc2;
          o += '<path d="M' + (cx - a) + ',' + sy0 + 'L' + cx + ',' + (sy0 + dep * 2.5) + 'L' + (cx + a) + ',' + sy0 + 'Z" style="fill:var(--acc);fill-opacity:.25;stroke:var(--acc);stroke-width:2"/>';
          o += '<path d="M' + (cx - a - 18) + ',' + (sy0 - 40) + 'L' + cx + ',' + (sy0 + dep * 2.5) + 'L' + (cx + a + 18) + ',' + (sy0 - 40) + '" style="fill:none;stroke:var(--ink);stroke-width:1.4"/><text class="tk" x="' + cx + '" y="' + (sy0 - 46) + '" text-anchor="middle">136°</text>';
          var q = Math.min(60, h * 0.3), qx = w * 0.82, qy = h * 0.3;
          o += '<rect x="' + (qx - q / 2) + '" y="' + (qy - q / 2) + '" width="' + q + '" height="' + q + '" transform="rotate(45 ' + qx + ' ' + qy + ')" style="fill:var(--acc);fill-opacity:.2;stroke:var(--acc);stroke-width:1.6"/><line x1="' + (qx - q * 0.707) + '" x2="' + (qx + q * 0.707) + '" y1="' + qy + '" y2="' + qy + '" style="stroke:var(--ink)"/><text class="la sm" x="' + qx + '" y="' + (qy + q * 0.707 + 16) + '" text-anchor="middle">d átló</text>';
          var HV = 0.189 * V.hvF * 9.80665 / (V.d1 * V.d1);
          rows = [['HV = 0,189 · F / d²', Math.round(HV) + ' HV', 'F newtonban, d mm-ben'], ['Jelölés', V.hvF === 30 ? Math.round(HV) + ' HV' : Math.round(HV) + ' HV ' + V.hvF, V.hvF === 30 ? '30 kp (294 N), 10–15 s: a terhelést nem kell kiírni' : 'eltérő terhelésnél kiírják, pl. 640 HV 40/20'], ['Behatolási mélység ≈ d/7', fmt(V.d1 / 7, 3) + ' mm', 'a jegyzet: < 0,15 × vastagság']];
          hint = 'A 136°-os gúlaszöget úgy választották, hogy HV ≈ HB legyen (kb. 400 HV-ig; e fölött a Vickers-érték nagyobb). Előny: a legkeményebb anyagok, vékony kéreg is mérhető, a lenyomat kicsi. Hátrány: lassú — gyors méréshez Rockwell.';
        } else {
          var e = V.e, sc3 = (h * 0.4) / 0.26, dd = e * sc3;
          o += V.sc === 'C'
            ? '<path d="M' + (cx - dd * 0.58 - 30) + ',' + (sy0 + dd - 52) + 'L' + cx + ',' + (sy0 + dd) + 'L' + (cx + dd * 0.58 + 30) + ',' + (sy0 + dd - 52) + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/><text class="tk" x="' + (cx + 40) + '" y="' + (sy0 + dd - 40) + '">120°</text>'
            : '<circle cx="' + cx + '" cy="' + (sy0 + dd - 22) + '" r="22" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/>';
          o += '<line x1="' + (cx + 60) + '" x2="' + (cx + 60) + '" y1="' + sy0 + '" y2="' + (sy0 + dd) + '" style="stroke:var(--acc);stroke-width:2"/><line x1="' + (cx + 52) + '" x2="' + (cx + 68) + '" y1="' + (sy0 + dd) + '" y2="' + (sy0 + dd) + '" style="stroke:var(--acc);stroke-width:2"/><text class="la sm" x="' + (cx + 74) + '" y="' + (sy0 + dd / 2 + 4) + '">e = ' + fmt(e, 3) + ' mm</text>';
          var HR = (V.sc === 'C' ? 100 : 130) - e / 0.002;
          rows = [[V.sc === 'C' ? 'HRC = 100 − e/0,002' : 'HRB = 130 − e/0,002', fmt(HR, 1) + ' HR' + V.sc], ['Rockwell-egységek', fmt(e / 0.002, 0), '1 egység = 0,002 mm maradó besüllyedés'], ['Terhelés', V.sc === 'C' ? 'F₀ = 98 N + F₁ → F = 1471 N (főterhelés 1373 N)' : 'F₀ = 98 N + főterhelés 882,6 N', 'előterhelés, főterhelés, majd a főterhelés levétele után mér']];
          hint = V.sc === 'C' ? '120°-os gyémántkúp: edzett, kemény anyagokhoz. Gyors, gyártás közbeni tömeges mérésre alkalmas; a keménység közvetlenül leolvasható.' : '1/16″ (1,59 mm) acélgolyó: lágyabb anyagokhoz. A skála 130 egységes.';
          if (HR < 20 || HR > 70) hint += ' <b>Figyelem:</b> a skála szokásos tartományán kívül vagy — válts skálát.';
        }
        P.svg.innerHTML = o;
        out.innerHTML = U.kv(rows) + '<p class="ix-hint">' + hint + '</p>';
      }
      P.render(); build();
    },
  });

  /* ================================================================== */
  /* A/03 — ütővizsgálat (TTKV), fárasztás (Wöhler), kúszás              */
  /* ================================================================== */
  AVIX.def('hofugg', {
    title: 'Ridegtörés, kifáradás, kúszás',
    sub: 'TTKV az ütőmunka–hőmérséklet görbéből · Wöhler-görbe · kúszásgörbe',
    mount: function (el) {
      var st = U.store('hofugg', { tab: 'ttkv' });
      var S = st.get();
      var V = { T: -20, re: 'lo', fcc: false, sa: 300, tw: 'acel', cs: 1 };
      el.innerHTML = '<p class="ix-lead">A hőmérséklet és az idő okozta három jelenség, a hozzájuk tartozó vizsgálattal. <b>Húzd a csúszkát</b>, és figyeld, melyik tartományba kerülsz.</p>';
      U.seg(el, [['ttkv', 'Charpy · TTKV'], ['wohler', 'Wöhler-görbe'], ['kuszas', 'Kúszás']], S.tab, function (v) { S.tab = v; st.set(S); build(); }, 'Nézet');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.46; }, minH: 240, maxH: 380 });
      var ctl = U.h('div'); el.appendChild(ctl);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var M = { l: 50, r: 16, t: 18, b: 40 };
      function kv(T) { return V.fcc ? 150 - T * 0.05 : 12 + 158 / (1 + Math.exp(-(T + 10) / 11)); }
      function build() {
        ctl.innerHTML = '';
        var g;
        if (S.tab === 'ttkv') {
          U.chips(ctl, [['lo', 'ReH ≤ 275 MPa → KV = 27,5 J'], ['hi', 'ReH > 275 MPa → KV = 38,2 J']], V.re, function (v) { V.re = v; upd(); });
          U.chips(ctl, [['bcc', 'Ferrites-perlites acél (α, BCC)'], ['fcc', 'Ausztenites acél (γ, FCC)']], V.fcc ? 'fcc' : 'bcc', function (v) { V.fcc = v === 'fcc'; upd(); });
          g = U.sliders(ctl);
          U.slider(g, { label: 'Hőmérséklet', min: -80, max: 60, step: 1, value: V.T, unit: '°C', dec: 0, onInput: function (v) { V.T = v; upd(); } });
        } else if (S.tab === 'wohler') {
          U.chips(ctl, [['acel', 'Acél'], ['al', 'Alumíniumötvözet']], V.tw, function (v) { V.tw = v; upd(); });
          g = U.sliders(ctl);
          U.slider(g, { label: 'σₐ amplitúdó', min: 60, max: 520, step: 5, value: V.sa, unit: 'MPa', dec: 0, onInput: function (v) { V.sa = v; upd(); } });
        } else {
          g = U.sliders(ctl);
          U.slider(g, { label: 'Terhelés/hőm.', min: 0.6, max: 1.6, step: 0.05, value: V.cs, fmt: function (v) { return v < 0.9 ? 'kicsi' : v < 1.2 ? 'közepes' : 'nagy'; }, onInput: function (v) { V.cs = v; upd(); } });
        }
        upd();
      }
      P.draw = function () { upd(); };
      function upd() {
        var w = P.w, h = P.h; if (!w) return;
        var o = '', x0 = M.l, x1 = w - M.r, y0 = M.t, y1 = h - M.b, sx, sy, html = '';
        if (S.tab === 'ttkv') {
          sx = U.scale(-80, 60, x0, x1); sy = U.scale(0, 180, y1, y0);
          o += U.axes({ x0: x0, x1: x1, y0: y0, y1: y1, sx: sx, sy: sy, xt: [-80, -60, -40, -20, 0, 20, 40, 60], yt: [0, 40, 80, 120, 160], xl: 'vizsgálati hőmérséklet, °C', yl: 'KV, J' });
          var thr = V.re === 'lo' ? 27.5 : 38.2, pts = [];
          for (var T = -80; T <= 60; T += 1) pts.push([T, kv(T)]);
          o += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" style="fill:transparent"/>';
          o += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + sy(thr) + '" y2="' + sy(thr) + '" style="stroke:var(--acc);stroke-dasharray:6 4;stroke-width:1.4"/><text class="la sm" x="' + (x1 - 4) + '" y="' + (sy(thr) - 6) + '" text-anchor="end">KV = ' + fmt(thr) + ' J</text>';
          o += '<path class="ln bd" d="' + U.path(pts, sx, sy) + '" style="stroke:var(--ix-2)"/>';
          var ttkv = null;
          if (!V.fcc) { for (T = -80; T <= 60; T += 0.1) if (kv(T) >= thr) { ttkv = T; break; } }
          if (ttkv != null) o += '<line x1="' + sx(ttkv) + '" x2="' + sx(ttkv) + '" y1="' + sy(thr) + '" y2="' + y1 + '" style="stroke:var(--acc);stroke-width:1.6"/><text class="la sm" x="' + sx(ttkv) + '" y="' + (y1 - 6) + '" text-anchor="middle">TTKV ≈ ' + Math.round(ttkv) + ' °C</text>';
          o += '<circle class="mk" cx="' + sx(V.T) + '" cy="' + sy(kv(V.T)) + '" r="7"/>';
          var k = kv(V.T), jell = V.fcc ? 'szívós (az FCC rácsnak sok csúszósíkja van — nincs éles átmenet)' : k < thr ? 'rideg (kis alakváltozás, szemcsés töret)' : k < 120 ? 'átmeneti (vegyes töret)' : 'szívós (nagy képlékeny alakváltozás)';
          html = '<h4><small>' + V.T + ' °C</small>KV ≈ ' + Math.round(k) + ' J — ' + jell + '</h4>' +
            '<p>A jegyzet szerint a TTKV-t kijelölő ütőmunka a folyáshatártól függ: ReH ≤ 275 MPa esetén 27,5 J (2,8 mkp), ReH > 275 MPa esetén 38,2 J (4,0 mkp). A TTKV a szerkezeti acélok <b>ridegtörési érzékenység szerinti rangsorolására</b> jó — a megengedett üzemi hőmérséklet megállapítására nem (arra törésmechanikai vizsgálat kell).</p>' +
            U.kv([['Ütőmunka', 'KV (KU) = G·(H − h)', 'G: a kalapács súlya, H, h: a kalapács kezdeti és véghelyzetének magassága'], ['Próbatest', '10 × 10 × 55 mm', 'kisméretű: 7,5 vagy 5 mm széles; V vagy U bemetszés'], ['Ütési sebesség', '3–5,5 m/s', 'az ütőmű méreteitől függ'], ['Jelölés', 'KV = 121 J', '300 J-os gép, V bemetszés, normál próbatest; KV 100/7,5 = 83 J']]);
        } else if (S.tab === 'wohler') {
          sx = U.scale(1e3, 1e9, x0, x1, true); sy = U.scale(0, 560, y1, y0);
          var steel = V.tw === 'acel', sD = 240, sE = 520, NK = 2e6;
          var sN = function (N) { if (steel) return N >= NK ? sD : sD + (sE - sD) * (Math.log(NK) - Math.log(N)) / (Math.log(NK) - Math.log(1e3)); return 110 + 330 * Math.pow(Math.log(1e9) - Math.log(N), 1.1) / Math.pow(Math.log(1e9) - Math.log(1e3), 1.1); };
          o += U.axes({ x0: x0, x1: x1, y0: y0, y1: y1, sx: sx, sy: sy, xt: [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9], yt: [0, 100, 200, 300, 400, 500], xgrid: true, xl: 'igénybevételi szám, N (log)', yl: 'σₐ, MPa', xf: function (t) { return '10' + String(Math.round(Math.log10(t))).replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }); } });
          var wp = []; for (var L = 3; L <= 9; L += 0.05) { var N = Math.pow(10, L); wp.push([N, sN(N)]); }
          if (steel) o += '<line x1="' + sx(1e7) + '" x2="' + sx(1e7) + '" y1="' + y0 + '" y2="' + y1 + '" style="stroke:var(--muted);stroke-dasharray:3 3"/><text class="tk" x="' + (sx(1e7) + 4) + '" y="' + (y0 + 12) + '">10⁷</text>';
          o += '<path class="ln bd" d="' + U.path(wp, sx, sy) + '" style="stroke:var(--ix-5)"/>';
          if (steel) o += '<text class="la sm" x="' + (x1 - 4) + '" y="' + (sy(sD) - 6) + '" text-anchor="end">σ_D kifáradási határ</text>';
          var life = null;
          if (steel && V.sa <= sD) life = Infinity;
          else { for (L = 3; L <= 9; L += 0.005) { if (sN(Math.pow(10, L)) <= V.sa) { life = Math.pow(10, L); break; } } }
          o += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + sy(V.sa) + '" y2="' + sy(V.sa) + '" style="stroke:var(--acc);stroke-width:1.2;stroke-dasharray:4 3"/>';
          if (life && isFinite(life)) o += '<circle class="mk" cx="' + sx(life) + '" cy="' + sy(V.sa) + '" r="7"/>';
          var reg = !steel ? 'Az Al-ötvözetnek nincs kifáradási határa: a Wöhler-görbe folyamatosan esik, csak adott ciklusszámhoz tartozó élettartam-szilárdság adható meg.'
            : life === Infinity ? 'III. tartomány: a kifáradási határ alatt — a próbatest gyakorlatilag végtelen sokszor (acélnál N = 10⁷ a „végtelen”) terhelhető.'
            : life < 1e4 ? 'I. kisciklusú fáradás tartománya: nagy amplitúdó, rövid élettartam.' : 'II. tartamszilárdság (élettartam) szakasz: adott ciklusszám után törés.';
          html = '<h4><small>σₐ = ' + V.sa + ' MPa</small>' + (life === Infinity ? 'Nem törik el (N → ∞)' : life ? 'Törés kb. N ≈ ' + fmt(life / Math.pow(10, Math.floor(Math.log10(life))), 1) + '·10' + String(Math.floor(Math.log10(life))).replace(/\d/g, function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]; }) + ' ciklusnál' : 'Azonnali törés (σₐ túl nagy)') + '</h4><p>' + reg + '</p>' +
            '<p>Felvétel a jegyzet szerint: legalább 6–8 próbatest, mindegyik más σₐ &lt; ReH amplitúdóval, állandó középfeszültséggel (σ = σ_m + σₐ·sin ωt), törésig. Acélnál a görbe meredeken eső egyenesből és vízszintes szakaszból áll, a töréspont kb. N = 2·10⁶-nál van.</p>';
        } else {
          sx = U.scale(0, 100, x0, x1); sy = U.scale(0, 30, y1, y0);
          o += U.axes({ x0: x0, x1: x1, y0: y0, y1: y1, sx: sx, sy: sy, xt: [0, 20, 40, 60, 80, 100], yt: [0, 10, 20, 30], xl: 'idő (relatív)', yl: 'ε, %' });
          var c = V.cs, e0 = 1.5 * c, rate = 0.12 * Math.pow(c, 3), tIII = Math.min(95, 80 / Math.pow(c, 2.2)), cp = [], t, eps;
          for (t = 0; t <= 100; t += 0.5) {
            eps = e0 + 3 * c * (1 - Math.exp(-t / 5)) + rate * t;
            if (t > tIII) eps += 0.02 * Math.pow(t - tIII, 2) * c;
            if (eps > 30) { cp.push([t, 30]); break; }
            cp.push([t, eps]);
          }
          o += '<rect x="' + sx(0) + '" y="' + y0 + '" width="' + (sx(12) - sx(0)) + '" height="' + (y1 - y0) + '" style="fill:var(--ix-2);fill-opacity:.08"/><rect x="' + sx(12) + '" y="' + y0 + '" width="' + (sx(Math.min(100, tIII)) - sx(12)) + '" height="' + (y1 - y0) + '" style="fill:var(--ix-3);fill-opacity:.08"/>';
          o += '<text class="lb sm" x="' + sx(6) + '" y="' + (y0 + 14) + '" text-anchor="middle">I.</text><text class="lb sm" x="' + sx((12 + Math.min(100, tIII)) / 2) + '" y="' + (y0 + 14) + '" text-anchor="middle">II.</text>' + (tIII < 98 ? '<text class="lb sm" x="' + sx(Math.min(99, tIII + 6)) + '" y="' + (y0 + 14) + '" text-anchor="middle">III.</text>' : '');
          o += '<path class="ln bd" d="' + U.path(cp, sx, sy) + '" style="stroke:var(--ix-1)"/>';
          html = '<h4><small>T = állandó, terhelés = állandó</small>Kúszásgörbe (Δl – lg t)</h4><p><b>I.</b> kezdeti, nagy nyúlási sebesség; <b>II.</b> felkeményedési (állandósult) szakasz — minél hosszabb, annál kúszásállóbb az anyag; <b>III.</b> ismét nagy nyúlási sebesség, töréssel. A jegyzet magyarázata: a lágyulási hőmérséklet fölött az alakítási keményedés csak ideiglenesen gátolja az alakváltozást, mert a lágyulás miatt a rugalmassági határ visszaesik — így változatlan terhelés mellett újabb alakváltozás jön létre. Nagyobb terhelés vagy hőmérséklet → rövidebb II. szakasz, hamarabb törés.</p>';
        }
        P.svg.innerHTML = o;
        out.innerHTML = html;
      }
      P.render(); build();
    },
  });
})();
