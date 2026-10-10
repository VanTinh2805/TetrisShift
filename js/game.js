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
var currentPiece = pieces[0];
var pieceRow = 0;
var pieceCol = 3;

var fixedBoard = [];
for(var i = 0; i<ROWS;i++){
  fixedBoard[i]=[];
  for (var j = 0;j < COLS;j++){
    fixedBoard[i][j] = 0;
  }
}

function clearBoard() {
  for (var i = 0; i < cells.length; i++) {
    cells[i].style.background = "#111827";
  }
}
function drawFixed(){
  for (var i = 0; i < ROWS; i++){
    for (var j = 0; j < COLS; j++ ){
      if (fixedBoard[i][j] === 1){
        var index = i*COLS+j;
        cells[index].style.background = "#38bdf8";
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
          cells[index].style.background = "#38bdf8";
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
        }
      }
    }
  }
}

function newPiece() {

  var random = Math.floor(Math.random() * pieces.length);
  currentPiece = pieces[random];

  pieceRow = 0;
  pieceCol = Math.floor((COLS - currentPiece[0].length) / 2);
}

function moveDown() {
  if (canMove(pieceRow + 1, pieceCol)) {
    pieceRow++;
    clearBoard();
    drawFixed();
    drawPiece();
  } else {

    lockPiece();
    newPiece();
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
  pieceRow = 0;
  pieceCol = 3;
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
  }
};

clearBoard();
drawFixed();
drawPiece();
