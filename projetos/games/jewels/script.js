const grid = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const rows = 8;
const cols = 8;
const jewels = ['ruby', 'diamond', 'emerald', 'sapphire', 'amethyst', 'topaz'];
let score = 0;
let highScore = 0;
let board = [];
let selectedCell = null;


// Função para salvar o recorde no local storage
function saveHighScore() {
  localStorage.setItem('highScore', highScore);
}

// Função para carregar o recorde do local storage ao carregar a página
function loadHighScore() {
  const savedHighScore = localStorage.getItem('highScore');
  if (savedHighScore !== null) {
    highScore = parseInt(savedHighScore);
    highScoreDisplay.textContent = highScore;
  }
}
// Chame a função para carregar o recorde quando a página for carregada
window.addEventListener('load', loadHighScore);

function createBoard() {
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', selectCell);
    grid.appendChild(cell);
    board.push(cell);
  }
  fillBoard();
}

function fillBoard() {
  board.forEach(cell => {
    const jewelType = jewels[Math.floor(Math.random() * jewels.length)];
    const img = document.createElement('img');
    img.src = 'imgs/' + jewelType + '.png';
    img.alt = jewelType;
    cell.appendChild(img);
    cell.dataset.jewel = jewelType;
  });
  checkAndRemoveCombos();
}

function selectCell() {
  if (selectedCell) {
    if (this === selectedCell) {
      this.classList.remove('selected');
      selectedCell = null;
    } else {
      swapJewels(this, selectedCell);
      selectedCell.classList.remove('selected');
      selectedCell = null;
    }
  } else {
    this.classList.add('selected');
    selectedCell = this;
  }
}

function swapJewels(cell1, cell2) {
  const index1 = parseInt(cell1.dataset.index);
  const index2 = parseInt(cell2.dataset.index);

  const isAdjacent = Math.abs(index1 - index2) === 1 || Math.abs(index1 - index2) === cols;
  if (!isAdjacent) return;

  const img1 = cell1.querySelector('img');
  const img2 = cell2.querySelector('img');
  const src1 = img1.src;
  const src2 = img2.src;
  img1.src = src2;
  img2.src = src1;

  const jewel1 = cell1.dataset.jewel;
  const jewel2 = cell2.dataset.jewel;
  cell1.dataset.jewel = jewel2;
  cell2.dataset.jewel = jewel1;


  const combo = checkForCombos();
  if (combo.length > 0 && !comboChecked) {
    updateScore(combo.length);
    removeJewels(combo);
    setTimeout(dropJewels, 500);
    comboChecked = true; // Atualiza a variável de controle
  } else {
    img1.src = src1;
    img2.src = src2;
    cell1.dataset.jewel = jewel1;
    cell2.dataset.jewel = jewel2;
  }
}

function checkForCombos() {
  let combos = [];
  board.forEach(cell => cell.classList.remove('combo'));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols - 2; j++) {
      let start = i * cols + j;
      if (board[start].dataset.jewel === board[start + 1].dataset.jewel &&
          board[start].dataset.jewel === board[start + 2].dataset.jewel) {
        board[start].classList.add('combo');
        board[start + 1].classList.add('combo');
        board[start + 2].classList.add('combo');
        combos.push(start, start + 1, start + 2);
      }
    }
  }
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows - 2; i++) {
      let start = i * cols + j;
      if (board[start].dataset.jewel === board[start + cols].dataset.jewel &&
          board[start].dataset.jewel === board[start + 2 * cols].dataset.jewel) {
        board[start].classList.add('combo');
        board[start + cols].classList.add('combo');
        board[start + 2 * cols].classList.add('combo');
        combos.push(start, start + cols, start + 2 * cols);
      }
    }
  }

  if (combos.length > 0) {
    setTimeout(() => {
      updateScore(combos.length);
      removeJewels(combos);
      setTimeout(dropJewels, 500);
    }, 1500);
  }

  return combos;
}

// Atualize o recorde e salve-o sempre que ele for atualizado
function updateScore(points) {
  score += points;
  scoreDisplay.textContent = score;
  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
    saveHighScore(); // Salva o recorde atualizado
  }
}

function removeJewels(combos) {
  combos.forEach(index => {
    const cell = board[index];
    const img = cell.querySelector('img');
    if (img && cell.contains(img)) {
      cell.removeChild(img);
    }
    cell.dataset.jewel = '';
  });
  setTimeout(dropJewels, 500);
}

function dropJewels() {
  for (let i = 0; i < cols; i++) {
    for (let j = rows - 1; j >= 0; j--) {
      const cell = board[j * cols + i];
      if (!cell.dataset.jewel) {
        for (let k = j - 1; k >= 0; k--) {
          const aboveCell = board[k * cols + i];
          if (aboveCell.dataset.jewel) {
            const aboveImg = aboveCell.querySelector('img');
            if (aboveImg) {
              cell.appendChild(aboveImg);
            }
            cell.dataset.jewel = aboveCell.dataset.jewel;
            aboveCell.dataset.jewel = '';
            break;
          }
        }
      }
    }
  }
  setTimeout(refillBoard, 500);
}

function refillBoard() {
  board.forEach(cell => {
    if (!cell.dataset.jewel) {
      const jewelType = jewels[Math.floor(Math.random() * jewels.length)];
      const img = document.createElement('img');
      img.src = 'imgs/' + jewelType + '.png';
      img.alt = jewelType;
      img.style.opacity = '0';
      cell.appendChild(img);
      setTimeout(() => {
        img.style.opacity = '1';
      }, 250);
      cell.dataset.jewel = jewelType;
    }
  });
  checkAndRemoveCombos();
}

function applyComboAnimation(combos) {
  combos.forEach(index => {
    board[index].classList.add('combo');
  });
}

function showHints() {
  const hints = findHints();
  hints.forEach(index => {
    board[index].classList.add('hint');
  });

  setTimeout(() => {
    board.forEach(cell => cell.classList.remove('hint'));
  }, 3000);
}

function findHints() {
  let hints = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      // Verifica movimentos horizontais e verticais sem fazer trocas reais
      if (j < cols - 1 && canSwap(index, index + 1)) {
        hints.push(index, index + 1);
      }
      if (i < rows - 1 && canSwap(index, index + cols)) {
        hints.push(index, index + cols);
      }
    }
  }

  return hints;
}


function canSwap(index1, index2) {
  // Faz uma cópia temporária do tabuleiro
  let tempBoard = board.map(cell => {
    return {
      jewel: cell.dataset.jewel,
      imgSrc: cell.querySelector('img').src
    };
  });

  // Troca as joias na cópia temporária
  let temp = tempBoard[index1];
  tempBoard[index1] = tempBoard[index2];
  tempBoard[index2] = temp;

  // Verifica se a troca resultaria em uma combinação
  return checkCombos(tempBoard).length > 0;
}


function checkCombos(tempBoard) {
  let combos = [];

  // Verifica combinações horizontais
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols - 2; j++) {
      let start = i * cols + j;
      if (tempBoard[start].jewel === tempBoard[start + 1].jewel &&
          tempBoard[start].jewel === tempBoard[start + 2].jewel) {
        combos.push(start, start + 1, start + 2);
      }
    }
  }

  // Verifica combinações verticais
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows - 2; i++) {
      let start = i * cols + j;
      if (tempBoard[start].jewel === tempBoard[start + cols].jewel &&
          tempBoard[start].jewel === tempBoard[start + 2 * cols].jewel) {
        combos.push(start, start + cols, start + 2 * cols);
      }
    }
  }

  // Retorna os índices das joias que formam combinações
  return combos;
}


function checkAndRemoveCombos() {
  const combos = checkForCombos();
  if (combos.length > 0) {
    applyComboAnimation(combos);
    setTimeout(() => {
      updateScore(combos.length);
      removeJewels(combos);
      setTimeout(dropJewels, 500);
    }, 1500); // Atraso para mostrar a animação de combinação
  } else {
    // Se não houver combinações, permite novos movimentos
    enableBoardInteractions();
  }
}


function enableBoardInteractions() {
  // Remove qualquer efeito visual de combinação
  board.forEach(cell => cell.classList.remove('combo'));

  // Reabilita os eventos de clique nas células
  board.forEach(cell => cell.addEventListener('click', selectCell));

  // Se necessário, remova a seleção atual
  if (selectedCell) {
    selectedCell.classList.remove('selected');
    selectedCell = null;
  }
}

document.getElementById('hintButton').addEventListener('click', showHints);

createBoard();