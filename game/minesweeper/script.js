const gameBoard = document.getElementById('gameBoard');
const minesLeftElement = document.getElementById('minesLeft');
const timerElement = document.getElementById('timer');
const gameOverElement = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartBtn = document.getElementById('restartBtn');
const difficultyBtns = document.querySelectorAll('.diff-btn');

const DIFFICULTIES = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

let board = [];
let rows = 9;
let cols = 9;
let totalMines = 10;
let minesLeft = 10;
let revealed = 0;
let gameOver = false;
let firstClick = true;
let timer = 0;
let timerInterval = null;

function initGame(difficulty = 'easy') {
    const config = DIFFICULTIES[difficulty];
    rows = config.rows;
    cols = config.cols;
    totalMines = config.mines;
    minesLeft = totalMines;
    revealed = 0;
    gameOver = false;
    firstClick = true;
    timer = 0;
    
    clearInterval(timerInterval);
    timerElement.textContent = '000';
    minesLeftElement.textContent = minesLeft;
    gameOverElement.style.display = 'none';
    gameOverElement.className = 'game-over';
    
    board = [];
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = {
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            };
        }
    }
    
    renderBoard();
}

function placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    
    while (minesPlaced < totalMines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        
        if (!board[r][c].mine && !(r === excludeRow && c === excludeCol)) {
            board[r][c].mine = true;
            minesPlaced++;
        }
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].mine) {
                board[r][c].adjacentMines = countAdjacentMines(r, c);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    let count = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const r = row + dr;
            const c = col + dc;
            
            if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].mine) {
                count++;
            }
        }
    }
    
    return count;
}

function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            cell.addEventListener('click', () => handleClick(r, c));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(r, c);
            });
            
            gameBoard.appendChild(cell);
        }
    }
}

function updateCell(row, col) {
    const cell = gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const data = board[row][col];
    
    cell.className = 'cell';
    cell.textContent = '';
    cell.removeAttribute('data-number');
    
    if (data.revealed) {
        cell.classList.add('revealed');
        
        if (data.mine) {
            cell.classList.add('mine');
            cell.textContent = '💣';
        } else if (data.adjacentMines > 0) {
            cell.textContent = data.adjacentMines;
            cell.dataset.number = data.adjacentMines;
        }
    } else if (data.flagged) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
    }
}

function handleClick(row, col) {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) {
        return;
    }
    
    if (firstClick) {
        firstClick = false;
        placeMines(row, col);
        startTimer();
    }
    
    reveal(row, col);
    checkWin();
}

function handleRightClick(row, col) {
    if (gameOver || board[row][col].revealed) {
        return;
    }
    
    const cell = board[row][col];
    cell.flagged = !cell.flagged;
    
    minesLeft += cell.flagged ? -1 : 1;
    minesLeftElement.textContent = minesLeft;
    
    updateCell(row, col);
}

function reveal(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return;
    }
    
    const cell = board[row][col];
    
    if (cell.revealed || cell.flagged) {
        return;
    }
    
    cell.revealed = true;
    revealed++;
    updateCell(row, col);
    
    if (cell.mine) {
        endGame(false, row, col);
        return;
    }
    
    if (cell.adjacentMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr !== 0 || dc !== 0) {
                    reveal(row + dr, col + dc);
                }
            }
        }
    }
}

function checkWin() {
    const totalCells = rows * cols;
    const nonMineCells = totalCells - totalMines;
    
    if (revealed === nonMineCells) {
        endGame(true);
    }
}

function endGame(won, explodedRow = -1, explodedCol = -1) {
    gameOver = true;
    clearInterval(timerInterval);
    
    if (won) {
        gameOverElement.classList.add('win');
        gameOverTitle.textContent = '🎉 恭喜获胜！';
        gameOverMessage.textContent = `用时: ${timer} 秒`;
    } else {
        gameOverElement.classList.add('lose');
        gameOverTitle.textContent = '💥 游戏结束！';
        gameOverMessage.textContent = '踩到地雷了！';
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].mine) {
                    board[r][c].revealed = true;
                    updateCell(r, c);
                }
            }
        }
        
        if (explodedRow >= 0 && explodedCol >= 0) {
            const explodedCell = gameBoard.querySelector(`[data-row="${explodedRow}"][data-col="${explodedCol}"]`);
            explodedCell.classList.add('mine-exploded');
        }
    }
    
    gameOverElement.style.display = 'block';
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerElement.textContent = timer.toString().padStart(3, '0');
    }, 1000);
}

function restartGame() {
    const activeBtn = document.querySelector('.diff-btn.active');
    const difficulty = activeBtn ? activeBtn.dataset.difficulty : 'easy';
    initGame(difficulty);
}

function goHome() {
    window.location.href = '../../home/home.html';
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        initGame(btn.dataset.difficulty);
    });
});

restartBtn.addEventListener('click', restartGame);

initGame('easy');
