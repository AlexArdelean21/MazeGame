
import { TILE_SIZE } from './config.js';

export const portalFrames = [];
const totalPortalFrames = 41;
let portalImagesLoaded = 0;
export let portalImagesReady = false;

for (let i = 1; i <= totalPortalFrames; i++) {
    const img = new Image();
    img.src = `../assets/Portal/Portal_100x100px${i}.png`;
    img.onload = () => {
        portalImagesLoaded++;
        //zconsole.log(`Loaded portal frame ${i}`);
        if (portalImagesLoaded === totalPortalFrames) {
            portalImagesReady = true;
            console.log('All portal images loaded.');
        }
    };
    img.onerror = (error) => {
        console.error(`Failed to load portal frame ${i}`, error);
    };
    portalFrames.push(img);
}

let currentPortalFrameIndex = 0;
const portalFrameRate = 10;
let portalElapsedTimeSinceLastFrame = 0;

export function drawPortal(ctx, finishLine, deltaTime) {
    portalElapsedTimeSinceLastFrame += deltaTime;
    if (portalElapsedTimeSinceLastFrame > 1000 / portalFrameRate) {
        currentPortalFrameIndex = (currentPortalFrameIndex + 1) % portalFrames.length;
        portalElapsedTimeSinceLastFrame = 0;
    }

    const currentImage = portalFrames[currentPortalFrameIndex];
    if (currentImage) {
        const portalScale = 1.9;
        const portalWidth = TILE_SIZE * portalScale;
        const portalHeight = TILE_SIZE * portalScale;
        const portalX = finishLine.x + (TILE_SIZE / 2) - (portalWidth / 2);
        const portalY = finishLine.y + (TILE_SIZE / 2) - (portalHeight / 2);
        ctx.drawImage(currentImage, portalX, portalY, portalWidth, portalHeight);
    }
}
