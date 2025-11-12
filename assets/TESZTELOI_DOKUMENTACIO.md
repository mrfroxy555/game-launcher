# Tesztelői Dokumentáció - Game Launcher

## Áttekintés

Ez a dokumentáció a Game Launcher platform teszteléséhez szükséges információkat tartalmazza.

## Tesztelési környezet

### Támogatott böngészők
- Google Chrome (v90+)
- Mozilla Firefox (v88+)
- Microsoft Edge (v90+)
- Safari (v14+)

### Tesztelendő eszközök
- Desktop PC (Windows, macOS, Linux)
- Laptop
- Tablet (iOS, Android)
- Okostelefon (iOS, Android)

### Képernyőfelbontások
- 1920x1080 (Full HD)
- 1366x768 (Laptop)
- 768x1024 (Tablet álló)
- 375x667 (Mobil)

## Funkcionális tesztek

### 1. Főoldal tesztelése

**TC-001: Főoldal betöltése**
- **Lépések**: Navigálj a főoldalra
- **Elvárt eredmény**: Az összes játékkártya megjelenik borítóképpel
- **Prioritás**: Magas

**TC-002: Játékkártyák megjelenítése**
- **Lépések**: Görgetsd végig az oldalt
- **Elvárt eredmény**: Minden játéknak van neve és borítóképe
- **Prioritás**: Magas

**TC-003: Háttér animáció**
- **Lépések**: Figyeld a hátteret
- **Elvárt eredmény**: A háttér animációk folyamatosan futnak, nem akadoznak
- **Prioritás**: Közepes

### 2. Navigációs tesztek

**TC-004: Játék megnyitása**
- **Lépések**: Kattints bármelyik játék kártyájára
- **Elvárt eredmény**: A játék betöltődik új oldalon
- **Prioritás**: Magas

**TC-005: Visszanavigálás**
- **Lépések**: Nyisd meg egy játékot, majd nyomj vissza gombot
- **Elvárt eredmény**: Visszajutsz a főoldalra
- **Prioritás**: Magas

### 3. Játék-specifikus tesztek

Minden játékra végezd el az alábbi teszteket:

**TC-006: Játék betöltése**
- **Lépések**: Nyisd meg a játékot
- **Elvárt eredmény**: A játék 5 másodpercen belül betöltődik és játszható
- **Prioritás**: Magas

**TC-007: Irányítás működése**
- **Lépések**: Használd a játék irányítását (billentyűzet/egér)
- **Elvárt eredmény**: Az irányítás válaszol, nincs késleltetés
- **Prioritás**: Magas

**TC-008: Játékmenet**
- **Lépések**: Játssz legalább 2 percig
- **Elvárt eredmény**: Nincs hiba, nem fagy le a játék
- **Prioritás**: Magas

**TC-009: Pontszám/állapot mentése**
- **Lépések**: Játssz, majd frissítsd az oldalt
- **Elvárt eredmény**: A pontszám vagy állapot megmarad (ha implementálva van)
- **Prioritás**: Közepes

## Teljesítmény tesztek

**TC-010: Betöltési idő**
- **Metrika**: Főoldal betöltési ideje < 3 másodperc
- **Eszköz**: Chrome DevTools (Network tab)

**TC-011: Játék FPS**
- **Metrika**: Minimum 30 FPS játék közben
- **Eszköz**: Chrome DevTools (Performance monitor)

**TC-012: Memóriahasználat**
- **Metrika**: Max 500 MB RAM használat játékonként
- **Eszköz**: Chrome Task Manager

## UI/UX tesztek

**TC-013: Reszponzív design**
- **Lépések**: Teszteld különböző képernyőméreteken
- **Elvárt eredmény**: A layout megfelelően alkalmazkodik
- **Prioritás**: Magas

**TC-014: Hover effektek**
- **Lépések**: Vidd az egeret a játékkártyák fölé
- **Elvárt eredmény**: Vizuális visszajelzés (hover animáció)
- **Prioritás**: Közepes

**TC-015: Betűtípusok és színek**
- **Lépések**: Ellenőrizd a szövegek olvashatóságát
- **Elvárt eredmény**: Minden szöveg jól olvasható
- **Prioritás**: Közepes

## Kompatibilitási tesztek

| Játék | Chrome | Firefox | Edge | Safari | Mobil |
|-------|--------|---------|------|--------|-------|
| 2048 | ✓ | ✓ | ✓ | ✓ | ✓ |
| Breakout | ✓ | ✓ | ✓ | ✓ | ✓ |
| Flappy | ✓ | ✓ | ✓ | ✓ | ? |
| Snake | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tetris | ✓ | ✓ | ✓ | ✓ | ? |
| ... | ... | ... | ... | ... | ... |

## Hibajelentés sablon

```
**Hiba azonosító**: BUG-XXX
**Súlyosság**: Kritikus/Magas/Közepes/Alacsony
**Játék/Modul**: [Név]
**Böngésző**: [Név + verzió]
**Eszköz**: [PC/Tablet/Mobil]

**Leírás**:
[Részletes leírás]

**Reprodukálási lépések**:
1. [Lépés 1]
2. [Lépés 2]
3. [Lépés 3]

**Elvárt eredmény**:
[Mit kellene történnie]

**Tényleges eredmény**:
[Mi történt valójában]

**Képernyőkép/Videó**:
[Ha van]

**Konzol hibaüzenetek**:
[F12 -> Console]
```

## Regressziós tesztelés

Minden új verzió kiadása előtt futtasd le az alábbi gyors teszteket:

1. Főoldal betöltődik ✓
2. Minden játékkártya látható ✓
3. 5 random játék megnyitása működik ✓
4. Navigáció vissza a főoldalra ✓
5. Mobil nézetben responsive ✓

## Tesztelési ütemterv

- **Smoke testing**: Minden commit után
- **Funkcionális tesztek**: Hetente
- **Teljesítmény tesztek**: Kéthetente
- **Teljes regressziós teszt**: Minden release előtt

## Eszközök

- **Chrome DevTools**: F12 (console, network, performance)
- **Lighthouse**: Teljesítmény auditálás
- **BrowserStack**: Cross-browser tesztelés
- **Responsively**: Responsive design tesztelés

## Teszt eredmények jelentése

A teszt eredményeket dokumentáld a GitHub Issues-ban:
- Label: `testing`, `bug`, `enhancement`
- Milestone: aktuális verzió
- Assignee: fejlesztő

## Kritikus hibák kezelése

Ha kritikus hibát találsz (játék nem töltődik be, crash, adatvesztés):
1. Azonnal jelentsd a fejlesztőnek
2. Nyiss GitHub Issue-t `critical` label-lel
3. Részletes reprodukálási lépéseket adj meg
4. Dokumentáld a környezetet (OS, böngésző, eszköz)