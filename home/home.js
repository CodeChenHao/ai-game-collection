function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '../login/login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    document.getElementById('userEmail').textContent = user.email;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../login/login.html';
}

function playGame(game) {
    if (game === 'snake') {
        window.location.href = '../game/snake/snake.html';
    } else if (game === 'aircraft') {
        window.location.href = '../game/aircraft/aircraft.html';
    } else if (game === 'gomoku') {
        window.location.href = '../game/gomoku/gomoku.html';
    } else if (game === '2048') {
        window.location.href = '../game/2048/2048.html';
    } else if (game === 'tetris') {
        window.location.href = '../game/tetris/tetris.html';
    } else if (game === 'minesweeper') {
        window.location.href = '../game/minesweeper/minesweeper.html';
    } else if (game === 'spider') {
        window.location.href = '../game/spider/spider.html';
    } else if (game === 'sheep') {
        window.location.href = '../game/sheep/sheep.html';
    } else if (game === 'jump') {
        window.location.href = '../game/jump/jump.html';
    } else if (game === 'sokoban') {
        window.location.href = '../game/sokoban/sokoban.html';
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);
