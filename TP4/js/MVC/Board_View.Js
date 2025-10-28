class View {
  constructor(model, onClick) {
    this.model = model;
    this.canvas = document.getElementById("pegCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.onClick = onClick;

    this.canvas.addEventListener("click", (e) => this.handleClick(e));
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / this.model.cellSize);
    const row = Math.floor(y / this.model.cellSize);
    this.onClick(row, col);
  }

  drawBoard(selected = null, hints = []) {
    const { ctx, model } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < model.size; i++) {
      for (let j = 0; j < model.size; j++) {
        const cell = model.board[i][j];
        if (cell === -1) continue;

        const x = j * model.cellSize + model.offset;
        const y = i * model.cellSize + model.offset;

        // background hole
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fillStyle = "#ddd";
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.stroke();

        // highlight possible moves (orange dots)
        if (hints.some((h) => h.row === i && h.col === j)) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = "orange";
          ctx.fill();
        }

        // selected peg highlight
        if (selected && selected.row === i && selected.col === j) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = "orange";
          ctx.stroke();
          ctx.lineWidth = 1;
        }

        // draw peg
        if (cell === 1) {
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fillStyle = "#3366cc";
          ctx.fill();
        }
      }
    }
  }

  showDefeat() {
    const { ctx, canvas } = this;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("DEFEAT 😢", canvas.width / 2, canvas.height / 2);
  }
}
