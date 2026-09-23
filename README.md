# Tanulás

Tananyagok és Claude dokumentumok egy helyen — iPhone 15 Pro Max-ra és iPad 5. generációra optimalizált web app.

**Megnyitás:** https://m00nsc0rched.github.io/Tanulas/

## Telepítés iPhone-ra / iPadre
1. Nyisd meg a fenti linket **Safariban**.
2. Koppints a **Megosztás** gombra, majd a **„Főképernyőhöz adás”** pontra.
3. Az app ezután teljes képernyőn, saját ikonnal indul, és offline is megnyílik.

## Funkciók
- **Claude dokumentumok** — a claude.ai-on lévő Artifact-ok listája (keresés, rendezés, kedvencek), koppintásra a claude.ai-on nyílnak meg.
- **Saját linkek** — bármilyen dokumentum linkje hozzáadható; csak az adott eszközön tárolódik.
- **Kezdőlap** — kedvencek és legutóbb megnyitott dokumentumok.
- Világos / sötét téma, offline működés (service worker).

## A dokumentumlista frissítése
A lista a `data/artifacts.json` fájlból jön. Új Artifact után szólj Claude-nak:
*„Frissítsd a Tanulás app dokumentumlistáját”* — ő lekéri az Artifact-listát, frissíti a fájlt és feltölti.
Az app előtérbe kerüléskor magától is szinkronizál.

## Fejlesztés
Nincs build lépés: statikus HTML/CSS/JS. Bármilyen statikus szerverrel futtatható, a `main` ágra pusholt
változtatások automatikusan kikerülnek a GitHub Pages-re.
