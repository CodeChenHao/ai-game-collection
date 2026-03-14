const LEVELS = [
    [
        "  ##### ",
        "###   # ",
        "#   $ # ",
        "#  .  # ",
        "#  @  # ",
        "####### "
    ],
    [
        "  ##### ",
        "###   # ",
        "# $ $ # ",
        "# . . # ",
        "#  @  # ",
        "####### "
    ],
    [
        " ####### ",
        " #     # ",
        " # .$. # ",
        "## $@$ ##",
        "#  .$.  #",
        "#       #",
        "#########"
    ],
    [
        " ####### ",
        " #  @  # ",
        " # $$$ # ",
        "##.....##",
        "#  $ $  #",
        "#       #",
        "#########"
    ],
    [
        "########",
        "#      #",
        "# .$$. #",
        "# .$@$.#",
        "# .$$. #",
        "#      #",
        "########"
    ]
];

const SYMBOLS = {
    ' ': { type: 'empty', char: '' },
    '#': { type: 'wall', char: '' },
    '@': { type: 'player', char: '🧑' },
    '$': { type: 'box', char: '📦' },
    '.': { type: 'target', char: '🎯' },
    '+': { type: 'player_on_target', char: '🧑' },
    '*': { type: 'box_on_target', char: '✅' }
};

let currentLevel = 0;
let gameState = [];
let playerPos = { x: 0, y: 0 };
let steps = 0;
let history = [];
let bestSteps = {};

const gameBoard = document.getElementById('gameBoard');
const levelElement = document.getElementById('level');
const stepsElement = document.getElementById('steps');
const bestStepsElement = document.getElementById('bestSteps');
const levelCompleteElement = document.getElementById('levelComplete');
const gameCompleteElement = document.getElementById('gameComplete');
const levelStepsElement = document.getElementById('levelSteps');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');

function initGame() {
    const saved = localStorage.getItem('sokobanBestSteps');
    if (saved) {
        bestSteps = JSON.parse(saved);
    }
    loadLevel(0);
}

function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    steps = 0;
    history = [];
    
    levelElement.textContent = currentLevel + 1;
    stepsElement.textContent = steps;
    bestStepsElement.textContent = bestSteps[currentLevel] || '-';
    undoBtn.disabled = true;
    
    const levelData = LEVELS[currentLevel];
    gameState = [];
    
    for (let y = 0; y < levelData.length; y++) {
        const row = [];
        for (let x = 0; x < levelData[y].length; x++) {
            const char = levelData[y][x];
            row.push(char);
            
            if (char === '@' || char === '+') {
                playerPos = { x, y };
            }
        }
        gameState.push(row);
    }
    
    renderBoard();
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.gridTemplateColumns = `repeat(${gameState[0].length}, 1fr)`;
    
    for (let y = 0; y < gameState.length; y++) {
        for (let x = 0; x < gameState[y].length; x++) {
            const cell = document.createElement('div');
            const char = gameState[y][x];
            const symbol = SYMBOLS[char] || SYMBOLS[' '];
            
            cell.className = `cell ${symbol.type}`;
            cell.textContent = symbol.char;
            
            grid.appendChild(cell);
        }
    }
    
    gameBoard.appendChild(grid);
}

function move(dx, dy) {
    if (levelCompleteElement.classList.contains('show') || 
        gameCompleteElement.classList.contains('show')) {
        return;
    }
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (!isValidPosition(newX, newY)) return;
    
    const targetChar = gameState[newY][newX];
    
    if (targetChar === '#' || targetChar === '*') return;
    
    saveState();
    
    if (targetChar === '$') {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;
        
        if (!isValidPosition(boxNewX, boxNewY)) return;
        
        const boxTargetChar = gameState[boxNewY][boxNewX];
        
        if (boxTargetChar === '#' || boxTargetChar === '$' || boxTargetChar === '*') return;
        
        gameState[boxNewY][boxNewX] = boxTargetChar === '.' ? '*' : '$';
        gameState[newY][newX] = targetChar === '$' ? ' ' : '.';
    }
    
    const currentChar = gameState[playerPos.y][playerPos.x];
    gameState[playerPos.y][playerPos.x] = currentChar === '@' ? ' ' : '.';
    
    const newPlayerChar = gameState[newY][newX];
    gameState[newY][newX] = newPlayerChar === '.' ? '@' : '@';
    
    playerPos = { x: newX, y: newY };
    steps++;
    
    stepsElement.textContent = steps;
    undoBtn.disabled = false;
    
    renderBoard();
    checkWin();
}

function isValidPosition(x, y) {
    return y >= 0 && y < gameState.length && x >= 0 && x < gameState[y].length;
}

function saveState() {
    const stateCopy = gameState.map(row => [...row]);
    history.push({
        state: stateCopy,
        playerPos: { ...playerPos },
        steps: steps
    });
    
    if (history.length > 100) {
        history.shift();
    }
}

function undo() {
    if (history.length === 0) return;
    
    const lastState = history.pop();
    gameState = lastState.state;
    playerPos = lastState.playerPos;
    steps = lastState.steps;
    
    stepsElement.textContent = steps;
    undoBtn.disabled = history.length === 0;
    
    renderBoard();
}

function checkWin() {
    let hasBox = false;
    let hasTarget = false;
    
    for (let row of gameState) {
        for (let char of row) {
            if (char === '$') hasBox = true;
            if (char === '.' || char === '+') hasTarget = true;
        }
    }
    
    if (!hasBox && !hasTarget) {
        if (!bestSteps[currentLevel] || steps < bestSteps[currentLevel]) {
            bestSteps[currentLevel] = steps;
            localStorage.setItem('sokobanBestSteps', JSON.stringify(bestSteps));
            bestStepsElement.textContent = steps;
        }
        
        levelStepsElement.textContent = steps;
        
        if (currentLevel < LEVELS.length - 1) {
            levelCompleteElement.classList.add('show');
        } else {
            gameCompleteElement.classList.add('show');
        }
    }
}

function nextLevel() {
    levelCompleteElement.classList.remove('show');
    loadLevel(currentLevel + 1);
}

function resetLevel() {
    loadLevel(currentLevel);
}

function restartGame() {
    gameCompleteElement.classList.remove('show');
    loadLevel(0);
}

function goHome() {
    window.location.href = '../../home/home.html';
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            move(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            move(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            move(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            move(1, 0);
            break;
    }
});

undoBtn.addEventListener('click', undo);
resetBtn.addEventListener('click', resetLevel);
restartBtn.addEventListener('click', restartGame);

initGame();
