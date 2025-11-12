# Fejlesztői Dokumentáció - Game Launcher

## Projekt áttekintés

A Game Launcher egy statikus HTML/CSS/JavaScript alapú játékgyűjtemény platform. A projekt célja, hogy egyszerű, böngészőben futó játékokat tartalmazzon egyetlen webes felületen.

## Technológiai stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (modern features, animations)
- **Build**: Nincs build tool (statikus HTML)
- **Hosting**: GitHub Pages
- **Version Control**: Git/GitHub

## Projekt struktúra

```
web/
├── index.html              # Főoldal (launcher)
├── assets/                 # Közös eszközök
│   ├── styles.css         # Főoldal stílusok
│   ├── app.js             # Főoldal logika
│   ├── bg.js              # Háttér animációk
│   └── placeholder.svg    # Helyőrző képek
├── [játék-név]/           # Minden játék saját mappában
│   ├── index.html         # Játék HTML
│   ├── script.js          # Játék logika
│   ├── style.css          # Játék stílusok
│   └── cover.jpg          # Játék borítókép
└── README.md              # Projekt dokumentáció
```

## Telepítés és futtatás

### Lokális fejlesztés

```bash
# Repository klónozása
git clone https://github.com/mrfroxy555/game-launcher.git
cd game-launcher

# HTTP szerver indítása (Python példa)
python -m http.server 8000

# Vagy Node.js http-server
npx http-server -p 8000

# Böngészőben nyisd meg
http://localhost:8000
```

### Élő deployment (GitHub Pages)

```bash
# Változtatások commitolása
git add .
git commit -m "Új feature leírás"
git push origin main

# GitHub Pages automatikusan deploy-ol
# Elérhető: https://mrfroxy555.github.io/game-launcher/
```

## Új játék hozzáadása

### 1. Játék mappa létrehozása

```bash
mkdir új-játék-név
cd új-játék-név
```

### 2. Alap fájlok létrehozása

**index.html** sablon:
```html
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Játék Név</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <!-- Játék UI elemek -->
    </div>
    <script src="script.js"></script>
</body>
</html>
```

**script.js** sablon:
```javascript
// Játék változók
let gameState = {
    running: false,
    score: 0
};

// Inicializálás
function init() {
    // Eseménykezelők beállítása
    setupEventListeners();
    // Játék indítása
    startGame();
}

// Játék logika
function gameLoop() {
    if (!gameState.running) return;
    
    // Update
    update();
    // Render
    render();
    
    requestAnimationFrame(gameLoop);
}

// Betöltés után indítás
window.addEventListener('load', init);
```

**style.css** sablon:
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: #1a1a2e;
    color: #fff;
    overflow: hidden;
}

.game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

### 3. Borítókép hozzáadása

- Méret: 400x300px (javasolt)
- Formátum: JPG vagy PNG
- Fájlnév: `cover.jpg` vagy `cover.png`

### 4. Játék regisztrálása a főoldalon

Szerkeszd az `assets/app.js` fájlt, add hozzá az új játékot:

```javascript
const games = [
    // ... meglévő játékok
    {
        title: 'Új Játék Név',
        folder: 'új-játék-név',
        cover: 'új-játék-név/cover.jpg',
        description: 'Rövid leírás'
    }
];
```

## Kódolási szabványok

### JavaScript

```javascript
// Használj const és let-et, kerüld a var-t
const GAME_WIDTH = 800;
let playerScore = 0;

// CamelCase függvénynevek
function calculateScore() { }

// PascalCase osztálynevek
class GameEntity { }

// UPPERCASE konstansok
const MAX_LIVES = 3;

// Arrow functions használata
const handleClick = (e) => {
    console.log('Clicked');
};

// Template literals
console.log(`Score: ${playerScore}`);
```

### CSS

```css
/* BEM metodológia használata */
.game-container { }
.game-container__title { }
.game-container--dark { }

/* CSS változók használata */
:root {
    --primary-color: #4a90e2;
    --secondary-color: #f39c12;
}

/* Modern CSS features */
.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

### HTML

```html
<!-- Szemantikus HTML5 elemek -->
<header>
<main>
<section>
<article>
<footer>

<!-- Accessible attributes -->
<button aria-label="Start game">Play</button>
<img src="logo.png" alt="Game logo">

<!-- Meta tags -->
<meta name="description" content="Játék leírás">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Teljesítmény optimalizálás

### JavaScript optimalizálás

```javascript
// requestAnimationFrame használata
function gameLoop() {
    requestAnimationFrame(gameLoop);
}

// Event delegation
document.addEventListener('click', (e) => {
    if (e.target.matches('.button')) {
        // Handle click
    }
});

// Debounce/Throttle használata
const handleResize = debounce(() => {
    // Resize logic
}, 250);
```

### CSS optimalizálás

```css
/* Transform és opacity animációk (GPU gyorsítás) */
.animated {
    transform: translateX(0);
    opacity: 1;
    transition: transform 0.3s, opacity 0.3s;
}

/* Will-change használata */
.game-sprite {
    will-change: transform;
}
```

### Képek optimalizálás

- Használj WebP formátumot, ahol lehetséges
- Tömörítsd a képeket (TinyPNG, ImageOptim)
- Lazy loading: `<img loading="lazy">`

## Hibakeresés

### Chrome DevTools

```javascript
// Console logging
console.log('Debug info:', variable);
console.error('Error message');
console.table(arrayOfObjects);

// Performance measuring
console.time('gameLoop');
// ... code
console.timeEnd('gameLoop');

// Breakpoints
debugger; // Automatikus breakpoint
```

### Gyakori hibák

**1. Canvas nem jelenik meg**
```javascript
// Helyes
const canvas = document.getElementById('gameCanvas');
canvas.width = 800;
canvas.height = 600;
```

**2. EventListener nem törlődik**
```javascript
// Használj named function-t
function handleClick() { }
element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick);
```

**3. Memory leak animációkban**
```javascript
let animationId;

function startAnimation() {
    animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
    cancelAnimationFrame(animationId);
}
```

## Git workflow

### Branch stratégia

```bash
main            # Production branch (GitHub Pages)
├── develop     # Development branch
└── feature/*   # Feature branches
```

### Commit üzenetek

```
feat: Új Snake játék hozzáadása
fix: Tetris forgási hiba javítása
docs: README frissítése
style: Kód formázás javítása
refactor: Game loop újraírása
test: Unit tesztek hozzáadása
```

### Pull Request folyamat

1. Új branch létrehozása
2. Változtatások implementálása
3. Commit és push
4. PR nyitása GitHub-on
5. Code review
6. Merge main-be

## API dokumentáció

### localStorage használat

```javascript
// Pontszám mentése
localStorage.setItem('highScore', score);

// Pontszám betöltése
const highScore = localStorage.getItem('highScore') || 0;

// Törlés
localStorage.removeItem('highScore');
```

### Canvas API példa

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Téglalap rajzolása
ctx.fillStyle = '#4a90e2';
ctx.fillRect(x, y, width, height);

// Kör rajzolása
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();

// Képek
const img = new Image();
img.onload = () => ctx.drawImage(img, x, y);
img.src = 'sprite.png';
```

## Tesztelés

### Manual testing checklist

- [ ] Játék betöltődik hibák nélkül
- [ ] Irányítás működik
- [ ] Pontszám helyesen számolódik
- [ ] Játék vége kezelése helyes
- [ ] Mobilon is működik
- [ ] Különböző böngészőkben tesztelve

### Browser kompatibilitás

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### GitHub Pages setup

1. Repository Settings → Pages
2. Source: `main` branch, `/ (root)` folder
3. Save
4. Site URL: `https://mrfroxy555.github.io/game-launcher/`

### Automatikus deployment

Minden push a `main` branch-re automatikusan deploy-ol.

## Függőségek

Ez a projekt **nulla** külső függőséggel rendelkezik. Minden vanilla JavaScript/CSS/HTML.

## Verziókezelés

- Semantic Versioning: `MAJOR.MINOR.PATCH`
- Példa: `v1.2.3`

## Kapcsolat és hozzájárulás

- GitHub: https://github.com/mrfroxy555/game-launcher
- Issues: Új játék ötletek, bug reportok
- Pull Requests: Szívesen fogadunk!