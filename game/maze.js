// maze.js
import { TILE_SIZE } from './config.js';

export function generateMazeDFS(rows, cols) {
    const maze = Array(rows).fill().map(() => Array(cols).fill(1));
    const stack = [];
    const directions = [
        [0, -1], // Up
        [0, 1],  // Down
        [-1, 0], // Left
        [1, 0],  // Right
    ];

    let currentRow = 1;
    let currentCol = 1;
    maze[currentRow][currentCol] = 0;
    stack.push([currentRow, currentCol]);

    let furthestPoint = { row: currentRow, col: currentCol, distance: 0 };
    const distances = Array(rows).fill().map(() => Array(cols).fill(Infinity));
    distances[currentRow][currentCol] = 0;

    const potentialFinishPoints = [];

    while (stack.length > 0) {
        const [row, col] = stack[stack.length - 1];
        const neighbors = [];

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow * 2;
            const newCol = col + dCol * 2;
            if (
                newRow > 0 &&
                newRow < rows - 1 &&
                newCol > 0 &&
                newCol < cols - 1 &&
                maze[newRow][newCol] === 1
            ) {
                neighbors.push([newRow, newCol, dRow, dCol]);
            }
        }

        if (neighbors.length > 0) {
            const [newRow, newCol, dRow, dCol] = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[newRow - dRow][newCol - dCol] = 0;
            maze[newRow][newCol] = 0;
            stack.push([newRow, newCol]);
            distances[newRow][newCol] = distances[row][col] + 1;
            if (distances[newRow][newCol] > furthestPoint.distance) {
                furthestPoint = { row: newRow, col: newCol, distance: distances[newRow][newCol] };
            }
            if (isEdgeCell(newRow, newCol, rows, cols) && !isSurroundedByWalls(maze, newRow, newCol)) {
                potentialFinishPoints.push({ row: newRow, col: newCol });
            }
        } else {
            stack.pop();
        }
    }

    let finishPoint;
    if (!isSurroundedByWalls(maze, furthestPoint.row, furthestPoint.col)) {
        finishPoint = furthestPoint;
    } else if (potentialFinishPoints.length > 0) {
        finishPoint = potentialFinishPoints[Math.floor(Math.random() * potentialFinishPoints.length)];
    } else {
        const openCells = getAllOpenCells(maze);
        finishPoint = openCells[Math.floor(Math.random() * openCells.length)];
    }

    return { maze, finishPoint };
}

function isEdgeCell(row, col, rows, cols) {
    return row === 1 || row === rows - 2 || col === 1 || col === cols - 2;
}

function isSurroundedByWalls(maze, row, col) {
    const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0],
    ];
    return directions.every(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        return (
            newRow < 0 ||
            newRow >= maze.length ||
            newCol < 0 ||
            newCol >= maze[0].length ||
            maze[newRow][newCol] === 1
        );
    });
}

function getAllOpenCells(maze) {
    const openCells = [];
    const rows = maze.length;
    const cols = maze[0].length;

    for (let row = 0; row < rows; row++) {
        const mazeRow = maze[row];
        for (let col = 0; col < cols; col++) {
            if (mazeRow[col] === 0) {
                openCells.push({ row, col });
            }
        }
    }
    return openCells;
}

export { isSurroundedByWalls, getAllOpenCells };
