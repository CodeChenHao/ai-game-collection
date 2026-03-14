const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let grid = [];
let score = 0;
let highScore = localStorage.getItem('2048HighScore') || 0;
let gameOver = false;

highScoreElement.textContent = highScore;

function initGame() {
    grid = [];
    for (let i = 0; i < 4; i++) {
        grid[i] = [];
        for (let j = 0; j < 4; j++) {
            grid[i][j] = 0;
        }
    }
    
    score = 0;
    gameOver = false;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    
    addRandomTile();
    addRandomTile();
    renderBoard();
}

function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        return randomCell;
    }
    
    return null;
}

function renderBoard(newTile = null, mergedTiles = []) {
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            
            if (grid[i][j] !== 0) {
                const value = grid[i][j];
                tile.textContent = value;
                
                if (value <= 2048) {
                    tile.classList.add(`tile-${value}`);
                } else {
                    tile.classList.add('tile-super');
                }
                
                if (newTile && newTile.row === i && newTile.col === j) {
                    tile.classList.add('tile-new');
                }
                
                if (mergedTiles.some(t => t.row === i && t.col === j)) {
                    tile.classList.add('tile-merged');
                }
            }
            
            gameBoard.appendChild(tile);
        }
    }
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    let merged = [];
    
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
            merged.push(i);
        }
    }
    
    arr = arr.filter(val => val !== 0);
    
    while (arr.length < 4) {
        arr.push(0);
    }
    
    return { result: arr, merged };
}

function moveLeft() {
    let moved = false;
    let allMerged = [];
    
    for (let i = 0; i < 4; i++) {
        const original = [...grid[i]];
        const { result, merged } = slide(grid[i]);
        grid[i] = result;
        
        if (original.join(',') !== result.join(',')) {
            moved = true;
        }
        
        merged.forEach(col => allMerged.push({ row: i, col: col }));
    }
    
    return { moved, mergedTiles: allMerged };
}

function moveRight() {
    let moved = false;
    let allMerged = [];
    
    for (let i = 0; i < 4; i++) {
        const original = [...grid[i]];
        const reversed = [...grid[i]].reverse();
        const { result, merged } = slide(reversed);
        grid[i] = result.reverse();
        
        if (original.join(',') !== grid[i].join(',')) {
            moved = true;
        }
        
        merged.forEach(col => allMerged.push({ row: i, col: 3 - col }));
    }
    
    return { moved, mergedTiles: allMerged };
}

function moveUp() {
    let moved = false;
    let allMerged = [];
    
    for (let j = 0; j < 4; j++) {
        const column = [];
        for (let i = 0; i < 4; i++) {
            column.push(grid[i][j]);
        }
        
        const original = [...column];
        const { result, merged } = slide(column);
        
        for (let i = 0; i < 4; i++) {
            grid[i][j] = result[i];
        }
        
        if (original.join(',') !== result.join(',')) {
            moved = true;
        }
        
        merged.forEach(row => allMerged.push({ row, col: j }));
    }
    
    return { moved, mergedTiles: allMerged };
}

function moveDown() {
    let moved = false;
    let allMerged = [];
    
    for (let j = 0; j < 4; j++) {
        const column = [];
        for (let i = 0; i < 4; i++) {
            column.push(grid[i][j]);
        }
        
        const original = [...column];
        const reversed = column.reverse();
        const { result, merged } = slide(reversed);
        const finalColumn = result.reverse();
        
        for (let i = 0; i < 4; i++) {
            grid[i][j] = finalColumn[i];
        }
        
        if (original.join(',') !== finalColumn.join(',')) {
            moved = true;
        }
        
        merged.forEach(row => allMerged.push({ row: 3 - row, col: j }));
    }
    
    return { moved, mergedTiles: allMerged };
}

function checkGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] === grid[i][j + 1]) {
                return false;
            }
        }
    }
    
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 3; i++) {
            if (grid[i][j] === grid[i + 1][j]) {
                return false;
            }
        }
    }
    
    return true;
}

function handleMove(direction) {
    if (gameOver) return;
    
    let result;
    
    switch (direction) {
        case 'left':
            result = moveLeft();
            break;
        case 'right':
            result = moveRight();
            break;
        case 'up':
            result = moveUp();
            break;
        case 'down':
            result = moveDown();
            break;
    }
    
    if (result.moved) {
        scoreElement.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('2048HighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        const newTile = addRandomTile();
        renderBoard(newTile, result.mergedTiles);
        
        if (checkGameOver()) {
            gameOver = true;
            finalScoreElement.textContent = score;
            gameOverElement.style.display = 'flex';
        }
    }
}

function restartGame() {
    initGame();
}

function goHome() {
    window.location.href = '../../home/home.html';
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            handleMove('left');
            e.preventDefault();
            break;
        case 'ArrowRight':
            handleMove('right');
            e.preventDefault();
            break;
        case 'ArrowUp':
            handleMove('up');
            e.preventDefault();
            break;
        case 'ArrowDown':
            handleMove('down');
            e.preventDefault();
            break;
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (gameOver) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                handleMove('right');
            } else {
                handleMove('left');
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                handleMove('down');
            } else {
                handleMove('up');
            }
        }
    }
});

restartBtn.addEventListener('click', restartGame);

initGame();
