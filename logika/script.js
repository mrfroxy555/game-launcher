let secretCode;
let gameMode = 'numbers';
let codeLength = 4;

// Initialize game on load
window.onload = function() {
  updateGame();
};

function generateCode() {
  let code = '';
  const characters = gameMode === 'numbers' ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

function updateGame() {
  // Get current settings
  gameMode = document.getElementById('gameMode').value;
  codeLength = parseInt(document.getElementById('codeLength').value);
  
  // Validate code length
  if (codeLength < 1 || codeLength > 50) {
    codeLength = 4;
    document.getElementById('codeLength').value = 4;
    alert('A kód hossza 1 és 50 között lehet!');
  }
  
  // Generate new code
  secretCode = generateCode();
  
  // Update UI
  updateUI();
  
  // Clear feedback
  document.getElementById('feedback').innerHTML = '';
}

function updateUI() {
  const guessInput = document.getElementById('guessInput');
  const gameDescription = document.getElementById('gameDescription');
  
  // Update input attributes
  guessInput.maxLength = codeLength;
  guessInput.value = '';
  
  if (gameMode === 'numbers') {
    guessInput.pattern = `\\d{${codeLength}}`;
    guessInput.placeholder = '1234'.substring(0, Math.min(4, codeLength)) + '...'.substring(0, Math.max(0, codeLength - 4));
    gameDescription.textContent = `Találd ki a ${codeLength} számjegyű kódot (0-9 közötti számok, ismétlődhetnek)!`;
  } else {
    guessInput.pattern = `[A-Za-z]{${codeLength}}`;
    guessInput.placeholder = 'ABCD'.substring(0, Math.min(4, codeLength)) + '...'.substring(0, Math.max(0, codeLength - 4));
    gameDescription.textContent = `Találd ki a ${codeLength} betűs kódot (A-Z közötti betűk, ismétlődhetnek)!`;
  }
}

function checkGuess() {
  const input = document.getElementById('guessInput').value.toUpperCase();
  const feedbackDiv = document.getElementById('feedback');
  
  // Input validation
  if (input.length !== codeLength) {
    alert(`Kérlek, adj meg egy ${codeLength} karakteres kódot!`);
    return;
  }
  
  // Check for valid characters and prevent negative numbers
  if (gameMode === 'numbers') {
    if (!/^\d+$/.test(input)) {
      alert('Csak számokat használj (0-9)! Negatív számok nem engedélyezettek.');
      return;
    }
    // Additional check to prevent negative numbers
    if (input.includes('-')) {
      alert('Negatív számok nem engedélyezettek!');
      return;
    }
  } else {
    if (!/^[A-Z]+$/.test(input)) {
      alert('Csak betűket használj (A-Z)!');
      return;
    }
  }
  
  // Calculate green and yellow matches
  let green = 0;
  let yellow = 0;
  let codeArr = secretCode.split('');
  let guessArr = input.split('');
  let usedCode = Array(codeLength).fill(false);
  let usedGuess = Array(codeLength).fill(false);
  
  // Check for green (exact position matches)
  for (let i = 0; i < codeLength; i++) {
    if (guessArr[i] === codeArr[i]) {
      green++;
      usedCode[i] = true;
      usedGuess[i] = true;
    }
  }
  
  // Check for yellow (wrong position matches)
  for (let i = 0; i < codeLength; i++) {
    if (!usedGuess[i]) {
      for (let j = 0; j < codeLength; j++) {
        if (!usedCode[j] && guessArr[i] === codeArr[j]) {
          yellow++;
          usedCode[j] = true;
          break;
        }
      }
    }
  }
  
  // Display feedback
  const row = document.createElement('div');
  row.className = 'feedback-row';
  row.innerHTML = `👉 ${input} — <span class="green">${green} zöld</span>, <span class="yellow">${yellow} sárga</span>`;
  feedbackDiv.prepend(row);
  
  // Check for win condition
  if (green === codeLength) {
    alert('🎉 Gratulálok! Kitaláltad a kódot!');
    newGame();
  }
  
  // Clear input
  document.getElementById('guessInput').value = '';
}

function newGame() {
  secretCode = generateCode();
  document.getElementById('feedback').innerHTML = '';
  hideSolution();
}

// Admin functionality
const ADMIN_PASSWORD = 'admin123';

function showAdminPanel() {
  const password = prompt('Add meg az admin jelszót:');
  
  if (password === ADMIN_PASSWORD) {
    showSolution();
  } else if (password !== null) {
    alert('Hibás jelszó!');
  }
}

function showSolution() {
  const solutionDisplay = document.getElementById('solutionDisplay');
  solutionDisplay.textContent = `Megoldás: ${secretCode}`;
  solutionDisplay.className = 'solution-visible';
  
  // Automatically hide after 10 seconds
  setTimeout(hideSolution, 10000);
}

function hideSolution() {
  const solutionDisplay = document.getElementById('solutionDisplay');
  solutionDisplay.className = 'solution-hidden';
}
