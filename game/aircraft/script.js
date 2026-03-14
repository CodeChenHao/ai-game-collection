const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let player;
let bullets = [];
let enemies = [];
let score = 0;
let highScore = localStorage.getItem('aircraftHighScore') || 0;
let gameLoop;
let isGameRunning = false;

highScoreElement.textContent = highScore;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const ENEMY_WIDTH = 35;
const ENEMY_HEIGHT = 35;

function initGame() {
    player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: canvas.height - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: 10
    };
    
    bullets = [];
    enemies = [];
    score = 0;
    scoreElement.textContent = score;
    
    gameOverElement.style.display = 'none';
    startBtn.disabled = false;
    startBtn.textContent = '开始游戏';
    restartBtn.disabled = true;
}

function drawPlayer() {
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#764ba2';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width / 2 + 5, player.y + 15);
    ctx.lineTo(player.x + player.width / 2 - 5, player.y + 15);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    ctx.fillStyle = '#f093fb';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#f5576c';
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    drawBullets();
    drawEnemies();
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= 8;
        return bullet.y > -BULLET_HEIGHT;
    });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
    });
    
    enemies = enemies.filter(enemy => {
        return enemy.y < canvas.height;
    });
}

function spawnEnemy() {
    if (Math.random() < 0.02) {
        enemies.push({
            x: Math.random() * (canvas.width - ENEMY_WIDTH),
            y: -ENEMY_HEIGHT,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            speed: 2 + Math.random() * 2
        });
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + BULLET_WIDTH > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + BULLET_HEIGHT > enemy.y) {
                
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
                scoreElement.textContent = score;
            }
        });
    });
    
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            endGame();
        }
    });
}

function update() {
    updateBullets();
    updateEnemies();
    spawnEnemy();
    checkCollisions();
}

function endGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('aircraftHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    startBtn.disabled = false;
    startBtn.textContent = '开始游戏';
    restartBtn.disabled = false;
}

document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.x -= player.speed;
        if (player.x < 0) player.x = 0;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        player.x += player.speed;
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
    } else if (e.key === ' ') {
        bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y
        });
        e.preventDefault();
    }
});

function startGame() {
    if (isGameRunning) return;
    
    initGame();
    isGameRunning = true;
    startBtn.disabled = true;
    restartBtn.disabled = false;
    
    draw();
    gameLoop = setInterval(() => {
        update();
        draw();
    }, 16);
}

function restartGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    startGame();
}

function goHome() {
    window.location.href = '../../home/home.html';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

initGame();
draw();
