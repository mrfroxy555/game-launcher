# 🚢 Torpedó Játék

Klasszikus tengeri csata játék modern webes megvalósításban többjátékos támogatással!

## ✨ Jellemzők

- **🌐 Valódi többjátékos**: Különböző böngészőkben és számítógépeken is játszható
- **📱 Reszponzív design**: Mobil és desktop eszközökön egyaránt
- **🎨 Modern UI**: Dark theme elegáns dizájnnal
- **⚡ Valós idejű**: WebSocket alapú azonnali szinkronizáció
- **🔢 4 jegyű kód**: Egyszerű csatlakozás játékokhoz

## 🚀 Indítás

### Előfeltételek
- **Node.js** (v14 vagy újabb) - [Letöltés](https://nodejs.org/)

### Windows
1. Dupla kattintás a `start.bat` fájlra
2. A script automatikusan telepíti a függőségeket és elindítja a szervert
3. Nyisd meg a böngészőben: `http://localhost:3000`

### Manuális indítás
```bash
# Függőségek telepítése (csak első alkalommal)
npm install

# Szerver indítása
npm start
```

## 🎮 Játék Menete

### 1. Játék Létrehozása
- Kattints a **"Játék létrehozása"** gombra
- Egy 4 jegyű kód generálódik
- Oszd meg ezt a kódot a másik játékossal

### 2. Csatlakozás
- A másik játékos kattintson a **"Csatlakozás játékhoz"** gombra
- Írja be a 4 jegyű kódot
- Automatikusan elindul a hajók elhelyezésének fázisa

### 3. Hajók Elhelyezése
- **5 hajó** elhelyezendő: 5, 4, 3, 3, 2 méretűek
- **Kattintás** a hajó kiválasztásához
- **Kattintás** a táblán az elhelyezéshez
- **Forgatás gomb** a tájolás változtatásához
- **Véletlenszerű gomb** az automatikus elhelyezéshez

### 4. Játék
- **Kattintás** az ellenfél táblájára a lövéshez
- **Találat**: Piros négyzet 💥, folytathatod a lövést
- **Melléfogás**: Kék négyzet 💧, az ellenfél következik
- **Elsüllyedt hajó**: Narancssárga négyzetek

### 5. Győzelem
- Az első, aki minden ellenséges hajót elsüllyeszt, nyer
- Megjelenik a statisztika: lövések, találatok, pontosság

## 🌐 Hálózati Játék

A játék **valódi többjátékos** WebSocket technológiával:

✅ **Különböző böngészők** (Chrome vs Firefox vs Opera)  
✅ **Különböző számítógépek** (LAN hálózaton)  
✅ **Valós idejű szinkronizáció**  
✅ **Automatikus újracsatlakozás**  

### LAN hálózaton történő játék
1. Tudja meg a szerver IP címét: `ipconfig` (Windows) vagy `ifconfig` (Mac/Linux)
2. A másik számítógépen nyisd meg: `http://[SZERVER_IP]:3000`
   - Például: `http://192.168.1.100:3000`

## 🔧 Technikai Részletek

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Kommunikáció**: WebSocket (Socket.IO)
- **Adattárolás**: Memória (szerver oldali)

## 📊 Játék Állapotok

```
Waiting → Setup → Playing → Finished
   ↓        ↓        ↓         ↓
 Várakozás → Hajók → Lövések → Eredmény
```

## 🐛 Hibakeresés

### Kapcsolati problémák
- Ellenőrizd, hogy a szerver fut-e
- Tűzfal beállítások ellenőrzése
- Böngésző konzol hibáinak ellenőrzése (F12)

### Portfoglaltság
Ha a 3000-es port foglalt, módosítsd a `server.js`-ben:
```javascript
const PORT = process.env.PORT || 3001; // Más port használata
```

## 📝 Licenc

MIT License - Szabadon használható és módosítható.

---

**Készítette**: Torpedó Játék Fejlesztője  
**Verzió**: 2.0 (WebSocket verzió)  
**Utolsó frissítés**: 2024