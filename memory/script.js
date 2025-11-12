const EMOJI=['🍎','🍌','🥝','🍇','🍓','🍊','🍍','🥥'];
const grid=document.getElementById('grid');
const timeEl=document.getElementById('time');
let first=null, lock=false, startTime=0, timer=null;

document.getElementById('new').onclick=init;

function init(){
  const pairs=[...EMOJI,...EMOJI].sort(()=>Math.random()-0.5);
  grid.innerHTML='';
  pairs.forEach(sym=>{
    const card=document.createElement('div'); card.className='card'; card.setAttribute('role','button'); card.tabIndex=0;
    card.innerHTML=`<div class="face front"></div><div class="face back">${sym}</div>`;
    card.dataset.sym=sym; card.onclick=()=>flip(card); card.onkeyup=e=>{ if(e.key===' '||e.key==='Enter') flip(card); };
    grid.appendChild(card);
  });
  first=null; lock=false; startClock();
}

function startClock(){ startTime=performance.now(); if(timer) cancelAnimationFrame(timer); tick(); }
function tick(){ const t=(performance.now()-startTime)/1000; timeEl.textContent=t.toFixed(1)+'s'; timer=requestAnimationFrame(tick); }

function flip(card){ if(lock||card.classList.contains('flipped')) return; card.classList.add('flipped');
  if(!first){ first=card; return; }
  if(first.dataset.sym===card.dataset.sym){ first=null; if([...grid.children].every(c=>c.classList.contains('flipped'))){ setTimeout(()=>{ alert('Kész! Idő: '+timeEl.textContent); },200); } }
  else { lock=true; setTimeout(()=>{ card.classList.remove('flipped'); first.classList.remove('flipped'); first=null; lock=false; },700); }
}

init();