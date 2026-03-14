const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    null,
    '#00f0f0', // I - 青色
    '#0000f0', // J - 蓝色
    '#f0a000', // L - 橙色
    '#f0f000', // O - 黄色
    '#00f000', // S - 绿色
    '#a000f0', // T - 紫色
    '#f00000'  // Z - 红色
];

const SHAPES = [
    [],
    [[1,1,1,1]], // I
    [[2,0,0],[2,2,2]], // J
    [[0,0,3],[3,3,3]], // L
    [[4,4],[4,4]], // O
    [[0,5,5],[5,5,0]], // S
    [[0,6,0],[6,6,6]], // T
    [[7,7,0],[0,7,7]]  // Z
];

let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;
let dropInterval = 1000;

highScoreElement.textContent = highScore;

function createBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }
}

function createPiece(type) {
    const shape = SHAPES[type].map(row => [...row]);
    return {
        shape: shape,
        type: type,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

function randomPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    return createPiece(type);
}

function drawBlock(context, x, y, color, size = BLOCK_SIZE) {
    context.fillStyle = color;
    context.fillRect(x * size, y * size, size, size);
    
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * size, y * size, size, size / 4);
    context.fillRect(x * size, y * size, size / 4, size);
    
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * size, y * size + size * 3/4, size, size / 4);
    context.fillRect(x * size + size * 3/4, y * size, size / 4, size);
    
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.strokeRect(x * size, y * size, size, size);
}

function drawBoard() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                drawBlock(ctx, c, r, COLORS[board[r][c]]);
            }
        }
    }
    
    if (currentPiece) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c] !== 0) {
                    drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, COLORS[currentPiece.type]);
                }
            }
        }
    }
}

function drawNextPiece() {
    nextCtx.fillStyle = '#0a0a0a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const blockSize = 25;
        const offsetX = (nextCanvas.width / blockSize - nextPiece.shape[0].length) / 2;
        const offsetY = (nextCanvas.height / blockSize - nextPiece.shape.length) / 2;
        
        for (let r = 0; r < nextPiece.shape.length; r++) {
            for (let c = 0; c < nextPiece.shape[r].length; c++) {
                if (nextPiece.shape[r][c] !== 0) {
                    const x = offsetX + c;
                    const y = offsetY + r;
                    
                    nextCtx.fillStyle = COLORS[nextPiece.type];
                    nextCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                    
                    nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    nextCtx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize / 4);
                    
                    nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    nextCtx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
                }
            }
        }
    }
}

function collision(piece, offsetX = 0, offsetY = 0) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] !== 0) {
                const newX = piece.x + c + offsetX;
                const newY = piece.y + r + offsetY;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] !== 0) {
                const boardY = currentPiece.y + r;
                if (boardY < 0) {
                    endGame();
                    return;
                }
                board[boardY][currentPiece.x + c] = currentPiece.type;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let r = ROWS - 1; r >= 0; r--) {
        let isFullLine = true;
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 0) {
                isFullLine = false;
                break;
            }
        }
        
        if (isFullLine) {
            board.splice(r, 1);
            board.unshift(new Array(COLS).fill(0));
            linesCleared++;
            r++;
        }
    }
    
    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        lines += linesCleared;
        
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
        
        updateScore();
    }
}

function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetrisHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function rotate(piece) {
    const newShape = [];
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    
    for (let c = 0; c < cols; c++) {
        newShape[c] = [];
        for (let r = rows - 1; r >= 0; r--) {
            newShape[c][rows - 1 - r] = piece.shape[r][c];
        }
    }
    
    return newShape;
}

function moveLeft() {
    if (!collision(currentPiece, -1, 0)) {
        currentPiece.x--;
    }
}

function moveRight() {
    if (!collision(currentPiece, 1, 0)) {
        currentPiece.x++;
    }
}

function moveDown() {
    if (!collision(currentPiece, 0, 1)) {
        currentPiece.y++;
        return true;
    }
    return false;
}

function hardDrop() {
    while (!collision(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 2;
    }
    updateScore();
    lockPiece();
}

function rotatePiece() {
    const rotated = rotate(currentPiece);
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (collision(currentPiece, 0, 0)) {
        if (!collision(currentPiece, -1, 0)) {
            currentPiece.x--;
        } else if (!collision(currentPiece, 1, 0)) {
            currentPiece.x++;
        } else if (!collision(currentPiece, -2, 0)) {
            currentPiece.x -= 2;
        } else if (!collision(currentPiece, 2, 0)) {
            currentPiece.x += 2;
        } else {
            currentPiece.shape = originalShape;
        }
    }
}

function lockPiece() {
    merge();
    clearLines();
    
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece();
    
    if (collision(currentPiece, 0, 0)) {
        endGame();
    }
}

function drop() {
    if (!moveDown()) {
        lockPiece();
    }
    drawBoard();
}

function endGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    
    startBtn.disabled = false;
    startBtn.textContent = '开始游戏';
    pauseBtn.disabled = true;
    restartBtn.disabled = false;
}

function startGame() {
    if (isGameRunning) return;
    
    createBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    updateScore();
    
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    
    gameOverElement.style.display = 'none';
    isGameRunning = true;
    isPaused = false;
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = '暂停';
    restartBtn.disabled = false;
    
    drawBoard();
    drawNextPiece();
    
    gameLoop = setInterval(drop, dropInterval);
}

function togglePause() {
    if (!isGameRunning) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameLoop);
        pauseBtn.textContent = '继续';
    } else {
        gameLoop = setInterval(drop, dropInterval);
        pauseBtn.textContent = '暂停';
    }
}

function restartGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    startGame();
}

function goHome() {
    window.location.href = '../../home/home.html';
}

document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isPaused) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            moveLeft();
            drawBoard();
            e.preventDefault();
            break;
        case 'ArrowRight':
            moveRight();
            drawBoard();
            e.preventDefault();
            break;
        case 'ArrowDown':
            moveDown();
            score += 1;
            updateScore();
            drawBoard();
            e.preventDefault();
            break;
        case 'ArrowUp':
            rotatePiece();
            drawBoard();
            e.preventDefault();
            break;
        case ' ':
            hardDrop();
            drawBoard();
            e.preventDefault();
            break;
    }
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

createBoard();
drawBoard();
