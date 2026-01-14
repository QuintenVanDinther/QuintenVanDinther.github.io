
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wordle (Vanilla JS)</title>
  <style>
    :root{
      --bg:#121213;
      --text:#e5e5e5;
      --subtle:#a2a2a2;
      --tile-border:#3a3a3c;
      --tile-bg:#121213;
      --key-bg:#818384;
      --key-text:#fff;
      --absent:#3a3a3c;   /* grijs */
      --present:#b59f3b;  /* geel */
      --correct:#538d4e;  /* groen */

      /* Zet deze drie in kleurblind modus als je wilt:
         --present:#f5793a;
         --correct:#85c0f9;
      */
      --gap: .5rem;
      --tile-size: 3.2rem;
      --radius:.35rem;
      --font: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Noto Color Emoji", "Apple Color Emoji";
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      background:var(--bg);
      color:var(--text);
      font-family:var(--font);
      display:flex;
      flex-direction:column;
      min-height:100vh;
    }
    header{
      display:flex;
      align-items:center;
      justify-content:center;
      border-bottom:1px solid var(--tile-border);
      padding:.75rem 1rem;
      gap:.5rem;
      position:sticky;
      top:0;
      background:var(--bg);
      z-index:2;
    }
    header h1{
      margin:0;
      font-size:1.15rem;
      letter-spacing:.12em;
      text-transform:uppercase;
    }
    .spacer{flex:1}
    .btn{
      background:transparent;
      color:var(--text);
      border:1px solid var(--tile-border);
      padding:.4rem .7rem;
      border-radius:.35rem;
      cursor:pointer;
    }
    main{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:1rem;
      padding:1rem;
      width:100%;
      max-width:520px;
      margin-inline:auto;
    }
    #board{
      margin-top:.5rem;
      display:grid;
      grid-template-rows: repeat(6, var(--tile-size));
      grid-template-columns: repeat(5, var(--tile-size));
      gap:var(--gap);
      touch-action:manipulation;
    }
    .tile{
      width:var(--tile-size);
      height:var(--tile-size);
      border:2px solid var(--tile-border);
      display:flex;
      align-items:center;
      justify-content:center;
      text-transform:uppercase;
      font-weight:700;
      font-size:1.4rem;
      background:var(--tile-bg);
      border-radius:var(--radius);
      user-select:none;
    }
    .tile.filled{
      border-color:#565758;
    }
    .tile.reveal{
      transition: background .3s ease, border-color .3s ease, color .3s ease;
    }
    .tile.absent{
      background:var(--absent);
      border-color:var(--absent);
      color:#fff;
    }
    .tile.present{
      background:var(--present);
      border-color:var(--present);
      color:#fff;
    }
    .tile.correct{
      background:var(--correct);
      border-color:var(--correct);
      color:#fff;
    }

    #keyboard{
      display:flex;
      flex-direction:column;
      gap:.4rem;
      width:100%;
      max-width:520px;
      margin: .5rem auto 1rem;
      user-select:none;
    }
    .keyrow{
      display:flex;
      gap:.35rem;
      justify-content:center;
    }
    .key{
      background:var(--key-bg);
      color:var(--key-text);
      border:none;
      border-radius:.35rem;
      padding:.9rem .6rem;
      font-weight:700;
      cursor:pointer;
      flex:1 0 auto;
      min-width:2rem;
      text-transform:uppercase;
    }
    .key.small{
      flex:1.5 0 auto;
      font-size:.9rem;
    }
    .key.absent{ background:var(--absent); }
    .key.present{ background:var(--present); }
    .key.correct{ background:var(--correct); }
    .key:active{ filter:brightness(1.07); }

    #toast{
      min-height:1.2rem;
      text-align:center;
      color:var(--text);
      opacity:.95;
      font-size:.95rem;
      margin-top:.25rem;
    }
    footer{
      margin:auto 0 1rem;
      display:flex;
      justify-content:center;
      gap:.75rem;
      flex-wrap:wrap;
      opacity:.85;
      font-size:.9rem;
    }

    @media (max-width:420px){
      :root{ --tile-size: 2.7rem; }
      header h1{ font-size:1rem; }
    }
  </style>
</head>
<body>
<header>
  <div class="spacer"></div>
  <h1>Wordle (vanilla)</h1>
  <div class="spacer" style="display:flex; gap:.5rem; justify-content:flex-end;">
    <button id="btn-new" class="btn" title="Nieuw spel">Nieuw</button>
  </div>
</header>

<main>
  <div id="board" aria-label="Rooster met 6 rijen en 5 kolommen"></div>
  <div id="toast" role="status" aria-live="polite"></div>
</main>

<div id="keyboard" aria-label="Virtueel toetsenbord"></div>

<footer>
  <span>Tip: voeg je eigen woorden toe in <code>wordList</code>.</span>
  <!--
  Kleurblind modus? Vervang in :root:
    --present:#f5793a;  --correct:#85c0f9;
  Dagelijkse modus? Zet DAILY_MODE = true in de JS.
  -->
</footer>

<script>
/*** ====== Instellingen ====== ***/
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const DAILY_MODE = false; // Zet op true voor dagelijkse puzzel (zelfde woord per dag)
const STORAGE_KEY = 'wordle-vanilla-state-v1';

/*** ====== Woordenlijst (Nederlands, 5 letters) ======
  Voeg hier gerust veel meer woorden toe. Alle woorden zijn geldig als gok
  én kunnen als oplossing dienen.
**/
const wordList = [
  "appel","tafel","fiets","droom","water","kaars","paars","stoel","plant","kaart",
  "snoep","vloer","spoor","bloem","brood","boter","molen","regen","storm","licht",
  "zomer","lente","hotel","kamer","taart","gezin","vrouw","stoom","loper","klomp",
  "schip","trein","metro","radio","video","audio","pixel","kleur","zwart","groen",
  "blauw","bruin","paard","vogel","bomen","takje","snoer","kabel","poort","frame",
  "steun","plank","spaan","zadel","motor","slaan","slaap","daken","ramen","vuren",
  "keuze","koken","peper","kruid","pizza","pasta","sushi","hamer","beitl","plint",
  "knoop","knars","magma","rader","gloed","schep","sloom","frons","krans","vlamt"
].filter(w => w.length === WORD_LENGTH && /^[a-zà-ÿ]+$/i.test(w)); // simpele filter

const allowedSet = new Set(wordList);

/*** ====== UI Elementen ====== ***/
const board = document.getElementById('board');
const toast = document.getElementById('toast');
const keyboard = document.getElementById('keyboard');
const btnNew = document.getElementById('btn-new');

/*** ====== Spelstatus ====== ***/
let solution = pickSolution();
let currentRow = 0;
let currentCol = 0;
let guesses = Array.from({length: MAX_GUESSES}, () => Array(WORD_LENGTH).fill(''));
let statuses = Array.from({length: MAX_GUESSES}, () => Array(WORD_LENGTH).fill('empty'));
let keyStatus = {}; // letter -> 'absent' | 'present' | 'correct'
let gameOver = false;

/*** ====== Start ====== ***/
buildBoard();
buildKeyboard();
loadStateIfDaily();
updateBoard();

showToast(`Veel plezier!`);

/*** ====== Event Listeners ====== ***/
btnNew.addEventListener('click', newGame);

document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  const key = e.key;
  if (key === 'Enter') submitGuess();
  else if (key === 'Backspace') backspace();
  else if (/^[a-zA-ZÀ-ÿ]$/.test(key)) typeLetter(key.toLowerCase());
});

function buildKeyboard(){
  keyboard.innerHTML = '';
  const rows = ["qwertyuiop","asdfghjkl","enterzxcvbnm←"];
  rows.forEach((row, idx) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyrow';
    for (const ch of row) {
      const btn = document.createElement('button');
      btn.className = 'key';
      let label = ch;
      if (ch === '←'){ label = '⌫'; btn.classList.add('small'); }
      if (ch === 'e' && row.includes('enter') && ch === row[0]) {} // noop
      if (ch === 'e' && row === "enterzxcvbnm←") {} // noop

      if (ch === 'e' && idx === 2) {} // noop (just to quiet lints)
      if (ch === 'e') {} // noop

      if (ch === 'e' && row.startsWith('enter')) {} // noop

      if (row.startsWith('enter') && ch === row[0]) {
        // We will create a special "Enter" key first
        const enterBtn = document.createElement('button');
        enterBtn.className = 'key small';
        enterBtn.textContent = 'Enter';
        enterBtn.addEventListener('click', () => submitGuess());
        rowEl.appendChild(enterBtn);
        continue; // skip this cycle, we will add rest normally
      }
      if (ch === '←') {
        btn.addEventListener('click', () => backspace());
      } else {
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (gameOver) return;
          typeLetter(label);
        });
      }
      if (btn.textContent === '') btn.textContent = ch;
      rowEl.appendChild(btn);
    }
    keyboard.appendChild(rowEl);
  });
  refreshKeyboardColors();
}

function buildBoard(){
  board.innerHTML = '';
  for (let r = 0; r < MAX_GUESSES; r++){
    for (let c = 0; c < WORD_LENGTH; c++){
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${r}-${c}`;
      tile.setAttribute('role', 'gridcell');
      tile.setAttribute('aria-label', `Rij ${r+1} kolom ${c+1}`);
      board.appendChild(tile);
    }
  }
}

function pickSolution(){
  if (DAILY_MODE){
    const base = new Date(2026,0,1); // 1 jan 2026
    const today = new Date();
    const days = Math.floor((stripTime(today) - stripTime(base)) / (1000*60*60*24));
    const idx = mod(days, wordList.length);
    return wordList[idx];
  } else {
    return wordList[Math.floor(Math.random() * wordList.length)];
  }
}
function stripTime(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function mod(n, m){ return ((n % m) + m) % m; }

function typeLetter(ch){
  if (!/^[a-zà-ÿ]$/i.test(ch)) return;
  if (currentCol >= WORD_LENGTH) return;
  guesses[currentRow][currentCol] = ch.toLowerCase();
  currentCol++;
  updateBoard();
}

function backspace(){
  if (currentCol > 0){
    currentCol--;
    guesses[currentRow][currentCol] = '';
    updateBoard();
  }
}

function submitGuess(){
  if (gameOver) return;
  if (currentCol < WORD_LENGTH){
    shakeRow(currentRow);
    return showToast('Niet genoeg letters.');
  }
  const guess = guesses[currentRow].join('');
  if (!allowedSet.has(guess)){
    shakeRow(currentRow);
    return showToast('Geen geldig woord.');
  }
  const fb = evaluateGuess(guess, solution);
  statuses[currentRow] = fb;
  colorRevealRow(currentRow, guess, fb);
  updateKeyStatus(guess, fb);

  if (guess === solution){
    gameOver = true;
    persistStateIfDaily();
    return showToast('Gewonnen! 🎉');
  }
  currentRow++;
  currentCol = 0;
  if (currentRow >= MAX_GUESSES){
    gameOver = true;
    showToast(`Jammer! Het woord was: ${solution.toUpperCase()}`);
  }
  persistStateIfDaily();
}

function evaluateGuess(guess, answer){
  // Twee-pass algoritme met lettertellingen voor correcte dubbeletters
  const res = Array(WORD_LENGTH).fill('absent');
  const counts = {};
  for (let i=0;i<WORD_LENGTH;i++){
    const ch = answer[i];
    counts[ch] = (counts[ch] || 0) + 1;
  }
  // Eerst 'correct'
  for (let i=0;i<WORD_LENGTH;i++){
    if (guess[i] === answer[i]){
      res[i] = 'correct';
      counts[guess[i]]--;
    }
  }
  // Dan 'present'
  for (let i=0;i<WORD_LENGTH;i++){
    if (res[i] === 'correct') continue;
    const ch = guess[i];
    if (counts[ch] > 0){
      res[i] = 'present';
      counts[ch]--;
    }
  }
  return res;
}

function updateBoard(){
  for (let r=0;r<MAX_GUESSES;r++){
    for (let c=0;c<WORD_LENGTH;c++){
      const tile = document.getElementById(`tile-${r}-${c}`);
      tile.className = 'tile'; // reset
      const ch = guesses[r][c];
      if (ch){
        tile.textContent = ch.toUpperCase();
        tile.classList.add('filled');
      } else {
        tile.textContent = '';
      }
      const st = statuses[r][c];
      if (['absent','present','correct'].includes(st)){
        tile.classList.add('reveal', st);
      }
    }
  }
  refreshKeyboardColors();
}

function colorRevealRow(r, guess, fb){
  // Eenvoudig (zonder flip-animatie) inkleuren
  for (let c=0;c<WORD_LENGTH;c++){
    const tile = document.getElementById(`tile-${r}-${c}`);
    requestAnimationFrame(() => {
      setTimeout(() => {
        tile.classList.add('reveal', fb[c]); // absent|present|correct
      }, c * 120);
    });
  }
}

function updateKeyStatus(guess, fb){
  // Prioriteit: correct > present > absent
  for (let i=0;i<WORD_LENGTH;i++){
    const ch = guess[i];
    const st = fb[i];
    const prev = keyStatus[ch];
    if (!prev || (prev === 'absent' && (st === 'present' || st === 'correct')) || (prev === 'present' && st === 'correct')){
      keyStatus[ch] = st;
    }
  }
  refreshKeyboardColors();
}

function refreshKeyboardColors(){
  const buttons = keyboard.querySelectorAll('.key');
  buttons.forEach(btn => {
    const label = btn.textContent.toLowerCase();
    btn.classList.remove('absent','present','correct');
    if (label === 'enter' || label === '⌫') return;
    const st = keyStatus[label];
    if (st) btn.classList.add(st);
  });
}

function showToast(msg){
  toast.textContent = msg;
  if (!msg) return;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.textContent = ''; }, 2500);
}

function shakeRow(r){
  // simpele "shake" met CSS via inline animation
  const tiles = [];
  for (let c=0;c<WORD_LENGTH;c++){
    tiles.push(document.getElementById(`tile-${r}-${c}`));
  }
  tiles.forEach(el => el.style.transform = 'translateX(0)');
  let i = 0;
  const seq = [-6,6,-5,5,-3,3,0];
  const id = setInterval(()=>{
    tiles.forEach(el => el.style.transform = `translateX(${seq[i]}px)`);
    i++;
    if (i >= seq.length){
      clearInterval(id);
      tiles.forEach(el => el.style.transform = '');
    }
  }, 40);
}

function persistStateIfDaily(){
  if (!DAILY_MODE) return;
  const data = {
    solution,
    currentRow,
    currentCol,
    guesses,
    statuses,
    keyStatus,
    gameOver,
    date: new Date().toDateString()
  };
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }catch(e){}
}

function loadStateIfDaily(){
  if (!DAILY_MODE) return;
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || data.solution !== solution) return;
    currentRow = data.currentRow || 0;
    currentCol = data.currentCol || 0;
    guesses = data.guesses || guesses;
    statuses = data.statuses || statuses;
    keyStatus = data.keyStatus || {};
    gameOver = !!data.gameOver;
  }catch(e){}
}

function newGame(){
  solution = pickSolution();
  currentRow = 0;
  currentCol = 0;
  guesses = Array.from({length: MAX_GUESSES}, () => Array(WORD_LENGTH).fill(''));
  statuses = Array.from({length: MAX_GUESSES}, () => Array(WORD_LENGTH).fill('empty'));
  keyStatus = {};
  gameOver = false;
  buildBoard();
  updateBoard();
  showToast('Nieuw spel gestart!');
  if (DAILY_MODE) persistStateIfDaily();
}

/*** Debug (optioneel): open console en typ reveal() om oplossing te zien ***/
window.reveal = () => solution;
</script>
</body>
</html>
