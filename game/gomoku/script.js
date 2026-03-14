const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 15;
const CELL_SIZE = 40;
const PADDING = 0;

let board = [];
let currentPlayer = 1; // 1: 黑棋, 2: 白棋
let gameOver = false;
let moveHistory = [];
let lastMove = null;

const restartBtn = document.getElementById('restartBtn');
const undoBtn = document.getElementById('undoBtn');
const currentPlayerElement = document.getElementById('currentPlayer');
const gameStatusElement = document.getElementById('gameStatus');

function initGame() {
    board = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            board[i][j] = 0;
        }
    }
    
    currentPlayer = 1;
    gameOver = false;
    moveHistory = [];
    lastMove = null;
    
    currentPlayerElement.textContent = '黑棋';
    gameStatusElement.style.display = 'none';
    undoBtn.disabled = true;
    
    drawBoard();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < GRID_SIZE; i++) {
        const pos = PADDING + i * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.beginPath();
        ctx.moveTo(pos, PADDING + CELL_SIZE / 2);
        ctx.lineTo(pos, canvas.height - PADDING - CELL_SIZE / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(PADDING + CELL_SIZE / 2, pos);
        ctx.lineTo(canvas.width - PADDING - CELL_SIZE / 2, pos);
        ctx.stroke();
    }
    
    const starPoints = [
        [3, 3], [3, 11], [11, 3], [11, 11], [7, 7],
        [3, 7], [7, 3], [7, 11], [11, 7]
    ];
    
    ctx.fillStyle = '#000';
    starPoints.forEach(([x, y]) => {
        const px = PADDING + x * CELL_SIZE + CELL_SIZE / 2;
        const py = PADDING + y * CELL_SIZE + CELL_SIZE / 2;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] !== 0) {
                drawPiece(i, j, board[i][j]);
            }
        }
    }
    
    if (lastMove) {
        const x = PADDING + lastMove.x * CELL_SIZE + CELL_SIZE / 2;
        const y = PADDING + lastMove.y * CELL_SIZE + CELL_SIZE / 2;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawPiece(row, col, player) {
    const x = PADDING + col * CELL_SIZE + CELL_SIZE / 2;
    const y = PADDING + row * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 3;
    
    const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
    
    if (player === 1) {
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = player === 1 ? '#000' : '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function getGridPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    const col = Math.round((x - PADDING - CELL_SIZE / 2) / CELL_SIZE);
    const row = Math.round((y - PADDING - CELL_SIZE / 2) / CELL_SIZE);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        return { row, col };
    }
    
    return null;
}

function makeMove(row, col) {
    if (gameOver || board[row][col] !== 0) {
        return false;
    }
    
    board[row][col] = currentPlayer;
    moveHistory.push({ row, col, player: currentPlayer });
    lastMove = { x: col, y: row };
    
    undoBtn.disabled = false;
    
    if (checkWin(row, col)) {
        gameOver = true;
        const winner = currentPlayer === 1 ? '黑棋' : '白棋';
        gameStatusElement.textContent = `${winner}获胜！`;
        gameStatusElement.style.display = 'block';
        drawBoard();
        return true;
    }
    
    if (moveHistory.length === GRID_SIZE * GRID_SIZE) {
        gameOver = true;
        gameStatusElement.textContent = '平局！';
        gameStatusElement.style.display = 'block';
        drawBoard();
        return true;
    }
    
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentPlayerElement.textContent = currentPlayer === 1 ? '黑棋' : '白棋';
    
    drawBoard();
    return true;
}

function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]],   // 横向
        [[1, 0], [-1, 0]],   // 纵向
        [[1, 1], [-1, -1]], // 斜向
        [[1, -1], [-1, 1]]  // 反斜向
    ];
    
    const player = board[row][col];
    
    for (const [dir1, dir2] of directions) {
        let count = 1;
        
        let r = row + dir1[0];
        let c = col + dir1[1];
        while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c] === player) {
            count++;
            r += dir1[0];
            c += dir1[1];
        }
        
        r = row + dir2[0];
        c = col + dir2[1];
        while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c] === player) {
            count++;
            r += dir2[0];
            c += dir2[1];
        }
        
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

function undoMove() {
    if (moveHistory.length === 0 || gameOver) {
        return;
    }
    
    const lastMoveData = moveHistory.pop();
    board[lastMoveData.row][lastMoveData.col] = 0;
    
    if (moveHistory.length > 0) {
        const prevMove = moveHistory[moveHistory.length - 1];
        lastMove = { x: prevMove.col, y: prevMove.row };
    } else {
        lastMove = null;
    }
    
    currentPlayer = lastMoveData.player;
    currentPlayerElement.textContent = currentPlayer === 1 ? '黑棋' : '白棋';
    
    if (moveHistory.length === 0) {
        undoBtn.disabled = true;
    }
    
    drawBoard();
}

function restartGame() {
    initGame();
}

function goHome() {
    window.location.href = '../../home/home.html';
}

canvas.addEventListener('click', (e) => {
    if (gameOver) {
        return;
    }
    
    const pos = getGridPosition(e.clientX, e.clientY);
    if (pos) {
        makeMove(pos.row, pos.col);
    }
});

restartBtn.addEventListener('click', restartGame);
undoBtn.addEventListener('click', undoMove);

initGame();
