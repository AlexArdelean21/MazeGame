import { TILE_SIZE, TILESET_TILE_SIZE } from './config.js';

export function drawMaze(ctx, maze, tilesetImage, backgroundImage) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const tileSize = TILE_SIZE;
    const mazeRows = maze.length;
    const mazeCols = maze[0].length;

    for (let row = 0; row < mazeRows; row++) {
        const mazeRow = maze[row];
        for (let col = 0; col < mazeCols; col++) {
            const cell = mazeRow[col];
            const x = col * tileSize;
            const y = row * tileSize;
            if (tilesetImage.complete && tilesetImage.naturalWidth !== 0){
            if (cell === 1) {
                ctx.drawImage(
                    tilesetImage,
                    TILESET_TILE_SIZE,
                    0,
                    TILESET_TILE_SIZE,
                    TILESET_TILE_SIZE,
                    x,
                    y,
                    tileSize,
                    tileSize
                );
            } else {
                ctx.drawImage(
                    backgroundImage,
                    0,
                    0,
                    TILESET_TILE_SIZE,
                    TILESET_TILE_SIZE,
                    x,
                    y,
                    tileSize,
                    tileSize
                );
            }
        }else {
            console.error("tilesetImage is not loaded properly.");
        }
        }
    }
}
