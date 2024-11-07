import { TILE_SIZE } from './config.js';

export const portalFrames = [];
const totalPortalFrames = 42;
let portalImagesLoaded = 0;
export let portalImagesReady = false;

for (let i = 1; i < totalPortalFrames; i++) {
    const img = new Image();
    img.src = `../assets/Portal/Portal_100x100px${i}.png`;
    img.onload = () => {
        portalImagesLoaded++;
        if (portalImagesLoaded === totalPortalFrames) {
            portalImagesReady = true;
        }
    };
    portalFrames.push(img);
}

let currentPortalFrameIndex = 0;
const portalFrameRate = 10; // Adjust as needed for animation speed
let portalElapsedTimeSinceLastFrame = 0;

export function drawPortal(ctx, finishLine, deltaTime) {
    portalElapsedTimeSinceLastFrame += deltaTime;
    if (portalElapsedTimeSinceLastFrame > 1000 / portalFrameRate) {
        currentPortalFrameIndex = (currentPortalFrameIndex + 1) % portalFrames.length;
        portalElapsedTimeSinceLastFrame = 0;
    }

    const currentImage = portalFrames[currentPortalFrameIndex];
    if (currentImage) {
        // Adjust the portal size and position
        const portalScale = 1.9;
        const portalWidth = TILE_SIZE * portalScale;
        const portalHeight = TILE_SIZE * portalScale;
        const portalX = finishLine.x + (TILE_SIZE / 2) - (portalWidth / 2);
        const portalY = finishLine.y + (TILE_SIZE / 2) - (portalHeight / 2);
        ctx.drawImage(currentImage, portalX, portalY, portalWidth, portalHeight);
    }
}
