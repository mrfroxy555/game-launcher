# 🎵 Zenei Találós Játék

Egy interaktív webes alkalmazás, ahol feltöltöd a saját zenéidet, és ki kell találnod, melyik zene játszik éppen egy 10 másodperces részlet alapján.

## 📋 Jellemzők

- **Fájl feltöltés**: Drag & drop vagy tallózással tölthetsz fel audio fájlokat
- **Intelligens audio lejátszás**: A zenék közepétől játszik 10 másodpercet
- **3 opciós választás**: Minden körben 3 lehetőség közül választhatsz
- **Pontozás rendszer**: Kövesd nyomon a teljesítményedet
- **Responsive dizájn**: Mobilon és asztalon is jól működik
- **Modern UI**: Elegáns, animált felhasználói felület

## 🚀 Használat

### 1. Fájlok megnyitása
- Nyisd meg az `index.html` fájlt bármilyen modern webböngészőben
- Chrome, Firefox, Safari, Edge mind támogatott

### 2. Zenék feltöltése
- Húzd a zenefájlokat a feltöltési területre, vagy
- Kattints a "Fájlok kiválasztása" gombra
- Minimum 3 zenefájl szükséges a játékhoz
- Támogatott formátumok: MP3, WAV, OGG, M4A, stb.

### 3. Játék indítása
- Kattints a "Játék indítása" gombra
- A játék 5 körből áll (vagy kevesebb, ha kevés zenéd van)
- Minden körben egy 10 másodperces részletet hallasz
- Válaszd ki a három opció közül a helyes választ

### 4. Eredmények
- A játék végén láthatod a pontszámodat
- Választhatsz újra játékot vagy új zenék feltöltését

## 🎯 Játék mechanizmus

1. **Audio feldolgozás**: A rendszer automatikusan megtalálja minden zene közepét
2. **Véletlenszerű kiválasztás**: Minden körben véletlenszerűen választ egy zenét lejátszásra
3. **Opciók generálása**: 3 véletlenszerű zene nevét jeleníti meg (beleértve a helyeset)
4. **Pontozás**: Minden helyes válaszért 1 pont
5. **Időzítő**: Pontosan 10 másodpercig játszik minden részlet

## 📁 Fájl struktúra

```
music-guesser/
├── index.html      # Fő HTML oldal
├── style.css       # CSS stílusok
├── script.js       # JavaScript logika
└── README.md       # Ez a dokumentáció
```

## 💡 Tippek

- **Válogatott zenék**: Használj olyan zenéket, amiket jól ismersz
- **Fájlnevek**: A játék a fájlnevek alapján generálja az opciókat, ezért használj beszédes neveket
- **Audio minőség**: Jobb minőségű fájlok jobb élményt nyújtanak
- **Zenei stílus**: Vegyes műfajú zenékkel érdekesebb a játék

## 🔧 Technikai részletek

- **HTML5**: Szemantikus struktúra
- **CSS3**: Modern design gradientekkel és animációkkal
- **Vanilla JavaScript**: Nincs szükség külső könyvtárakra
- **HTML5 Audio API**: Audio fájlok kezelése
- **File API**: Fájl feltöltés kezelése
- **Drag & Drop API**: Húzás-ejtés funkció

## ⚠️ Korlátozások

- Csak helyi fájlok használhatók (biztonsági okokból)
- Modern böngésző szükséges
- Az audio fájloknak támogatott formátumúaknak kell lenniük

## 🎮 Élvezd a játékot!

Teszteld a zeneismeretedet és szórakozz a saját zenéiddel!