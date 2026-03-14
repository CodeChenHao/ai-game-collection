const PATTERNS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒'];
const MAX_SLOTS = 7;
const TILES_PER_PATTERN = 6;

const gameBoard = document.getElementById('gameBoard');
const slotsContainer = document.getElementById('slots');
const remainingElement = document.getElementById('remaining');
const clearedElement = document.getElementById('cleared');
const gameOverElement = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartBtn = document.getElementById('restartBtn');

let tiles = [];
let slots = [];
let cleared = 0;
let gameOver = false;

function initGame() {
    tiles = [];
    slots = [];
    cleared = 0;
    gameOver = false;
    
    gameOverElement.classList.remove('show', 'win', 'lose');
    
    const allPatterns = [];
    PATTERNS.forEach(pattern => {
        for (let i = 0; i < TILES_PER_PATTERN; i++) {
            allPatterns.push(pattern);
        }
    });
    
    shuffle(allPatterns);
    
    tiles = allPatterns.map((pattern, index) => ({
        id: index,
        pattern: pattern,
        removed: false
    }));
    
    renderBoard();
    renderSlots();
    updateInfo();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    tiles.forEach((tile) => {
        if (tile.removed) return;
        
        const tileDiv = document.createElement('div');
        tileDiv.className = 'tile';
        tileDiv.textContent = tile.pattern;
        tileDiv.dataset.id = tile.id;
        
        tileDiv.addEventListener('click', () => handleTileClick(tile.id));
        
        gameBoard.appendChild(tileDiv);
    });
}

function handleTileClick(tileId) {
    if (gameOver) return;
    
    if (slots.length >= MAX_SLOTS) {
        return;
    }
    
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.removed) return;
    
    tile.removed = true;
    slots.push(tile.pattern);
    
    renderBoard();
    renderSlots();
    
    setTimeout(() => {
        checkMatch();
    }, 100);
}

function renderSlots() {
    const slotDivs = slotsContainer.querySelectorAll('.slot');
    
    slotDivs.forEach((slotDiv, index) => {
        if (index < slots.length) {
            slotDiv.textContent = slots[index];
            slotDiv.className = 'slot filled';
        } else {
            slotDiv.textContent = '';
            slotDiv.className = 'slot';
        }
    });
}

function checkMatch() {
    if (gameOver) return;
    
    const patternCounts = {};
    slots.forEach((pattern, index) => {
        if (!patternCounts[pattern]) {
            patternCounts[pattern] = [];
        }
        patternCounts[pattern].push(index);
    });
    
    for (const pattern in patternCounts) {
        if (patternCounts[pattern].length >= 3) {
            const indices = patternCounts[pattern].slice(0, 3);
            
            const slotDivs = slotsContainer.querySelectorAll('.slot');
            indices.forEach(i => {
                slotDivs[i].classList.add('matching');
            });
            
            setTimeout(() => {
                indices.forEach(i => {
                    slotDivs[i].classList.remove('matching');
                    slotDivs[i].classList.add('removing');
                });
                
                setTimeout(() => {
                    const newSlots = slots.filter((_, index) => !indices.includes(index));
                    slots = newSlots;
                    cleared += 3;
                    
                    renderSlots();
                    updateInfo();
                    checkWin();
                }, 400);
            }, 300);
            
            return;
        }
    }
    
    checkLose();
}

function checkWin() {
    const remaining = tiles.filter(t => !t.removed).length;
    
    if (remaining === 0 && slots.length === 0) {
        gameOver = true;
        gameOverTitle.textContent = '🎉 恭喜过关！';
        gameOverMessage.textContent = `成功消除了 ${cleared} 个图案！`;
        gameOverElement.classList.add('show', 'win');
    }
}

function checkLose() {
    if (slots.length >= MAX_SLOTS) {
        gameOver = true;
        gameOverTitle.textContent = '💔 游戏结束！';
        gameOverMessage.textContent = '槽位已满，无法继续！';
        gameOverElement.classList.add('show', 'lose');
    }
}

function updateInfo() {
    const remaining = tiles.filter(t => !t.removed).length;
    remainingElement.textContent = remaining;
    clearedElement.textContent = cleared;
}

function restartGame() {
    initGame();
}

function goHome() {
    window.location.href = '../../home/home.html';
}

restartBtn.addEventListener('click', restartGame);

initGame();
