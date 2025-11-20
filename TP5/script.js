// Flappy Magikarp - Código esencial
const magikarp = document.getElementById('magikarp');
const gameContainer = document.querySelector('.game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Coin counter UI
let coinCounter = document.getElementById('coinCounter');
if (!coinCounter) {
    coinCounter = document.createElement('div');
    coinCounter.className = 'coin-counter';
    coinCounter.id = 'coinCounter';
    coinCounter.innerHTML = '<span class="coin-icon"></span><span id="coinCount">0</span>';
    gameContainer.appendChild(coinCounter);
}
const coinCountDisplay = document.getElementById('coinCount');

let magiPosition = 250;
let magiVelocity = 0;
let gravity = 0.6;
let jumpStrength = -10;
let gameRunning = false;
let score = 0;
let obstacles = [];
let coins = [];
let coinScore = 0;
let gameLoop;
let obstacleInterval;
let coinInterval;

const obstacleGap = 240;
const obstacleSpeed = 3;
const obstacleFrequency = 2000;
const coinFrequency = 4000; // ms (menos frecuencia)

// Initialize game
function init() {
    magiPosition = 250;
    magiVelocity = 0;
    score = 0;
    obstacles = [];
    coins = [];
    coinScore = 0;
    scoreDisplay.textContent = score;
    coinCountDisplay.textContent = coinScore;
    magikarp.style.top = magiPosition + 'px';
    // Clear existing obstacles
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    // Clear existing coins
    document.querySelectorAll('.coin').forEach(c => c.remove());
}

// Start game
function startGame() {
    init();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60); // 60 FPS
    // Create obstacles periodically
    obstacleInterval = setInterval(createObstacle, obstacleFrequency);
    // Create coins periodically
    coinInterval = setInterval(createCoin, coinFrequency);
}

// Jump function
function jump() {
    if (!gameRunning) return;
    magiVelocity = jumpStrength;
}

// Update game state
function update() {
    if (!gameRunning) return;
    // Apply gravity
    magiVelocity += gravity;
    magiPosition += magiVelocity;
    // Update Magikarp position
    magikarp.style.top = magiPosition + 'px';
    // Rotate Magikarp based on velocity
    let rotation = Math.min(Math.max(magiVelocity * 3, -30), 90);
    magikarp.style.transform = `rotate(${rotation}deg)`;
    // Check boundaries (más permisivo)
    const techoLimite = -300;
    const pisoLimite = window.innerHeight - 20;
    if (magiPosition < techoLimite || magiPosition > pisoLimite) {
        endGame();
    }
    // Hitbox ajustada
    const magiWidth = 61;
    const magiHeight = 42;
    const magiLeft = window.innerWidth * 0.3 + (77 - magiWidth) / 2 + 4;
    const magiTop = magiPosition + (56 - magiHeight) / 2 + 6;
    const magiRight = magiLeft + magiWidth;
    const magiBottom = magiTop + magiHeight;

    // Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.left -= obstacleSpeed;
        obstacle.topElement.style.left = obstacle.left + 'px';
        obstacle.bottomElement.style.left = obstacle.left + 'px';
        // Score cuando pasa el obstáculo
        if (!obstacle.passed && magiLeft > obstacle.left + 80) {
            obstacle.passed = true;
            score++;
            scoreDisplay.textContent = score;
        }
        // Eliminar obstáculos fuera de pantalla
        if (obstacle.left < -80) {
            obstacle.topElement.remove();
            obstacle.bottomElement.remove();
            obstacles.splice(i, 1);
            continue;
        }
        // Colisión
        const obstacleLeft = obstacle.left;
        const obstacleRight = obstacle.left + 80;
        const gapTop = obstacle.gapTop;
        const gapBottom = obstacle.gapTop + obstacleGap;
        const horizontalCollision = magiRight > obstacleLeft && magiLeft < obstacleRight;
        const topCollision = magiTop < gapTop && horizontalCollision;
        const bottomCollision = magiBottom > gapBottom && horizontalCollision;
        if (topCollision || bottomCollision) {
            endGame();
        }
    }

    // Coins
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        coin.left -= obstacleSpeed;
        coin.element.style.left = coin.left + 'px';
        // Eliminar monedas fuera de pantalla
        if (coin.left < -coin.width) {
            coin.element.remove();
            coins.splice(i, 1);
            continue;
        }
        // Colisión con Magikarp
        const coinLeft = coin.left;
        const coinRight = coin.left + coin.width;
        const coinTop = coin.top;
        const coinBottom = coin.top + coin.height;
        const collide =
            magiRight > coinLeft &&
            magiLeft < coinRight &&
            magiBottom > coinTop &&
            magiTop < coinBottom;
        if (collide) {
            coin.element.remove();
            coins.splice(i, 1);
            coinScore++;
            coinCountDisplay.textContent = coinScore;
        }
    }
}
// Crear moneda flotante en zona "segura" (dentro del gap de obstáculos o en el aire)
function createCoin() {
    if (!gameRunning) return;
    // Buscar un obstáculo próximo para poner la moneda en el gap
    let gapTop = null;
    let gapLeft = window.innerWidth;
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].left > window.innerWidth * 0.5) {
            gapTop = obstacles[i].gapTop;
            gapLeft = obstacles[i].left;
            break;
        }
    }
    // Si hay gap, poner la moneda en el centro del gap, sino random en el aire
    let coinTop;
    const coinHeight = 20; // coincide con CSS (.coin height)
    if (gapTop !== null) {
        coinTop = gapTop + obstacleGap / 2 - (coinHeight / 2);
    } else {
        // Altura random entre 100 y window.innerHeight - 200
        coinTop = Math.random() * (window.innerHeight - 250) + 100;
    }
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = gapLeft + 'px';
    coin.style.top = coinTop + 'px';
    gameContainer.appendChild(coin);
    coins.push({
        left: gapLeft,
        top: coinTop,
        width: 20,
        height: 20,
        element: coin
    });
}

// Create obstacle
function createObstacle() {
    if (!gameRunning) return;
    
    const minGapTop = 100;
    const maxGapTop = window.innerHeight - obstacleGap - 100;
    const gapTop = Math.random() * (maxGapTop - minGapTop) + minGapTop;
    
    const topObstacle = document.createElement('div');
    topObstacle.classList.add('obstacle', 'obstacle-top');
    topObstacle.style.left = window.innerWidth + 'px';
    topObstacle.style.height = gapTop + 'px';
    gameContainer.appendChild(topObstacle);
    
    const bottomObstacle = document.createElement('div');
    bottomObstacle.classList.add('obstacle', 'obstacle-bottom');
    bottomObstacle.style.left = window.innerWidth + 'px';
    bottomObstacle.style.height = (window.innerHeight - gapTop - obstacleGap) + 'px';
    gameContainer.appendChild(bottomObstacle);
    
    obstacles.push({
        left: window.innerWidth,
        gapTop: gapTop,
        topElement: topObstacle,
        bottomElement: bottomObstacle
    });
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

document.addEventListener('click', () => {
    if (gameRunning) {
        jump();
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initialize on load
init();
