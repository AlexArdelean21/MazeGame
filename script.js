const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');
const modal = document.getElementById('congratulationsModal');
const finalTimeDisplay = document.getElementById('finalTime');
const nextLevelButton = document.getElementById('nextLevelButton');
const exitButton = document.getElementById('exitButton');

let timer;
let timeElapsed = 0;
let level = 1;
let isGameActive = false;

// Player settings
const player = {
    x: 40,
    y: 40,
    size: 40,
};

// Finish line position
const finishLine = {
    x: 520,
    y: 40,
    size: 40,
};

let maze;

// Set the canvas size
canvas.width = 600;
canvas.height = 600;

// Function to generate a random maze using DFS
function generateMazeDFS(rows, cols) {
    const maze = Array(rows).fill().map(() => Array(cols).fill(1));
    const stack = [];
    const directions = [
        [0, -1], // Up
        [0, 1],  // Down
        [-1, 0], // Left
        [1, 0],  // Right
    ];

    let currentRow = 1;
    let currentCol = 1;
    maze[currentRow][currentCol] = 0;
    stack.push([currentRow, currentCol]);

    while (stack.length > 0) {
        const [row, col] = stack[stack.length - 1];
        const neighbors = [];

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow * 2;
            const newCol = col + dCol * 2;
            if (newRow > 0 && newRow < rows - 1 && newCol > 0 && newCol < cols - 1 && maze[newRow][newCol] === 1) {
                neighbors.push([newRow, newCol, dRow, dCol]);
            }
        }

        if (neighbors.length > 0) {
            const [newRow, newCol, dRow, dCol] = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[newRow - dRow][newCol - dCol] = 0;
            maze[newRow][newCol] = 0;
            stack.push([newRow, newCol]);
        } else {
            stack.pop();
        }
    }

    return maze;
}

// Function to draw the maze
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 1) {
                ctx.fillStyle = 'black';
                ctx.fillRect(col * player.size, row * player.size, player.size, player.size);
            }
        }
    }
    
    // Draw the finish line
    ctx.fillStyle = 'green';
    ctx.fillRect(finishLine.x, finishLine.y, finishLine.size, finishLine.size);

    // Draw the player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function showCongratulations() {
    clearInterval(timer);
    finalTimeDisplay.textContent = timeElapsed;
    modal.style.display = 'flex';
}

function startGame() {
    if (!isGameActive) {
        timeElapsed = 0;
        level = 1;
        isGameActive = true;
        timerDisplay.textContent = timeElapsed;
        levelDisplay.textContent = level;
        player.x = 40;
        player.y = 40;
        maze = generateMazeDFS(15, 15);
        drawMaze();
        startTimer();
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = timeElapsed;
    }, 1000);
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (canMove(newX, newY)) {
        player.x = newX;
        player.y = newY;
    }

    if (player.x === finishLine.x && player.y === finishLine.y) {
        showCongratulations();
    }
}

function canMove(newX, newY) {
    const row = Math.floor(newY / player.size);
    const col = Math.floor(newX / player.size);
    return maze[row] && maze[row][col] === 0;
}

window.addEventListener('keydown', (event) => {
    if (isGameActive) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                movePlayer(0, -player.size);
                break;
            case 'ArrowDown':
                event.preventDefault();
                movePlayer(0, player.size);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                movePlayer(-player.size, 0);
                break;
            case 'ArrowRight':
                event.preventDefault();
                movePlayer(player.size, 0);
                break;
        }
        drawMaze();
    }
});

startButton.addEventListener('click', startGame);

exitButton.addEventListener('click', () => {
    window.close();
});

nextLevelButton.addEventListener('click', () => {
    modal.style.display = 'none';
    level++;
    maze = generateMazeDFS(15, 15);
    drawMaze();
    startTimer();
});

drawMaze();
