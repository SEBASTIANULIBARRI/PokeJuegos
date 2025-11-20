// Flappy Magikarp - Código esencial
const magikarp = document.getElementById('magikarp');
const gameContainer = document.querySelector('.game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Contador de monedas (interfaz)
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

// Inicializar juego
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
    // Eliminar obstáculos existentes
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
    // Eliminar monedas existentes
    document.querySelectorAll('.coin').forEach(c => c.remove());
    // Eliminar mantines restantes para reiniciar limpio
    document.querySelectorAll('.mantine').forEach(w => w.remove());
}

// Iniciar juego
function startGame() {
    init();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameRunning = true;
    // Iniciar bucle del juego
    gameLoop = setInterval(update, 1000 / 60); // 60 FPS
    // Crear obstáculos periódicamente
    obstacleInterval = setInterval(createObstacle, obstacleFrequency);
    // Crear monedas periódicamente
    coinInterval = setInterval(createCoin, coinFrequency);
}

// Función de salto
function jump() {
    if (!gameRunning) return;
    magiVelocity = jumpStrength;
}

// Actualizar estado del juego
function update() {
    if (!gameRunning) return;
    // Aplicar gravedad
    magiVelocity += gravity;
    magiPosition += magiVelocity;
    // Actualizar posición de Magikarp
    magikarp.style.top = magiPosition + 'px';
    // Rotar Magikarp según la velocidad
    let rotation = Math.min(Math.max(magiVelocity * 3, -30), 90);
    magikarp.style.transform = `rotate(${rotation}deg)`;
    // Comprobar límites (más permisivo)
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

    // Obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.left -= obstacleSpeed;
        obstacle.topElement.style.left = obstacle.left + 'px';
        obstacle.bottomElement.style.left = obstacle.left + 'px';
        // Puntuación cuando Magikarp pasa el obstáculo
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
        // Colisión contra los bordes del gap
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

        // Mover y comprobar mantine si existe (hitbox circular)
        if (obstacle.mantineElement) {
            obstacle.mantineElement.style.left = obstacle.left + 'px';
            // Actualizar dimensiones en caso de que cambien por CSS / responsividad
            const rect = obstacle.mantineElement.getBoundingClientRect();
            obstacle.mantineWidth = rect.width || obstacle.mantineElement.offsetWidth || obstacle.mantineWidth;
            obstacle.mantineHeight = rect.height || obstacle.mantineElement.offsetHeight || obstacle.mantineHeight;

            // Centro de la mantine (en coordenadas de pantalla)
            const mCenterX = obstacle.left + obstacle.mantineWidth / 2;
            const mCenterY = parseFloat(obstacle.mantineElement.style.top) + obstacle.mantineHeight / 2;
            // Hacer la hitbox de Mantine proporcional al tamaño del elemento
            const mantineRadiusFactor = 0.7; // 0.0-1.0, reduce el radio de colisión
            const radius = Math.max(obstacle.mantineWidth, obstacle.mantineHeight) / 2 * mantineRadiusFactor;
            const hitMantine = rectCircleCollides(magiLeft, magiTop, magiRight, magiBottom, mCenterX, mCenterY, radius);
            if (hitMantine) {
                endGame();
            }
        }
    }

    // Monedas
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
        // Comprobación de colisión con Magikarp
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

// Auxiliar: colisión círculo vs rectángulo
function rectCircleCollides(rectLeft, rectTop, rectRight, rectBottom, circleX, circleY, radius) {
    // find closest point on the rectangle to the circle center
    const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
    const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));
    const dx = circleX - closestX;
    const dy = circleY - closestY;
    return (dx * dx + dy * dy) <= (radius * radius);
}

// Manejador de victoria: detiene el juego y muestra la pantalla de victoria si existe
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
        // vincular botón de victoria para reiniciar si existe
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
    // Si hay gap, poner la moneda en el centro del gap, si no, aleatorio en el aire
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

// Crear obstáculo
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

    // Determinar dimensiones reales de la mantine (si se añadió)
    let mWidth = 0, mHeight = 0;
    if (mantineElement) {
        // Forzar un reflow para asegurar dimensiones actualizadas
        const rect = mantineElement.getBoundingClientRect();
        mWidth = rect.width || mantineElement.offsetWidth || 0;
        mHeight = rect.height || mantineElement.offsetHeight || 0;
    }

    obstacles.push({
        left: window.innerWidth,
        gapTop: gapTop,
        topElement: topObstacle,
        bottomElement: bottomObstacle,
        mantineElement: mantineElement,
        mantineWidth: mWidth,
        mantineHeight: mHeight,
        passed: false
    });
}

// Finalizar juego
function endGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Manejadores de eventos
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

// Inicializar al cargar
init();
