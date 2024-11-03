const animations = {
    'idle': [],
    'down': [],
    'up': [],
    'walkLeft': [],
    'walkRight': [],
};

['idle', 'down', 'up', 'walkLeft', 'walkRight'].forEach((type) => {
    for (let i = 0; i < 10  ; i++) {
        const img = new Image();
        img.src = `characters/${type}/Character2M_1_${type.replace(' ', '_')}_${i}.png`;
        animations[type].push(img);
    }
});

let currentFrameIndex = 0;
const frameRate = 6;
let lastFrameTime = 0;
let currentAnimation = 'idle';

function setAnimation(type) {
    if (animations[type] && currentAnimation !== type) {
        currentAnimation = type;
        currentFrameIndex = 0;
    }
}

function drawPlayer(ctx, player, currentTime) {
    if (!lastFrameTime) {
        lastFrameTime = currentTime;
    }

    const elapsedTime = currentTime - lastFrameTime;

    // Update frame index based on frame rate
    if (elapsedTime > 1000 / frameRate) {
        currentFrameIndex = (currentFrameIndex + 1) % animations[currentAnimation].length;
        lastFrameTime = currentTime;
    }

    // Draw the current frame of the character
    ctx.drawImage(
        animations[currentAnimation][currentFrameIndex],
        player.x,
        player.y,
        player.size,
        player.size
    );
}

// Exporting Functions
export { drawPlayer, setAnimation };
