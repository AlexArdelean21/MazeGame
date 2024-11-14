
export const MOVE_SPEED = (() => {
    const savedSpeed = localStorage.getItem('MOVE_SPEED');
    return savedSpeed !== null ? parseFloat(savedSpeed) : 1.5; // Default speed is 1.5
})();

export const TILE_SIZE = 64;
export const BUFFER_SIZE = 2;
export const INITIAL_MAZE_SIZE = 15;
export const MAZE_SIZE_MULTIPLIER = 1.2;
export const MAX_LEVEL = 5;
export const TILESET_TILE_SIZE = 48;
export const FRAME_RATE = 6;