// Game Engine
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Game state
        this.gameState = 'start'; // start, playing, paused, gameOver, levelComplete, upgrade
        this.pausedTime = 0;
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.score = 0;
        this.missedEnemies = 0;
        this.maxMissedEnemies = 1000;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.stars = [];
        this.powerups = [];
        this.screenShake = 0;
        
        // Achievement system
        this.achievements = {
            kills: 0,
            totalKills: parseInt(localStorage.getItem('totalKills') || '0'),
            perfectRuns: parseInt(localStorage.getItem('perfectRuns') || '0'),
            allUpgrades: localStorage.getItem('allUpgrades') === 'true',
            currentRunDamage: 0
        };
        
        // Upgrades
        this.playerUpgrades = {
            doubleShot: false,
            shield: false,
            rapidFire: false,
            multiShot: false,
            laserBeam: false,
            autoRepair: false
        };
        
        // Spaceship image
        this.spaceshipImage = new Image();
        this.spaceshipImage.src = 'spaceship.png';
        this.imageLoaded = false;
        this.spaceshipImage.onload = () => {
            this.imageLoaded = true;
        };
        
        // Sound system
        this.soundEnabled = true;
        this.bgMusic = null;
        this.initSoundSystem();
        
        // Game settings
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal' // easy, normal, hard
        };
        
        // Game settings
        this.keys = {};
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        this.backgroundLevel = 1;
        
        // Background variations
        this.backgroundColors = [
            'radial-gradient(ellipse at center, #1a0033 0%, #000000 100%)', // Default purple
            'radial-gradient(ellipse at center, #001a33 0%, #000000 100%)', // Blue
            'radial-gradient(ellipse at center, #331a00 0%, #000000 100%)', // Orange
            'radial-gradient(ellipse at center, #1a3300 0%, #000000 100%)', // Green
            'radial-gradient(ellipse at center, #33001a 0%, #000000 100%)', // Red
            'radial-gradient(ellipse at center, #1a1a33 0%, #000000 100%)', // Deep blue
            'radial-gradient(ellipse at center, #331a1a 0%, #000000 100%)', // Red-brown
            'radial-gradient(ellipse at center, #1a331a 0%, #000000 100%)', // Forest
            'radial-gradient(ellipse at center, #33331a 0%, #000000 100%)', // Yellow
            'radial-gradient(ellipse at center, #2a1a33 0%, #000000 100%)'  // Purple-red
        ];
        
        // Level configurations
        this.levelConfigs = [
            { enemySpeed: 1, spawnRate: 2000, enemyHealth: 1, enemyTypes: ['basic'] },
            { enemySpeed: 1.2, spawnRate: 1800, enemyHealth: 1, enemyTypes: ['basic', 'fast'] },
            { enemySpeed: 1.4, spawnRate: 1600, enemyHealth: 2, enemyTypes: ['basic', 'fast'] },
            { enemySpeed: 1.6, spawnRate: 1400, enemyHealth: 2, enemyTypes: ['basic', 'fast', 'tank'] },
            { enemySpeed: 1.8, spawnRate: 1200, enemyHealth: 2, enemyTypes: ['basic', 'fast', 'tank'] },
            { enemySpeed: 2.0, spawnRate: 1000, enemyHealth: 3, enemyTypes: ['basic', 'fast', 'tank', 'shooter'] },
            { enemySpeed: 2.2, spawnRate: 900, enemyHealth: 3, enemyTypes: ['basic', 'fast', 'tank', 'shooter'] },
            { enemySpeed: 2.4, spawnRate: 800, enemyHealth: 4, enemyTypes: ['fast', 'tank', 'shooter', 'boss'] },
            { enemySpeed: 2.6, spawnRate: 700, enemyHealth: 4, enemyTypes: ['tank', 'shooter', 'boss'] },
            { enemySpeed: 3.0, spawnRate: 600, enemyHealth: 5, enemyTypes: ['boss', 'shooter'] }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateStars();
        this.hideSkipButton(); // Hide button on game start
        this.loadSettings();
        this.gameLoop();
    }
    
    initSoundSystem() {
        // Create Web Audio API context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.audioContext = null;
        }
    }
    
    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.settings.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playShootSound() {
        this.playSound(800, 0.1, 'square', 0.05);
    }
    
    playExplosionSound() {
        this.playSound(150, 0.3, 'sawtooth', 0.1);
    }
    
    playPowerUpSound() {
        this.playSound(600, 0.2, 'sine', 0.08);
        setTimeout(() => this.playSound(800, 0.2, 'sine', 0.08), 100);
    }
    
    playUISound() {
        this.playSound(400, 0.15, 'triangle', 0.06);
    }
    
    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
    
    updateBackground() {
        const bgIndex = (this.currentLevel - 1) % this.backgroundColors.length;
        document.getElementById('gameContainer').style.background = this.backgroundColors[bgIndex];
    }
    
    spawnPowerup() {
        const powerupTypes = ['health', 'rapidFire', 'doublePoints', 'slowMotion'];
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        const x = Math.random() * (this.canvas.width - 40) + 20;
        this.powerups.push(new Powerup(x, -30, type));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing' && this.player) {
                    this.player.shoot();
                }
            }
            if (e.code === 'Escape') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.togglePause();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button events
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.showUpgradeScreen();
        });
        
        document.getElementById('skipLevelButton').addEventListener('click', () => {
            this.skipLevel();
        });
        
        document.getElementById('closeUpgradeButton').addEventListener('click', () => {
            this.closeUpgradeScreen();
        });
        
        document.getElementById('settingsButton').addEventListener('click', () => {
            this.showSettingsScreen();
        });
        
        document.getElementById('closeSettingsButton').addEventListener('click', () => {
            this.hideSettingsScreen();
        });
        
        // Settings controls
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.settings.soundEnabled = !this.settings.soundEnabled;
            this.updateSettingsUI();
            this.playUISound();
        });
        
        document.getElementById('musicToggle').addEventListener('click', () => {
            this.settings.musicEnabled = !this.settings.musicEnabled;
            this.updateSettingsUI();
            this.playUISound();
        });
        
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.settings.difficulty = e.target.value;
            this.playUISound();
        });
        
        document.getElementById('resetProgressButton').addEventListener('click', () => {
            if (confirm('Biztosan törli az összes eredményt?')) {
                this.resetProgress();
                this.updateAchievements();
            }
        });
        
        // Pause functionality
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resumeButton').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('mainMenuButton').addEventListener('click', () => {
            this.goToMainMenu();
        });
        
        // Resize event
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    startGame() {
        this.playUISound();
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        this.missedEnemies = 0;
        this.achievements.currentRunDamage = 0;
        this.achievements.kills = 0;
        // Reset upgrades on new game
        this.playerUpgrades = {
            doubleShot: false,
            shield: false,
            rapidFire: false,
            multiShot: false,
            laserBeam: false,
            autoRepair: false
        };
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.powerups = [];
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.hideAllScreens();
        this.updateUI();
        this.showSkipButton();
        this.updateBackground();
        this.updatePauseButton();
    }
    
    restartGame() {
        this.startGame();
    }
    
    showUpgradeScreen() {
        this.gameState = 'upgrade';
        this.generateUpgradeOptions();
        document.getElementById('upgradeScreen').classList.remove('hidden');
        this.hideSkipButton();
    }
    
    generateUpgradeOptions() {
        const upgradeContainer = document.getElementById('upgradeOptions');
        upgradeContainer.innerHTML = '';
        
        const availableUpgrades = [
            {
                id: 'doubleShot',
                title: 'Dupla Lövés',
                description: 'Egyszerre két lövedék kilövése',
                available: !this.playerUpgrades.doubleShot
            },
            {
                id: 'rapidFire',
                title: 'Gyors Tüzelés',
                description: 'Növeli a lövési sebességet',
                available: !this.playerUpgrades.rapidFire
            },
            {
                id: 'shield',
                title: 'Energia Pajzs',
                description: 'Extra védelem az ütközések ellen',
                available: !this.playerUpgrades.shield
            },
            {
                id: 'multiShot',
                title: 'Szórt Lövés',
                description: 'Három irányba lövés egyszerre',
                available: !this.playerUpgrades.multiShot
            },
            {
                id: 'laserBeam',
                title: 'Lézer Sugár',
                description: 'Átható lézer lövedékek',
                available: !this.playerUpgrades.laserBeam
            },
            {
                id: 'autoRepair',
                title: 'Auto Javítás',
                description: 'Lassan regenerálja az életerőt',
                available: !this.playerUpgrades.autoRepair
            }
        ];
        
        const available = availableUpgrades.filter(u => u.available);
        
        // Ha nincs elérhető fejlesztés, egyből a következő szintre lép
        if (available.length === 0) {
            this.nextLevel();
            return;
        }
        
        const selected = available.sort(() => Math.random() - 0.5).slice(0, Math.min(2, available.length));
        
        selected.forEach(upgrade => {
            const button = document.createElement('button');
            button.className = 'upgrade-button';
            button.innerHTML = `
                <div class="upgrade-title">${upgrade.title}</div>
                <div class="upgrade-description">${upgrade.description}</div>
            `;
            button.addEventListener('click', () => {
                this.selectUpgrade(upgrade.id);
            });
            upgradeContainer.appendChild(button);
        });
        
        // Ha csak 1 fejlesztés maradt, adj hozzá egy "Továbblépés fejlesztés nélkül" opciót
        if (selected.length === 1) {
            const skipButton = document.createElement('button');
            skipButton.className = 'upgrade-button';
            skipButton.style.background = 'linear-gradient(135deg, #666666 0%, #444444 100%)';
            skipButton.style.borderColor = '#666666';
            skipButton.innerHTML = `
                <div class="upgrade-title">Továbblépés</div>
                <div class="upgrade-description">Fejlesztés nélkül a következő szintre</div>
            `;
            skipButton.addEventListener('click', () => {
                this.nextLevel();
            });
            upgradeContainer.appendChild(skipButton);
        }
    }
    
    selectUpgrade(upgradeId) {
        this.playerUpgrades[upgradeId] = true;
        this.nextLevel();
    }
    
    skipLevel() {
        if (this.gameState === 'playing') {
            const password = prompt('Adja meg a jelszót:');
            if (password === 'palfi') {
                this.showUpgradeScreen();
            } else if (password !== null) {
                alert('Helytelen jelszó!');
            }
        }
    }
    
    closeUpgradeScreen() {
        // Bezárja a fejlesztési képernyőt fejlesztés nélkül
        this.nextLevel();
    }
    
    showSettingsScreen() {
        this.playUISound();
        document.getElementById('settingsScreen').classList.remove('hidden');
        this.updateSettingsUI();
        this.updateAchievements();
    }
    
    hideSettingsScreen() {
        this.playUISound();
        document.getElementById('settingsScreen').classList.add('hidden');
        this.saveSettings();
    }
    
    updateSettingsUI() {
        // Update toggle buttons
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.textContent = this.settings.soundEnabled ? 'BE' : 'KI';
        soundToggle.className = this.settings.soundEnabled ? 'toggle-button' : 'toggle-button off';
        
        const musicToggle = document.getElementById('musicToggle');
        musicToggle.textContent = this.settings.musicEnabled ? 'BE' : 'KI';
        musicToggle.className = this.settings.musicEnabled ? 'toggle-button' : 'toggle-button off';
        
        // Update difficulty select
        document.getElementById('difficultySelect').value = this.settings.difficulty;
    }
    
    updateAchievements() {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        const achievements = [
            {
                name: 'Első lépések',
                description: '10 ellenség megsemmisítése',
                progress: `${Math.min(this.achievements.totalKills, 10)}/10`,
                unlocked: this.achievements.totalKills >= 10
            },
            {
                name: 'Veterán',
                description: '100 ellenség megsemmisítése',
                progress: `${Math.min(this.achievements.totalKills, 100)}/100`,
                unlocked: this.achievements.totalKills >= 100
            },
            {
                name: 'Mester',
                description: '500 ellenség megsemmisítése',
                progress: `${Math.min(this.achievements.totalKills, 500)}/500`,
                unlocked: this.achievements.totalKills >= 500
            },
            {
                name: 'Tökéletes küldetés',
                description: 'Szint teljesítése károsodás nélkül',
                progress: `${this.achievements.perfectRuns} alkalommal`,
                unlocked: this.achievements.perfectRuns > 0
            }
        ];
        
        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = achievement.unlocked ? 'achievement-item' : 'achievement-item locked';
            
            item.innerHTML = `
                <div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div style="font-size: 12px; color: #aaa;">${achievement.description}</div>
                </div>
                <div class="achievement-progress">${achievement.progress}</div>
            `;
            
            achievementsList.appendChild(item);
        });
    }
    
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.enemies = [];
            this.bullets = [];
            this.enemyBullets = [];
            this.particles = [];
            this.missedEnemies = 0;
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
            this.gameState = 'playing';
            this.hideAllScreens();
            this.updateUI();
            this.showSkipButton();
            this.updateBackground();
            
            // Check for perfect run achievement
            if (this.achievements.currentRunDamage === 0) {
                this.achievements.perfectRuns++;
                localStorage.setItem('perfectRuns', this.achievements.perfectRuns.toString());
            }
        } else {
            this.gameWin();
        }
    }
    
    gameWin() {
        this.gameState = 'gameOver';
        document.getElementById('gameOverScreen').querySelector('h1').textContent = 'GYŐZELEM!';
        document.getElementById('finalScore').textContent = `Pontszám: ${this.score}`;
        document.getElementById('finalLevel').textContent = `Minden szint teljesítve!`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.hideSkipButton();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = `Pontszám: ${this.score}`;
        document.getElementById('finalLevel').textContent = `Elért szint: ${this.currentLevel}`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.hideSkipButton();
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        document.getElementById('levelCompleteText').textContent = 
            this.currentLevel < this.maxLevel ? 
            `Szint ${this.currentLevel + 1} következik...` : 
            'Utolsó szint következik!';
        document.getElementById('levelCompleteScreen').classList.remove('hidden');
    }
    
    hideAllScreens() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('levelCompleteScreen').classList.add('hidden');
        document.getElementById('upgradeScreen').classList.add('hidden');
        document.getElementById('settingsScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
    }
    
    resetProgress() {
        localStorage.removeItem('totalKills');
        localStorage.removeItem('perfectRuns');
        localStorage.removeItem('allUpgrades');
        localStorage.removeItem('gameSettings');
        
        this.achievements.totalKills = 0;
        this.achievements.perfectRuns = 0;
        this.achievements.allUpgrades = false;
        
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal'
        };
        
        this.updateSettingsUI();
        this.playUISound();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        this.pausedTime = Date.now();
        document.getElementById('pauseScreen').classList.remove('hidden');
        this.updatePauseButton();
        this.playUISound();
    }
    
    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
        this.updatePauseButton();
        this.playUISound();
    }
    
    goToMainMenu() {
        this.gameState = 'start';
        this.hideAllScreens();
        this.hideSkipButton();
        document.getElementById('startScreen').classList.remove('hidden');
        this.updatePauseButton();
        this.playUISound();
    }
    
    updatePauseButton() {
        const pauseBtn = document.getElementById('pauseButton');
        if (this.gameState === 'paused') {
            pauseBtn.innerHTML = '▶️'; // Play icon
            pauseBtn.className = 'control-btn pause-btn paused';
        } else {
            pauseBtn.innerHTML = '⏸️'; // Pause icon
            pauseBtn.className = 'control-btn pause-btn playing';
        }
    }
    
    showSkipButton() {
        document.getElementById('skipLevelButton').classList.remove('hidden');
    }
    
    hideSkipButton() {
        document.getElementById('skipLevelButton').classList.add('hidden');
    }
    
    updateUI() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('missedCount').textContent = this.missedEnemies;
        if (this.player) {
            const healthPercentage = (this.player.health / this.player.maxHealth) * 100;
            document.getElementById('healthFill').style.width = healthPercentage + '%';
        }
    }
    
    generateStars() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push(new Star(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 2 + 0.5
            ));
        }
    }
    
    spawnEnemy() {
        const config = this.levelConfigs[this.currentLevel - 1];
        const enemyType = config.enemyTypes[Math.floor(Math.random() * config.enemyTypes.length)];
        const x = Math.random() * (this.canvas.width - 60) + 30;
        this.enemies.push(new Enemy(x, -50, enemyType, config));
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') {
            // Still update stars even when paused for visual effect
            if (this.gameState === 'paused') {
                this.stars.forEach(star => star.update(deltaTime));
            }
            return;
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.keys, this.canvas.width, this.canvas.height);
            
            if (this.player.health <= 0) {
                this.gameOver();
                return;
            }
        }
        
        // Spawn enemies
        this.enemySpawnTimer += deltaTime;
        const config = this.levelConfigs[this.currentLevel - 1];
        if (this.enemySpawnTimer > config.spawnRate) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // Spawn powerups
        this.powerupSpawnTimer += deltaTime;
        if (this.powerupSpawnTimer > 15000) { // Every 15 seconds
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player);
            if (enemy.y > this.canvas.height + 50) {
                enemy.remove = true;
                this.missedEnemies++;
                
                // Check if too many enemies missed
                if (this.missedEnemies >= this.maxMissedEnemies) {
                    this.gameOver();
                    return;
                }
            }
        });
        
        // Update bullets
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        this.enemyBullets.forEach(bullet => bullet.update(deltaTime));
        
        // Update powerups
        this.powerups.forEach(powerup => {
            powerup.update(deltaTime);
            if (powerup.y > this.canvas.height + 50) {
                powerup.remove = true;
            }
        });
        
        // Update particles
        this.particles.forEach(particle => particle.update(deltaTime));
        this.stars.forEach(star => star.update(deltaTime));
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime;
        }
        
        // Auto repair upgrade
        if (this.playerUpgrades.autoRepair && this.player && this.player.health < this.player.maxHealth) {
            this.player.repairTimer = (this.player.repairTimer || 0) + deltaTime;
            if (this.player.repairTimer > 3000) { // Repair every 3 seconds
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
                this.player.repairTimer = 0;
            }
        }
        
        // Collision detection
        this.checkCollisions();
        
        // Remove dead objects
        this.bullets = this.bullets.filter(bullet => !bullet.remove);
        this.enemyBullets = this.enemyBullets.filter(bullet => !bullet.remove);
        this.enemies = this.enemies.filter(enemy => !enemy.remove);
        this.particles = this.particles.filter(particle => !particle.remove);
        this.powerups = this.powerups.filter(powerup => !powerup.remove);
        
        // Check level completion
        if (this.score >= this.currentLevel * 1000 && this.enemies.length === 0) {
            this.levelComplete();
        }
        
        this.updateUI();
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                if (this.checkCollision(bullet, enemy) && !enemy.remove) {
                    if (bullet.isLaser && bullet.penetrateCount < 3) {
                        // Laser can penetrate multiple enemies
                        bullet.penetrateCount++;
                    } else {
                        bullet.remove = true;
                    }
                    
                    enemy.takeDamage(1);
                    this.createExplosion(enemy.x, enemy.y, '#ffaa00');
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.achievements.kills++;
                        this.achievements.totalKills++;
                        localStorage.setItem('totalKills', this.achievements.totalKills.toString());
                        this.playExplosionSound();
                        this.createExplosion(enemy.x, enemy.y, '#ff0000');
                        enemy.remove = true;
                        
                        // Screen shake for big enemies
                        if (enemy.type === 'boss' || enemy.type === 'tank') {
                            this.screenShake = 200;
                        }
                    }
                }
            });
        });
        
        // Enemy bullets vs player
        if (this.player) {
            this.enemyBullets.forEach(bullet => {
                if (this.checkCollision(bullet, this.player)) {
                    bullet.remove = true;
                    this.player.takeDamage(1);
                    this.achievements.currentRunDamage++;
                    this.createExplosion(this.player.x, this.player.y, '#ff4444');
                }
            });
            
            // Enemies vs player
            this.enemies.forEach(enemy => {
                if (this.checkCollision(enemy, this.player)) {
                    enemy.remove = true;
                    this.player.takeDamage(2);
                    this.achievements.currentRunDamage += 2;
                    this.createExplosion(this.player.x, this.player.y, '#ff0000');
                }
            });
            
            // Powerups vs player
            this.powerups.forEach(powerup => {
                if (this.checkCollision(powerup, this.player)) {
                    powerup.remove = true;
                    this.applyPowerup(powerup.type);
                    this.playPowerUpSound();
                    this.createExplosion(powerup.x, powerup.y, powerup.color);
                }
            });
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    applyPowerup(type) {
        switch (type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
                break;
            case 'rapidFire':
                this.player.rapidFireBoost = 5000; // 5 seconds
                break;
            case 'doublePoints':
                this.player.doublePointsBoost = 10000; // 10 seconds
                break;
            case 'slowMotion':
                this.player.slowMotionBoost = 8000; // 8 seconds
                break;
        }
    }
    
    render() {
        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeAmount = Math.min(this.screenShake / 10, 10);
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * shakeAmount,
                (Math.random() - 0.5) * shakeAmount
            );
        }
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render stars
        this.stars.forEach(star => star.render(this.ctx));
        
        if (this.gameState === 'playing') {
            // Render player
            if (this.player) {
                this.player.render(this.ctx);
            }
            
            // Render enemies
            this.enemies.forEach(enemy => enemy.render(this.ctx));
            
            // Render bullets
            this.bullets.forEach(bullet => bullet.render(this.ctx));
            this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
            
            // Render powerups
            this.powerups.forEach(powerup => powerup.render(this.ctx));
        }
        
        // Render particles
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Restore canvas if screen shake was applied
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;  // Doubled from 30
        this.height = 80; // Doubled from 40
        this.speed = 5;
        this.health = 5;
        this.maxHealth = 5;
        this.shootTimer = 0;
        this.shootDelay = 200;
        
        // Powerup timers
        this.rapidFireBoost = 0;
        this.doublePointsBoost = 0;
        this.slowMotionBoost = 0;
    }
    
    update(deltaTime, keys, canvasWidth, canvasHeight) {
        // Movement
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x < canvasWidth - this.width) {
            this.x += this.speed;
        }
        if (keys['ArrowUp'] && this.y > 0) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] && this.y < canvasHeight - this.height) {
            this.y += this.speed;
        }
        
        this.shootTimer += deltaTime;
        
        // Update powerup timers
        if (this.rapidFireBoost > 0) {
            this.rapidFireBoost -= deltaTime;
        }
        if (this.doublePointsBoost > 0) {
            this.doublePointsBoost -= deltaTime;
        }
        if (this.slowMotionBoost > 0) {
            this.slowMotionBoost -= deltaTime;
        }
    }
    
    shoot() {
        let delay = this.shootDelay;
        if (game.playerUpgrades.rapidFire || this.rapidFireBoost > 0) {
            delay = this.shootDelay / 2;
        }
        
        if (this.shootTimer > delay) {
            if (game.playerUpgrades.multiShot) {
                // Three-way shot
                game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -8, '#00ffff', true));
                game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -8, '#00ffff', true, -2));
                game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -8, '#00ffff', true, 2));
            } else if (game.playerUpgrades.doubleShot) {
                // Double shot
                game.bullets.push(new Bullet(this.x + this.width / 2 - 6, this.y, -8, '#00ffff', true));
                game.bullets.push(new Bullet(this.x + this.width / 2 + 2, this.y, -8, '#00ffff', true));
            } else {
                // Single shot
                game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -8, '#00ffff', true));
            }
            
            if (game.playerUpgrades.laserBeam) {
                // Add laser properties to bullets
                game.bullets[game.bullets.length - 1].isLaser = true;
            }
            
            game.playShootSound();
            this.shootTimer = 0;
        }
    }
    
    takeDamage(damage) {
        let finalDamage = damage;
        if (game.playerUpgrades.shield && Math.random() < 0.5) {
            finalDamage = Math.max(0, damage - 1); // Reduce damage by 1 with 50% chance
        }
        this.health = Math.max(0, this.health - finalDamage);
    }
    
    render(ctx) {
        if (game.imageLoaded) {
            // Draw spaceship image
            ctx.drawImage(game.spaceshipImage, this.x, this.y, this.width, this.height);
            
            // Draw shield effect if upgraded
            if (game.playerUpgrades.shield) {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, 2 * Math.PI);
                ctx.stroke();
            }
        } else {
            // Fallback to original drawing if image not loaded (scaled 2x)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 20, this.y + 30, 20, 50);
            
            ctx.fillStyle = '#00aaff';
            ctx.fillRect(this.x, this.y + 40, 16, 30);
            ctx.fillRect(this.x + 44, this.y + 40, 16, 30);
            
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(this.x + 16, this.y + 10, 28, 30);
            
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(this.x + 24, this.y + 70, 12, 10);
            
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 26, this.y + 72, 8, 6);
        }
        
        // Engine flames (particle effect)
        if (Math.random() > 0.7) {
            game.particles.push(new Particle(
                this.x + this.width/2 + (Math.random() - 0.5) * 20,
                this.y + this.height - 5,
                '#ffaa00'
            ));
        }
    }
}

// Enemy Classes
class Enemy {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.remove = false;
        this.shootTimer = 0;
        
        switch (type) {
            case 'basic':
                this.width = 25;
                this.height = 25;
                this.speed = config.enemySpeed;
                this.health = config.enemyHealth;
                this.maxHealth = config.enemyHealth;
                this.points = 100;
                this.color = '#ff4444';
                this.shootDelay = Infinity;
                break;
            case 'fast':
                this.width = 20;
                this.height = 20;
                this.speed = config.enemySpeed * 1.5;
                this.health = config.enemyHealth;
                this.maxHealth = config.enemyHealth;
                this.points = 150;
                this.color = '#ff8844';
                this.shootDelay = Infinity;
                break;
            case 'tank':
                this.width = 35;
                this.height = 35;
                this.speed = config.enemySpeed * 0.7;
                this.health = config.enemyHealth * 2;
                this.maxHealth = config.enemyHealth * 2;
                this.points = 300;
                this.color = '#888888';
                this.shootDelay = Infinity;
                break;
            case 'shooter':
                this.width = 30;
                this.height = 30;
                this.speed = config.enemySpeed;
                this.health = config.enemyHealth;
                this.maxHealth = config.enemyHealth;
                this.points = 250;
                this.color = '#aa44ff';
                this.shootDelay = 1500;
                break;
            case 'boss':
                this.width = 50;
                this.height = 50;
                this.speed = config.enemySpeed * 0.5;
                this.health = config.enemyHealth * 3;
                this.maxHealth = config.enemyHealth * 3;
                this.points = 500;
                this.color = '#ff00ff';
                this.shootDelay = 800;
                break;
        }
    }
    
    update(deltaTime, player) {
        this.y += this.speed;
        this.shootTimer += deltaTime;
        
        // Shooting logic for shooter and boss types
        if ((this.type === 'shooter' || this.type === 'boss') && 
            this.shootTimer > this.shootDelay && 
            this.y > 50 && this.y < game.canvas.height - 200) {
            this.shoot();
            this.shootTimer = 0;
        }
    }
    
    shoot() {
        game.enemyBullets.push(new Bullet(
            this.x + this.width / 2 - 2, 
            this.y + this.height, 
            4, 
            '#ff4444', 
            false
        ));
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }
    
    render(ctx) {
        // Draw enemy based on type
        ctx.fillStyle = this.color;
        
        if (this.type === 'boss') {
            // Boss design
            ctx.fillRect(this.x + 5, this.y, 40, 30);
            ctx.fillRect(this.x, this.y + 10, 50, 20);
            ctx.fillRect(this.x + 10, this.y + 30, 30, 20);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 20, this.y + 15, 10, 10);
        } else if (this.type === 'tank') {
            // Tank design
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        } else if (this.type === 'shooter') {
            // Shooter design
            ctx.fillRect(this.x + 5, this.y, 20, 25);
            ctx.fillRect(this.x, this.y + 10, 30, 15);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 12, this.y + 5, 6, 6);
        } else {
            // Basic and fast enemy design
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        }
        
        // Health bar for enemies with more than 1 HP
        if (this.maxHealth > 1) {
            const healthPercentage = this.health / this.maxHealth;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 8, this.width, 4);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillRect(this.x, this.y - 8, this.width * healthPercentage, 4);
        }
    }
}

// Bullet Class
class Bullet {
    constructor(x, y, speed, color, isPlayer, xOffset = 0) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.xSpeed = xOffset;
        this.color = color;
        this.isPlayer = isPlayer;
        this.remove = false;
        this.isLaser = false;
        this.penetrateCount = 0;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.x += this.xSpeed;
        
        if (this.y < -20 || this.y > game.canvas.height + 20 || this.x < 0 || this.x > game.canvas.width) {
            this.remove = true;
        }
    }
    
    render(ctx) {
        if (this.isLaser) {
            // Laser beam rendering
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x, this.y, this.width, this.height * 2);
            
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(this.x, this.y, this.width, this.height * 2);
            ctx.shadowBlur = 0;
        } else {
            // Normal bullet rendering
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Glow effect
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        }
    }
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 4 + 2;
        this.color = color;
        this.remove = false;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;
        
        if (this.life <= 0 || this.size < 0.5) {
            this.remove = true;
        }
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Powerup Class
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.remove = false;
        this.rotation = 0;
        
        // Set properties based on type
        switch (type) {
            case 'health':
                this.color = '#00ff00';
                this.symbol = '+';
                break;
            case 'rapidFire':
                this.color = '#ffaa00';
                this.symbol = 'R';
                break;
            case 'doublePoints':
                this.color = '#ffff00';
                this.symbol = '2';
                break;
            case 'slowMotion':
                this.color = '#00aaff';
                this.symbol = 'S';
                break;
        }
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.rotation += deltaTime * 0.002;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Draw powerup background
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Draw symbol
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        
        ctx.restore();
    }
}

// Star Class
class Star {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkle = Math.random() * 2 * Math.PI;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.twinkle += 0.02;
        
        if (this.y > game.canvas.height) {
            this.y = -10;
            this.x = Math.random() * game.canvas.width;
        }
    }
    
    render(ctx) {
        const alpha = this.opacity * (0.5 + 0.5 * Math.sin(this.twinkle));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Initialize game
let game;
window.addEventListener('load', () => {
    game = new Game();
});