import { drawPlayer, setAnimation } from './characterAnimations.js';

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

const tilesetImage = new Image();
tilesetImage.src = "assets/tileset 1.png";

const backgroundImage = new Image();
backgroundImage.src = "assets/RockWall_Normal.png"; 

autoWinButton.textContent = 'Auto Win Level';
document.body.appendChild(autoWinButton);

let timer;
let timeElapsed = 0;
let level = 1;
let isGameActive = false;

const player = {
    x: 48,
    y: 48,
    size: 64,  // Updated player size (e.g., increase to 64 or more to make it bigger)
    offsetY: 16 // Optional offset to align the feet with the ground
};


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
        [0, -1], [0, 1], [-1, 0], [1, 0],
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

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 1) {
                // Draw wall cells
                const wallTileX = 48; 
                const wallTileY = 0;  
                ctx.drawImage(tilesetImage, wallTileX, wallTileY, 48, 48, col * player.size, row * player.size, player.size, player.size);
            } else {
                // Draw path cells with RockWall_Normal tile
                const pathTileX = 0; 
                const pathTileY = 0; 
                ctx.drawImage(backgroundImage, pathTileX, pathTileY, 48, 48, col * player.size, row * player.size, player.size, player.size);
            }
        }
    }

    // Draw the finish line
    ctx.fillStyle = 'green';
    ctx.fillRect(finishLine.x, finishLine.y, finishLine.size, finishLine.size);

    // Draw the player character
    drawPlayer(ctx, player, performance.now());
}


function showCongratulations() {
    clearInterval(timer);
    modal.style.display = 'flex';
    finalTimeDisplay.textContent = timeElapsed;
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
        setAnimation('idle');
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

function movePlayer(dx, dy, direction) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (canMove(newX, newY)) {
        player.x = newX;
        player.y = newY;
        setAnimation(direction);
    } else {
        setAnimation('idle');
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
                movePlayer(0, -player.size, 'up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                movePlayer(0, player.size, 'down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                movePlayer(-player.size, 0, 'walkLeft');
                break;
            case 'ArrowRight':
                event.preventDefault();
                movePlayer(player.size, 0, 'walkRight');
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
        setAnimation('idle');
        maze = generateMazeDFS(newRows, newCols);
        updateCanvasSize();
        drawMaze();
        startTimer();
    } else {
        alert('You have completed all 5 levels!');
        window.close();
    }
});


tilesetImage.onload = function() {
    backgroundImage.onload = function() {
        drawMaze();
    };
};
