
import { TILE_SIZE, MOVE_SPEED_DEFAULT, BUFFER_SIZE } from './config.js';
import { setAnimation } from './characterAnimations.js';
import {startTeleportationAnimation } from './script.js'; 

export const player = {
    x: TILE_SIZE,
    y: TILE_SIZE,
    size: TILE_SIZE,
    offsetY: 16,
};

export let playerSpeed = 1;
let targetPosition = { x: player.x, y: player.y };

export function movePlayer(dx, dy, maze) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (Math.abs(dx) > 0) {
        newY = Math.round(player.y / TILE_SIZE) * TILE_SIZE;
    } else if (Math.abs(dy) > 0) {
        newX = Math.round(player.x / TILE_SIZE) * TILE_SIZE;
    }

    if (canMove(newX, newY, maze)) {
        targetPosition.x = newX;
        targetPosition.y = newY;
    }
}

function canMove(newX, newY, maze) {
    const buffer = BUFFER_SIZE;

    const topLeft = { x: newX + buffer, y: newY + buffer };
    const topRight = { x: newX + player.size - buffer, y: newY + buffer };
    const bottomLeft = { x: newX + buffer, y: newY + player.size - buffer };
    const bottomRight = { x: newX + player.size - buffer, y: newY + player.size - buffer };

    return (
        isWalkable(topLeft, maze) &&
        isWalkable(topRight, maze) &&
        isWalkable(bottomLeft, maze) &&
        isWalkable(bottomRight, maze)
    );
}

function isWalkable(corner, maze) {
    const row = Math.floor(corner.y / TILE_SIZE);
    const col = Math.floor(corner.x / TILE_SIZE);

    return maze[row] && maze[row][col] === 0;
}

export function updatePlayerPosition(finishLine, maze) {
    const dx = targetPosition.x - player.x;
    const dy = targetPosition.y - player.y;

    if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        if (Math.abs(dx) > Math.abs(dy)) {
            setAnimation(dx > 0 ? 'walkRight' : 'walkLeft');
        } else {
            setAnimation(dy > 0 ? 'down' : 'up');
        }
    }

    // Move the player gradually towards the target position without overshooting
    if (Math.abs(dx) > 0) {
        const stepX = Math.min(Math.abs(dx), playerSpeed) * Math.sign(dx);
        player.x += stepX;
    } else {
        player.x = targetPosition.x;
    }

    if (Math.abs(dy) > 0) {
        const stepY = Math.min(Math.abs(dy), playerSpeed) * Math.sign(dy);
        player.y += stepY;
    } else {
        player.y = targetPosition.y;
    }

    // Stop animation if player has reached the target
    if (player.x === targetPosition.x && player.y === targetPosition.y) {
        setAnimation('idle');
        snapToGrid();
    }

    const reachedPortal = isPlayerAtFinishLine(finishLine);
    return reachedPortal;
}


function checkPlayerReachedPortal() {
    if (isPlayerAtFinishLine(finishLine)) {
        startTeleportationAnimation();
    }
}

function snapToGrid() {
    player.x = Math.round(player.x / TILE_SIZE) * TILE_SIZE;
    player.y = Math.round(player.y / TILE_SIZE) * TILE_SIZE;
}

function isPlayerAtFinishLine(finishLine) {
    return player.x === finishLine.x && player.y === finishLine.y;
}


export function resetPlayerPosition() {
    player.x = TILE_SIZE;
    player.y = TILE_SIZE;
    targetPosition = { x: player.x, y: player.y };
}

export function setPlayerSpeed(speed) {
    playerSpeed = speed;
}