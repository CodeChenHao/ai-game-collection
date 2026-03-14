const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let columns = [];
let stock = [];
let completed = 0;
let moves = 0;
let score = 500;
let selectedCards = null;
let selectedColumn = -1;
let history = [];
let numSuits = 1;

const tableau = document.getElementById('tableau');
const stockCount = document.getElementById('stockCount');
const scoreElement = document.getElementById('score');
const movesElement = document.getElementById('moves');
const completedElement = document.getElementById('completed');
const completedArea = document.getElementById('completedArea');
const undoBtn = document.getElementById('undoBtn');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');
const winMessage = document.getElementById('winMessage');
const finalScoreElement = document.getElementById('finalScore');
const finalMovesElement = document.getElementById('finalMoves');
const difficultyBtns = document.querySelectorAll('.diff-btn');

function createDeck() {
    const deck = [];
    const suitsToUse = SUITS.slice(0, numSuits);
    const decksNeeded = 8 / numSuits;
    
    for (let d = 0; d < decksNeeded; d++) {
        for (let suit of suitsToUse) {
            for (let value of VALUES) {
                deck.push({ suit, value, faceUp: false });
            }
        }
    }
    
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame(suits = 1) {
    numSuits = suits;
    columns = Array(10).fill(null).map(() => []);
    stock = [];
    completed = 0;
    moves = 0;
    score = 500;
    selectedCards = null;
    selectedColumn = -1;
    history = [];
    
    const deck = shuffle(createDeck());
    
    for (let i = 0; i < 54; i++) {
        columns[i % 10].push(deck[i]);
    }
    
    for (let i = 54; i < deck.length; i++) {
        stock.push(deck[i]);
    }
    
    columns.forEach(col => {
        if (col.length > 0) {
            col[col.length - 1].faceUp = true;
        }
    });
    
    updateDisplay();
    updateCompletedArea();
    undoBtn.disabled = true;
}

function getValueIndex(value) {
    return VALUES.indexOf(value);
}

function canMove(cards) {
    if (cards.length === 0) return false;
    
    for (let i = 0; i < cards.length - 1; i++) {
        if (cards[i].suit !== cards[i + 1].suit) return false;
        if (getValueIndex(cards[i].value) !== getValueIndex(cards[i + 1].value) + 1) return false;
    }
    
    return true;
}

function canPlace(cards, targetColumn) {
    if (targetColumn.length === 0) return true;
    
    const topCard = targetColumn[targetColumn.length - 1];
    const movingCard = cards[0];
    
    return getValueIndex(topCard.value) === getValueIndex(movingCard.value) + 1;
}

function moveCards(fromCol, startIndex, toCol) {
    const cards = columns[fromCol].splice(startIndex);
    
    saveHistory();
    
    columns[toCol].push(...cards);
    
    if (columns[fromCol].length > 0) {
        columns[fromCol][columns[fromCol].length - 1].faceUp = true;
    }
    
    moves++;
    score--;
    
    checkComplete(toCol);
    updateDisplay();
}

function checkComplete(colIndex) {
    const col = columns[colIndex];
    
    if (col.length >= 13) {
        const last13 = col.slice(-13);
        
        if (last13[0].value === 'K' && canMove(last13)) {
            columns[colIndex] = col.slice(0, -13);
            completed++;
            score += 100;
            
            if (columns[colIndex].length > 0) {
                columns[colIndex][columns[colIndex].length - 1].faceUp = true;
            }
            
            updateCompletedArea();
            
            if (completed === 8) {
                showWin();
            }
        }
    }
}

function dealCards() {
    if (stock.length === 0) return;
    
    const hasEmpty = columns.some(col => col.length === 0);
    if (hasEmpty) {
        alert('不能在有空列时发牌！');
        return;
    }
    
    saveHistory();
    
    for (let i = 0; i < 10 && stock.length > 0; i++) {
        const card = stock.pop();
        card.faceUp = true;
        columns[i].push(card);
        checkComplete(i);
    }
    
    moves++;
    updateDisplay();
}

function saveHistory() {
    history.push({
        columns: columns.map(col => col.map(card => ({ ...card }))),
        stock: stock.map(card => ({ ...card })),
        completed,
        moves,
        score
    });
    
    if (history.length > 50) {
        history.shift();
    }
    
    undoBtn.disabled = false;
}

function undo() {
    if (history.length === 0) return;
    
    const state = history.pop();
    columns = state.columns;
    stock = state.stock;
    completed = state.completed;
    moves = state.moves;
    score = state.score;
    
    updateDisplay();
    updateCompletedArea();
    
    undoBtn.disabled = history.length === 0;
}

function showHint() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('hint'));
    
    for (let fromCol = 0; fromCol < 10; fromCol++) {
        const col = columns[fromCol];
        
        for (let startIdx = 0; startIdx < col.length; startIdx++) {
            if (!col[startIdx].faceUp) continue;
            
            const cards = col.slice(startIdx);
            if (!canMove(cards)) continue;
            
            for (let toCol = 0; toCol < 10; toCol++) {
                if (toCol === fromCol) continue;
                
                if (canPlace(cards, columns[toCol])) {
                    const cardElement = document.querySelector(`[data-column="${fromCol}"][data-index="${startIdx}"]`);
                    if (cardElement) {
                        cardElement.classList.add('hint');
                        setTimeout(() => cardElement.classList.remove('hint'), 2000);
                    }
                    return;
                }
            }
        }
    }
}

function updateDisplay() {
    tableau.innerHTML = '';
    
    columns.forEach((col, colIndex) => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.column = colIndex;
        
        col.forEach((card, cardIndex) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = `card ${card.faceUp ? 'face-up' : 'back'}`;
            cardDiv.dataset.column = colIndex;
            cardDiv.dataset.index = cardIndex;
            cardDiv.style.top = `${cardIndex * 20}px`;
            
            if (card.faceUp) {
                const suitClass = card.suit === '♥' || card.suit === '♦' ? 'suit-hearts' : 'suit-spades';
                cardDiv.innerHTML = `
                    <div class="card-value ${suitClass}">${card.value}${card.suit}</div>
                    <div class="card-center ${suitClass}">${card.suit}</div>
                    <div class="card-suit ${suitClass}">${card.value}${card.suit}</div>
                `;
            }
            
            cardDiv.addEventListener('click', () => handleCardClick(colIndex, cardIndex));
            columnDiv.appendChild(cardDiv);
        });
        
        columnDiv.addEventListener('click', (e) => {
            if (e.target === columnDiv && selectedCards) {
                moveCards(selectedColumn, columns[selectedColumn].length - selectedCards.length, colIndex);
                clearSelection();
            }
        });
        
        tableau.appendChild(columnDiv);
    });
    
    stockCount.textContent = Math.ceil(stock.length / 10);
    scoreElement.textContent = score;
    movesElement.textContent = moves;
    completedElement.textContent = `${completed}/8`;
}

function updateCompletedArea() {
    completedArea.innerHTML = '';
    
    for (let i = 0; i < completed; i++) {
        const stack = document.createElement('div');
        stack.className = 'completed-stack';
        stack.textContent = '♠';
        completedArea.appendChild(stack);
    }
}

function handleCardClick(colIndex, cardIndex) {
    const col = columns[colIndex];
    const card = col[cardIndex];
    
    if (!card.faceUp) return;
    
    const cards = col.slice(cardIndex);
    
    if (!canMove(cards)) return;
    
    if (selectedCards) {
        if (canPlace(selectedCards, col)) {
            moveCards(selectedColumn, columns[selectedColumn].length - selectedCards.length, colIndex);
        }
        clearSelection();
    } else {
        selectedCards = cards;
        selectedColumn = colIndex;
        
        document.querySelectorAll('.card.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        for (let i = cardIndex; i < col.length; i++) {
            const cardEl = document.querySelector(`[data-column="${colIndex}"][data-index="${i}"]`);
            if (cardEl) {
                cardEl.classList.add('selected');
            }
        }
    }
}

function clearSelection() {
    selectedCards = null;
    selectedColumn = -1;
    
    document.querySelectorAll('.card.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

function showWin() {
    finalScoreElement.textContent = score;
    finalMovesElement.textContent = moves;
    winMessage.classList.add('show');
}

function restartGame() {
    winMessage.classList.remove('show');
    const activeBtn = document.querySelector('.diff-btn.active');
    const suits = activeBtn ? parseInt(activeBtn.dataset.suits) : 1;
    initGame(suits);
}

function goHome() {
    window.location.href = '../../home/home.html';
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        initGame(parseInt(btn.dataset.suits));
    });
});

undoBtn.addEventListener('click', undo);
hintBtn.addEventListener('click', showHint);
restartBtn.addEventListener('click', restartGame);

initGame(1);
