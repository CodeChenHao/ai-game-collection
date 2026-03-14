const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

canvas.width = 400;
canvas.height = 500;

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

let player = { x: 0, y: 0, width: 30, height: 50, vy: 0, jumping: false };
let blocks = [];
let currentBlock = null;
let nextBlock = null;
let score = 0;
let highScore = 0;
let gameOver = false;
let pressing = false;
let pressTime = 0;
let power = 0;
let cameraX = 0;
let jumpDirection = 1;

function init() {
    highScore = localStorage.getItem('jumpHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    resetGame();
}

function resetGame() {
    score = 0;
    gameOver = false;
    cameraX = 0;
    pressing = false;
    power = 0;
    jumpDirection = 1;
    
    scoreElement.textContent = score;
    gameOverElement.classList.remove('show');
    
    blocks = [];
    
    const firstBlock = createBlock(80, 350, 80, 100);
    blocks.push(firstBlock);
    
    player.x = firstBlock.x + firstBlock.width / 2 - player.width / 2;
    player.y = firstBlock.y - player.height;
    player.vy = 0;
    player.jumping = false;
    
    currentBlock = firstBlock;
    nextBlock = createNextBlock();
    blocks.push(nextBlock);
    
    render();
}

function createBlock(x, y, width, height) {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
}

function createNextBlock() {
    const distance = 80 + Math.random() * 120;
    const width = 50 + Math.random() * 60;
    const height = 60 + Math.random() * 40;
    
    const lastBlock = blocks[blocks.length - 1];
    const x = lastBlock.x + distance;
    const y = 350 + (Math.random() - 0.5) * 30;
    
    return createBlock(x, y, width, height);
}

function startPress() {
    if (gameOver || player.jumping) return;
    pressing = true;
    pressTime = Date.now();
}

function endPress() {
    if (!pressing || gameOver) return;
    pressing = false;
    
    const duration = Date.now() - pressTime;
    power = Math.min(duration / 15, 20);
    
    jump();
}

function jump() {
    if (player.jumping) return;
    
    player.jumping = true;
    player.vy = -12;
    
    const jumpDistance = power * 8;
    
    if (nextBlock.x > currentBlock.x) {
        jumpDirection = 1;
        player.targetX = player.x + jumpDistance;
    } else {
        jumpDirection = -1;
        player.targetX = player.x + jumpDistance;
    }
    
    power = 0;
}

function update() {
    if (gameOver) return;
    
    if (pressing) {
        power = Math.min((Date.now() - pressTime) / 15, 20);
    }
    
    if (player.jumping) {
        player.vy += 0.8;
        player.y += player.vy;
        
        const speed = power * 0.8 || 8;
        player.x += jumpDirection * speed;
        
        if (player.y > 500) {
            endGame();
            return;
        }
        
        for (let block of blocks) {
            if (checkLanding(block)) {
                player.jumping = false;
                player.y = block.y - player.height;
                player.vy = 0;
                
                if (block === nextBlock) {
                    const centerX = block.x + block.width / 2;
                    const playerCenterX = player.x + player.width / 2;
                    const distance = Math.abs(playerCenterX - centerX);
                    
                    if (distance < 10) {
                        score += 2;
                    } else {
                        score += 1;
                    }
                    
                    scoreElement.textContent = score;
                    
                    currentBlock = nextBlock;
                    nextBlock = createNextBlock();
                    blocks.push(nextBlock);
                    
                    if (blocks.length > 10) {
                        blocks.shift();
                    }
                    
                    cameraX = currentBlock.x - 80;
                } else if (block !== currentBlock) {
                    endGame();
                    return;
                }
                
                break;
            }
        }
    }
    
    render();
    requestAnimationFrame(update);
}

function checkLanding(block) {
    const playerBottom = player.y + player.height;
    const playerLeft = player.x;
    const playerRight = player.x + player.width;
    
    const blockTop = block.y;
    const blockLeft = block.x;
    const blockRight = block.x + block.width;
    
    return playerBottom >= blockTop && 
           playerBottom <= blockTop + 30 &&
           playerRight > blockLeft && 
           playerLeft < blockRight;
}

function endGame() {
    gameOver = true;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('jumpHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverElement.classList.add('show');
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-cameraX, 0);
    
    for (let block of blocks) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(block.x, block.y + block.height - 10, block.width, 10);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(block.x + 5, block.y + 5, block.width - 10, 10);
    }
    
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = '#555';
    ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, player.height - 10);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    if (pressing && !player.jumping) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        const barWidth = power * 3;
        ctx.fillRect(player.x + player.width / 2 - barWidth / 2, player.y - 20, barWidth, 8);
    }
    
    ctx.restore();
    
    if (pressing && !player.jumping) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('蓄力中...', canvas.width / 2, 30);
    }
}

function restartGame() {
    resetGame();
    update();
}

function goHome() {
    window.location.href = '../../home/home.html';
}

canvas.addEventListener('mousedown', startPress);
canvas.addEventListener('mouseup', endPress);
canvas.addEventListener('mouseleave', () => {
    if (pressing) endPress();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startPress();
});
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    endPress();
});

restartBtn.addEventListener('click', restartGame);

init();
update();
