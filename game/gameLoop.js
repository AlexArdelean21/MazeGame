import { updatePlayerPosition, player } from './player.js';
import { drawPlayer } from './characterAnimations.js';
import { drawMaze } from './script.js'; 

let lastTime = 0;
let animationFrameId;

export function gameLoop(currentTime, maze, finishLine, showCongratulations, ctx) {
    if (!window.isGameActive) return;
    if (lastTime === 0) lastTime = currentTime;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const reachedFinish = updatePlayerPosition(finishLine, maze);
    drawMaze(ctx, maze, finishLine);
    drawPlayer(ctx, player, deltaTime);

    if (reachedFinish) {
        showCongratulations();
    } else {
        animationFrameId = requestAnimationFrame((time) =>
            gameLoop(time, maze, finishLine, showCongratulations, ctx)
        );
    }
}

export function cancelGameLoop() {
    cancelAnimationFrame(animationFrameId);
}
