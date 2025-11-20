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

const obstacleGap = 300; // aumentado para huecos más amplios
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
    // Clear any remaining mantines so restart is clean
    document.querySelectorAll('.mantine').forEach(w => w.remove());
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
    // Hitbox ajustada (Magikarp): restaurada a la caja original
    const magiWidth = 60;
    const magiHeight = 42;
    const magiLeft = window.innerWidth * 0.3 + (60 - magiWidth) / 2 + 4;
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
            // comprobar condición de victoria
            if (score >= 40 || coinScore >= 15) {
                showVictoryScreen();
                return;
            }
        }
        // Eliminar obstáculos fuera de pantalla
            if (obstacle.left < -80) {
                obstacle.topElement.remove();
                obstacle.bottomElement.remove();
                if (obstacle.mantineElement) obstacle.mantineElement.remove();
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

        // Mover y chequear mantine si existe (hitbox circular)
        if (obstacle.mantineElement) {
            obstacle.mantineElement.style.left = obstacle.left + 'px';
            const mCenterX = obstacle.left + obstacle.mantineWidth / 2;
            const mCenterY = parseFloat(obstacle.mantineElement.style.top) + obstacle.mantineHeight / 2;
            // hacer la hitbox de Mantine más pequeña (factor)</br>
            const mantineRadiusFactor = 0.9; // 0.0-1.0, reduce el radio de colisión
            const radius = Math.max(obstacle.mantineWidth, obstacle.mantineHeight) / 2 * mantineRadiusFactor;
            const hitMantine = rectCircleCollides(magiLeft, magiTop, magiRight, magiBottom, mCenterX, mCenterY, radius);
            if (hitMantine) {
                endGame();
            }
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
            // comprobar condición de victoria
            if (score >= 10 || coinScore >= 15) {
                showVictoryScreen();
                return;
            }
        }
    }
}

// Helper: circle vs rect collision
function rectCircleCollides(rectLeft, rectTop, rectRight, rectBottom, circleX, circleY, radius) {
    // find closest point on the rectangle to the circle center
    const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
    const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));
    const dx = circleX - closestX;
    const dy = circleY - closestY;
    return (dx * dx + dy * dy) <= (radius * radius);
}

// Victory handler: detiene el juego y muestra la pantalla de victoria si existe
function showVictoryScreen() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    console.log('Victory reached! Score:', score, 'Coins:', coinScore);
    const victoryEl = document.getElementById('victoryScreen');
    if (victoryEl) {
        // ocultar pantallas anteriores si existen
        try { startScreen.classList.add('hidden'); } catch(e) {}
        try { gameOverScreen.classList.add('hidden'); } catch(e) {}
        // actualizar valores mostrados si existen
        const vs = document.getElementById('victoryScore');
        const vc = document.getElementById('victoryCoins');
        if (vs) vs.textContent = score;
        if (vc) vc.textContent = coinScore;
        victoryEl.classList.remove('hidden');
        // vincular botón de victory para reiniciar si existe
        const vBtn = document.getElementById('victoryButton');
        if (vBtn) {
            // remover listeners previos asegurando idempotencia
            vBtn.replaceWith(vBtn.cloneNode(true));
            const newBtn = document.getElementById('victoryButton');
            if (newBtn) newBtn.addEventListener('click', () => {
                // ocultar la pantalla de victoria y reiniciar
                victoryEl.classList.add('hidden');
                startGame();
            });
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
    
    // Decidir si añadimos un Mantine dentro del gap (probabilidad)
    let mantineElement = null;
    const shouldAddMantine = Math.random() < 0.35; // 35% de probabilidad
    if (shouldAddMantine) {
        mantineElement = document.createElement('div');
        mantineElement.classList.add('mantine');
        // colocar inicialmente alineado con el obstáculo a la derecha
        mantineElement.style.left = window.innerWidth + 'px';
        // centrar verticalmente en el gap, pero evitar el centro (donde está la moneda)
        const mantineHeight = 20; // coincide con CSS (.mantine height)
        const center = gapTop + obstacleGap / 2;
        const coinHeight = 20; // altura de la moneda
        const padding = 12; // separación entre moneda y mantine
        const placeBelow = Math.random() < 0.5;
        let mantineTop;
        if (placeBelow) {
            mantineTop = center + (coinHeight / 2) + (mantineHeight / 2) + padding;
        } else {
            mantineTop = center - (coinHeight / 2) - (mantineHeight / 2) - padding;
        }
        mantineTop = Math.max(80, Math.min(window.innerHeight - 80, mantineTop));
        mantineElement.style.top = mantineTop + 'px';
        gameContainer.appendChild(mantineElement);
    }

    obstacles.push({
        left: window.innerWidth,
        gapTop: gapTop,
        topElement: topObstacle,
        bottomElement: bottomObstacle,
        mantineElement: mantineElement,
        mantineWidth: mantineElement ? 20 : 0,
        mantineHeight: mantineElement ? 20 : 0,
        passed: false
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
