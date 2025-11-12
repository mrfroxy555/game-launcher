// Launcher logic: builds the grid from a list of game folders
const games = [
  { title: 'Logika',         folder: 'logika',        cover: 'cover.jpg' },
  { title: 'Music Guesser',  folder: 'music-guesser', cover: 'cover.jpg' },
  { title: 'PCB Build',      folder: 'pcbuild',       cover: 'cover.jpg' },
  { title: 'RAK',            folder: 'rak',           cover: 'cover.jpg' },
  { title: 'Tank',           folder: 'tank',          cover: 'cover.jpg' },
  { title: 'Torpedo',        folder: 'torpedo',       cover: 'cover.jpg' },
  { title: 'Űrhajó',         folder: 'urhajo',        cover: 'cover.jpg' },
  { title: '2048',           folder: '2048',          cover: 'cover.jpg' },
  { title: 'Breakout',       folder: 'breakout',      cover: 'cover.jpg' },
  { title: 'Tetris',         folder: 'tetris',        cover: 'cover.jpg' },
  { title: 'Snake',          folder: 'snake',         cover: 'cover.jpg' },
  { title: 'Memory',         folder: 'memory',        cover: 'cover.jpg' },
  { title: 'Platform Jumper',         folder: 'flappy',        cover: 'cover.jpg' },
  { title: 'Pong',           folder: 'pong',          cover: 'cover.jpg' },
  { title: 'Minesweeper',    folder: 'minesweeper',   cover: 'cover.jpg' },
  { title: 'Simon',          folder: 'simon',         cover: 'cover.jpg' },
];

const els = {
  count: document.querySelector('[data-count]'),
  grid:  document.querySelector('[data-grid]'),
  search:document.querySelector('[data-search]')
};

function encodePath(p){
  // encodeURI keeps slashes; handles spaces and non-ascii properly
  return encodeURI(p);
}

function coverFor(g){
  return `${encodePath(g.folder)}/${g.cover || 'cover.jpg'}`;
}

function playUrlFor(g){
  return `${encodePath(g.folder)}/index.html`;
}

function cardTemplate(g){
  const cover = coverFor(g);
  const playUrl = playUrlFor(g);
  return `
    <article class="card" tabindex="0" data-title="${g.title.toLowerCase()}">
      <div class="thumb">
        <img src="${cover}" alt="${g.title} cover" onerror="this.onerror=null; this.src='assets/placeholder.svg'" />
        <span class="corner-badge">WEB</span>
        <button class="play" title="Play ${g.title}" aria-label="Play ${g.title}" onclick="location.href='${playUrl}'">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      <div class="meta">
        <div class="title">${g.title}</div>
      </div>
    </article>
  `;
}

function render(list){
  els.grid.innerHTML = list.map(cardTemplate).join('');
  els.count.textContent = String(list.length);
}

function initSearch(){
  els.search.addEventListener('input', () => {
    const q = els.search.value.trim().toLowerCase();
    const filtered = q ? games.filter(g => g.title.toLowerCase().includes(q)) : games;
    render(filtered);
  });
}

// Boot
render(games);
initSearch();
