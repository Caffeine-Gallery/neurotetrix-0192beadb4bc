import { backend } from 'declarations/backend';

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const scoreElement = document.getElementById('score-value');
const startButton = document.getElementById('start-button');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const NEXT_BLOCK_SIZE = 20;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextPieceCanvas.width = 4 * NEXT_BLOCK_SIZE;
nextPieceCanvas.height = 4 * NEXT_BLOCK_SIZE;

const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

const COLORS = [
    '#00FFFF', '#FFFF00', '#800080', '#0000FF',
    '#FF7F00', '#00FF00', '#FF0000'
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;
let score = 0;
let gameLoop = null;

function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    const color = COLORS[shapeIndex];
    const x = Math.floor((COLS - shape[0].length) / 2);
    const y = 0;

    return { shape, color, x, y };
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(x, y, value);
            }
        });
    });
}

function drawPiece(piece, context, blockSize) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = piece.color;
                context.fillRect((piece.x + x) * blockSize, (piece.y + y) * blockSize, blockSize, blockSize);
                context.strokeStyle = '#000';
                context.strokeRect((piece.x + x) * blockSize, (piece.y + y) * blockSize, blockSize, blockSize);
            }
        });
    });
}

function drawNextPiece() {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextPieceCtx.fillStyle = nextPiece.color;
                    nextPieceCtx.fillRect((offsetX + x) * NEXT_BLOCK_SIZE, (offsetY + y) * NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE);
                    nextPieceCtx.strokeStyle = '#000';
                    nextPieceCtx.strokeRect((offsetX + x) * NEXT_BLOCK_SIZE, (offsetY + y) * NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE, NEXT_BLOCK_SIZE);
                }
            });
        });
    }
}

function collides(piece, board) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] && (board[piece.y + y] && board[piece.y + y][piece.x + x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function rotate(piece) {
    const newShape = piece.shape[0].map((_, index) =>
        piece.shape.map(row => row[index]).reverse()
    );
    const newPiece = {
        ...piece,
        shape: newShape
    };
    if (!collides(newPiece, board)) {
        return newPiece;
    }
    return piece;
}

function moveDown() {
    currentPiece.y++;
    if (collides(currentPiece, board)) {
        currentPiece.y--;
        mergePiece();
        clearLines();
        if (currentPiece.y === 0) {
            gameOver();
            return;
        }
        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();
    }
}

function moveLeft() {
    currentPiece.x--;
    if (collides(currentPiece, board)) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if (collides(currentPiece, board)) {
        currentPiece.x--;
    }
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreElement.textContent = score;
    }
}

function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0ff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    startButton.textContent = 'Restart Game';
    startButton.disabled = false;
    submitHighScore();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(currentPiece, ctx, BLOCK_SIZE);
}

function startGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    scoreElement.textContent = score;
    currentPiece = createPiece();
    nextPiece = createPiece();
    drawNextPiece();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        moveDown();
        update();
    }, 500);
    startButton.textContent = 'Restart Game';
}

document.addEventListener('keydown', event => {
    if (!currentPiece) return;
    switch (event.code) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'Space':
            currentPiece = rotate(currentPiece);
            break;
    }
    update();
});

startButton.addEventListener('click', startGame);

// High score functionality
async function submitHighScore() {
    const name = prompt('Enter your name for the high score:');
    if (name) {
        await backend.addHighScore(name, score);
        displayHighScores();
    }
}

async function displayHighScores() {
    const highScores = await backend.getHighScores();
    console.log('High Scores:', highScores);
    // You can implement a UI to display high scores here
}
