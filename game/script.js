
import { generateMazeDFS } from './maze.js';
import { portalImagesReady, drawPortal } from './portal.js';
import { player, movePlayer, resetPlayerPosition, setPlayerSpeed } from './player.js';
import { setAnimation } from './characterAnimations.js';
import { gameLoop, cancelGameLoop } from './gameLoop.js';
import { teleportationFrames, teleportationImagesReady } from './teleportationAnimation.js';
import { drawMaze } from './draw.js';
import {
    TILE_SIZE,
    INITIAL_MAZE_SIZE,
    MAZE_SIZE_MULTIPLIER,
    MAX_LEVEL,
    MOVE_SPEED_DEFAULT
} from './config.js';

// Audio elements
const menuMusic = new Audio('../assets/sounds/awesomeness.wav');
menuMusic.loop = true;
menuMusic.volume = 0.5;

const backgroundMusic = new Audio('../assets/sounds/happy.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

const portalSound = new Audio('../assets/sounds/teleport2.wav');
portalSound.volume = 0.7;

// Element references
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

const startButton = document.getElementById('startButton');
const autoWinButton = document.getElementById('autoWinButton');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');

const modal = document.getElementById('congratulationsModal');
const finalTimeDisplay = document.getElementById('finalTime');
const nextLevelButton = document.getElementById('nextLevelButton');
const exitButton = document.getElementById('exitButton');

const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const volumeControl = document.getElementById('volumeControl');
const volumeValue = document.getElementById('volumeValue');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const speedWarning = document.getElementById('speedWarning');
const speedControlLabel = document.getElementById('speedControlLabel');

// Set initial volumes and speeds
const initialVolume = parseFloat(volumeControl.value);
menuMusic.volume = initialVolume;
backgroundMusic.volume = initialVolume;
portalSound.volume = initialVolume * 0.7;

speedControl.value = MOVE_SPEED_DEFAULT;
speedValue.textContent = MOVE_SPEED_DEFAULT.toFixed(1);

autoWinButton.disabled = true;
setPlayerSpeed(MOVE_SPEED_DEFAULT);

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

// Load saved settings
window.addEventListener('load', () => {
    menuMusic.play();

    const savedVolume = localStorage.getItem('gameVolume');
    const savedSpeed = localStorage.getItem('MOVE_SPEED');

    if (savedVolume !== null) {
        volumeControl.value = savedVolume;
        volumeValue.textContent = parseFloat(savedVolume).toFixed(2);
        menuMusic.volume = parseFloat(savedVolume);
        backgroundMusic.volume = parseFloat(savedVolume);
        portalSound.volume = parseFloat(savedVolume) * 0.7;
    }

    if (savedSpeed !== null) {
        const speed = parseFloat(savedSpeed);
        speedControl.value = speed;
        speedValue.textContent = speed.toFixed(1);
        setPlayerSpeed(speed);
    } else {
        speedControl.value = MOVE_SPEED_DEFAULT;
        speedValue.textContent = MOVE_SPEED_DEFAULT.toFixed(1);
        setPlayerSpeed(MOVE_SPEED_DEFAULT);
    }
});

// Event listeners for settings
settingsButton.addEventListener('click', () => {
    $('#settingsModal').modal('show');
});



volumeControl.addEventListener('input', (event) => {
    const volume = parseFloat(event.target.value);
    volumeValue.textContent = volume.toFixed(2);
    menuMusic.volume = volume;
    backgroundMusic.volume = volume;
    portalSound.volume = volume * 0.7;
    localStorage.setItem('gameVolume', volume);
});

speedControl.addEventListener('input', (event) => {
    const speed = parseFloat(event.target.value);
    speedValue.textContent = speed.toFixed(1);
});

speedControl.addEventListener('change', (event) => {
    const speed = parseFloat(event.target.value);
    speedValue.textContent = speed.toFixed(1);
    localStorage.setItem('MOVE_SPEED', speed);
    alert('Changing the player speed will restart the game.');
    window.location.reload();
});

// Show warning when hovering over the speed control and label
speedControl.addEventListener('mouseover', () => {
    speedWarning.style.display = 'block';
});

speedControl.addEventListener('mouseout', () => {
    speedWarning.style.display = 'none';
});

speedControlLabel.addEventListener('mouseover', () => {
    speedWarning.style.display = 'block';
});

speedControlLabel.addEventListener('mouseout', () => {
    speedWarning.style.display = 'none';
});

// Image loading function
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
        //console.log('Checking if assets are loaded...');
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
    $('#congratulationsModal').modal('show');
    finalTimeDisplay.textContent = timeElapsed;
    backgroundMusic.pause();
    autoWinButton.disabled = true;
}

export function startTeleportationAnimation() {
    window.isGameActive = false; // Stop game interactions
    backgroundMusic.pause(); 
    portalSound.currentTime = 0;
    portalSound.play();

    let teleportationStartTime = null;
    const teleportationDuration = 2500; // Duration in milliseconds
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
            showCongratulations();
        }
    }

    // Start the teleportation animation loop
    requestAnimationFrame(teleportationLoop);
}

function startGame() {
    if (!window.isGameActive && portalImagesReady && teleportationImagesReady) {
        console.log('Starting game. All assets are loaded.');

        menuMusic.pause();
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();

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
        drawMaze(ctx, maze, tilesetImage, backgroundImage);
        autoWinButton.disabled = false;
        startTimer();

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

    } else if (!portalImagesReady || !teleportationImagesReady) {
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
    menuMusic.play();
    window.location.reload();
});

nextLevelButton.addEventListener('click', () => {
    if (level < MAX_LEVEL) {
    $('#congratulationsModal').modal('hide');
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
        drawMaze(ctx, maze, tilesetImage, backgroundImage);
        startTimer();
        backgroundMusic.play();
        window.isGameActive = true;
        autoWinButton.disabled = false;
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
        menuMusic.play();
        window.location.reload();
    } 
});