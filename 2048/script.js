const size = 4;
let board, score = 0;
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
document.getElementById('new').onclick = start;

function start(){
  score = 0; scoreEl.textContent = '0';
  board = Array.from({length:size}, ()=>Array(size).fill(0));
  boardEl.innerHTML = '';
  for(let i=0;i<size*size;i++){
    const d=document.createElement('div'); d.className='cell'; boardEl.appendChild(d);
  }
  spawn(); spawn();
  draw();
}

function draw(){
  const cells = boardEl.children;
  let i=0;
  for(const row of board){
    for(const v of row){
      const c = cells[i++]; c.textContent = v||''; c.dataset.v = v||'';
    }
  }
}

function emptyCells(){
  const list = [];
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(!board[r][c]) list.push([r,c]);
  return list;
}
function spawn(){
  const list = emptyCells(); if(!list.length) return;
  const [r,c] = list[Math.floor(Math.random()*list.length)];
  board[r][c] = Math.random()<0.9?2:4;
}

function slideRow(row){
  const compact = row.filter(v=>v);
  for(let i=0;i<compact.length-1;i++){
    if(compact[i]===compact[i+1]){ compact[i]*=2; score+=compact[i]; compact.splice(i+1,1); }
  }
  while(compact.length<size) compact.push(0);
  return compact;
}

function rotate(times){
  for(let t=0;t<times;t++){
    const b = Array.from({length:size},()=>Array(size).fill(0));
    for(let r=0;r<size;r++) for(let c=0;c<size;c++) b[c][size-1-r]=board[r][c];
    board=b;
  }
}

function move(dir){
  // 0:left, 1:up, 2:right, 3:down via rotations
  const before = JSON.stringify(board);
  if(dir===2){ rotate(2); dir=0; }
  if(dir===1){ rotate(1); dir=0; }
  if(dir===3){ rotate(3); dir=0; }
  for(let r=0;r<size;r++) board[r]=slideRow(board[r]);
  if(before!==JSON.stringify(board)) { spawn(); scoreEl.textContent = score; }
  // rotate back
  if(dir===0){}
  draw();
  checkEnd();
}

function movesAvailable(){
  if(emptyCells().length) return true;
  for(let r=0;r<size;r++) for(let c=0;c<size;c++){
    const v=board[r][c];
    if((r+1<size && board[r+1][c]===v) || (c+1<size && board[r][c+1]===v)) return true;
  }
  return false;
}
function checkEnd(){
  if(!movesAvailable()) setTimeout(()=>alert('Vége! Pont: '+score),10);
}

window.addEventListener('keydown', e=>{
  const k = e.key;
  if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(k)) e.preventDefault();
  if(k==='ArrowLeft') move(0);
  if(k==='ArrowUp') move(1);
  if(k==='ArrowRight') move(2);
  if(k==='ArrowDown') move(3);
});

// touch
let sx=0, sy=0;
boardEl.addEventListener('touchstart',e=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY;});
boardEl.addEventListener('touchend',e=>{ const t=e.changedTouches[0]; const dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dx)+Math.abs(dy)<20) return; if(Math.abs(dx)>Math.abs(dy)) move(dx<0?0:2); else move(dy<0?1:3);});

start();
