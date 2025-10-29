class Controller {
  constructor() {
    this.model = new Model();
    this.view = new View(this.model, this.handleClick.bind(this));
    // Establecer imagen de fondo del tablero (MVC: View la maneja)
    this.view.setBackground("img/img-peg/fondoPeg3.jpg");
    this.selected = null;
    this.hints = [];
    this.defeated = false;
    this.view.drawBoard();
  }

  handleClick(row, col) {
    if (this.defeated) return; // stop if game over

    const cell = this.model.getCell(row, col);

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

    // Check defeat
    if (!this.model.hasAnyValidMoves()) {
      this.defeated = true;
      setTimeout(() => this.view.showDefeat(), 300);
    }
  }
  
}



window.onload = () => new Controller();
