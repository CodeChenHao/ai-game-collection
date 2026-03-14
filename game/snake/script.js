const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isGameRunning = false;
let changingDirection = false;

// 初始化最高分显示
highScoreElement.textContent = highScore;

// 初始化游戏
function initGame() {
    // 初始化蛇的位置（从中间开始）
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // 初始方向向右
    dx = 1;
    dy = 0;
    
    score = 0;
    scoreElement.textContent = score;
    
    generateFood();
    gameOverElement.style.display = 'none';
}

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // 确保食物不在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格（可选，增加视觉效果）
    ctx.strokeStyle = '#3d4758';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#48bb78';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#48bb78';
        } else {
            // 蛇身
            ctx.fillStyle = '#68d391';
            ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // 绘制蛇眼
        if (index === 0) {
            ctx.fillStyle = '#2d3748';
            ctx.shadowBlur = 0;
            const eyeSize = 3;
            const eyeOffset = 5;
            
            if (dx === 1) { // 向右
                ctx.fillRect((segment.x + 1) * gridSize - eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect((segment.x + 1) * gridSize - eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (dx === -1) { // 向左
                ctx.fillRect(segment.x * gridSize + eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (dy === -1) { // 向上
                ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset - eyeSize, eyeSize, eyeSize);
            } else { // 向下
                ctx.fillRect(segment.x * gridSize + eyeOffset, (segment.y + 1) * gridSize - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, (segment.y + 1) * gridSize - eyeOffset, eyeSize, eyeSize);
            }
        }
    });

    // 绘制食物
    ctx.fillStyle = '#f56565';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f56565';
    ctx.beginPath();
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 2;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// 更新游戏状态
function update() {
    if (!isGameRunning) return;

    changingDirection = false;

    // 计算新的蛇头位置
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }

    // 将新头部添加到蛇身
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }

    draw();
}

// 检查碰撞
function checkCollision(head) {
    // 撞墙检测
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // 撞到自己身体检测
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            return true;
        }
    }

    return false;
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    startBtn.disabled = false;
    startBtn.textContent = '开始游戏';
    restartBtn.disabled = true;
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    // 防止连续快速按键导致的问题
    if (changingDirection) return;
    changingDirection = true;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    // 防止反向移动
    if (e.key === 'ArrowLeft' && !goingRight) {
        dx = -1;
        dy = 0;
    } else if (e.key === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -1;
    } else if (e.key === 'ArrowRight' && !goingLeft) {
        dx = 1;
        dy = 0;
    } else if (e.key === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = 1;
    }
});

// 开始游戏
function startGame() {
    if (isGameRunning) return;
    
    initGame();
    isGameRunning = true;
    changingDirection = false;
    startBtn.disabled = true;
    restartBtn.disabled = false;
    
    draw();
    gameLoop = setInterval(update, 100);
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    startGame();
}

// 返回首页
function goHome() {
    window.location.href = '../../home/home.html';
}

// 按钮事件
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// 初始绘制
initGame();
draw();
