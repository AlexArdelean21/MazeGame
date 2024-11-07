import { updatePlayerPosition, player } from './player.js';
import { drawPlayer } from './characterAnimations.js';
import { drawMaze } from './draw.js';
import { drawPortal } from './portal.js';

let lastTime = 0;
let animationFrameId;

export function gameLoop(
    currentTime,
    maze,
    finishLine,
    showCongratulations,
    ctx,
    tilesetImage,
    backgroundImage,
    startTeleportationAnimation
) {
    if (!window.isGameActive) return;

    if (lastTime === 0) lastTime = currentTime;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const reachedPortal = updatePlayerPosition(finishLine, maze);

    drawMaze(ctx, maze, tilesetImage, backgroundImage);
    drawPortal(ctx, finishLine, deltaTime);
    drawPlayer(ctx, player, deltaTime);

    if (reachedPortal) {
        startTeleportationAnimation();
    } else {
        animationFrameId = requestAnimationFrame((time) =>
            gameLoop(
                time,
                maze,
                finishLine,
                showCongratulations,
                ctx,
                tilesetImage,
                backgroundImage,
                startTeleportationAnimation
            )
        );
    }
}

export function cancelGameLoop() {
    cancelAnimationFrame(animationFrameId);
}
