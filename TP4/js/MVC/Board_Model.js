class Model {
  constructor() {
    this.size = 7;
    // Solo estado lógico del juego (MVC): tamaño y tablero.
    // El cálculo de layout (tamaños en píxeles, offsets) corresponde a la View.

    // -1 = inválido, 0 = vacío, números positivos = tipos de fichas (1 = pokebola, 2 = superball)
    this.board = [
      [-1, -1, 1, 2, 1, -1, -1],
      [-1, -1, 2, 1, 2, -1, -1],
      [ 1,  2, 1, 2, 1,  2,  1],
      [ 2,  1, 2, 0, 2,  1,  2],
      [ 1,  2, 1, 2, 1,  2,  1],
      [-1, -1, 2, 1, 2, -1, -1],
      [-1, -1, 1, 2, 1, -1, -1],
    ];
 
  }

  // Nota: eliminado updateLayout para respetar responsabilidades MVC.

  getCell(row, col) {
    if (row < 0 || col < 0 || row >= this.size || col >= this.size) return -1;
    return this.board[row][col];
  }

  setCell(row, col, value) {
    if (row >= 0 && col >= 0 && row < this.size && col < this.size) {
      this.board[row][col] = value;
    }
  }

  isValidMove(from, to) {
    const dr = to.row - from.row;
    const dc = to.col - from.col;

    if ((Math.abs(dr) === 2 && dc === 0) || (Math.abs(dc) === 2 && dr === 0)) {
      const midRow = (from.row + to.row) / 2;
      const midCol = (from.col + to.col) / 2;
      const fromCell = this.getCell(from.row, from.col);
      const midCell = this.getCell(midRow, midCol);
      return (
        fromCell > 0 && // cualquier tipo de ficha
        midCell > 0 && // cualquier tipo de ficha
        this.getCell(to.row, to.col) === 0
      );
    }
    return false;
  }

  makeMove(from, to) {
    const midRow = (from.row + to.row) / 2;
    const midCol = (from.col + to.col) / 2;
    const fromCell = this.getCell(from.row, from.col);
    this.setCell(from.row, from.col, 0);
    this.setCell(midRow, midCol, 0);
    // Mantener el tipo de ficha que se movió (pokebola/superball)
    this.setCell(to.row, to.col, fromCell > 0 ? fromCell : 1);
  }

  getValidMoves(row, col) {
    const moves = [];
    const directions = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ];

    for (const { dr, dc } of directions) {
      const to = { row: row + dr, col: col + dc };
      if (this.isValidMove({ row, col }, to)) moves.push(to);
    }

    return moves;
  }

  hasAnyValidMoves() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] > 0 && this.getValidMoves(i, j).length > 0) {
          return true;
        }
      }
    }
    return false;
  }


  hasOnlyOnePeg() {
  let pegCount = 0;

  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      if (this.board[i][j] == 1 ||  this.board[i][j] == 2 ) pegCount++;
    }
  }

  // Return true if there's exactly one peg and it's in the center
  return pegCount === 1;
}

hasOnlyCenter() {
  
  let centerRow = Math.floor(this.size / 2);
  let centerCol = Math.floor(this.size / 2);

  // Return true if there's exactly one peg and it's in the center
  return  (this.board[centerRow][centerCol] == 1 || this.board[centerRow][centerCol] == 2);
}
  // Restablece el tablero al estado inicial
  reset() {
    this.board = [
      [-1, -1, 1, 2, 1, -1, -1],
      [-1, -1, 2, 1, 2, -1, -1],
      [ 1,  2, 1, 2, 1,  2,  1],
      [ 2,  1, 2, 0, 2,  1,  2],
      [ 1,  2, 1, 2, 1,  2,  1],
      [-1, -1, 2, 1, 2, -1, -1],
      [-1, -1, 1, 2, 1, -1, -1],
    ];
  }
}
