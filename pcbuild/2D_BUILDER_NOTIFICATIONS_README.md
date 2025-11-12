# 2D Builder Értesítések Kikapcsolása

## Áttekintés

A PC Builder alkalmazásban most lehetőség van a 2D Builder rész értesítéseinek külön kezelésére. Ezek az értesítések csak a 2D Builder funkcionalitáshoz kapcsolódnak, míg az alkalmazás többi része továbbra is normálisan jelenít meg értesítéseket.

## Mi változott

### 1. Új beállítás hozzáadva
- `show2DBuilderNotifications` tulajdonság az alkalmazásban
- Alapértelmezetten bekapcsolva (true)
- Az beállítás eltárolódik a localStorage-ban

### 2. Módosított showToast metódus
- Új paraméter: `is2DBuilder` (alapértelmezetten false)
- Ha `is2DBuilder = true` és a beállítás ki van kapcsolva, nem jelennek meg az értesítések

### 3. Frissített 2D Builder értesítések
A következő értesítések érintettek:
- ✅ "Komponens sikeresen elhelyezve!"
- ✅ "Processzor elhelyezve a CPU foglalatban!"
- ❌ "A komponens nem helyezhető ide!"
- ❌ "Hiba történt! Próbáld újra."
- ⚠️ "Komponens eltávolítva!"
- ⚠️ "Először válassz komponenseket!"
- ✅ "2D builder kitörölve!"
- ℹ️ "Automatikus összerakás elindítva!"

### 4. Új kezelőfelület elem
- "Értesítések" gomb a 2D Builder vezérlőpanelen
- 🔔 ikon: értesítések bekapcsolva
- 🔕 ikon: értesítések kikapcsolva
- Tooltip magyarázat

## Használat

### Értesítések kikapcsolása
1. Navigálj a "2D Builder" fülre
2. Kattints az "Értesítések" gombra a vezérlőpanelen
3. Az ikon 🔔-ról 🔕-re változik
4. Egy utolsó értesítés megerősíti a változást

### Értesítések visszakapcsolása
1. A "2D Builder" fülön kattints újra az "Értesítések" gombra
2. Az ikon 🔕-ról 🔔-re változik
3. Az értesítések újra megjelennek

## Technikai részletek

### Kód változások

```javascript
// Új tulajdonság a konstruktorban
this.show2DBuilderNotifications = localStorage.getItem('show2DBuilderNotifications') !== 'false';

// Módosított showToast metódus
showToast(message, type = 'info', is2DBuilder = false) {
    if (is2DBuilder && !this.show2DBuilderNotifications) {
        return; // Nem jeleníti meg az értesítést
    }
    // ... többi kód
}

// 2D Builder értesítések frissítve
this.showToast('Komponens sikeresen elhelyezve!', 'success', true);
```

### HTML változások
```html
<button id="toggle2DNotifications" class="btn btn-secondary" title="2D Builder értesítések kikapcsolása">
    <i class="fas fa-bell"></i> Értesítések
</button>
```

## Megjegyzések

- ✅ A beállítás megmarad az oldal újratöltése után (localStorage)
- ✅ Csak a 2D Builder értesítések érintettek
- ✅ Az alkalmazás többi része változatlan marad
- ✅ Felhasználóbarát kezelőfelület
- ✅ Vizuális visszajelzés az aktuális állapotról

## Tesztelés

1. Nyisd meg az alkalmazást
2. Menj a 2D Builder fülre
3. Próbálj komponenseket húzni/elengedni - láthatóak az értesítések
4. Kattints az "Értesítések" gombra
5. Próbálj újra komponenseket húzni - nincsenek értesítések
6. Frissítsd az oldalt - a beállítás megmarad