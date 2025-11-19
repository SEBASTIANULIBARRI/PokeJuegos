// Game variables
const magikarp = document.getElementById('magikarp');
const gameContainer = document.querySelector('.game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

let magiPosition = 250;
let magiVelocity = 0;
let gravity = 0.6;
let jumpStrength = -10;
let gameRunning = false;
let score = 0;
let obstacles = [];
let gameLoop;
let obstacleInterval;

// Game configuration
const obstacleGap = 240;
const obstacleSpeed = 3;
const obstacleFrequency = 2000; // milliseconds

// Initialize game
function init() {
    magiPosition = 250;
    magiVelocity = 0;
    score = 0;
    obstacles = [];
    scoreDisplay.textContent = score;
    magikarp.style.top = magiPosition + 'px';
    
    // Clear existing obstacles
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
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
    magikarp.style.top = magiPosition+ 'px';
    
    // Rotate Magikarp based on velocity
    let rotation = Math.min(Math.max(magiVelocity * 3, -30), 90);
    magikarp.style.transform = `rotate(${rotation}deg)`;
    
    // Check boundaries (más permisivo)
    const techoLimite = -300; // Puede salir 40px por arriba
    const pisoLimite = window.innerHeight - 20; // Puede salir 20px por abajo
    if (magiPosition < techoLimite || magiPosition > pisoLimite) {
        endGame();
    }
    
    // Achicar hitbox de Magikarp 2px más en cada borde
    const magiWidth = 66; // 70 - 4
    const magiHeight = 50; // 54 - 4
    const magiLeft = window.innerWidth * 0.3 + (77 - magiWidth) / 2 + 2; // Centrar y achicar 2px
    const magiTop = magiPosition + (56 - magiHeight) / 2 + 2; // Centrar y achicar 2px
    const magiRight = magiLeft + magiWidth;
    const magiBottom = magiTop + magiHeight;

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.left -= obstacleSpeed;
        obstacle.topElement.style.left = obstacle.left + 'px';
        obstacle.bottomElement.style.left = obstacle.left + 'px';

        // Nueva lógica: sumar score cuando Magikarp pasa el obstáculo
        if (!obstacle.passed && magiLeft > obstacle.left + 80) {
            obstacle.passed = true;
            score++;
            scoreDisplay.textContent = score;
        }

        // Remove off-screen obstacles
        if (obstacle.left < -80) {
            obstacle.topElement.remove();
            obstacle.bottomElement.remove();
            obstacles.splice(i, 1);
            continue; // Saltar colisión si se elimina
        }

        // Obstáculos
        const obstacleLeft = obstacle.left;
        const obstacleRight = obstacle.left + 80;
        const gapTop = obstacle.gapTop;
        const gapBottom = obstacle.gapTop + obstacleGap;

        // Colisión precisa con hitbox ajustada
        const horizontalCollision = magiRight > obstacleLeft && magiLeft < obstacleRight;
        const topCollision = magiTop < gapTop && horizontalCollision;
        const bottomCollision = magiBottom > gapBottom && horizontalCollision;
        if (topCollision || bottomCollision) {
            endGame();
        }
    }
}

// Create obstacle
function createObstacle() {
    if (!gameRunning) return;
    
    const minGapTop = 100;
    const maxGapTop = window.innerHeight - obstacleGap - 100;
    const gapTop = Math.random() * (maxGapTop - minGapTop) + minGapTop;
    
    // Top obstacle
    const topObstacle = document.createElement('div');
    topObstacle.classList.add('obstacle', 'obstacle-top');
    topObstacle.style.left = window.innerWidth + 'px';
    topObstacle.style.height = gapTop + 'px';
    gameContainer.appendChild(topObstacle);
    
    // Bottom obstacle
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
