var ROWS = 20;
var COLS = 10;

var board = document.querySelector(".game-board");
var cells = [];


for (var i = 0; i < ROWS; i++) {
  for (var j = 0; j < COLS; j++) {
    var cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = "cell-" + i + "-" + j;
    board.appendChild(cell);
    cells.push(cell);
  }
}



var gameInterval = null;
var isPlaying = false;
var nextPiece = null;
var score = 0;
var lines = 0;
var pieces = [
  // I
  [[1, 1, 1, 1]
  ],

  [ [1],
    [1],
    [1],
    [1]
  ],
  // O
  [
    [1, 1],
    [1, 1]
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // L
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],

  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  // Z
  [
    [0, 1, 1],
    [1, 1, 0]
  ],

  [
    [1, 1, 0],
    [0, 1, 1]
  ]
];

var pieceColors = [
  "#3498db",
  "#3498db",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#e74c3c",
  "#31ac59",
  "#31ac59"

];
var currentPiece = pieces[Math.floor(Math.random() * pieces.length)];
var pieceRow = 0;
var pieceCol = Math.floor((COLS - currentPiece[0].length) / 2);
var currentColor = pieceColors[pieces.indexOf(currentPiece) % pieceColors.length];
var fixedBoard = [];
var fixedColors = [];

for (var i = 0; i < ROWS; i++) {
  fixedBoard[i] = [];
  fixedColors[i] = [];

  for (var j = 0; j < COLS; j++) {
    fixedBoard[i][j] = 0;
    fixedColors[i][j] = "";
  }
}
function randomPiece() {
  return Math.floor(Math.random() * pieces.length);
}
function clearBoard() {
  for (var i = 0; i < cells.length; i++) {
    cells[i].style.background = "#111827";
  }
}
function drawFixed() {
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      var index = i * COLS + j;

      if (fixedBoard[i][j] === 1) {
        cells[index].style.background = fixedColors[i][j];
      }
    }
  }
}

function drawPiece() {
  for (var r = 0; r < currentPiece.length; r++) {
    for (var c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c] === 1) {
        var index = (pieceRow + r) * COLS + (pieceCol + c);
        if (index >= 0 && index < cells.length) {
          cells[index].style.background = currentColor;
        }
      }
    }
  }
}


function canMove(newRow, newCol) {
  for (var r = 0; r < currentPiece.length; r++) {
    for (var c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c] === 1) {
        var nextRow = newRow + r;
        var nextCol = newCol + c;

        if (nextCol < 0 || nextCol >= COLS || nextRow >= ROWS) {
          return false;
        }
        if (nextRow >= 0 && fixedBoard[nextRow][nextCol] === 1){
          return false;
        }
      }
    }
  }
  return true;
}

function rotatePiece(){
  var newPiece = [];
  var rows = currentPiece.length;
  var cols = currentPiece[0].length;
  for(var c = 0; c < cols; c++){
    newPiece[c] = [];
    for (var r = rows - 1; r >= 0; r--) {
      newPiece[c].push(currentPiece[r][c]);
    }
  }
  var oldPiece = currentPiece;
  currentPiece = newPiece;

  if (!canMove(pieceRow, pieceCol)) {
    currentPiece = oldPiece;
  } else {

    clearBoard();
    drawFixed();
    drawPiece();
  }
}

function lockPiece() {
  for (var r = 0; r < currentPiece.length; r++) {
    for (var c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c] === 1) {
        var row = pieceRow + r;
        var col = pieceCol + c;

        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
          fixedBoard[row][col] = 1;
          fixedColors[row][col] = currentColor;
        }
      }
    }
  }
}


function clearLines() {
  var cleared = 0;

  for (var i = ROWS - 1; i >= 0; i--) {
    var full = true;

    for (var j = 0; j < COLS; j++) {
      if (fixedBoard[i][j] === 0) {
        full = false;
        break;
      }
    }

    if (full) {
      fixedBoard.splice(i, 1);
      fixedColors.splice(i, 1);

      var newRow = [];
      var newColorRow = [];

      for (var j = 0; j < COLS; j++) {
        newRow.push(0);
        newColorRow.push("");
      }

      fixedBoard.unshift(newRow);
      fixedColors.unshift(newColorRow);

      cleared++;
      i++;
    }
  }

  if (cleared > 0) {
    lines += cleared;

    if (cleared === 1) {
      score += 100;
    } else if (cleared === 2) {
      score += 300;
    } else if (cleared === 3) {
      score += 500;
    } else if (cleared >= 4) {
      score += 800;
    }

    updateStats();
    checkWin();
  }
}


function updateStats() {
  document.getElementById("score").textContent =
    String(score).padStart(6, "0");

  document.getElementById("lines").textContent =
    String(lines).padStart(6, "0");
}
function checkWin() {
  if (lines >= 10) {
    clearInterval(gameInterval);
    gameInterval = null;
    isPlaying = false;

    alert("Chúc mừng! Bạn đã chiến thắng.");
  }
}


function newPiece() {
  var currentIndex;

  if (nextPiece === null) {
    currentIndex = Math.floor(Math.random() * pieces.length);
  } else {
    currentIndex = nextPiece.index;
  }

  currentPiece = pieces[currentIndex];
  currentColor = pieceColors[currentIndex % pieceColors.length];

  var nextIndex = Math.floor(Math.random() * pieces.length);
  nextPiece = {
    shape: pieces[nextIndex],
    index: nextIndex
  };

  pieceRow = 0;
  pieceCol = Math.floor((COLS - currentPiece[0].length) / 2);

  drawNextPiece();

  if (!canMove(pieceRow, pieceCol)) {
    gameOver();
  }
}

function gameOver() {
  clearInterval(gameInterval);
  gameInterval = null;
  isPlaying = false;

  alert("Trò chơi kết thúc! Bạn đã thua.");
}


function drawNextPiece() {
  var miniBlock = document.querySelector(".mini-block");
  miniBlock.innerHTML = "";

  var rows = nextPiece.shape.length;
  var cols = nextPiece.shape[0].length;

  miniBlock.style.gridTemplateColumns = "repeat(" + cols + ", 25px)";
  miniBlock.style.gridTemplateRows = "repeat(" + rows + ", 25px)";

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var span = document.createElement("span");

      if (nextPiece.shape[r][c] === 1) {
        span.style.background = pieceColors[nextPiece.index % pieceColors.length];
      } else {
        span.style.background = "transparent";
      }

      miniBlock.appendChild(span);
    }
  }
}



function moveDown() {
  if (!isPlaying) return;

  if (canMove(pieceRow + 1, pieceCol)) {
    pieceRow++;
    clearBoard();
    drawFixed();
    drawPiece();
  } else {
    lockPiece();
    clearLines();

    if (!isPlaying) return;

    newPiece();

    if (!isPlaying) return;

    clearBoard();
    drawFixed();
    drawPiece();
  }
}



function moveLeft() {
  if (canMove(pieceRow, pieceCol - 1)) {
    pieceCol--;
    clearBoard();
    drawFixed();
    drawPiece();
  }
}

function moveRight() {
  if (canMove(pieceRow, pieceCol + 1)) {
    pieceCol++;
    clearBoard();
    drawFixed();
    drawPiece();
  }
}


function startGame() {
  if (isPlaying) return;

  isPlaying = true;
  nextPiece = null;

  newPiece();

  if (!isPlaying) return;

  clearBoard();
  drawFixed();
  drawPiece();

  gameInterval = setInterval(moveDown, 500);
}



function pauseGame() {
  if (!isPlaying) return;
  clearInterval(gameInterval);
  isPlaying = false;
}


function restartGame() {
  clearInterval(gameInterval);
  isPlaying = false;

  score = 0;
  lines = 0;
  updateStats();

  nextPiece = null;
  document.querySelector(".mini-block").innerHTML = "";
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      fixedBoard[i][j] = 0;
    }
  }
  pieceRow = 0;
  pieceCol = 3;
  clearBoard();
  drawPiece();
}


document.querySelector(".btn-start").onclick = startGame;
document.querySelector(".btn-pause").onclick = pauseGame;
document.querySelector(".btn-restart").onclick = restartGame;


document.onkeydown = function (e) {
  if (!isPlaying) return;

  if (e.key === "ArrowLeft") {
    moveLeft();
  } else if (e.key === "ArrowRight") {
    moveRight();
  } else if (e.key === "ArrowDown") {
    moveDown();
  } else if (e.key === "ArrowUp") {
    rotatePiece();
  } else if (e.code === "Space") {
  e.preventDefault();

  while (canMove(pieceRow + 1, pieceCol)) {
    pieceRow++;
  }

  moveDown();
}
};

clearBoard();
drawFixed();
drawPiece();
