class MusicGuesser {
    constructor() {
        this.musicFiles = [];
        this.gameData = {
            currentRound: 0,
            totalRounds: 5,
            score: 0,
            currentSong: null,
            options: [],
            selectedAnswer: null,
            usedSongs: [] // Már felhasznált zenék követése
        };
        this.audio = document.getElementById('game-audio');
        this.audioTimeout = null; // Audio időzítő referencia
        this.canSeek = false; // Játékos csak válasz után tekerhet
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Fájl feltöltés
        const fileInput = document.getElementById('music-files');
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Játék indítása
        const startBtn = document.getElementById('start-game-btn');
        startBtn.addEventListener('click', () => this.startGame());

        // Játék vezérlők
        const replayBtn = document.getElementById('replay-btn');
        replayBtn.addEventListener('click', () => this.replayAudio());

        const nextBtn = document.getElementById('next-btn');
        nextBtn.addEventListener('click', () => this.nextRound());

        // Eredmény gombok
        const playAgainBtn = document.getElementById('play-again-btn');
        playAgainBtn.addEventListener('click', () => this.playAgain());

        const newSongsBtn = document.getElementById('new-songs-btn');
        newSongsBtn.addEventListener('click', () => this.resetGame());

        // Audio események
        this.audio.addEventListener('loadedmetadata', () => this.onAudioLoaded());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onAudioEnded());
        this.audio.addEventListener('play', () => this.updatePlayPauseButton());
        this.audio.addEventListener('pause', () => this.updatePlayPauseButton());
        
        // Egyedi vezérlők
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        const progressBar = document.getElementById('progress-bar');
        progressBar.addEventListener('click', (e) => this.handleProgressBarClick(e));
        
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e));
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('upload-area');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('audio/'));
            this.addMusicFiles(files);
        });

        uploadArea.addEventListener('click', () => {
            document.getElementById('music-files').click();
        });
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.addMusicFiles(files);
    }

    addMusicFiles(files) {
        files.forEach(file => {
            // Ellenőrizzük, hogy már nincs-e hozzáadva
            const existingFile = this.musicFiles.find(f => f.name === file.name && f.size === file.size);
            if (!existingFile) {
                const musicFile = {
                    file: file,
                    name: this.getFileNameWithoutExtension(file.name),
                    url: URL.createObjectURL(file),
                    duration: null
                };
                this.musicFiles.push(musicFile);
            }
        });
        
        this.updateFileList();
        this.updateStartButton();
    }

    getFileNameWithoutExtension(filename) {
        return filename.substring(0, filename.lastIndexOf('.')) || filename;
    }

    updateFileList() {
        const fileList = document.getElementById('file-list');
        
        if (this.musicFiles.length === 0) {
            fileList.innerHTML = '';
            return;
        }

        fileList.innerHTML = this.musicFiles.map((musicFile, index) => `
            <div class="file-item">
                <span class="file-icon">🎵</span>
                <span class="file-name">${musicFile.name}</span>
                <button class="remove-file" onclick="musicGuesser.removeFile(${index})">✖</button>
            </div>
        `).join('');
    }

    removeFile(index) {
        // URL objektum felszabadítása
        URL.revokeObjectURL(this.musicFiles[index].url);
        this.musicFiles.splice(index, 1);
        this.updateFileList();
        this.updateStartButton();
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        const minFiles = 3;
        
        if (this.musicFiles.length >= minFiles) {
            startBtn.disabled = false;
            startBtn.textContent = `Játék indítása (${this.musicFiles.length} zene)`;
        } else {
            startBtn.disabled = true;
            startBtn.textContent = `Legalább ${minFiles} zene szükséges (${this.musicFiles.length}/${minFiles})`;
        }
    }

    async startGame() {
        // Korábbi audio leállítása és timeout törlése
        this.stopAudio();
        
        // Átváltás játék módba
        document.getElementById('upload-section').style.display = 'none';
        document.getElementById('game-section').style.display = 'block';
        document.getElementById('results-section').style.display = 'none';

        // Játék adatok visszaállítása
        this.gameData = {
            currentRound: 0,
            totalRounds: Math.min(5, this.musicFiles.length),
            score: 0,
            currentSong: null,
            options: [],
            selectedAnswer: null,
            usedSongs: [] // Használt zenék listájának törölése
        };

        // Audio metaadatok betöltése
        await this.loadAudioMetadata();
        
        // Első kör indítása
        this.nextRound();
    }

    async loadAudioMetadata() {
        const promises = this.musicFiles.map(musicFile => {
            return new Promise((resolve) => {
                const audio = new Audio(musicFile.url);
                audio.addEventListener('loadedmetadata', () => {
                    musicFile.duration = audio.duration;
                    resolve();
                });
                audio.addEventListener('error', () => {
                    musicFile.duration = 30; // alapértelmezett érték hiba esetén
                    resolve();
                });
            });
        });

        await Promise.all(promises);
    }

    nextRound() {
        if (this.gameData.currentRound >= this.gameData.totalRounds) {
            this.showResults();
            return;
        }

        this.gameData.currentRound++;
        this.gameData.selectedAnswer = null;
        this.canSeek = false; // Új körben letiltjuk a tekerést
        
        // UI frissítése
        this.updateGameInfo();
        this.clearResult();
        
        // Új kérdés generálása
        this.generateQuestion();
        
        // Gombok állapotának frissítése
        document.getElementById('next-btn').disabled = true;
        
        // Fade-in animáció
        document.querySelector('.question').classList.add('fade-in');
    }

    generateQuestion() {
        // Véletlenszerű helyes válasz kiválasztása (ami még nem volt használva)
        const correctSong = this.getRandomUnusedSong();
        this.gameData.currentSong = correctSong;
        
        // Hozzáadjuk a használt zenékhez
        this.gameData.usedSongs.push(correctSong);

        // További két véletlenszerű opció kiválasztása (bármelyik lehet, kivéve a helyes)
        const wrongOptions = this.getRandomSongs(2, [correctSong]);
        
        // Opciókat összekeverjük
        this.gameData.options = this.shuffleArray([correctSong, ...wrongOptions]);

        // Audio betöltése és lejátszása
        this.loadAndPlayAudio(correctSong);

        // Opciók megjelenítése
        this.displayOptions();
    }

    getRandomSong() {
        const randomIndex = Math.floor(Math.random() * this.musicFiles.length);
        return this.musicFiles[randomIndex];
    }
    
    getRandomUnusedSong() {
        // Elérhető zenék (amelyek még nem voltak használva)
        const unusedSongs = this.musicFiles.filter(song => !this.gameData.usedSongs.includes(song));
        
        // Ha elfogytak a fel nem használt zenék, újrakezdés
        if (unusedSongs.length === 0) {
            this.gameData.usedSongs = [];
            return this.getRandomSong();
        }
        
        const randomIndex = Math.floor(Math.random() * unusedSongs.length);
        return unusedSongs[randomIndex];
    }

    getRandomSongs(count, exclude = []) {
        const availableSongs = this.musicFiles.filter(song => !exclude.includes(song));
        const selected = [];
        
        while (selected.length < count && selected.length < availableSongs.length) {
            const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            if (!selected.includes(randomSong)) {
                selected.push(randomSong);
            }
        }
        
        return selected;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    loadAndPlayAudio(song) {
        this.audio.src = song.url;
        this.audio.load();
    }

    onAudioLoaded() {
        const duration = this.audio.duration;
        const startTime = Math.max(0, (duration / 2) - 5); // középtől 5 másodperccel korábban
        
        // Korábbi timeout törlése
        this.stopAudio();
        
        // Audio pozíció és hangerő beállítása
        this.audio.currentTime = startTime;
        this.setVolumeFromSlider();
        
        // 10 másodperc lejátszása
        this.audio.play();
        
        // Új időzítő beállítása a leállításhoz
        this.audioTimeout = setTimeout(() => {
            this.audio.pause();
            this.audioTimeout = null;
        }, 10000);

        this.updateTimeDisplay();
    }

    displayOptions() {
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = this.gameData.options.map((song, index) => `
            <button class="option" onclick="musicGuesser.selectOption(${index}, this)">
                ${song.name}
            </button>
        `).join('');
    }

    selectOption(index, buttonElement) {
        // Előző kiválasztás törölése
        document.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Új kiválasztás
        buttonElement.classList.add('selected');
        this.gameData.selectedAnswer = index;
        
        // Válasz ellenőrzése
        this.checkAnswer();
    }

    checkAnswer() {
        const selectedSong = this.gameData.options[this.gameData.selectedAnswer];
        const correctSong = this.gameData.currentSong;
        const isCorrect = selectedSong === correctSong;

        // Pontszám frissítése
        if (isCorrect) {
            this.gameData.score++;
        }

        // Opciók színezése
        document.querySelectorAll('.option').forEach((btn, index) => {
            btn.classList.add('disabled');
            
            if (this.gameData.options[index] === correctSong) {
                btn.classList.add('correct');
            } else if (index === this.gameData.selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Eredmény megjelenítése
        this.showRoundResult(isCorrect);
        
        // Tekerés engedélyezése válasz után
        this.canSeek = true;
        
        // Következő gomb engedélyezése
        document.getElementById('next-btn').disabled = false;
        
        // Pontszám frissítése
        this.updateGameInfo();
    }

    showRoundResult(isCorrect) {
        const resultDiv = document.getElementById('result');
        const correctSong = this.gameData.currentSong;
        
        if (isCorrect) {
            resultDiv.innerHTML = `
                <div class="result correct pulse">
                    ✅ Helyes válasz! Ez valóban "${correctSong.name}" volt.
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="result incorrect pulse">
                    ❌ Hibás válasz. A helyes válasz: "${correctSong.name}"
                </div>
            `;
        }
    }

    clearResult() {
        document.getElementById('result').innerHTML = '';
    }

    replayAudio() {
        if (this.gameData.currentSong) {
            // Korábbi lejátszás leállítása
            this.stopAudio();
            // Új lejátszás indítása
            this.loadAndPlayAudio(this.gameData.currentSong);
        }
    }
    
    stopAudio() {
        // Audio leállítása
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        
        // Timeout törlése ha van
        if (this.audioTimeout) {
            clearTimeout(this.audioTimeout);
            this.audioTimeout = null;
        }
    }

    updateGameInfo() {
        document.getElementById('score').textContent = this.gameData.score;
        document.getElementById('current-round').textContent = this.gameData.currentRound;
        document.getElementById('total-rounds').textContent = this.gameData.totalRounds;
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('audio-progress').style.width = `${progress}%`;
            this.updateTimeDisplay();
        }
    }

    updateTimeDisplay() {
        const currentTime = this.formatTime(this.audio.currentTime || 0);
        const duration = this.formatTime(this.audio.duration || 0);
        
        document.getElementById('current-time').textContent = currentTime;
        document.getElementById('duration').textContent = duration;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    onAudioEnded() {
        // Ha az audio véget ért, reset progress bar
        document.getElementById('audio-progress').style.width = '0%';
    }

    showResults() {
        // Átváltás eredmény módba
        document.getElementById('game-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';

        // Eredmények megjelenítése
        const scorePercentage = Math.round((this.gameData.score / this.gameData.totalRounds) * 100);
        
        document.getElementById('final-score').textContent = this.gameData.score;
        document.getElementById('final-total').textContent = this.gameData.totalRounds;
        
        // Üzenet a teljesítmény alapján
        let message = '';
        if (scorePercentage === 100) {
            message = '🏆 Tökéletes! Minden dallamot felismertél!';
        } else if (scorePercentage >= 80) {
            message = '🎉 Kiváló! Remekül ismered a zenéidet!';
        } else if (scorePercentage >= 60) {
            message = '👍 Jó munka! Többségét eltaláltad!';
        } else if (scorePercentage >= 40) {
            message = '📚 Nem rossz, de még lehet gyakorolni!';
        } else {
            message = '🎵 Talán jobban megismerhetnéd a zenéidet!';
        }
        
        document.getElementById('score-message').textContent = message;
        
        // Fade-in animáció
        document.querySelector('.results-section').classList.add('fade-in');
    }

    playAgain() {
        // Audio leállítása újrakezdés előtt
        this.stopAudio();
        // Új játék ugyanazokkal a zenékkel
        this.startGame();
    }

    resetGame() {
        // Audio leállítása reset előtt
        this.stopAudio();
        
        // Teljes reset
        this.musicFiles.forEach(musicFile => {
            URL.revokeObjectURL(musicFile.url);
        });
        this.musicFiles = [];
        
        // Játék adatok reset
        this.gameData.usedSongs = [];
        
        // UI reset
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('game-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        
        this.updateFileList();
        this.updateStartButton();
        
        // Fájl input reset
        document.getElementById('music-files').value = '';
    }

    // Egyedi audio vezérlők
    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    updatePlayPauseButton() {
        const button = document.getElementById('play-pause-btn');
        if (this.audio.paused) {
            button.textContent = '▶️';
        } else {
            button.textContent = '⏸️';
        }
    }

    handleProgressBarClick(e) {
        if (!this.canSeek) {
            // Vizualís jelzés, hogy nem lehet tekerni
            const progressBar = document.getElementById('progress-bar');
            progressBar.classList.add('disabled-seeking');
            setTimeout(() => {
                progressBar.classList.remove('disabled-seeking');
            }, 500);
            return;
        }

        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        if (this.audio.duration) {
            const newTime = this.audio.duration * percentage;
            this.audio.currentTime = newTime;
        }
    }

    handleVolumeChange(e) {
        const volume = e.target.value / 100;
        this.audio.volume = volume;
        this.updateVolumeIcon(volume);
    }

    setVolumeFromSlider() {
        const volumeSlider = document.getElementById('volume-slider');
        const volume = volumeSlider.value / 100;
        this.audio.volume = volume;
        this.updateVolumeIcon(volume);
    }

    updateVolumeIcon(volume) {
        const volumeIcon = document.querySelector('.volume-icon');
        if (volume === 0) {
            volumeIcon.textContent = '🔇'; // néma
        } else if (volume < 0.3) {
            volumeIcon.textContent = '🔈'; // alacsony
        } else if (volume < 0.7) {
            volumeIcon.textContent = '🔉'; // közepes
        } else {
            volumeIcon.textContent = '🔊'; // magas
        }
    }
}

// Globális példány létrehozása
let musicGuesser;

// DOM tartalom betöltődése után inicializálás
document.addEventListener('DOMContentLoaded', () => {
    musicGuesser = new MusicGuesser();
});