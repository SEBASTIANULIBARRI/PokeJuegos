
// Flappy Magikarp - Versión simplificada para contenedor redimensionado
document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.game-container-flappy');
    const magikarp = document.getElementById('magikarp');
    const scoreDisplay = document.getElementById('score');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreDisplay = document.getElementById('finalScore');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const coinCountDisplay = document.getElementById('coinCount');
    const instructionsScreen = document.getElementById('instructions');
    const showInstructionsBtn = document.getElementById('showInstructionsBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    let gameWidth = gameContainer.offsetWidth;
    let gameHeight = gameContainer.offsetHeight;

    let magiPosition = gameHeight / 2.4;
    let magiVelocity = 0;
    let gravity = 0.6;
    let jumpStrength = -10;
    let gameRunning = false;
    let score = 0;
    let obstacles = [];
    let coins = [];
    let kyogres = [];
    let coinScore = 0;
    let gameLoop;
    let obstacleInterval;
    let coinInterval;
    let kyogreTimer = null;
    let allowBoundaryDeath = false;

    const obstacleGap = 300;
    const obstacleSpeed = 3;
    const obstacleFrequency = 2000;
    const coinFrequency = 4000;

    function init() {
        magiPosition = gameHeight / 2.4;
        magiVelocity = 0;
        score = 0;
        obstacles = [];
        coins = [];
        coinScore = 0;
        scoreDisplay.textContent = score;
        coinCountDisplay.textContent = coinScore;
        magikarp.style.top = magiPosition + 'px';
        magikarp.classList.remove('dead');
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        document.querySelectorAll('.coin').forEach(c => c.remove());
        document.querySelectorAll('.mantine').forEach(w => w.remove());
        document.querySelectorAll('.kyogre').forEach(k => k.remove());
        kyogres = [];
    }

    function startGame() {
        gameWidth = gameContainer.offsetWidth;
        gameHeight = gameContainer.offsetHeight;
        init();
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameRunning = true;
        allowBoundaryDeath = false;
        setTimeout(() => { allowBoundaryDeath = true; }, 600);
        gameLoop = setInterval(update, 1000 / 60);
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);
        coinInterval = setInterval(createCoin, coinFrequency);
        scheduleNextKyogre();
    }

    function scheduleNextKyogre() {
        if (kyogreTimer) clearTimeout(kyogreTimer);
        kyogreTimer = setTimeout(() => {
            createKyogre();
            scheduleNextKyogre();
        }, 7000);
    }

    function jump() {
        if (!gameRunning) return;
        magiVelocity = jumpStrength;
    }

    function update() {
        if (!gameRunning) return;
        
        magiVelocity += gravity;
        magiPosition += magiVelocity;
        magikarp.style.top = magiPosition + 'px';
        
        let rotation = Math.min(Math.max(magiVelocity * 3, -30), 90);
        magikarp.style.transform = `rotate(${rotation}deg)`;
        
        const techoLimite = -50;
        const pisoLimite = gameHeight - 20;
        if (allowBoundaryDeath && (magiPosition < techoLimite || magiPosition > pisoLimite)) {
            endGame(false);
            return;
        }
        
        const magiWidth = 60;
        const magiHeight = 42;
        const magiLeft = gameWidth * 0.3 - magiWidth / 2;
        const magiTop = magiPosition + 7;
        const magiRight = magiLeft + magiWidth;
        const magiBottom = magiTop + magiHeight;

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            obstacle.left -= obstacleSpeed;
            obstacle.topElement.style.left = obstacle.left + 'px';
            obstacle.bottomElement.style.left = obstacle.left + 'px';
            
            // Actualizar posición del Mantine
            if (obstacle.mantineElement) {
                obstacle.mantineElement.style.left = obstacle.left + 'px';
            }
            
            if (!obstacle.passed && magiLeft > obstacle.left + 80) {
                obstacle.passed = true;
                score++;
                scoreDisplay.textContent = score;
                if (score >= 20 || coinScore >= 10) {
                    showVictoryScreen();
                    return;
                }
            }
            
            if (obstacle.left < -80) {
                obstacle.topElement.remove();
                obstacle.bottomElement.remove();
                if (obstacle.mantineElement) obstacle.mantineElement.remove();
                obstacles.splice(i, 1);
                continue;
            }
            
            const obstacleLeft = obstacle.left;
            const obstacleRight = obstacle.left + 80;
            const gapTop = obstacle.gapTop;
            const gapBottom = obstacle.gapTop + obstacleGap;
            const horizontalCollision = magiRight > obstacleLeft && magiLeft < obstacleRight;
            const topCollision = magiTop < gapTop && horizontalCollision;
            const bottomCollision = magiBottom > gapBottom && horizontalCollision;
            if (topCollision || bottomCollision) {
                endGame(true);
                return;
            }
            
            // Colisión con Mantine (hitbox circular)
            if (obstacle.mantineElement) {
                const mCenterX = obstacle.left + 30;
                const mCenterY = parseFloat(obstacle.mantineElement.style.top) + 20;
                const mantineRadiusFactor = 0.7;
                const radius = Math.max(60, 40) / 2 * mantineRadiusFactor;
                const hitMantine = rectCircleCollides(magiLeft, magiTop, magiRight, magiBottom, mCenterX, mCenterY, radius);
                if (hitMantine) {
                    endGame(true);
                    return;
                }
            }
        }

        for (let i = coins.length - 1; i >= 0; i--) {
            const coin = coins[i];
            coin.left -= obstacleSpeed;
            coin.element.style.left = coin.left + 'px';
            
            if (coin.left < -20) {
                coin.element.remove();
                coins.splice(i, 1);
                continue;
            }
            
            const coinLeft = coin.left;
            const coinRight = coin.left + 20;
            const coinTop = coin.top;
            const coinBottom = coin.top + 20;
            const collide = magiRight > coinLeft && magiLeft < coinRight && magiBottom > coinTop && magiTop < coinBottom;
            
            if (collide) {
                const el = coin.element;
                if (!el.classList.contains('coin-picked')) {
                    coinScore += 1;
                    coinCountDisplay.textContent = coinScore;
                    el.classList.add('coin-picked');
                    el.addEventListener('animationend', () => {
                        try { el.remove(); } catch (e) {}
                        const idx = coins.indexOf(coin);
                        if (idx !== -1) coins.splice(idx, 1);
                    }, { once: true });

                    if (score >= 20 || coinScore >= 10) {
                        showVictoryScreen();
                        return;
                    }
                }
            }
        }

        for (let i = kyogres.length - 1; i >= 0; i--) {
            const k = kyogres[i];
            k.left -= k.speed;
            k.element.style.left = k.left + 'px';
            if (k.left < -50) {
                k.element.remove();
                kyogres.splice(i, 1);
            }
        }
    }

    function rectCircleCollides(rectLeft, rectTop, rectRight, rectBottom, circleX, circleY, radius) {
        const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
        const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));
        const dx = circleX - closestX;
        const dy = circleY - closestY;
        return (dx * dx + dy * dy) <= (radius * radius);
    }

    function showVictoryScreen() {
        gameRunning = false;
        clearInterval(gameLoop);
        clearInterval(obstacleInterval);
        clearInterval(coinInterval);
        const victoryEl = document.getElementById('victoryScreen');
        if (victoryEl) {
            startScreen.classList.add('hidden');
            gameOverScreen.classList.add('hidden');
            document.getElementById('victoryScore').textContent = score;
            document.getElementById('victoryCoins').textContent = coinScore;
            victoryEl.classList.remove('hidden');
            const vBtn = document.getElementById('victoryButton');
            if (vBtn) {
                vBtn.replaceWith(vBtn.cloneNode(true));
                document.getElementById('victoryButton').addEventListener('click', () => {
                    victoryEl.classList.add('hidden');
                    startGame();
                });
            }
        }
    }

    function createCoin() {
        if (!gameRunning) return;
        
        let gapTop = null;
        let gapLeft = gameWidth;
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].left > gameWidth * 0.5) {
                gapTop = obstacles[i].gapTop;
                gapLeft = obstacles[i].left;
                break;
            }
        }
        
        let coinTop;
        if (gapTop !== null) {
            coinTop = gapTop + obstacleGap / 2 - 10;
        } else {
            coinTop = Math.random() * (gameHeight - 250) + 100;
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

    function createKyogre() {
        if (!gameRunning) return;
        if (kyogres.length > 2) return;
        
        const ky = document.createElement('div');
        ky.className = 'kyogre';
        const initialLeft = gameWidth;
        ky.style.left = initialLeft + 'px';
        const top = Math.random() * (gameHeight - 100) + 50;
        ky.style.top = top + 'px';
        gameContainer.appendChild(ky);

        const speed = 1.6 + Math.random() * 1.2;
        kyogres.push({
            left: initialLeft,
            top: top,
            width: 50,
            height: 59,
            element: ky,
            speed: speed
        });
    }

    function createObstacle() {
        if (!gameRunning) return;
        
        const minGapTop = 80;
        const maxGapTop = gameHeight - obstacleGap - 80;
        const gapTop = Math.random() * (maxGapTop - minGapTop) + minGapTop;
        
        const topObstacle = document.createElement('div');
        topObstacle.classList.add('obstacle', 'obstacle-top');
        topObstacle.style.left = gameWidth + 'px';
        topObstacle.style.height = gapTop + 'px';
        gameContainer.appendChild(topObstacle);
        
        const bottomObstacle = document.createElement('div');
        bottomObstacle.classList.add('obstacle', 'obstacle-bottom');
        bottomObstacle.style.left = gameWidth + 'px';
        bottomObstacle.style.height = (gameHeight - gapTop - obstacleGap) + 'px';
        gameContainer.appendChild(bottomObstacle);
        
        let mantineElement = null;
        if (Math.random() < 0.35) {
            mantineElement = document.createElement('div');
            mantineElement.classList.add('mantine');
            mantineElement.style.left = gameWidth + 'px';
            const center = gapTop + obstacleGap / 2;
            const mantineTop = center - 10;
            mantineElement.style.top = Math.max(50, Math.min(gameHeight - 50, mantineTop)) + 'px';
            gameContainer.appendChild(mantineElement);
        }

        obstacles.push({
            left: gameWidth,
            gapTop: gapTop,
            topElement: topObstacle,
            bottomElement: bottomObstacle,
            mantineElement: mantineElement,
            mantineWidth: 60,
            mantineHeight: 40,
            passed: false
        });
    }

    function endGame(animate = true) {
        gameRunning = false;
        clearInterval(gameLoop);
        clearInterval(obstacleInterval);
        clearInterval(coinInterval);
        if (kyogreTimer) clearTimeout(kyogreTimer);
        document.querySelectorAll('.kyogre').forEach(k => k.remove());
        kyogres = [];

        if (!animate) {
            finalScoreDisplay.textContent = score;
            gameOverScreen.classList.remove('hidden');
            return;
        }

        if (!magikarp.classList.contains('dead')) {
            magikarp.classList.add('dead');
            magikarp.addEventListener('animationend', () => {
                finalScoreDisplay.textContent = score;
                gameOverScreen.classList.remove('hidden');
            }, { once: true });
        } else {
            finalScoreDisplay.textContent = score;
            gameOverScreen.classList.remove('hidden');
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });

    document.addEventListener('click', () => {
        if (gameRunning) jump();
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // Instrucciones
    showInstructionsBtn.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        instructionsScreen.classList.remove('hidden');
    });

    backToMenuBtn.addEventListener('click', () => {
        instructionsScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    init();

     window.resumeGame = function() {
        if (gameRunning) return;
        magikarp.classList.remove('dead');
        gameRunning = true;
        allowBoundaryDeath = true;
        gameLoop = setInterval(update, 1000 / 60);
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);
        coinInterval = setInterval(createCoin, coinFrequency);
        scheduleNextKyogre();
        const victoryEl = document.getElementById('victoryScreen');
        if (victoryEl) victoryEl.classList.add('hidden');
        window.scrollTo(0,0);
    };

    window.resetGame = function() {
        gameRunning = false;
        clearInterval(gameLoop);
        clearInterval(obstacleInterval);
        clearInterval(coinInterval);
        if (kyogreTimer) clearTimeout(kyogreTimer);
        document.querySelectorAll('.obstacle, .coin, .kyogre, .mantine').forEach(el => el.remove());
        init();
        const victoryEl = document.getElementById('victoryScreen');
        if (victoryEl) victoryEl.classList.add('hidden');
        const gameOverEl = document.getElementById('gameOverScreen');
        if (gameOverEl) gameOverEl.classList.add('hidden');
        startScreen.classList.remove('hidden');
        window.scrollTo(0,0);
    };
});


(function(){
  const screens = document.querySelectorAll('.screen');
  const startScreen = document.getElementById('startScreen');
  const instructions = document.getElementById('instructions');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const victoryScreen = document.getElementById('victoryScreen');

  const startButton = document.getElementById('startButton');
  const showInstructionsBtn = document.getElementById('showInstructionsBtn');
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  const restartButton = document.getElementById('restartButton');
  const backToMenuButton = document.getElementById('backToMenuButton');
  const victoryButton = document.getElementById('victoryButton');

  function hideAllScreens(){
    screens.forEach(s => s.classList.add('hidden'));
  }
  function showScreen(id){
    hideAllScreens();
    const el = document.getElementById(id);
    if(el) el.classList.remove('hidden');
    window.scrollTo(0,0);
  }

  if(startButton){
    startButton.addEventListener('click', () => {
      showScreen(''); // ocultar menú; reemplazar con la lógica de inicio del juego
      startScreen.classList.add('hidden');
      // TODO: iniciar/activar lógica del juego aquí
    });
  }

  if(showInstructionsBtn) showInstructionsBtn.addEventListener('click', () => showScreen('instructions'));
  if(backToMenuBtn) backToMenuBtn.addEventListener('click', () => showScreen('startScreen'));

  if(restartButton) restartButton.addEventListener('click', () => {
    // TODO: resetear estado del juego y arrancar
    showScreen('startScreen');
  });

  if(backToMenuButton) backToMenuButton.addEventListener('click', () => {
    showScreen('startScreen');
    // limpiar estado extra si hace falta
  });

  if(victoryButton) victoryButton.addEventListener('click', () => {
    // TODO: resetear y volver a iniciar
    showScreen('startScreen');
  });
})();

(function(){
  const victoryScreen = document.getElementById('victoryScreen');
  const continueButton = document.getElementById('continueButton');
  const victoryToMenuButton = document.getElementById('victoryToMenuButton');

  if (continueButton) {
    continueButton.addEventListener('click', () => {
      // Oculta la pantalla de victoria y continúa el juego.
      // Si tienes una función para continuar del juego (resumeGame), se llama.
      victoryScreen.classList.add('hidden');
      if (typeof window.resumeGame === 'function') {
        window.resumeGame();
      } else if (typeof window.startGame === 'function') {
        // Si no hay resume, intenta usar startGame (reinicia o continúa según tu lógica).
        window.startGame();
      }
      window.scrollTo(0,0);
    });
  }

  if (victoryToMenuButton) {
    victoryToMenuButton.addEventListener('click', () => {
      // Volver al menú inicial y resetear estado si existe resetGame()
      const startScreen = document.getElementById('startScreen');
      if (startScreen) startScreen.classList.remove('hidden');
      if (victoryScreen) victoryScreen.classList.add('hidden');
      if (typeof window.resetGame === 'function') window.resetGame();
      window.scrollTo(0,0);
    });
  }
})();