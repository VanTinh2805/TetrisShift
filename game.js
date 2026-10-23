// Âm thanh khi xóa dòng
var clearSound = new Audio("clear.mp3");  // đổi tên file cho đúng với file của bạn
clearSound.volume = 0.6;

// Số hàng và số cột của bàn chơi Tetris
var ROWS = 20;
var COLS = 10;

//Lấy bàn chơi trong file HTML để lát nửa thêm các ô vào
var board = document.querySelector(".game-board");

// Mảng này dùng để lưu lại tất cả ô trên bàn chơi,
// sau này muốn đổi màu ô nào thì mình tìm ô đó trong mảng
var cells = [];

// Dùng vòng lặp để tạo đủ 20 hàng, mỗi hàng có 10 ô
for (var i = 0; i < ROWS; i++) {
  for (var j = 0; j < COLS; j++) {
    // Tạo một ô mới trên bàn chơi
    var cell = document.createElement("div");
    // Thêm class cell để áp dụng CSS đã viết
    cell.classList.add("cell");
    // Đặt ID riêng cho từng ô để dễ phân biệt vị trí hàng và cột
    cell.id = "cell-" + i + "-" + j;
    // Thêm ô vừa tạo vào bàn chơi trên giao diện
    board.appendChild(cell);
    // Lưu ô vào mảng để sau này xử lý di chuyển và đổi màu
    cells.push(cell);
  }
}


// Trạng thái trò chơi và điểm số
var gameInterval = null;
var isPlaying = false;
var nextPiece = null;
var score = 0;
var lines = 0;
var currentLevel = 1;
// Số 1 là ô có khối, số 0 là ô trống
var pieces = [
  // I - Thanh dài
  [
    [1, 1, 1, 1]
  ],
  // O - Khối vuông
  [
    [1, 1],
    [1, 1]
  ],

  // T - Khối chữ T
  [
    [0, 1, 0],
    [1, 1, 1]
  ],

  // L - Khối chữ L
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],

  // J - Khối chữ J ngược
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],

  // S - Khối chữ S
  [
    [0, 1, 1],
    [1, 1, 0]
  ],

  // Z - Khối chữ Z
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
];

// Mỗi loại khối có một màu riêng
var pieceColors = [
  "#00BCD4", // I - Xanh cyan
  "#F1C40F", // O - Vàng
  "#9B59B6", // T - Tím
  "#E67E22", // L - Cam
  "#3498DB", // J - Xanh dương
  "#2ECC71", // S - Xanh lá
  "#E74C3C"  // Z - Đỏ
];
var currentPiece = pieces[Math.floor(Math.random() * pieces.length)];
var pieceRow = 0;
var pieceCol = Math.floor((COLS - currentPiece[0].length) / 2);
var currentColor = pieceColors[pieces.indexOf(currentPiece) % pieceColors.length];
// Lưu vị trí và màu sắc của các khối đã cố định trên bàn chơi
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
// ===== Level 2: Hàng đóng băng =====
var isFrozen = [];
var frozenCleared = 0;
var FROZEN_COLOR = "#7f8c8d"; // màu xám cho ô đóng băng

var frozenColors = [
  "#3498DB",
  "#2ECC71",
  "#F1C40F",
  "#E67E22",
  "#9B59B6",
  "#E74C3C"
];

// Lưu vị trí các lỗ gốc của từng hàng đóng băng (để khi phá chỉ xóa đúng những ô đó)
var frozenHoles = [];
// Đánh dấu hàng đã phá băng nhưng chưa xóa lần 2 (để đếm thắng)
var brokenFrozen = [];

for (var i = 0; i < ROWS; i++) {
  isFrozen[i] = false;
  frozenHoles[i] = null;   // null = không phải hàng đóng băng
  brokenFrozen[i] = false;
}

// Hàm tạo hàng đóng băng ở phía dưới bàn chơi
function createFrozenRows() {
  // Xóa trạng thái đóng băng cũ (nếu có)
  for (var i = 0; i < ROWS; i++) {
    isFrozen[i] = false;
    frozenHoles[i] = null;
    brokenFrozen[i] = false;
  }
  frozenCleared = 0;

  // Tạo 1 hàng đóng băng ở hàng cuối bàn chơi
  var frozenRowIndexes = [19];

  for (var k = 0; k < frozenRowIndexes.length; k++) {
    var row = frozenRowIndexes[k];
    isFrozen[row] = true;

    // Mỗi hàng đóng băng có đúng 1 ô trống
    var emptyCount = 1;

    // Tạo danh sách vị trí trống ngẫu nhiên
    var emptyCols = [];
    while (emptyCols.length < emptyCount) {
      var col = Math.floor(Math.random() * COLS);
      if (emptyCols.indexOf(col) === -1) {
        emptyCols.push(col);
      }
    }
    // Lưu lỗ gốc
    frozenHoles[row] = emptyCols.slice();

    // Điền hàng: ô trống = 0, còn lại = xám
    for (var j = 0; j < COLS; j++) {
      if (emptyCols.indexOf(j) !== -1) {
        fixedBoard[row][j] = 0;
        fixedColors[row][j] = "";
      } else {
        fixedBoard[row][j] = 1;
        fixedColors[row][j] = FROZEN_COLOR;
      }
    }
  }
}


// ===== Level 3: Vùng Nguy Hiểm =====
var isDanger = [];
var dangerCount = 0;
var DANGER_COLOR = "#FFFFFF"; // trắng - phân biệt rõ với khối O (#F1C40F)
var DANGER_BORDER_COLOR = "#8B0000";
// // Level 3: thời gian khối bị kẹt khi chạm ô nguy hiểm
var dangerContactSince = null;
var DANGER_LIMIT = 1000; // 1000ms = 1 giây → người chơi kịp phản ứng

for (var i = 0; i < ROWS; i++) {
  isDanger[i] = [];
  for (var j = 0; j < COLS; j++) {
    isDanger[i][j] = false;
  }
}

function createDangerCells() {
  // Xóa trạng thái nguy hiểm cũ
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      isDanger[i][j] = false;
    }
  }

  dangerCount = 0;

  // Ô nguy hiểm thứ nhất: luôn ở hàng 19
  var row1 = 19;
  var col1 = Math.floor(Math.random() * COLS);

  isDanger[row1][col1] = true;
  dangerCount++;

  // Ô nguy hiểm thứ hai: ngẫu nhiên ở hàng 17 hoặc 18
  var row2 = Math.random() < 0.5 ? 17 : 18;
  var col2;

  // Đảm bảo hai ô không cùng cột
  do {
    col2 = Math.floor(Math.random() * COLS);
  } while (col2 === col1);

  isDanger[row2][col2] = true;
  dangerCount++;

  // Vẽ màu đỏ cho hai ô nguy hiểm
  fixedColors[row1][col1] = DANGER_COLOR;
  fixedColors[row2][col2] = DANGER_COLOR;
}


function randomPiece() {
  return Math.floor(Math.random() * pieces.length);
}
// Xóa phần hiển thị cũ trước khi vẽ lại bàn chơi
function clearBoard() {
  for (var i = 0; i < cells.length; i++) {
    cells[i].style.background = "#111827";
    cells[i].style.border = "";
  }
}
// Vẽ lại các khối đã nằm cố định (kể cả hàng đóng băng và ô nguy hiểm)
function drawFixed() {
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      var index = i * COLS + j;

      if (fixedBoard[i][j] === 1) {
        cells[index].style.background = fixedColors[i][j];
    } else if (isDanger[i][j]) {
      // Ô nguy hiểm Level 3: fixedBoard=0 nhưng vẫn hiển thị màu đỏ
      cells[index].style.background = DANGER_COLOR;
      cells[index].style.border = "3px solid " + DANGER_BORDER_COLOR;
      cells[index].style.boxSizing = "border-box";
    }
    }
  }
}
// Hiển thị khối đang rơi theo vị trí hiện tại
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

function touchesDanger(newRow, newCol) {
  for (var r = 0; r < currentPiece.length; r++) {
    for (var c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c] !== 1) continue;

      var row = newRow + r;
      var col = newCol + c;

      if (
        row >= 0 && row < ROWS &&
        col >= 0 && col < COLS &&
        isDanger[row][col]
      ) {
        return true;
      }
    }
  }

  return false;
}



// Kiểm tra khối có thể di chuyển đến vị trí mới hay không
// Nếu chạm tường, đáy bàn hoặc khối khác thì trả về false
function canMove(newRow, newCol) {
  for (var r = 0; r < currentPiece.length; r++) {
    for (var c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c] === 1) {
        var nextRow = newRow + r;
        var nextCol = newCol + c;

        if (nextCol < 0 || nextCol >= COLS || nextRow >= ROWS) {
          return false;
        }
        if (nextRow >= 0 &&
          (fixedBoard[nextRow][nextCol] === 1 || isDanger[nextRow][nextCol])) {
          return false;

        }
      }
    }
  }
  return true;
}
// Xoay khối 90 độ, nếu vị trí mới không hợp lệ thì giữ nguyên khối cũ
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
// Khi khối không rơi xuống được nữa thì cố định khối vào bàn chơi
// Guard !isDanger: không ghi đè lên ô nguy hiểm Level 3
function lockPiece() {
  for (var r = 0; r < currentPiece.length; r++) {
    for (var c = 0; c < currentPiece[r].length; c++) {
      if (currentPiece[r][c] === 1) {
        var row = pieceRow + r;
        var col = pieceCol + c;

        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && !isDanger[row][col]) {
          fixedBoard[row][col] = 1;
          fixedColors[row][col] = currentColor;
        }
      }
    }
  }
}



function applyGravity(row, col) {
  // Dồn các ô phía trên xuống 1 ô trong cùng cột
  for (var r = row; r > 0; r--) {
    fixedBoard[r][col] = fixedBoard[r - 1][col];
    fixedColors[r][col] = fixedColors[r - 1][col];
  }

  // Ô trên cùng trở thành ô trống
  fixedBoard[0][col] = 0;
  fixedColors[0][col] = "";
}



// Kiểm tra và xóa các hàng đã lấp đầy, sau đó cập nhật điểm
function clearLines() {
  var cleared = 0;

  for (var i = ROWS - 1; i >= 0; i--) {
    var full = true;


    for (var j = 0; j < COLS; j++) {
      // Ô nguy hiểm cũng được tính là ô đã lấp đầy
      if (fixedBoard[i][j] === 0 && !isDanger[i][j]) {
        full = false;
        break;
      }
    }


    if (full) {
      // Level 2: Hàng băng bị lấp đầy lần đầu => phá băng, không xóa hàng
      if (currentLevel === 2 && isFrozen[i] && !brokenFrozen[i]) {
        // Lấy danh sách TẤT CẢ các lỗ gốc của hàng băng này
        var holes = frozenHoles[i] ? frozenHoles[i].slice() : [];

        // Xóa tất cả các ô tại vị trí lỗ (các ô vừa được người chơi lấp vào)
        for (var h = 0; h < holes.length; h++) {
          fixedBoard[i][holes[h]] = 0;
          fixedColors[i][holes[h]] = "";
        }

        // Đổi màu các ô băng còn lại sang màu ngẫu nhiên
        for (var j = 0; j < COLS; j++) {
          if (fixedBoard[i][j] === 1 &&
            fixedColors[i][j] === FROZEN_COLOR) {
            var colorIndex = Math.floor(
              Math.random() * frozenColors.length
            );
            fixedColors[i][j] = frozenColors[colorIndex];
          }
        }

        // Đánh dấu hàng đã phá băng (chờ lấp đầy lần 2 để xóa hẳn)
        brokenFrozen[i] = true;
        isFrozen[i] = false;
        // Không xóa hàng, tiếp tục vòng lặp
        continue;
      }

      // Hàng bình thường hoặc hàng băng đã phá lần đầu: xóa hàng
      // Nếu hàng này là hàng băng đã bị phá (brokenFrozen), đếm thêm 1
      if (currentLevel === 2 && brokenFrozen[i]) {
        frozenCleared++;
      }

      // Level 3: đếm ô nguy hiểm bị xóa trong hàng này
      if (currentLevel === 3) {
        for (var j = 0; j < COLS; j++) {
          if (isDanger[i][j]) {
            dangerCount--;
          }
        }
      }

      fixedBoard.splice(i, 1);
      fixedColors.splice(i, 1);
      isFrozen.splice(i, 1);
      frozenHoles.splice(i, 1);
      brokenFrozen.splice(i, 1);
      isDanger.splice(i, 1);

      fixedBoard.unshift(Array(COLS).fill(0));
      fixedColors.unshift(Array(COLS).fill(""));
      isFrozen.unshift(false);
      frozenHoles.unshift(null);
      brokenFrozen.unshift(false);
      isDanger.unshift(Array(COLS).fill(false));

      cleared++;
      i++;
    }
  }

  if (cleared > 0) {
    clearSound.currentTime = 0;
    clearSound.play();

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


// Cập nhật điểm số và số dòng lên giao diện
function updateStats() {
  document.getElementById("score").textContent =
    String(score).padStart(6, "0");

  document.getElementById("lines").textContent =
    String(lines).padStart(6, "0");
}
// Kiểm tra điều kiện chiến thắng theo từng level
function checkWin() {
  var won = false;

  if (currentLevel === 2) {
    // Level 2: thắng khi xóa được hàng băng VÀ ít nhất 5 dòng bình thường
    if (frozenCleared >= 1 && lines >= 5) {
      won = true;
    }
  } else if (currentLevel === 3) {
    // Level 3: thắng khi xóa đủ 8 dòng mà không đè ô đỏ
    if (lines >= 8) {
      won = true;
    }
  } else {
    // Các level khác: thắng khi xóa đủ 10 dòng
    if (lines >= 10) {
      won = true;
    }
  }

  if (won) {
    clearInterval(gameInterval);
    gameInterval = null;
    isPlaying = false;

    alert("Chúc mừng! Bạn đã chiến thắng.");
  }
}

// Tạo khối mới và chuẩn bị khối tiếp theo
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
// Kết thúc trò chơi khi không thể tạo khối mới ở vị trí ban đầu
function gameOver() {
  clearInterval(gameInterval);
  gameInterval = null;
  isPlaying = false;

  alert("Trò chơi kết thúc! Bạn đã thua.");
}

// Hiển thị hình dạng và màu sắc của khối tiếp theo
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
        span.style.background = pieceColors[nextPiece.index];
      } else {
        span.style.background = "transparent";
      }

      miniBlock.appendChild(span);
    }
  }
}


// Cho khối rơi xuống; nếu không thể rơi tiếp thì cố định và kiểm tra xóa dòng

function moveDown() {
  if (!isPlaying) return;

  // Nếu khối có thể rơi xuống bình thường
  if (canMove(pieceRow + 1, pieceCol)) {
    pieceRow++;
    dangerContactSince = null;

    clearBoard();
    drawFixed();
    drawPiece();
    return;
  }

  if (currentLevel === 3 &&
    touchesDanger(pieceRow + 1, pieceCol)) {

    if (dangerContactSince === null) {
      dangerContactSince = Date.now();
    }

    if (Date.now() - dangerContactSince >= DANGER_LIMIT) {
      gameOver();
      return;
    }

    return;
  }

  // Nếu không phải ô nguy hiểm thì khóa khối như bình thường
  dangerContactSince = null;

  // lockPiece bình thường (hitDanger cho Lv3 đã xử lý bằng timer ở trên)
  lockPiece();

  clearLines();

  if (!isPlaying) return;

  newPiece();

  if (!isPlaying) return;

  clearBoard();
  drawFixed();
  drawPiece();
}



// Di chuyển khối sang trái hoặc phải nếu vị trí mới hợp lệ
function moveLeft() {
  if (canMove(pieceRow, pieceCol - 1)) {
    pieceCol--;
    clearBoard();
    drawFixed();
    drawPiece();
  }
}
// Di chuyển khối sang trái hoặc phải nếu vị trí mới hợp lệ
function moveRight() {
  if (canMove(pieceRow, pieceCol + 1)) {
    pieceCol++;
    clearBoard();
    drawFixed();
    drawPiece();
  }
}



//Bắt đầu
function startGame() {
  if (isPlaying) return;

  isPlaying = true;

  // Level 3: nếu chưa có ô nguy hiểm nào thì tạo mới
  if (currentLevel === 3 && dangerCount === 0) {
    createDangerCells();
  }

  // Level 2: nếu chưa có hàng băng thì tạo mới
  if (currentLevel === 2 && frozenCleared === 0) {
    var hasFrozen = false;
    for (var i = 0; i < ROWS; i++) {
      if (isFrozen[i]) { hasFrozen = true; break; }
    }
    if (!hasFrozen) createFrozenRows();
  }

  if (nextPiece === null) {
    var nextIndex = Math.floor(Math.random() * pieces.length);
    nextPiece = {
      shape: pieces[nextIndex],
      index: nextIndex
    };
  }

  drawNextPiece();

  clearBoard();
  drawFixed();
  drawPiece();

  gameInterval = setInterval(moveDown, 500);
}




// Dừng lại
function pauseGame() {
  if (!isPlaying) return;
  clearInterval(gameInterval);
  isPlaying = false;
}

// Chơi lại
function restartGame() {
  clearInterval(gameInterval);
  gameInterval = null;
  isPlaying = false;

  score = 0;
  lines = 0;
  updateStats();

  nextPiece = null;
  document.querySelector(".mini-block").innerHTML = "";

  // Xóa hết bàn chơi và reset toàn bộ trạng thái Level 2 & 3
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      fixedBoard[i][j] = 0;
      fixedColors[i][j] = "";
      isDanger[i][j] = false;   // reset ô nguy hiểm
    }
    isFrozen[i] = false;
    frozenHoles[i] = null;
    brokenFrozen[i] = false;
  }
  frozenCleared = 0;
  dangerCount = 0;
  dangerContactSince = null;

  // Khởi tạo cơ chế theo level
  if (currentLevel === 2) {
    createFrozenRows();
  } else if (currentLevel === 3) {
    createDangerCells();
  }

  var index = Math.floor(Math.random() * pieces.length);
  currentPiece = pieces[index];
  currentColor = pieceColors[index];

  pieceRow = 0;
  pieceCol = Math.floor((COLS - currentPiece[0].length) / 2);

  clearBoard();
  drawFixed();
  drawPiece();
}



document.querySelector(".btn-start").onclick = startGame;
document.querySelector(".btn-pause").onclick = pauseGame;
document.querySelector(".btn-restart").onclick = restartGame;


var levelButtons = document.querySelectorAll(".level");


var levelInfo = [
  {
    name: "CƠ BẢN",
    description: "Làm quen với cách di chuyển, xoay và xóa các dòng trong Tetris",
    target: "Xoá 10 Dòng "
  },
  {
    name: "HÀNG ĐÓNG BĂNG",
    description: "Một hàng băng màu xám xuất hiện ở đáy bàn chơi với 1 khe trống. Lấp khe để phá băng — hàng đổi màu. Lấp đầy lần 2 để xóa hàng băng. ",
    target: "Xóa hàng bị đóng băng + 5 dòng"
  },
  {
    name: "VÙNG NGUY HIỂM",
    description: "2 ô đỏ nguy hiểm ẩn ở đáy bàn chơi. Nếu khối của bạn đè xuống đúng vào ô đỏ — thua ngay! Hãy điều hướng thật cẩn thận.",
    target: "Xóa 8 dòng\n(không đè ô đỏ)"
  },
  {
    name: "ĐẢO CHIỀU ĐIỀU KHIỂN",
    description: "Sau mỗi 5 khối được cố định, phím trái và phải sẽ bị đảo trong 3 giây. Hãy điều chỉnh thao tác để đặt khối đúng vị trí."
  },
  {
    name: "BOM PHÁ HỦY",
    description: "Bom xuất hiện ngẫu nhiên trong lượt chơi. Khi kích hoạt, bom phá các ô trong vùng 3×3 xung quanh."
  },
  {
    name: "SÀN DÂNG LÊN",
    description: "Sau mỗi 8 khối được cố định, sàn sẽ dâng lên khiến không gian chơi ít dần."
  },
  {
    name: "BÀN CHƠI THU HẸP",
    description: "Sau mỗi 4 dòng được xóa, bàn chơi sẽ hẹp lại. Hãy đặt khối chính xác và xóa đủ 6 dòng trước khi hết chỗ."
  },
  {
    name: "ĐẢO CHIỀU KHỐI",
    description: "Khi chạm đáy hoặc khối đã cố định, khối đang rơi xoay ngược 180 độ trước khi khóa vị trí. Hãy dự đoán hình dạng mới để xếp khối chính xác."
  }
];

levelButtons.forEach(function(button, index) {
  button.onclick = function() {
    currentLevel = index + 1;
    document.getElementById("level-display").textContent = currentLevel;


    document.querySelector(".level-label").textContent = "MỨC ĐỘ " + currentLevel;

    document.querySelector(".level-info h3").textContent = levelInfo[index].name;

    document.querySelector(".level-info p").textContent = levelInfo[index].description;

    // Thêm dòng này để đổi mục tiêu
    document.querySelector(".target-text").textContent = levelInfo[index].target;

    levelButtons.forEach(function(btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    restartGame();

  };
});


// Xử lý các phím điều khiển trong lúc chơi
document.onkeydown = function (e) {
  if (!isPlaying) return;

  // Chặn hành vi mặc định của mũi tên và space để không bị cuộn trang
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key) || e.code === "Space") {
    e.preventDefault();
  }

  if (e.key === "ArrowLeft") {
    moveLeft();
  } else if (e.key === "ArrowRight") {
    moveRight();
  } else if (e.key === "ArrowDown") {
    moveDown();
  } else if (e.key === "ArrowUp") {
    rotatePiece();
  } else if (e.code === "Space") {
    while (canMove(pieceRow + 1, pieceCol)) {
      pieceRow++;
    }
    moveDown();
  }
};

clearBoard();
drawFixed();
drawPiece();
