import { generateMazeDFS } from './maze.js';
import { portalImagesReady } from './portal.js';
import { player, movePlayer, resetPlayerPosition } from './player.js';
import { setAnimation } from './characterAnimations.js';
import { gameLoop, cancelGameLoop } from './gameLoop.js';
import {
    TILE_SIZE,
    INITIAL_MAZE_SIZE,
    MAZE_SIZE_MULTIPLIER,
    MAX_LEVEL,
    TILESET_TILE_SIZE,
    FRAME_RATE
} from './config.js';

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
window.isGameActive = false;

let maze;
let finishLine = {
    x: 0,
    y: 0,
    size: TILE_SIZE,
};

const tilesetImage = new Image();
const backgroundImage = new Image();

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

//  startButton.disabled = true; // Disable start button until assets are loaded

Promise.all([
    loadImage('../assets/tileset 1.png'),
    loadImage('../assets/RockWall_Normal.png')
]).then((images) => {
    tilesetImage.src = images[0].src;
    backgroundImage.src = images[1].src;

    // Check if portal images are ready
    const checkAssetsLoaded = setInterval(() => {
        if (portalImagesReady) {
            clearInterval(checkAssetsLoaded);
            startButton.disabled = false;
        }
    }, 100);
}).catch((error) => {
    console.error('Failed to load images:', error);
});

Promise.all([
    loadImage('assets/tileset 1.png'),
    loadImage('assets/RockWall_Normal.png'),
]).then((images) => {
    tilesetImage.src = images[0].src;
    backgroundImage.src = images[1].src;
}).catch((error) => {
    console.error('Failed to load images:', error);
});

export function drawMaze(ctx, maze, finishLine) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tileSize = TILE_SIZE;
    const mazeRows = maze.length;
    const mazeCols = maze[0].length;

    for (let row = 0; row < mazeRows; row++) {
        const mazeRow = maze[row];
        for (let col = 0; col < mazeCols; col++) {
            const cell = mazeRow[col];
            const x = col * tileSize;
            const y = row * tileSize;
            if (cell === 1) {
                ctx.drawImage(
                    tilesetImage,
                    TILESET_TILE_SIZE,
                    0,
                    TILESET_TILE_SIZE,
                    TILESET_TILE_SIZE,
                    x,
                    y,
                    tileSize,
                    tileSize
                );
            } else {
                ctx.drawImage(
                    backgroundImage,
                    0,
                    0,
                    TILESET_TILE_SIZE,
                    TILESET_TILE_SIZE,
                    x,
                    y,
                    tileSize,
                    tileSize
                );
            }
        }
    }
}

function showCongratulations() {
    clearInterval(timer);
    cancelGameLoop();
    window.isGameActive = false;
    modal.style.display = 'flex';
    finalTimeDisplay.textContent = timeElapsed;
}

function startGame() {
    if (!window.isGameActive) {
        timeElapsed = 0;
        level = 1;
        window.isGameActive = true;
        timerDisplay.textContent = timeElapsed;
        levelDisplay.textContent = level;
        resetPlayerPosition();
        setAnimation('idle');
        const { maze: newMaze, finishPoint } = generateMazeDFS(
            INITIAL_MAZE_SIZE,
            INITIAL_MAZE_SIZE
        );
        maze = newMaze;
        finishLine.x = finishPoint.col * TILE_SIZE;
        finishLine.y = finishPoint.row * TILE_SIZE;
        updateCanvasSize();
        drawMaze(ctx, maze, finishLine);
        startTimer();
        //lastTime = performance.now();
        requestAnimationFrame((currentTime) => {
            gameLoop(currentTime, maze, finishLine, showCongratulations, ctx);
        }); 

    }else if(!portalImagesReady){
        alert('Assets are still loading, please wait.');
    }
}

let startTime;

function startTimer() {
    clearInterval(timer);
    startTime = Date.now();
    timer = setInterval(() => {
        timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.textContent = timeElapsed;
    }, 1000);
}

function updateCanvasSize() {
    const rows = maze.length;
    const cols = maze[0].length;
    canvas.width = cols * TILE_SIZE;
    canvas.height = rows * TILE_SIZE;
    finishLine.size = TILE_SIZE;
}

window.addEventListener('keydown', (event) => {
    if (!window.isGameActive) return;
    const key = event.key.toLowerCase();
    switch (key) {
        case 'arrowup':
        case 'w':
            event.preventDefault();
            movePlayer(0, -TILE_SIZE, maze);
            break;
        case 'arrowdown':
        case 's':
            event.preventDefault();
            movePlayer(0, TILE_SIZE, maze);
            break;
        case 'arrowleft':
        case 'a':
            event.preventDefault();
            movePlayer(-TILE_SIZE, 0, maze);
            break;
        case 'arrowright':
        case 'd':
            event.preventDefault();
            movePlayer(TILE_SIZE, 0, maze);
            break;
    }
});

startButton.addEventListener('click', () => {
    startGame();
});

autoWinButton.addEventListener('click', () => {
    if (window.isGameActive) {
        showCongratulations();
    }
});

exitButton.addEventListener('click', () => {
    window.location.reload();
});

nextLevelButton.addEventListener('click', () => {
    if (level < MAX_LEVEL) {
        modal.style.display = 'none';
        level++;
        timeElapsed = 0;
        timerDisplay.textContent = timeElapsed;
        levelDisplay.textContent = level;
        const newMazeSize = Math.round(
            INITIAL_MAZE_SIZE * Math.pow(MAZE_SIZE_MULTIPLIER, level - 1)
        );
        resetPlayerPosition();
        setAnimation('idle');
        const { maze: newMaze, finishPoint } = generateMazeDFS(newMazeSize, newMazeSize);
        maze = newMaze;
        finishLine.x = finishPoint.col * TILE_SIZE;
        finishLine.y = finishPoint.row * TILE_SIZE;
        updateCanvasSize();
        drawMaze(ctx, maze, finishLine);
        startTimer();
        window.isGameActive = true;
        //lastTime = performance.now();
        //gameLoop(lastTime, maze, finishLine, showCongratulations, ctx);
        requestAnimationFrame((currentTime) => {
            gameLoop(currentTime, maze, finishLine, showCongratulations, ctx);
        });
    } else {
        alert('You have completed all levels!');
        window.location.reload();
    }
});

requestAnimationFrame((currentTime) => {
    gameLoop(currentTime, maze, finishLine, showCongratulations, ctx);
});