// Torpedó Játék - JavaScript
class BattleshipGame {
    constructor() {
        this.gameCode = null;
        this.isHost = false;
        this.playerId = this.generatePlayerId();
        this.currentScreen = 'start';
        this.gameState = {
            phase: 'waiting', // waiting, setup, playing, finished
            currentPlayer: 1,
            players: {
                1: {
                    id: null,
                    name: 'Játékos 1',
                    board: this.createEmptyBoard(),
                    ships: [],
                    shots: 0,
                    hits: 0,
                    ready: false
                },
                2: {
                    id: null,
                    name: 'Játékos 2', 
                    board: this.createEmptyBoard(),
                    ships: [],
                    shots: 0,
                    hits: 0,
                    ready: false
                }
            },
            winner: null
        };
        
        // Hajók konfigurációja
        this.shipSizes = [5, 4, 3, 3, 2];
        this.selectedShip = null;
        this.shipOrientation = 'horizontal'; // horizontal, vertical
        this.placedShips = [];
        
        // UI elemek
        this.elements = {};
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.showScreen('start');
        
        // LocalStorage változások figyelése
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('battleship_')) {
                this.handleStorageChange(e);
            }
        });
        
        // Saját LocalStorage változások figyelése (polling)
        setInterval(() => {
            this.checkForGameUpdates();
        }, 1000);
    }
    
    cacheElements() {
        // Gombok
        this.elements.createGameBtn = document.getElementById('createGameBtn');
        this.elements.joinGameBtn = document.getElementById('joinGameBtn');
        this.elements.backFromCreateBtn = document.getElementById('backFromCreateBtn');
        this.elements.backFromJoinBtn = document.getElementById('backFromJoinBtn');
        this.elements.joinConfirmBtn = document.getElementById('joinConfirmBtn');
        this.elements.readyBtn = document.getElementById('readyBtn');
        this.elements.rotateBtn = document.getElementById('rotateBtn');
        this.elements.randomPlaceBtn = document.getElementById('randomPlaceBtn');
        this.elements.newGameBtn = document.getElementById('newGameBtn');
        this.elements.playAgainBtn = document.getElementById('playAgainBtn');
        this.elements.backToMenuBtn = document.getElementById('backToMenuBtn');
        
        // Képernyők
        this.elements.startScreen = document.getElementById('startScreen');
        this.elements.createScreen = document.getElementById('createScreen');
        this.elements.joinScreen = document.getElementById('joinScreen');
        this.elements.setupScreen = document.getElementById('setupScreen');
        this.elements.gameScreen = document.getElementById('gameScreen');
        this.elements.resultScreen = document.getElementById('resultScreen');
        
        // Egyéb elemek
        this.elements.gameCodeDisplay = document.getElementById('gameCodeDisplay');
        this.elements.gameCodeInput = document.getElementById('gameCodeInput');
        this.elements.joinError = document.getElementById('joinError');
        this.elements.setupBoard = document.getElementById('setupBoard');
        this.elements.shipsList = document.getElementById('shipsList');
        this.elements.ownBoard = document.getElementById('ownBoard');
        this.elements.enemyBoard = document.getElementById('enemyBoard');
        this.elements.currentPlayer = document.getElementById('currentPlayer');
        this.elements.turnIndicator = document.getElementById('turnIndicator');
        this.elements.hitCount = document.getElementById('hitCount');
        this.elements.shotCount = document.getElementById('shotCount');
        this.elements.playerName = document.getElementById('playerName');
    }
    
    bindEvents() {
        this.elements.createGameBtn.addEventListener('click', () => this.createGame());
        this.elements.joinGameBtn.addEventListener('click', () => this.showJoinScreen());
        this.elements.backFromCreateBtn.addEventListener('click', () => this.showScreen('start'));
        this.elements.backFromJoinBtn.addEventListener('click', () => this.showScreen('start'));
        this.elements.joinConfirmBtn.addEventListener('click', () => this.joinGame());
        this.elements.readyBtn.addEventListener('click', () => this.confirmShipPlacement());
        this.elements.rotateBtn.addEventListener('click', () => this.rotateShip());
        this.elements.randomPlaceBtn.addEventListener('click', () => this.randomPlaceShips());
        this.elements.newGameBtn.addEventListener('click', () => this.showScreen('start'));
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.elements.backToMenuBtn.addEventListener('click', () => this.showScreen('start'));
        
        // Enter key a kód megadásnál
        this.elements.gameCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });
        
        // Csak számok a kód beviteli mezőben
        this.elements.gameCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateGameCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    createEmptyBoard() {
        return Array(10).fill(null).map(() => Array(10).fill({
            hasShip: false,
            isHit: false,
            shipId: null
        }));
    }
    
    showScreen(screenName) {
        // Összes képernyő elrejtése
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Kiválasztott képernyő megjelenítése
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
        
        this.currentScreen = screenName;
    }
    
    createGame() {
        this.gameCode = this.generateGameCode();
        this.isHost = true;
        
        // Játékos 1-ként regisztrálás
        this.gameState.players[1].id = this.playerId;
        this.gameState.players[1].name = 'Házigazda';
        
        // Játék állapot mentése
        localStorage.setItem(`battleship_${this.gameCode}`, JSON.stringify(this.gameState));
        localStorage.setItem(`battleship_${this.gameCode}_created_at`, Date.now());
        
        this.elements.gameCodeDisplay.textContent = this.gameCode;
        this.showScreen('create');
        
        // Várakozás a másik játékosra
        this.waitForSecondPlayer();
    }
    
    waitForSecondPlayer() {
        const checkInterval = setInterval(() => {
            const gameData = localStorage.getItem(`battleship_${this.gameCode}`);
            if (gameData) {
                const state = JSON.parse(gameData);
                if (state.players[2].id && state.phase === 'setup') {
                    clearInterval(checkInterval);
                    this.gameState = state;
                    this.startSetupPhase();
                }
            }
        }, 1000);
    }
    
    showJoinScreen() {
        this.showScreen('join');
        this.elements.gameCodeInput.focus();
    }
    
    joinGame() {
        const code = this.elements.gameCodeInput.value.trim();
        
        if (code.length !== 4) {
            this.showError('A játék kód 4 számjegyű kell legyen!');
            return;
        }
        
        const gameData = localStorage.getItem(`battleship_${code}`);
        if (!gameData) {
            this.showError('Nem található játék ezzel a kóddal!');
            return;
        }
        
        const state = JSON.parse(gameData);
        
        if (state.players[2].id) {
            this.showError('Ez a játék már megtelt!');
            return;
        }
        
        this.gameCode = code;
        this.isHost = false;
        
        // Játékos 2-ként csatlakozás
        state.players[2].id = this.playerId;
        state.players[2].name = 'Csatlakozott játékos';
        state.phase = 'setup';
        
        localStorage.setItem(`battleship_${this.gameCode}`, JSON.stringify(state));
        
        this.gameState = state;
        this.startSetupPhase();
    }
    
    showError(message) {
        this.elements.joinError.textContent = message;
        this.elements.joinError.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.joinError.classList.add('hidden');
        }, 3000);
    }
    
    startSetupPhase() {
        this.showScreen('setup');
        this.elements.playerName.textContent = this.isHost ? 'Házigazda' : 'Csatlakozott játékos';
        this.createSetupBoard();
        this.updateShipsList();
    }
    
    createSetupBoard() {
        this.elements.setupBoard.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.handleSetupCellClick(row, col));
                cell.addEventListener('mouseenter', () => this.showShipPreview(row, col));
                cell.addEventListener('mouseleave', () => this.hideShipPreview());
                
                this.elements.setupBoard.appendChild(cell);
            }
        }
    }
    
    updateShipsList() {
        const shipItems = this.elements.shipsList.querySelectorAll('.ship-item');
        
        shipItems.forEach((item, index) => {
            const isPlaced = this.placedShips.some(ship => ship.index === index);
            
            if (isPlaced) {
                item.classList.add('placed');
                item.classList.remove('selected');
            } else {
                item.classList.remove('placed');
            }
            
            item.addEventListener('click', () => {
                if (!isPlaced) {
                    this.selectShip(index);
                }
            });
        });
        
        // Kész gomb állapot frissítése
        if (this.placedShips.length === this.shipSizes.length) {
            this.elements.readyBtn.classList.remove('disabled');
        } else {
            this.elements.readyBtn.classList.add('disabled');
        }
    }
    
    selectShip(index) {
        // Előző kijelölés eltávolítása
        this.elements.shipsList.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Új hajó kijelölése
        const shipItem = this.elements.shipsList.children[index];
        shipItem.classList.add('selected');
        this.selectedShip = { index, size: this.shipSizes[index] };
    }
    
    handleSetupCellClick(row, col) {
        if (!this.selectedShip) return;
        
        if (this.canPlaceShip(row, col, this.selectedShip.size, this.shipOrientation)) {
            this.placeShip(row, col, this.selectedShip.size, this.shipOrientation);
            this.selectedShip = null;
            this.updateShipsList();
            this.updateSetupBoard();
        }
    }
    
    canPlaceShip(row, col, size, orientation) {
        const cells = this.getShipCells(row, col, size, orientation);
        
        if (cells.some(([r, c]) => r < 0 || r >= 10 || c < 0 || c >= 10)) {
            return false; // Túllóg a táblából
        }
        
        // Ellenőrizzük, hogy nincs-e ütközés más hajókkal
        for (const [r, c] of cells) {
            // Maga a cella
            if (this.isCellOccupied(r, c)) return false;
            
            // Szomszédos cellák ellenőrzése
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
                        if (this.isCellOccupied(nr, nc)) return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    getShipCells(row, col, size, orientation) {
        const cells = [];
        
        if (orientation === 'horizontal') {
            for (let i = 0; i < size; i++) {
                cells.push([row, col + i]);
            }
        } else {
            for (let i = 0; i < size; i++) {
                cells.push([row + i, col]);
            }
        }
        
        return cells;
    }
    
    isCellOccupied(row, col) {
        return this.placedShips.some(ship => 
            ship.cells.some(([r, c]) => r === row && c === col)
        );
    }
    
    placeShip(row, col, size, orientation) {
        const cells = this.getShipCells(row, col, size, orientation);
        const shipId = `ship_${this.placedShips.length}`;
        
        this.placedShips.push({
            index: this.selectedShip.index,
            id: shipId,
            size: size,
            cells: cells,
            hits: 0,
            sunk: false
        });
    }
    
    updateSetupBoard() {
        const cells = this.elements.setupBoard.querySelectorAll('.board-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            cell.className = 'board-cell';
            
            if (this.isCellOccupied(row, col)) {
                cell.classList.add('ship');
            }
        });
    }
    
    showShipPreview(row, col) {
        if (!this.selectedShip) return;
        
        this.hideShipPreview();
        
        const cells = this.getShipCells(row, col, this.selectedShip.size, this.shipOrientation);
        const canPlace = this.canPlaceShip(row, col, this.selectedShip.size, this.shipOrientation);
        
        cells.forEach(([r, c]) => {
            const cell = this.elements.setupBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                cell.classList.add(canPlace ? 'preview' : 'invalid');
            }
        });
    }
    
    hideShipPreview() {
        this.elements.setupBoard.querySelectorAll('.board-cell').forEach(cell => {
            cell.classList.remove('preview', 'invalid');
        });
    }
    
    rotateShip() {
        this.shipOrientation = this.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    }
    
    randomPlaceShips() {
        this.placedShips = [];
        
        for (let i = 0; i < this.shipSizes.length; i++) {
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                
                if (this.canPlaceShip(row, col, this.shipSizes[i], orientation)) {
                    const cells = this.getShipCells(row, col, this.shipSizes[i], orientation);
                    const shipId = `ship_${this.placedShips.length}`;
                    
                    this.placedShips.push({
                        index: i,
                        id: shipId,
                        size: this.shipSizes[i],
                        cells: cells,
                        hits: 0,
                        sunk: false
                    });
                    placed = true;
                }
                attempts++;
            }
        }
        
        this.updateSetupBoard();
        this.updateShipsList();
    }
    
    confirmShipPlacement() {
        if (this.placedShips.length !== this.shipSizes.length) return;
        
        const playerNum = this.isHost ? 1 : 2;
        this.gameState.players[playerNum].ships = this.placedShips;
        this.gameState.players[playerNum].ready = true;
        
        // Hajók elhelyezése a táblán
        this.placedShips.forEach(ship => {
            ship.cells.forEach(([row, col]) => {
                this.gameState.players[playerNum].board[row][col] = {
                    hasShip: true,
                    isHit: false,
                    shipId: ship.id
                };
            });
        });
        
        localStorage.setItem(`battleship_${this.gameCode}`, JSON.stringify(this.gameState));
        
        // Várakozás a másik játékosra
        this.waitForGameStart();
    }
    
    waitForGameStart() {
        const checkInterval = setInterval(() => {
            const gameData = localStorage.getItem(`battleship_${this.gameCode}`);
            if (gameData) {
                const state = JSON.parse(gameData);
                if (state.players[1].ready && state.players[2].ready && state.phase === 'playing') {
                    clearInterval(checkInterval);
                    this.gameState = state;
                    this.startGame();
                } else if (state.players[1].ready && state.players[2].ready) {
                    // Mindkét játékos kész, indítjuk a játékot
                    state.phase = 'playing';
                    localStorage.setItem(`battleship_${this.gameCode}`, JSON.stringify(state));
                }
            }
        }, 1000);
    }
    
    startGame() {
        this.showScreen('game');
        this.createGameBoards();
        this.updateGameUI();
    }
    
    createGameBoards() {
        this.createOwnBoard();
        this.createEnemyBoard();
    }
    
    createOwnBoard() {
        this.elements.ownBoard.innerHTML = '';
        const playerNum = this.isHost ? 1 : 2;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const cellData = this.gameState.players[playerNum].board[row][col];
                
                if (cellData.hasShip) {
                    cell.classList.add('ship');
                }
                
                if (cellData.isHit) {
                    cell.classList.add('hit');
                }
                
                this.elements.ownBoard.appendChild(cell);
            }
        }
    }
    
    createEnemyBoard() {
        this.elements.enemyBoard.innerHTML = '';
        const enemyNum = this.isHost ? 2 : 1;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const cellData = this.gameState.players[enemyNum].board[row][col];
                
                if (cellData.isHit) {
                    if (cellData.hasShip) {
                        cell.classList.add('hit');
                    } else {
                        cell.classList.add('miss');
                    }
                }
                
                cell.addEventListener('click', () => this.handleEnemyBoardClick(row, col));
                
                this.elements.enemyBoard.appendChild(cell);
            }
        }
    }
    
    handleEnemyBoardClick(row, col) {
        const playerNum = this.isHost ? 1 : 2;
        const enemyNum = this.isHost ? 2 : 1;
        
        // Ellenőrizzük, hogy a játékos körön van-e
        if (this.gameState.currentPlayer !== playerNum) return;
        
        // Ellenőrizzük, hogy a cella már meg lett-e lőve
        if (this.gameState.players[enemyNum].board[row][col].isHit) return;
        
        this.makeShot(row, col);
    }
    
    makeShot(row, col) {
        const playerNum = this.isHost ? 1 : 2;
        const enemyNum = this.isHost ? 2 : 1;
        
        this.gameState.players[playerNum].shots++;
        this.gameState.players[enemyNum].board[row][col].isHit = true;
        
        const hit = this.gameState.players[enemyNum].board[row][col].hasShip;
        
        if (hit) {
            this.gameState.players[playerNum].hits++;
            
            // Ellenőrizzük, hogy elsüllyedt-e hajó
            const shipId = this.gameState.players[enemyNum].board[row][col].shipId;
            this.checkShipSunk(enemyNum, shipId);
        }
        
        // Következő játékos köre (csak ha nem talált)
        if (!hit) {
            this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
        }
        
        // Győzelem ellenőrzése
        if (this.checkWinCondition()) {
            this.gameState.phase = 'finished';
            this.gameState.winner = playerNum;
        }
        
        localStorage.setItem(`battleship_${this.gameCode}`, JSON.stringify(this.gameState));
        
        if (this.gameState.phase === 'finished') {
            this.endGame();
        } else {
            this.updateGameUI();
            this.createGameBoards();
        }
    }
    
    checkShipSunk(playerNum, shipId) {
        const ship = this.gameState.players[playerNum].ships.find(s => s.id === shipId);
        if (!ship) return;
        
        const allCellsHit = ship.cells.every(([row, col]) => 
            this.gameState.players[playerNum].board[row][col].isHit
        );
        
        if (allCellsHit) {
            ship.sunk = true;
            
            // Elsüllyedt hajó celláinak megjelölése
            ship.cells.forEach(([row, col]) => {
                const cell = this.elements.enemyBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('sunk');
                }
            });
        }
    }
    
    checkWinCondition() {
        const playerNum = this.isHost ? 1 : 2;
        const enemyNum = this.isHost ? 2 : 1;
        
        // Ellenőrizzük, hogy az ellenfél összes hajója elsüllyedt-e
        const allShipsSunk = this.gameState.players[enemyNum].ships.every(ship => ship.sunk);
        return allShipsSunk;
    }
    
    updateGameUI() {
        const playerNum = this.isHost ? 1 : 2;
        const isMyTurn = this.gameState.currentPlayer === playerNum;
        
        this.elements.currentPlayer.textContent = this.isHost ? 'Házigazda' : 'Csatlakozott játékos';
        this.elements.turnIndicator.textContent = isMyTurn ? '• Te vagy körön' : '• Ellenfél körön';
        this.elements.turnIndicator.className = isMyTurn ? 'turn-indicator' : 'turn-indicator enemy-turn';
        
        this.elements.shotCount.textContent = this.gameState.players[playerNum].shots;
        this.elements.hitCount.textContent = this.gameState.players[playerNum].hits;
    }
    
    endGame() {
        const playerNum = this.isHost ? 1 : 2;
        const won = this.gameState.winner === playerNum;
        
        document.getElementById('resultIcon').textContent = won ? '🏆' : '😞';
        document.getElementById('resultTitle').textContent = won ? 'Győzelem!' : 'Vereség!';
        document.getElementById('resultMessage').textContent = won ? 
            'Gratulálunk, legyőzted az ellenfelet!' : 
            'Ne izgulj, legközelebb sikerülni fog!';
        
        document.getElementById('finalShotCount').textContent = this.gameState.players[playerNum].shots;
        document.getElementById('finalHitCount').textContent = this.gameState.players[playerNum].hits;
        
        const accuracy = this.gameState.players[playerNum].shots > 0 ? 
            Math.round((this.gameState.players[playerNum].hits / this.gameState.players[playerNum].shots) * 100) : 0;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        
        this.showScreen('result');
    }
    
    playAgain() {
        // Játék újrakezdése
        this.resetGame();
        this.createGame();
    }
    
    resetGame() {
        // LocalStorage tisztítása
        if (this.gameCode) {
            localStorage.removeItem(`battleship_${this.gameCode}`);
            localStorage.removeItem(`battleship_${this.gameCode}_created_at`);
        }
        
        // Játék állapot visszaállítása
        this.gameCode = null;
        this.isHost = false;
        this.playerId = this.generatePlayerId();
        this.placedShips = [];
        this.selectedShip = null;
        this.shipOrientation = 'horizontal';
        
        this.gameState = {
            phase: 'waiting',
            currentPlayer: 1,
            players: {
                1: {
                    id: null,
                    name: 'Játékos 1',
                    board: this.createEmptyBoard(),
                    ships: [],
                    shots: 0,
                    hits: 0,
                    ready: false
                },
                2: {
                    id: null,
                    name: 'Játékos 2',
                    board: this.createEmptyBoard(),
                    ships: [],
                    shots: 0,
                    hits: 0,
                    ready: false
                }
            },
            winner: null
        };
    }
    
    handleStorageChange(e) {
        if (e.key === `battleship_${this.gameCode}`) {
            const newState = JSON.parse(e.newValue);
            this.gameState = newState;
            
            // UI frissítése az új állapot alapján
            if (this.currentScreen === 'game') {
                this.updateGameUI();
                this.createGameBoards();
            }
        }
    }
    
    checkForGameUpdates() {
        if (!this.gameCode) return;
        
        const gameData = localStorage.getItem(`battleship_${this.gameCode}`);
        if (gameData) {
            const newState = JSON.parse(gameData);
            
            // Csak akkor frissítünk, ha van változás
            if (JSON.stringify(newState) !== JSON.stringify(this.gameState)) {
                this.gameState = newState;
                
                if (this.currentScreen === 'game') {
                    this.updateGameUI();
                    this.createGameBoards();
                }
                
                if (newState.phase === 'finished' && this.currentScreen !== 'result') {
                    this.endGame();
                }
            }
        }
    }
}

// Játék indítása
document.addEventListener('DOMContentLoaded', () => {
    window.battleshipGame = new BattleshipGame();
});