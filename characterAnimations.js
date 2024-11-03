const animations = {
    'idle': [],
    'down': [],
    'up': [],
    'walkLeft': [],
    'walkRight': [],
};

['idle', 'down', 'up', 'walkLeft', 'walkRight'].forEach((type) => {
    let frameCount = 10;
    if (type == 'idle' || type == 'walkLeft' || type == "walkRight"){
        frameCount = 8;
    }

    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = `characters/${type}/Character2M_1_${type}_${i}.png`;
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

// Draw the current frame of the player character
function drawPlayer(ctx, player, currentTime) {
    if (!lastFrameTime) {
        lastFrameTime = currentTime;
    }

    const elapsedTime = currentTime - lastFrameTime;

    if (elapsedTime > 1000 / frameRate) {
        currentFrameIndex = (currentFrameIndex + 1) % animations[currentAnimation].length;
        lastFrameTime = currentTime;
    }

    const currentImage = animations[currentAnimation][currentFrameIndex];
    if (currentImage) {
        ctx.drawImage(
            currentImage,
            player.x,
            player.y + player.offsetY, // Adjust the Y position using the offset to align with the ground
            player.size,
            player.size
        );
    }
}


export { drawPlayer, setAnimation };
