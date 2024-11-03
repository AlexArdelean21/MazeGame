const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');
const modal = document.getElementById('congratulationsModal');
const finalTimeDisplay = document.getElementById('finalTime');
const nextLevelButton = document.getElementById('nextLevelButton');
const exitButton = document.getElementById('exitButton');
const autoWinButton = document.createElement('button');

autoWinButton.textContent = 'Auto Win Level';
document.body.appendChild(autoWinButton);

let timer;
let timeElapsed = 0;
let level = 1;
let isGameActive = false;

// Player settings
const player = {
    x: 48,
    y: 48,
    size: 48,
};

// Finish line position
const finishLine = {
    x: 0,
    y: 0,
    size: 48,
};

let maze;

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

    let furthestPoint = { row: currentRow, col: currentCol, distance: 0 };
    const distances = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    distances[currentRow][currentCol] = 0;

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
            distances[newRow][newCol] = distances[row][col] + 1;
            if (distances[newRow][newCol] > furthestPoint.distance) {
                furthestPoint = { row: newRow, col: newCol, distance: distances[newRow][newCol] };
            }
        } else {
            stack.pop();
        }
    }

    // Place the finish line at an accessible position
    let finishPlaced = false;
    while (!finishPlaced) {
        if (!isSurroundedByWalls(maze, furthestPoint.row, furthestPoint.col)) {
            finishLine.x = furthestPoint.col * player.size;
            finishLine.y = furthestPoint.row * player.size;
            finishPlaced = true;
        } else {
            const openCells = getAllOpenCells(maze);
            furthestPoint = openCells[Math.floor(Math.random() * openCells.length)];
        }
    }

    return maze;
}

function isSurroundedByWalls(maze, row, col) {
    const directions = [
        [0, -1], // Up
        [0, 1],  // Down
        [-1, 0], // Left
        [1, 0],  // Right
    ];
    return directions.every(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        return newRow < 0 || newRow >= maze.length || newCol < 0 || newCol >= maze[0].length || maze[newRow][newCol] === 1;
    });
}

function getAllOpenCells(maze) {
    const openCells = [];
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 0) {
                openCells.push({ row, col });
            }
        }
    }
    return openCells;
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
        player.x = player.size;
        player.y = player.size;
        maze = generateMazeDFS(15, 15);
        updateCanvasSize();
        drawMaze();
        startTimer();
    }
}

function startTimer() {
    clearInterval(timer);
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

function updateCanvasSize() {
    const rows = maze.length;
    const cols = maze[0].length;
    canvas.width = cols * player.size;
    canvas.height = rows * player.size;
    finishLine.size = player.size;
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

autoWinButton.addEventListener('click', () => {
    if (isGameActive) {
        showCongratulations();
    }
});

exitButton.addEventListener('click', () => {
    window.close();
});

nextLevelButton.addEventListener('click', () => {
    if (level < 5) {
        modal.style.display = 'none';
        level++;
        timeElapsed = 0;
        timerDisplay.textContent = timeElapsed;
        levelDisplay.textContent = level;
        const newRows = Math.round(15 * Math.pow(1.2, level - 1));
        const newCols = Math.round(15 * Math.pow(1.2, level - 1));
        player.x = player.size;
        player.y = player.size;
        maze = generateMazeDFS(newRows, newCols);
        updateCanvasSize();
        drawMaze();
        startTimer();
    } else {
        alert('You have completed all 5 levels!');
        window.close();
    }
});

drawMaze();
