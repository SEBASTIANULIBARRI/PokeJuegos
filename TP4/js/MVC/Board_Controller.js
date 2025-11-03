class Controller {
  constructor() {
    this.model = new Model();
    this.view = new View(
      this.model,
      this.handleClick.bind(this),
      {
        onDragStart: this.handleDragStart.bind(this),
        onDragMove: this.handleDragMove.bind(this),
        onDragEnd: this.handleDragEnd.bind(this)
      }
    );
    // Establecer imagen de fondo del tablero (MVC: View la maneja)
    this.view.setBackground("img/img-peg/fondoPeg3.jpg");
    this.selected = null;
    this.hints = [];
    this.defeated = false;
    this.victory = false;
    // Timer (por defecto 6 minutos)
    this.timeLimitMs = 6 * 60 * 1000; // 1 minuto para pruebas rápidas (antes 6 minutos)
    this.timerInterval = null;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.view.drawBoard();
  }

  async startWithFill(fillDelay = 40) {
    // Hide any defeat screen if visible
    const defeatScreenEl = document.getElementById('defeat-screen');
    if (defeatScreenEl) defeatScreenEl.style.display = 'none';
    // Reset model to template configuration and then show empty board and animate filling
    if (this.model && typeof this.model.reset === 'function') this.model.reset();
    // Template is the desired final board
    const template = JSON.parse(JSON.stringify(this.model.board));

    // Clear all valid cells (set to 0) while preserving -1 invalid cells
    for (let i = 0; i < this.model.size; i++) {
      for (let j = 0; j < this.model.size; j++) {
        if (this.model.board[i][j] !== -1) this.model.board[i][j] = 0;
      }
    }
    // draw empty board
    this.view.drawBoard();

    // Build list of positions to fill in reading order (top-left -> bottom-right)
    const coords = [];
    for (let i = 0; i < this.model.size; i++) {
      for (let j = 0; j < this.model.size; j++) {
        if (template[i][j] > 0) coords.push({ r: i, c: j, v: template[i][j] });
      }
    }

    // Optional: sort coords to center-first or any pattern. We'll do a subtle center-outwards effect
    const center = (this.model.size - 1) / 2;
    coords.sort((a, b) => {
      const da = Math.hypot(a.r - center, a.c - center);
      const db = Math.hypot(b.r - center, b.c - center);
      return da - db; // closer to center first
    });

    // Animate filling
    for (let k = 0; k < coords.length; k++) {
      const p = coords[k];
      this.model.setCell(p.r, p.c, p.v);
      this.view.drawBoard();
      // small delay
      await new Promise((res) => setTimeout(res, fillDelay));
    }

    // After fill, ensure game state ready and start timer
    this.defeated = false;
    this.victory = false;
    this.elapsedTime = 0;
    this.view.drawBoard();
    this.startTimer();
  }

  handleClick(row, col) {
    if (this.defeated) return; // detener si el juego terminó

    const cell = this.model.getCell(row, col);

    // logs de depuración eliminados para dejar el código más limpio

    if (cell > 0) { // Ahora acepta cualquier tipo de ficha (1 = pokebola, 2 = superball)
      this.selected = { row, col };
      this.hints = this.model.getValidMoves(row, col);
    } else if (cell === 0 && this.selected) {
      if (this.model.isValidMove(this.selected, { row, col })) {
        this.model.makeMove(this.selected, { row, col });
      }
      this.selected = null;
      this.hints = [];
    } else {
      this.selected = null;
      this.hints = [];
    }

    this.view.drawBoard(this.selected, this.hints);

    // Comprobar derrota
     if (this.model.hasOnlyOnePeg()) {
      const image = document.getElementById('victory-image');
      if(this.model.hasOnlyCenter()  ){
        image.src = "img/opcionesjuego/iniciales.jpg";
        document.getElementById('victory-message').textContent = "Felicitaciones! Ganaste! En la forma mas dificil!";
      } else {image.src = "img/victoryScreen.jpg";
        document.getElementById('victory-message').textContent = "Felicitaciones! Ganaste!";
      }
      this.victory = true;
      this.stopTimer();
      setTimeout(() => this.view.showVictory(), 300);}
      else if (!this.model.hasAnyValidMoves()) {
      this.defeated = true;
      this.stopTimer();
      setTimeout(() => this.view.showDefeat(), 300);
    }
  }

  // --- Manejadores de arrastre enviados desde la View ---
  handleDragStart(row, col, clientX, clientY) {
    if (this.defeated) return;
    const cell = this.model.getCell(row, col);
    if (cell > 0) {
      // marcaremos la ficha como seleccionada y mostraremos sugerencias (hints)
      this.selected = { row, col };
      this.hints = this.model.getValidMoves(row, col);
      // sugerencias (hints) calculadas
      // limpiar indicador visual de celda candidata (drag-over)
      this.view._dragOver = null;
      this.view.drawBoard(this.selected, this.hints);
    }
  }

  handleDragMove(clientX, clientY, overRow, overCol) {
    // Durante el arrastre indicamos visualmente si el destino es válido
    if (!this.selected) return;
    const valid = this.model.isValidMove(this.selected, { row: overRow, col: overCol });
    // candidato de arrastre calculado
    this.view._dragOver = { row: overRow, col: overCol, valid };
    this.view.drawBoard(this.selected, this.hints);
  }

  handleDragEnd(clientX, clientY, overRow, overCol) {
    if (!this.selected) return;
    const target = { row: overRow, col: overCol };
    const isValid = this.model.isValidMove(this.selected, target);
    // Registro seguro: evitar llamar a getCell con índices no enteros (evita TypeError si el destino no está alineado)
    const fromCell = this.model.getCell(this.selected.row, this.selected.col);
    const toCell = this.model.getCell(target.row, target.col);
    const midRow = (this.selected.row + target.row) / 2;
    const midCol = (this.selected.col + target.col) / 2;
    let midCell = 'N/A';
    if (Number.isInteger(midRow) && Number.isInteger(midCol)) {
      midCell = this.model.getCell(midRow, midCol);
    }
    // fin del arrastre: información calculada (logs eliminados)
    if (isValid) {
      this.model.makeMove(this.selected, target);
    }
    // limpiar selección y sugerencias en ambos casos (si fue válido movimos, si no, regresó)
    this.selected = null;
    this.hints = [];
    this.view._dragOver = null;
    this.view.drawBoard(this.selected, this.hints);

    
    // Check end of game conditions
    if (this.model.hasOnlyOnePeg()) {
     const image = document.getElementById('victory-image');
      if(this.model.hasOnlyCenter() ){
        image.src = "img/opcionesjuego/iniciales.jpg";
        document.getElementById('victory-message').textContent = "Felicitaciones! Ganaste! En la forma mas dificil!";
      } else {image.src = "img/victoryScreen.jpg";
        document.getElementById('victory-message').textContent = "Felicitaciones! Ganaste!";
      }
      this.victory = true;
      this.stopTimer();
      setTimeout(() => this.view.showVictory(), 300);
    } else if(!this.model.hasAnyValidMoves()) {
      this.defeated = true;
      this.stopTimer();
      setTimeout(() => this.view.showDefeat(), 300);
    }
  }

  // Inicia el temporizador del juego
  startTimer() {
    // limpiar si ya hay uno
    if (this.timerInterval) this.stopTimer();
    this.startTime = Date.now() - this.elapsedTime;
    this.timerInterval = setInterval(() => this.updateTimer(), 250);
    this.updateTimer();
  }

  // Detiene el temporizador
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Actualiza la visualización del temporizador y comprueba límite
  updateTimer() {
    this.elapsedTime = Date.now() - this.startTime;
    const remaining = Math.max(0, this.timeLimitMs - this.elapsedTime);
    const seconds = Math.floor(remaining / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const el = document.getElementById('peg-timer');
    if (el) el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
   

    if (remaining <= 0) {
      // tiempo cumplido -> derrota
      this.stopTimer();
      this.defeated = true;
      this.view.showDefeat();
    }
  }

  // Reinicia el juego (tablero, estados) y opcionalmente inicia timer
  resetGame(startTimer = true) {
    if (this.model && typeof this.model.reset === 'function') {
      this.model.reset();
    } else {
      this.model = new Model();
      this.view.model = this.model;
    }
    this.defeated = false;
    this.selected = null;
    this.hints = [];
    this.elapsedTime = 0;
    // reset timer display
    const el = document.getElementById('peg-timer');
    if (el) el.textContent = `${String(Math.floor(this.timeLimitMs / 60000)).padStart(2, '0')}:00`;
    this.view.drawBoard();
    if (startTimer) this.startTimer();
  }

}
// Funciones para controlar la visibilidad del menú y el inicio del juego
function startPegGame() {
  // ✅ Primero ocultar cualquier pantalla o contenido previo
  const juego = document.getElementById('juego');
  const instructions = document.getElementById('instructions');
  const defeatScreen = document.getElementById('defeat-screen');
  const victoryScreen = document.getElementById('victory-screen');
  const canvasWrap = document.getElementById('pegCanvasWrap');
  const canvasEl = document.getElementById('pegCanvas');
  const tcont = document.getElementById('pegTimerContainer');
  const controls = document.getElementById('pegControls');

  if (juego) juego.style.display = 'none';
  if (instructions) instructions.style.display = 'none';
  if (defeatScreen) defeatScreen.style.display = 'none';
  if (victoryScreen) victoryScreen.style.display = 'none';

  // ✅ Asegurar que el canvas y sus contenedores aparezcan correctamente sin dejar fondo negro
  if (canvasWrap) canvasWrap.style.display = 'flex';
  if (canvasEl) {
    canvasEl.style.display = 'block';
    canvasEl.style.backgroundColor = 'transparent'; // evita parpadeo negro
  }

  if (tcont) tcont.style.display = 'block';
  if (controls) controls.style.display = 'flex';

  // ✅ Iniciar el controlador solo al comenzar el juego
  const ctrl = window.startPegController();
  if (ctrl) {
    // Mostrar tiempo inicial en el contador
    const el = document.getElementById('peg-timer');
    if (el && ctrl.timeLimitMs) {
      const mins = Math.floor(ctrl.timeLimitMs / 60000);
      el.textContent = `${String(mins).padStart(2, '0')}:00`;
    }

    // ✅ Ejecutar animación de llenado o reinicio del juego
    if (typeof ctrl.startWithFill === 'function') {
      ctrl.startWithFill(40); // ms por ficha
    } else {
      if (typeof ctrl.resetGame === 'function') ctrl.resetGame(true);
      if (ctrl.view) ctrl.view.drawBoard();
    }
  }
}


document.getElementById('startBtn').addEventListener('click', ()=>{
  document.getElementById('pegCanvasWrap').style.display = 'block';
  startPegGame()}
);
document.getElementById('showInstructionsBtn').addEventListener('click', function () {
  document.getElementById('juego').style.display = 'none';
  document.getElementById('instructions').style.display = 'block';
});
document.getElementById('backToMenuBtn').addEventListener('click', function () {
  document.getElementById('instructions').style.display = 'none';
  document.getElementById('juego').style.display = 'block';
});
// Retry / Menu buttons on defeat or victory screen
document.addEventListener('DOMContentLoaded', function () {
  const retry = document.getElementById('btnRetry');
  const menu = document.getElementById('btnMenu');
  const menu_ = document.getElementById('btnMenu_');

  // Retry button (defeat screen)
  if (retry) {
    retry.addEventListener('click', function () {
      const ctrl = window.startPegController();
      if (ctrl && typeof ctrl.resetGame === 'function') {
        ctrl.resetGame(true);

        // Show game elements again
        const canvasEl = document.getElementById('pegCanvas');
        if (canvasEl) canvasEl.style.display = 'block';
        const tcont = document.getElementById('pegTimerContainer');
        if (tcont) tcont.style.display = 'block';
        const controls = document.getElementById('pegControls');
        if (controls) controls.style.display = 'flex';

        // Hide defeat/victory screens
        const defeatScreen = document.getElementById('defeat-screen');
        if (defeatScreen) defeatScreen.style.display = 'none';
        const victoryScreen = document.getElementById('victory-screen');
        if (victoryScreen) victoryScreen.style.display = 'none';
      }
    });
  }

  // Menu buttons (both defeat and victory)
  const handleMenuClick = () => {
    const ctrl = window.startPegController();
    if (ctrl && typeof ctrl.stopTimer === 'function') ctrl.stopTimer();

    // Hide gameplay UI
    document.getElementById('pegCanvas').style.display = 'none';
    const tcont = document.getElementById('pegTimerContainer');
    if (tcont) tcont.style.display = 'none';
    const controls = document.getElementById('pegControls');
    if (controls) controls.style.display = 'none';

    // Hide overlays
    const defeatScreen = document.getElementById('defeat-screen');
    if (defeatScreen) defeatScreen.style.display = 'none';
    const victoryScreen = document.getElementById('victory-screen');
    if (victoryScreen) victoryScreen.style.display = 'none';

    // Show main menu
    document.getElementById('juego').style.display = 'block';
  };

  if (menu) menu.addEventListener('click', handleMenuClick);
  if (menu_) menu_.addEventListener('click', handleMenuClick);
});


// Attach listeners for restart and return buttons (if present)
const restartBtn = document.getElementById('btnRestartGame');
if (restartBtn) {
  restartBtn.addEventListener('click', function () {
    const ctrl = window.startPegController();
    if (ctrl && typeof ctrl.resetGame === 'function') {
  ctrl.resetGame(true);
  const c = document.getElementById('pegCanvas'); if (c) c.style.display = 'block';
  const tcont = document.getElementById('pegTimerContainer'); if (tcont) tcont.style.display = 'block';
  const controls = document.getElementById('pegControls'); if (controls) controls.style.display = 'flex';
      if (ctrl.view) ctrl.view.drawBoard();
    }
  });
}

const returnBtn = document.getElementById('btnReturnMenu');
if (returnBtn) {
  returnBtn.addEventListener('click', function () {
    const ctrl = window.startPegController();
    if (ctrl && typeof ctrl.stopTimer === 'function') ctrl.stopTimer();
    const c = document.getElementById('pegCanvas'); if (c) c.style.display = 'none';
    const tcont = document.getElementById('pegTimerContainer'); if (tcont) tcont.style.display = 'none';
    const controls = document.getElementById('pegControls'); if (controls) controls.style.display = 'none';
    const elJ = document.getElementById('juego'); if (elJ) elJ.style.display = 'block';
    document.getElementById('pegCanvasWrap').style.display = 'none';
  });
}

// No iniciar automáticamente el Controller: lo creamos cuando el jugador pulsa "Comenzar"
window.controller = null;
window.startPegController = function () {
  if (!window.controller) {
    window.controller = new Controller();
  }
  return window.controller;
};
