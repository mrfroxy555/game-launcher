const gridEl=document.getElementById('grid');
const N=10, MINES=12; let board, revealed, flags, alive=true;

document.getElementById('new').onclick=start;

function start(){
  alive=true; flags=0;
  board=Array.from({length:N},()=>Array(N).fill(0));
  revealed=Array.from({length:N},()=>Array(N).fill(false));
  // place mines
  let placed=0; while(placed<MINES){ const r=rand(N), c=rand(N); if(board[r][c]!==-1){ board[r][c]=-1; placed++; }}
  // numbers
  for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(board[r][c]!==-1){ board[r][c]=countAround(r,c); }
  // draw
  gridEl.innerHTML='';
  for(let r=0;r<N;r++) for(let c=0;c<N;c++){
    const d=document.createElement('div'); d.className='cell'; d.dataset.r=r; d.dataset.c=c;
    d.oncontextmenu=(e)=>{ e.preventDefault(); toggleFlag(r,c,d); };
    d.onclick=()=>openCell(r,c);
    gridEl.appendChild(d);
  }
}

function rand(n){ return Math.floor(Math.random()*n); }
function around(r,c){ const a=[]; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ if(dr||dc){ const rr=r+dr, cc=c+dc; if(rr>=0&&cc>=0&&rr<N&&cc<N) a.push([rr,cc]); }} return a; }
function countAround(r,c){ return around(r,c).filter(([rr,cc])=>board[rr][cc]===-1).length; }

function toggleFlag(r,c,el){ if(revealed[r][c]||!alive) return; el=el||getCell(r,c); if(el.classList.toggle('flag')) flags++; else flags--; }

function getCell(r,c){ return gridEl.children[r*N+c]; }

function openCell(r,c){ if(!alive||revealed[r][c]) return; const val=board[r][c]; const el=getCell(r,c); if(el.classList.contains('flag')) return; revealed[r][c]=true; el.classList.add('open');
  if(val===-1){ el.textContent='💣'; alive=false; revealAll(); setTimeout(()=>alert('Vesztettél!'),10); return; }
  if(val>0){ el.textContent=String(val); el.style.color=['','#7aa2ff','#a0e9a4','#f2cd5d','#ff9aa2','#ffd166'][val]||'#e7e9ed'; }
  else { for(const [rr,cc] of around(r,c)) if(!revealed[rr][cc]) openCell(rr,cc); }
  checkWin();
}

function revealAll(){ for(let r=0;r<N;r++) for(let c=0;c<N;c++){ const el=getCell(r,c); if(board[r][c]===-1) el.textContent='💣'; el.classList.add('open'); }}

function checkWin(){
  for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(board[r][c]!==-1 && !revealed[r][c]) return;
  setTimeout(()=>alert('Nyertél!'),10);
}

start();
