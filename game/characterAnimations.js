import { FRAME_RATE } from './config.js';

const animations = {
    'idle': [],
    'down': [],
    'up': [],
    'walkLeft': [],
    'walkRight': [],
};

['idle', 'down', 'up', 'walkLeft', 'walkRight'].forEach((type) => {
    let frameCount = 10;
    if (type === 'idle' || type === 'walkLeft' || type === 'walkRight') {
        frameCount = 8;
    }

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = `characters/${type}/Character2M_1_${type}_${i}.png`;
        animations[type].push(img);
    }
});

let currentFrameIndex = 0;
let elapsedTimeSinceLastFrame = 0;
let currentAnimation = 'idle';

export function setAnimation(type) {
    if (animations[type] && currentAnimation !== type) {
        currentAnimation = type;
        currentFrameIndex = 0;
    }
}

export function drawPlayer(ctx, player, deltaTime) {
    elapsedTimeSinceLastFrame += deltaTime;

    if (elapsedTimeSinceLastFrame > 1000 / FRAME_RATE) {
        currentFrameIndex = (currentFrameIndex + 1) % animations[currentAnimation].length;
        elapsedTimeSinceLastFrame = 0;
    }

    const currentImage = animations[currentAnimation][currentFrameIndex];
    if (currentImage) {
        ctx.drawImage(
            currentImage,
            player.x,
            player.y + player.offsetY,
            player.size,
            player.size
        );
    }
}
