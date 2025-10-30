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
    this.view.drawBoard();
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
    if (!this.model.hasAnyValidMoves()) {
      this.defeated = true;
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

  // Comprobar derrota
    if (!this.model.hasAnyValidMoves()) {
      this.defeated = true;
      setTimeout(() => this.view.showDefeat(), 300);
    }
  }
  
}



window.onload = () => new Controller();
