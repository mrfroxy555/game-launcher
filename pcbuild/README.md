# 🖥️ PC Builder Simulator - Modern 2024

Egy professzionális PC építő szimulátor a legújabb 2024-es technológiákkal, reális árakkal és fejlett funkciókkal.

## ✨ Főbb Funkciók

### 🔧 Core Funkciók
- **Komponens Választás**: 8 különböző kategóriában válogathat (CPU, GPU, Alaplap, RAM, Tárhely, Tápegység, Számítógépház, Hűtés)
- **Reális Árak**: 2024-es valós piaci árak alapján
- **Kompatibilitás Ellenőrzés**: Automatikus socket, RAM, tápegység és méret kompatibilitás ellenőrzés
- **Teljesítmény Becslés**: Gaming és munkateljesítmény kalkuláció
- **Valós Idejű Feedback**: Toast értesítések és hibakezelés

### 📱 Modern UI/UX
- **Dark/Light Mode**: Automatikus témaváltás és mentés
- **Responsive Design**: Tökéletes megjelenés mobil és desktop eszközökön
- **Touch-Friendly**: Optimalizált érintőképernyős használatra
- **Animációk**: Smooth átmenetek és visual feedback
- **Accessibility**: Keyboard navigation és screen reader támogatás

### 🎯 Speciális Funkciók
- **2D PC Builder**: Interaktív drag & drop PC összerakás 2D-ben
- **Előre Konfigurált Gépek**: 4 professzionálisan összeállított konfiguráció
- **Mentés/Betöltés**: LocalStorage alapú konfigurációk mentése
- **Auto-Save**: Automatikus mentés 30 másodpercenként
- **Keresés**: Komponens keresés név, márka és specifikáció alapján
- **Benchmark Eredmények**: Valós gaming és munkateljesítmény becslés
- **Teljesítmény Preview**: 5 különböző benchmark kategória
- **Automatikus Összerakás**: Egy klikkel automatikus 2D összerakás

### 🔧 Technológiai Stack
- **HTML5**: Szemantikus struktúra
- **CSS3**: Modern design system, CSS Grid/Flexbox, CSS Custom Properties
- **Vanilla JavaScript**: ES6+ features, moduláris architektúra
- **LocalStorage**: Adatok helyi mentése
- **Progressive Enhancement**: Fokozatos fejlesztés alapelv

## 🚀 Indítás

1. **Fájlok letöltése**: Töltsd le az összes fájlt egy mappába
2. **Webszerver indítása**: Indíts egy helyi webszervert (pl. Live Server)
3. **Böngésző**: Nyisd meg az `index.html` fájlt a böngészőben
4. **Élvezd**: Kezdj el számítógépet építeni!

### Lokális Szerver Indítása

**VS Code Live Server**:
```bash
# VS Code Extension: Live Server
# Jobb klikk az index.html-re → "Open with Live Server"
```

**Python**:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -M SimpleHTTPServer 8000
```

**Node.js**:
```bash
npx serve .
# vagy
npx http-server
```

## 📊 Komponens Adatbázis

### CPU Kategória (10+ opció)
- **Intel 14th Gen**: i9-14900KS, i7-14700K, i5-14600K
- **Intel 12th Gen Budget**: i5-12400F, i3-12100F
- **AMD Ryzen 9000**: Ryzen 9 9950X, Ryzen 7 9700X, Ryzen 5 9600X
- **AMD Ryzen 5000**: Ryzen 5 5600 (AM4)
- **AMD APU**: Ryzen 3 4300G (integrált GPU-val)

### GPU Kategória (12+ opció)
- **High-End**: RTX 4090, RTX 4080 SUPER, RX 7900 XTX
- **Mid-Range**: RTX 4070 Ti SUPER, RTX 3060, RX 7800 XT, RX 6600
- **Budget**: GTX 1660 SUPER, GTX 1080, RX 580
- **Entry**: GT 1030 (alapszintű használatra)

### RAM Kategória (9+ opció)
- **DDR5**: 4800-7200 MHz (16GB-64GB)
- **DDR4**: 2666-3600 MHz (8GB-32GB)
- **Budget és Premium**: különböző ár-érték kategóriák

### Storage & Egyéb Komponensek
- **NVMe SSD**: PCIe 3.0/4.0/5.0 (240GB-4TB)
- **SATA SSD/HDD**: Budget tárolási megoldások
- **Motherboard**: Intel LGA1700, AM4, AM5 socket támogatás
- **PSU**: 300W-1600W tartomány, 80+ hatékonyság
- **Házak és Hűtés**: Air és liquid cooling megoldások

## 🎮 Teljesítmény Benchmarks

### Gaming Performance
- **4K Ultra Settings**: RTX 4090 vezetésével
- **1440p Ultra Settings**: Optimális gaming élmény
- **Ray Tracing**: Valós idejű fénykövetés támogatás
- **DLSS/FSR**: AI-alapú felbontás növelés

### Workstation Performance
- **Video Editing**: Adobe Premiere Pro, DaVinci Resolve
- **3D Rendering**: Blender, 3ds Max, Cinema 4D
- **Streaming**: Multi-threaded encoding teljesítmény
- **Content Creation**: Professzionális munkaterhelés

## 🛠️ Fejlett Funkciók

### Kompatibilitás Rendszer
```javascript
// Socket kompatibilitás
LGA1700 ↔ Z790, Z690, B760, H770
AM5 ↔ X870E, X870, X670E, B650E, B650

// RAM típus támogatás
Intel: DDR5 (DDR4 korlátozott támogatás)
AMD: DDR5 kizárólag

// Tápegység kalkuláció
RTX 4090: 850W+ ajánlott
Teljes rendszer: 80% PSU kapacitás max
```

### Teljesítmény Számítások
```javascript
Gaming Score = (GPU × 60%) + (CPU × 30%) + (RAM × 10%)
Work Score = (CPU × 50%) + (RAM × 30%) + (Storage × 20%)
4K Gaming = GPU benchmark × resolution modifier
Power Draw = Σ(component TDP + efficiency factors)
```

## 🎨 Design System

### Színpaletta
```css
--primary-color: #6366f1    /* Indigo */
--success-color: #10b981    /* Emerald */
--warning-color: #f59e0b    /* Amber */
--error-color: #ef4444      /* Red */
```

### Tipográfia
```css
font-family: 'Inter', system-ui, sans-serif
Font weights: 300, 400, 500, 600, 700
```

### Responsive Breakpoints
```css
Mobile: max-width: 480px
Tablet: max-width: 768px
Desktop: 768px+
```

## 🔒 Adatkezelés

### LocalStorage
- **Témá**: `theme` (dark/light)
- **Mentett Konfigurációk**: `savedConfigs`
- **Auto-Save**: `autosave_build`

### Adatstruktúra
```javascript
{
  id: "timestamp",
  name: "Konfiguráció neve",
  components: {
    cpu: {...},
    gpu: {...},
    // ...
  },
  totalPrice: 1234567,
  gamingScore: 95,
  workScore: 88,
  createdAt: "ISO timestamp"
}
```

## ⌨️ Billentyű Parancsok

- **Ctrl/Cmd + S**: Konfiguráció mentése
- **Ctrl/Cmd + K**: Keresés fókusz
- **Escape**: Modal bezárása
- **Tab**: Navigáció billentyűzettel

## 🌐 Browser Támogatás

### Teljes Támogatás
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Minimális Funkcionalitás
- IE 11 (korlátozott)
- Régebbi mobilböngészők

## 📱 PWA Funkciók (Jövőbeli)

- Service Worker
- Offline működés
- App installálás
- Push értesítések

## 🐛 Ismert Problémák

1. **Safari Animációk**: Néhány CSS animáció limitált
2. **IE Kompatibilitás**: CSS Grid korlátozott támogatás
3. **Mobilböngészők**: LocalStorage méret limitációk

## 🔄 Verzió Információ

**Jelenlegi verzió**: v1.0.0
**Utolsó frissítés**: 2024. október
**Következő funkciók**:
- Komponens összehasonlítás
- 3D vizualizáció
- Export/import funkciók
- Multi-nyelv támogatás

## 📄 Licenc

MIT License - Szabad felhasználás személyes és kereskedelmi célokra.

## 🤝 Közreműködés

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📧 Kapcsolat

Ha kérdésed vagy javaslatod van, nyiss egy Issue-t a GitHub repository-ban!

---

**Készítette**: Modern PC Builder Team  
**Technológia**: HTML5, CSS3, Vanilla JavaScript  
**Utolsó frissítés**: 2024 Október  

Élvezd a PC építést! 🎮🖥️