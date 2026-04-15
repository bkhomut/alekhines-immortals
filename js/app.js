// ═══════════════════════════════════════════════════════════
// Alekhine Chess Explorer — Main App
// ═══════════════════════════════════════════════════════════

let game = null;       // chess.js instance
let board = null;      // chessboard.js instance
let currentGame = null;
let currentMoveIndex = -1;
let parsedMoves = [];

// ── State ────────────────────────────────────────────────
let state = {
  sortBy: 'rank',
  sortDir: 1,
  filterTheme: '',
  filterOpening: '',
  filterResult: '',
  filterYear: '',
  search: '',
  selectedId: null
};

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  bindEvents();
  applySort('rank');
  renderList();

  // Select first game
  if (ALEKHINE_GAMES.length > 0) {
    selectGame(ALEKHINE_GAMES[0].id);
  }
});

// ── Filters ──────────────────────────────────────────────
function populateFilters() {
  const themeSelect = document.getElementById('filter-theme');
  ALL_THEMES.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    themeSelect.appendChild(opt);
  });

  const openingSelect = document.getElementById('filter-opening');
  ALL_OPENINGS.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    openingSelect.appendChild(opt);
  });
}

function bindEvents() {
  document.getElementById('filter-theme').addEventListener('change', e => {
    state.filterTheme = e.target.value;
    renderList();
  });
  document.getElementById('filter-opening').addEventListener('change', e => {
    state.filterOpening = e.target.value;
    renderList();
  });
  document.getElementById('filter-result').addEventListener('change', e => {
    state.filterResult = e.target.value;
    renderList();
  });
  document.getElementById('filter-year').addEventListener('change', e => {
    state.filterYear = e.target.value;
    renderList();
  });
  document.getElementById('search-input').addEventListener('input', e => {
    state.search = e.target.value.toLowerCase().trim();
    renderList();
  });
  document.getElementById('reset-btn').addEventListener('click', resetFilters);

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => applySort(btn.dataset.sort));
  });

  // Move controls
  document.getElementById('btn-start').addEventListener('click', goToStart);
  document.getElementById('btn-prev').addEventListener('click', prevMove);
  document.getElementById('btn-next').addEventListener('click', nextMove);
  document.getElementById('btn-end').addEventListener('click', goToEnd);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevMove(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nextMove(); }
    if (e.key === 'Home') { e.preventDefault(); goToStart(); }
    if (e.key === 'End') { e.preventDefault(); goToEnd(); }
  });
}

function resetFilters() {
  state.filterTheme = '';
  state.filterOpening = '';
  state.filterResult = '';
  state.filterYear = '';
  state.search = '';
  document.getElementById('filter-theme').value = '';
  document.getElementById('filter-opening').value = '';
  document.getElementById('filter-result').value = '';
  document.getElementById('filter-year').value = '';
  document.getElementById('search-input').value = '';
  renderList();
}

// ── Sort ─────────────────────────────────────────────────
function applySort(key) {
  if (state.sortBy === key) {
    state.sortDir *= -1;
  } else {
    state.sortBy = key;
    state.sortDir = 1;
  }
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.sort-btn[data-sort="${key}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  renderList();
}

// ── Filter + Sort ─────────────────────────────────────────
function getFilteredGames() {
  let games = [...ALEKHINE_GAMES];

  if (state.filterTheme) {
    games = games.filter(g => g.themes.includes(state.filterTheme));
  }
  if (state.filterOpening) {
    games = games.filter(g => g.opening === state.filterOpening);
  }
  if (state.filterResult) {
    if (state.filterResult === 'win') games = games.filter(g => {
      const isWhite = g.white === 'Alexander Alekhine';
      return (isWhite && g.result === '1-0') || (!isWhite && g.result === '0-1');
    });
    else if (state.filterResult === 'loss') games = games.filter(g => {
      const isWhite = g.white === 'Alexander Alekhine';
      return (isWhite && g.result === '0-1') || (!isWhite && g.result === '1-0');
    });
    else if (state.filterResult === 'draw') games = games.filter(g => g.result === '1/2-1/2');
  }
  if (state.filterYear) {
    const decade = parseInt(state.filterYear);
    games = games.filter(g => g.year >= decade && g.year < decade + 10);
  }
  if (state.search) {
    games = games.filter(g =>
      g.title.toLowerCase().includes(state.search) ||
      g.white.toLowerCase().includes(state.search) ||
      g.black.toLowerCase().includes(state.search) ||
      g.event.toLowerCase().includes(state.search) ||
      g.opening.toLowerCase().includes(state.search) ||
      g.description.toLowerCase().includes(state.search) ||
      String(g.year).includes(state.search)
    );
  }

  games.sort((a, b) => {
    let val = 0;
    switch (state.sortBy) {
      case 'rank': val = a.rank - b.rank; break;
      case 'year': val = a.year - b.year; break;
      case 'opening': val = a.opening.localeCompare(b.opening); break;
      case 'theme': val = (a.themes[0] || '').localeCompare(b.themes[0] || ''); break;
    }
    return val * state.sortDir;
  });

  return games;
}

// ── Render list ──────────────────────────────────────────
function renderList() {
  const games = getFilteredGames();
  const container = document.getElementById('game-list');
  const countEl = document.getElementById('results-count');

  countEl.textContent = `${games.length} of ${ALEKHINE_GAMES.length} games`;

  if (games.length === 0) {
    container.innerHTML = '<div class="no-games">No games match your filters.</div>';
    return;
  }

  container.innerHTML = '';
  games.forEach((g, i) => {
    const isAlekhineWhite = g.white === 'Alexander Alekhine';
    const alekhineWins = (isAlekhineWhite && g.result === '1-0') || (!isAlekhineWhite && g.result === '0-1');
    const isDraw = g.result === '1/2-1/2';
    const resultClass = alekhineWins ? 'win' : isDraw ? 'draw' : 'loss';
    const resultText = alekhineWins ? 'Win' : isDraw ? 'Draw' : 'Loss';
    const opponent = isAlekhineWhite ? g.black : g.white;

    const item = document.createElement('div');
    item.className = `game-item${g.id === state.selectedId ? ' active' : ''}`;
    item.style.animationDelay = `${i * 0.02}s`;
    item.dataset.id = g.id;
    item.innerHTML = `
      <div class="game-item-rank">№ ${g.rank}</div>
      <div class="game-item-title">${g.title}</div>
      <div class="game-item-meta">
        <span class="game-item-players">vs. ${opponent}</span>
        <span class="game-item-year">${g.year}</span>
        <span class="game-item-result ${resultClass}">${resultText}</span>
      </div>
      <div class="game-themes">
        ${g.themes.map(t => `<span class="theme-tag">${t}</span>`).join('')}
      </div>
    `;
    item.addEventListener('click', () => selectGame(g.id));
    container.appendChild(item);
  });
}

// ── Select game ──────────────────────────────────────────
function selectGame(id) {
  state.selectedId = id;
  currentGame = ALEKHINE_GAMES.find(g => g.id === id);
  if (!currentGame) return;

  // Update active state in list
  document.querySelectorAll('.game-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.id) === id);
  });

  // Scroll selected item into view
  const activeItem = document.querySelector('.game-item.active');
  if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });

  renderGameDetail(currentGame);
  initBoard(currentGame);
}

// ── Render detail panel ──────────────────────────────────
function renderGameDetail(g) {
  const isWhite = g.white === 'Alexander Alekhine';
  const alekhineWins = (isWhite && g.result === '1-0') || (!isWhite && g.result === '0-1');
  const isDraw = g.result === '1/2-1/2';
  const resultClass = alekhineWins ? 'win' : isDraw ? 'draw' : 'loss';
  const resultText = g.result;

  document.getElementById('detail-rank').textContent = `Greatest Game № ${g.rank}`;
  document.getElementById('detail-title').textContent = g.title;
  document.getElementById('detail-white').textContent = g.white;
  document.getElementById('detail-black').textContent = g.black;
  document.getElementById('detail-result').textContent = resultText;
  document.getElementById('detail-result').className = `result-badge ${resultClass}`;
  document.getElementById('detail-year').textContent = g.year;
  document.getElementById('detail-event').textContent = g.event;
  document.getElementById('detail-description').textContent = g.description;

  // Tags
  const tagsRow = document.getElementById('detail-tags');
  tagsRow.innerHTML = `
    <span class="game-tag opening-tag">${g.opening}</span>
    ${g.themes.map(t => `<span class="game-tag">${t}</span>`).join('')}
  `;
}

// ── Chess board ──────────────────────────────────────────
function initBoard(g) {
  // Parse moves using chess.js
  game = new Chess();
  parsedMoves = [];
  currentMoveIndex = -1;

  // Parse PGN
  const pgnResult = game.load_pgn(g.pgn, { sloppy: true });
  if (pgnResult) {
    parsedMoves = game.history({ verbose: true });
  }

  // Reset to start
  game.reset();

  // Init or update board
  const cfg = {
    draggable: false,
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
  };

  if (board) {
    board.destroy();
  }
  board = Chessboard('board', cfg);

  renderMoveList();
  updateControls();
}

function goToPosition(index) {
  game.reset();
  for (let i = 0; i <= index; i++) {
    if (parsedMoves[i]) {
      game.move(parsedMoves[i]);
    }
  }
  board.position(game.fen(), false);
  currentMoveIndex = index;
  highlightCurrentMove();
  updateControls();
}

function goToStart() {
  game.reset();
  board.position('start', false);
  currentMoveIndex = -1;
  highlightCurrentMove();
  updateControls();
}

function goToEnd() {
  goToPosition(parsedMoves.length - 1);
}

function prevMove() {
  if (currentMoveIndex > -1) {
    goToPosition(currentMoveIndex - 1);
  }
}

function nextMove() {
  if (currentMoveIndex < parsedMoves.length - 1) {
    goToPosition(currentMoveIndex + 1);
  }
}

function updateControls() {
  const total = parsedMoves.length;
  document.getElementById('btn-start').disabled = currentMoveIndex === -1;
  document.getElementById('btn-prev').disabled = currentMoveIndex === -1;
  document.getElementById('btn-next').disabled = currentMoveIndex === total - 1;
  document.getElementById('btn-end').disabled = currentMoveIndex === total - 1;

  const moveNum = currentMoveIndex === -1 ? 'Start' :
    `Move ${Math.floor(currentMoveIndex / 2) + 1}${currentMoveIndex % 2 === 0 ? ' (White)' : ' (Black)'}`;
  document.getElementById('move-indicator').textContent = `${moveNum} · ${currentMoveIndex + 1}/${total} half-moves`;
}

// ── Move list ────────────────────────────────────────────
function renderMoveList() {
  const container = document.getElementById('move-list');
  container.innerHTML = '';

  for (let i = 0; i < parsedMoves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const white = parsedMoves[i];
    const black = parsedMoves[i + 1];

    const numEl = document.createElement('span');
    numEl.className = 'move-num';
    numEl.textContent = `${moveNum}.`;

    const whiteEl = document.createElement('span');
    whiteEl.className = 'move-cell';
    whiteEl.dataset.index = i;
    whiteEl.textContent = white ? white.san : '';
    whiteEl.addEventListener('click', () => goToPosition(i));

    const blackEl = document.createElement('span');
    blackEl.className = 'move-cell';
    blackEl.dataset.index = i + 1;
    blackEl.textContent = black ? black.san : '';
    if (black) blackEl.addEventListener('click', () => goToPosition(i + 1));

    container.appendChild(numEl);
    container.appendChild(whiteEl);
    container.appendChild(blackEl);
  }
}

function highlightCurrentMove() {
  document.querySelectorAll('.move-cell').forEach(el => el.classList.remove('current'));
  if (currentMoveIndex >= 0) {
    const cell = document.querySelector(`.move-cell[data-index="${currentMoveIndex}"]`);
    if (cell) {
      cell.classList.add('current');
      cell.scrollIntoView({ block: 'nearest' });
    }
  }
}
