class Model {
  constructor() {
    this.size = 7;
    this.cellSize = 60;
    this.offset = 30;

    // -1 = invalid, 1 = peg, 0 = empty
    this.board = [
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
      [ 1,  1, 1, 1, 1,  1,  1],
      [ 1,  1, 1, 0, 1,  1,  1],
      [ 1,  1, 1, 1, 1,  1,  1],
      [-1, -1, 1, 1, 1, -1, -1],
      [-1, -1, 1, 1, 1, -1, -1],
    ];
  }

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
      return (
        this.getCell(from.row, from.col) === 1 &&
        this.getCell(midRow, midCol) === 1 &&
        this.getCell(to.row, to.col) === 0
      );
    }
    return false;
  }

  makeMove(from, to) {
    const midRow = (from.row + to.row) / 2;
    const midCol = (from.col + to.col) / 2;
    this.setCell(from.row, from.col, 0);
    this.setCell(midRow, midCol, 0);
    this.setCell(to.row, to.col, 1);
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
        if (this.board[i][j] === 1 && this.getValidMoves(i, j).length > 0) {
          return true;
        }
      }
    }
    return false;
  }
}
