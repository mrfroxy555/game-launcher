# PSU Slot Hozzáadása a 2D Builder-hez

## Áttekintés

A 2D PC Builder most már támogatja a PSU (tápegység) elhelyezését egy dedikált slot-ban az alaplap mellé.

## Változások

### 1. HTML módosítások (`index.html`)
- **Új PSU drop zone** hozzáadva az alaplap bal oldalára:
  ```html
  <!-- PSU Slot - left side of motherboard -->
  <div class="visual-drop-zone psu-drop-zone" data-slot-type="psu" id="visual-psu-slot" 
       style="position: absolute; left: 50px; top: 200px; width: 120px; height: 180px; z-index: 10;">
      <div class="drop-zone-content" id="psu-visual-content"></div>
  </div>
  ```
- **Útmutató frissítve**: "Tápegység az alaplap bal oldalán helyezhető el" pont hozzáadva

### 2. JavaScript módosítások (`script.js`)

#### Automatikus összeszerelés frissítése
- `autoBuild2D()` funkció kiegészítve PSU támogatással:
  ```javascript
  if (this.selectedComponents.psu) {
      placements.push({ category: 'psu', componentId: this.selectedComponents.psu.id, slot: 'visual-psu-slot' });
  }
  ```

#### Validáció frissítése
- `isValidVisualDrop()` funkció kiegészítve PSU validációval:
  ```javascript
  // PSU can go in PSU slot
  if (slotType === 'psu' && componentCategory === 'psu') {
      console.log('✅ PSU special case match');
      return true;
  }
  ```

- `validate2DVisualPlacement()` funkció kiegészítve:
  ```javascript
  if (componentCategory === slotType || 
      (slotType === 'storage' && componentCategory === 'storage') ||
      (slotType === 'psu' && componentCategory === 'psu')) {
      // Valid placement
  }
  ```

#### Kép frissítése
- PSU kép elérési útja frissítve: `'psu': 'images/tap.png'`
- Case kép is frissítve: `'case': 'images/gephaz.jpg'`

## Funkciók

### ✅ Támogatott műveletek
1. **Drag & Drop**: PSU húzása az inventory-ból a PSU slot-ba
2. **Automatikus elhelyezés**: "Automatikus Összerakás" gomb PSU-t is elhelyezi
3. **Validáció**: Csak PSU komponensek helyezhetők a PSU slot-ba
4. **Eltávolítás**: Dupla klikk vagy "Összes Eltávolítása" gomb
5. **Vizuális visszajelzés**: Drag-over effektus és invalid-drop állapot

### 📍 PSU Slot pozíció
- **Hely**: Az alaplap bal oldalán
- **Koordináták**: left: 50px, top: 200px
- **Méret**: 120px × 180px
- **Z-index**: 10 (alaplap felett, de más komponensek alatt)

## Tesztelés

### Alapvető funkciók tesztelése
1. ✅ Válassz ki egy tápegységet a Builder fülön
2. ✅ Menj a 2D Builder fülre
3. ✅ Húzd a PSU-t az alaplap bal oldalán lévő területre
4. ✅ Ellenőrizd, hogy megjelenik a "Komponens sikeresen elhelyezve!" üzenet
5. ✅ Teszteld az "Automatikus Összerakás" funkciót
6. ✅ Próbáld dupla klikkel eltávolítani a PSU-t

### Hibakezelés tesztelése
1. ✅ Próbálj más komponenst húzni a PSU slot-ba → hibaüzenet
2. ✅ Próbálj PSU-t húzni már foglalt slot-ba → hibaüzenet
3. ✅ Teszteld az értesítések ki/bekapcsolását

## Megjegyzések

- **Kompatibilitás**: Az eredeti funkcionalitás változatlan maradt
- **Teljesítmény**: Nincs jelentős hatás a teljesítményre
- **UI/UX**: Konzisztens a többi komponens kezelésével
- **Kép**: A `tap.png` fájlt használja a PSU vizualizációjához

## Következő lépések (opcionális)

1. **CSS stílusok**: Egyedi PSU slot stílusok hozzáadása
2. **Animáció**: PSU elhelyezési animáció
3. **Kábelezés**: Virtuális kábelek megjelenítése PSU és más komponensek között
4. **Teljesítmény számítás**: PSU wattage ellenőrzés a teljes rendszer fogyasztásával