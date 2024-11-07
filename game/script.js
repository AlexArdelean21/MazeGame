import { generateMazeDFS } from './maze.js';
import { portalImagesReady } from './portal.js';
import { player, movePlayer, resetPlayerPosition} from './player.js';
import { setAnimation } from './characterAnimations.js';
import { gameLoop, cancelGameLoop } from './gameLoop.js';
import { teleportationFrames, totalTeleportationFrames } from './teleportationAnimation.js';
import { drawMaze } from './draw.js';
import { teleportationImagesReady } from './teleportationAnimation.js';
import {
    TILE_SIZE,
    INITIAL_MAZE_SIZE,
    MAZE_SIZE_MULTIPLIER,
    MAX_LEVEL,
    TILESET_TILE_SIZE,
    FRAME_RATE
} from './config.js';

const backgroundMusic = new Audio('../assets/sounds/happy.mp3');
backgroundMusic.loop = true; // Enable looping
backgroundMusic.volume = 0.5; // Adjust volume (0.0 to 1.0)

const portalSound = new Audio('../assets/sounds/teleport2.wav');
portalSound.volume = 0.7;

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');
const modal = document.getElementById('congratulationsModal');
const finalTimeDisplay = document.getElementById('finalTime');
const nextLevelButton = document.getElementById('nextLevelButton');
const exitButton = document.getElementById('exitButton');
const autoWinButton = document.getElementById('autoWinButton');

autoWinButton.disabled = true;

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

startButton.disabled = true; // Disable start button until assets are loaded

Promise.all([
    loadImage('../assets/tileset 1.png'),
    loadImage('../assets/RockWall_Normal.png'),
    // Load the first teleportation frame as a proxy for all frames
    loadImage('../characters/teleportation_frames/teleport_0.png')
]).then((images) => {
    tilesetImage.src = images[0].src;
    backgroundImage.src = images[1].src;

    const checkAssetsLoaded = setInterval(() => {
        console.log('Checking if assets are loaded...');
        if (portalImagesReady && teleportationImagesReady) {
            clearInterval(checkAssetsLoaded);
            startButton.disabled = false; // Enable start button
            console.log('All assets loaded. Start button enabled.');
        }
    }, 100);
    
}).catch((error) => {
    console.error('Failed to load images:', error);
});

function showCongratulations() {
    clearInterval(timer);
    cancelGameLoop();
    window.isGameActive = false;
    portalSound.play();
    modal.style.display = 'flex';
    finalTimeDisplay.textContent = timeElapsed;
    backgroundMusic.pause();
    autoWinButton.disabled = true;
}

export function startTeleportationAnimation() {
    window.isGameActive = false; // Stop game interactions
    backgroundMusic.pause(); // Pause background music
    portalSound.currentTime = 0; // Reset sound in case it's already playing
    portalSound.play(); // Play portal sound effect

    let teleportationStartTime = null;
    const teleportationDuration = 3600; // Duration in milliseconds (3.6 seconds)
    const totalFrames = teleportationFrames.length;
    const frameDuration = teleportationDuration / totalFrames;

    function teleportationLoop(currentTime) {
        if (!teleportationStartTime) teleportationStartTime = currentTime;
        const elapsed = currentTime - teleportationStartTime;
        const frameIndex = Math.min(Math.floor(elapsed / frameDuration), totalFrames - 1);

        // Clear the canvas and redraw the maze and portal
        drawMaze(ctx, maze, tilesetImage, backgroundImage);
        drawPortal(ctx, finishLine, 0); // deltaTime is 0 since portal animation is paused

        // Draw the teleportation frame
        const frameImage = teleportationFrames[frameIndex];
        if (frameImage) {
            ctx.drawImage(
                frameImage,
                player.x,
                player.y + player.offsetY,
                player.size,
                player.size
            );
        }

        if (elapsed < teleportationDuration) {
            requestAnimationFrame(teleportationLoop);
        } else {
            // After the animation, show the congratulations modal
            showCongratulations();
        }
    }

    // Start the teleportation animation loop
    requestAnimationFrame(teleportationLoop);
}

function startGame() {
    if (!window.isGameActive) {
        console.log('Starting game. All assets are loaded.');
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
        autoWinButton.disabled = false;
        backgroundMusic.play();
        startTimer();
        //lastTime = performance.now();
        requestAnimationFrame((currentTime) => {
            gameLoop(
                currentTime,
                maze,
                finishLine,
                showCongratulations,
                ctx,
                tilesetImage,
                backgroundImage,
                startTeleportationAnimation
            );
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
        portalSound.play();
        showCongratulations();
    }
});

exitButton.addEventListener('click', () => {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
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
        backgroundMusic.play();
        window.isGameActive = true;
        requestAnimationFrame((currentTime) => {
            gameLoop(
                currentTime,
                maze,
                finishLine,
                showCongratulations,
                ctx,
                tilesetImage,
                backgroundImage,
                startTeleportationAnimation
            );
        });
    } else {
        alert('You have completed all levels!');
        window.location.reload();
    }
});

requestAnimationFrame((currentTime) => {
    gameLoop(currentTime, maze, finishLine, showCongratulations, ctx);
});