class View {
  constructor(model, onClick) {
    this.model = model;
    this.canvas = document.getElementById("pegCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.onClick = onClick;

    // Manejo de eventos
    this.canvas.addEventListener("click", (e) => this.handleClick(e));

    // Redibujar al cambiar tamaño de la ventana
    window.addEventListener("resize", () => this.resizeAndRedraw());

    // Configuración inicial del canvas para el tamaño actual
    this.resizeCanvasForDPR();
    // Background image holders
    this.bgImage = null;
    this.bgSrc = null;
    
    // Images for different types of pokeballs
    this.ballImages = {
      1: null, // pokeball
      2: null  // superball
    };
    this.loadBallImages();
  }

  loadBallImages() {
    // Cargar Pokeball normal
    const pokeball = new Image();
    pokeball.crossOrigin = 'anonymous';
    pokeball.onload = () => { 
      this.ballImages[1] = pokeball;
      this.drawBoard(); 
    };
    pokeball.onerror = () => { 
      console.warn('No se pudo cargar la imagen de la pokebola'); 
      this.ballImages[1] = null; 
    };
    pokeball.src = 'img/ficha.png';

    // Cargar Superball
    const superball = new Image();
    superball.crossOrigin = 'anonymous';
    superball.onload = () => { 
      this.ballImages[2] = superball;
      this.drawBoard(); 
    };
    superball.onerror = () => { 
      console.warn('No se pudo cargar la imagen de la superball'); 
      this.ballImages[2] = null; 
    };
    superball.src = 'img/superball.png';
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calcular layout localmente (la View es responsable de la transformación a píxeles)
    const layout = this.computeLayout();
    const { cellSize, offsetX, offsetY } = layout;

    const col = Math.floor((x - offsetX + cellSize / 2) / cellSize);
    const row = Math.floor((y - offsetY + cellSize / 2) / cellSize);

    // Depuración: registrar coordenadas y valor de celda
    const cellVal = this.model.getCell(row, col);
    console.log(`click -> client(${Math.round(x)},${Math.round(y)}) rect(${Math.round(rect.left)},${Math.round(rect.top)}) -> cell(${row},${col}) =`, cellVal);

    if (row < 0 || col < 0 || row >= this.model.size || col >= this.model.size) return;
    this.onClick(row, col);
  }

  drawBoard(selected = null, hints = []) {
    const { ctx, model } = this;

    // Actualizar el tamaño interno del canvas si cambió el DPR o el tamaño CSS
    this.resizeCanvasForDPR();

    // Calcular layout local y limpiar usando dimensiones en píxeles CSS
    const layout = this.computeLayout();
    const { clientW, clientH, cellSize, offsetX, offsetY } = layout;
    ctx.clearRect(0, 0, clientW, clientH);

    // Dibujar imagen de fondo (cubrir TODO el canvas) si existe
    if (this.bgImage) {
      this._drawImageCover(this.bgImage, 0, 0, clientW, clientH);
    }

    // Dibujar un contorno que siga el perímetro real del tablero (forma de '+')
    // Para ello acumulamos los segmentos de borde: si una celda válida tiene
    // un vecino inválido en una dirección, dibujamos el segmento de su arista.
    const segments = [];
    const half = cellSize / 2;
    for (let i = 0; i < model.size; i++) {
      for (let j = 0; j < model.size; j++) {
        if (model.board[i][j] === -1) continue;
        const cx = j * cellSize + offsetX;
        const cy = i * cellSize + offsetY;
        const left = cx - half;
        const right = cx + half;
        const top = cy - half;
        const bottom = cy + half;

        // arriba
        if (model.board[i - 1]?.[j] === -1 || i - 1 < 0) {
          segments.push({ x1: left, y1: top, x2: right, y2: top });
        }
        // abajo
        if (model.board[i + 1]?.[j] === -1 || i + 1 >= model.size) {
          segments.push({ x1: left, y1: bottom, x2: right, y2: bottom });
        }
        // izquierda
        if (model.board[i]?.[j - 1] === -1 || j - 1 < 0) {
          segments.push({ x1: left, y1: top, x2: left, y2: bottom });
        }
        // derecha
        if (model.board[i]?.[j + 1] === -1 || j + 1 >= model.size) {
          segments.push({ x1: right, y1: top, x2: right, y2: bottom });
        }
      }
    }

    if (segments.length > 0) {
      ctx.save();
        // Color del contorno en forma de '+' según solicitud
        ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
      ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.06));
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (const s of segments) {
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Tamaños relativos a cellSize
    const holeRadius = cellSize * 0.35;
    const hintRadius = cellSize * 0.18;
    const pegRadius = cellSize * 0.40;
    const holeStroke = Math.max(1, cellSize * 0.04);

    for (let i = 0; i < model.size; i++) {
      for (let j = 0; j < model.size; j++) {
        const cell = model.board[i][j];
        if (cell === -1) continue;

        const x = j * cellSize + offsetX;
        const y = i * cellSize + offsetY;

        // hueco de fondo
        ctx.beginPath();
        ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ddd";
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = holeStroke;
        ctx.stroke();

        // resaltar movimientos posibles (puntos naranja)
        if (hints.some((h) => h.row === i && h.col === j)) {
          ctx.beginPath();
          ctx.arc(x, y, hintRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#2bff00ff";
          ctx.fill();
        }

        // resaltado de ficha seleccionada
        if (selected && selected.row === i && selected.col === j) {
          ctx.beginPath();
          ctx.arc(x, y, holeRadius + holeStroke, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(2, holeStroke * 1.2);
          ctx.strokeStyle = "#3d3d3dff";
          ctx.stroke();
          ctx.lineWidth = 1;
        }

        // dibujar ficha (diferentes tipos de pokébolas)
        if (cell > 0) {
          const ballImage = this.ballImages[cell];
          if (ballImage) {
            // Dibujar la imagen de la pokébola correspondiente centrada en la celda
            const size = pegRadius * 2; // Tamaño de la pokébola
            ctx.drawImage(
              ballImage,
              x - size/2,  // Centrar horizontalmente
              y - size/2,  // Centrar verticalmente
              size,        // Ancho
              size         // Alto
            );
          } else {
            // Fallback a círculos de diferentes colores si la imagen no está cargada
            ctx.beginPath();
            ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
            ctx.fillStyle = cell === 1 ? "#f00" : "#00f"; // Rojo para pokebola, azul para superball
            ctx.fill();
          }
        }
      }
    }
  }

  /**
   * Establece la imagen de fondo (ruta). Carga y redibuja cuando esté lista.
   */
  setBackground(src) {
    if (!src) { this.bgImage = null; this.bgSrc = null; return; }
    if (this.bgSrc === src && this.bgImage) return;
    this.bgSrc = src;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { this.bgImage = img; this.drawBoard(); };
    img.onerror = () => { console.warn('No se pudo cargar background:', src); this.bgImage = null; };
    img.src = src;
  }

  // Dibuja la imagen recortada para cubrir el área destino (comportamiento cover)
  _drawImageCover(img, dx, dy, dw, dh) {
    const iw = img.width, ih = img.height;
    const canvasRatio = dw / dh, imgRatio = iw / ih;
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (imgRatio > canvasRatio) {
      // imagen más ancha -> recortar laterales
      sh = ih;
      sw = sh * canvasRatio;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      // imagen más alta -> recortar arriba/abajo
      sw = iw;
      sh = sw / canvasRatio;
      sx = 0;
      sy = (ih - sh) / 2;
    }
    this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  showDefeat() {
    const { ctx, canvas } = this;
    const clientW = this.canvas.clientWidth;
    const clientH = this.canvas.clientHeight;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, clientW, clientH);

    // Escalar la fuente según la dimensión menor
    const size = Math.min(clientW, clientH);
    const fontSize = Math.max(16, Math.floor(size * 0.08));
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DEFEAT 😢", clientW / 2, clientH / 2);
  }

  // Ajusta el buffer del canvas para devicePixelRatio y establece transform
  resizeCanvasForDPR() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.max(1, this.canvas.clientWidth);
    const cssH = Math.max(1, this.canvas.clientHeight);
    const internalW = Math.floor(cssW * dpr);
    const internalH = Math.floor(cssH * dpr);

    if (this.canvas.width !== internalW || this.canvas.height !== internalH) {
      this.canvas.width = internalW;
      this.canvas.height = internalH;
      // Reset transform and scale so drawing uses CSS pixel units
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // Calcula y devuelve layout (en píxeles CSS) sin modificar el model
  computeLayout() {
    const clientW = this.canvas.clientWidth;
    const clientH = this.canvas.clientHeight;
    const boardSize = Math.min(clientW, clientH);
    const cellSize = boardSize / this.model.size;
    const offsetX = (clientW - boardSize) / 2 + cellSize / 2;
    const offsetY = (clientH - boardSize) / 2 + cellSize / 2;
    return { clientW, clientH, boardSize, cellSize, offsetX, offsetY };
  }

  // Redimensiona el canvas y redibuja
  resizeAndRedraw() {
    this.resizeCanvasForDPR();
    // El controlador/llamador decide cuándo dibujar; aquí forzamos un redraw
    this.drawBoard();
  }
}
