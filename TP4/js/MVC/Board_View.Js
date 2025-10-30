class View {
  constructor(model, onClick, callbacks) {
    this.model = model;
    this.canvas = document.getElementById("pegCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.onClick = onClick;
    // Callbacks opcionales para arrastre
    callbacks = callbacks || {};
    this.onDragStart = callbacks.onDragStart || null;
    this.onDragMove = callbacks.onDragMove || null;
    this.onDragEnd = callbacks.onDragEnd || null;

  // Manejo de eventos
  this.canvas.addEventListener("click", (e) => this.handleClick(e));
  // Eventos pointer para arrastrar/soltar (compatibles con mouse y táctil)
  this.canvas.addEventListener('pointerdown', (e) => this._onPointerDown(e));
  window.addEventListener('pointermove', (e) => this._onPointerMove(e));
  window.addEventListener('pointerup', (e) => this._onPointerUp(e));
  this.canvas.addEventListener('pointercancel', (e) => this._onPointerCancel(e));

    // Redibujar al cambiar tamaño de la ventana
    window.addEventListener("resize", () => this.resizeAndRedraw());

    // Configuración inicial del canvas para el tamaño actual
    this.resizeCanvasForDPR();
  // Contenedores de imagen de fondo
  this.bgImage = null;
  this.bgSrc = null;
    
    // Imágenes para los diferentes tipos de pokébolas
    this.ballImages = {
      1: null, // pokeball
      2: null  // superball
    };
    this.loadBallImages();

    // Factor de padding vertical (fracción de la altura del canvas)
    // Ajusta este valor para dejar más o menos espacio arriba/abajo
    this.verticalPaddingFactor = 0.06; // 6% por defecto

    // Estado de arrastre interno de la View
    this._dragging = null; // { fromRow, fromCol, type, clientX, clientY, offsetX, offsetY, pointerId }
    this._dragOver = null; // { row, col, valid }
    this._suppressClick = false; // evita doble-trigger entre click y pointer
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
    if (this._suppressClick) return; // si fue parte de un drag, ignorar el click
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

  // --- Pointer / drag helpers ---
  _pointToCell(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const layout = this.computeLayout();
    const { cellSize, offsetX, offsetY } = layout;
    const col = Math.floor((x - offsetX + cellSize / 2) / cellSize);
    const row = Math.floor((y - offsetY + cellSize / 2) / cellSize);
    return { row, col, localX: x, localY: y };
  }

  _onPointerDown(e) {
    const p = this._pointToCell(e.clientX, e.clientY);
    const row = p.row, col = p.col;
    const cellVal = this.model.getCell(row, col);
    if (cellVal > 0) {
      // iniciar arrastre
      try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
      this._dragging = {
        fromRow: row,
        fromCol: col,
        type: cellVal,
        clientX: e.clientX,
        clientY: e.clientY,
        localX: p.localX,
        localY: p.localY,
        pointerId: e.pointerId
      };
  this._suppressClick = true;
  if (this.onDragStart) this.onDragStart(row, col, e.clientX, e.clientY);
      e.preventDefault();
    }
  }

  _onPointerMove(e) {
    if (!this._dragging) return;
    if (e.pointerId !== this._dragging.pointerId) return;
    // actualizar posición y avisar al controller
    const p = this._pointToCell(e.clientX, e.clientY);
    this._dragging.clientX = e.clientX;
    this._dragging.clientY = e.clientY;
    this._dragging.localX = p.localX;
    this._dragging.localY = p.localY;
  // comunicar candidato (el Controller realizará el redraw con los hints correctos)
  if (this.onDragMove) this.onDragMove(e.clientX, e.clientY, p.row, p.col);
    e.preventDefault();
  }

  _onPointerUp(e) {
    if (!this._dragging) return;
    if (e.pointerId !== this._dragging.pointerId) return;
    const p = this._pointToCell(e.clientX, e.clientY);
    // Limpiar estado de arrastre antes de notificar al Controller para evitar que
    // el 'ghost' se pinte durante el redraw que haga el Controller.
    try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    this._dragging = null;
    this._dragOver = null;
    // permitir al click siguiente funcionar (dejarlo reiniciarse en next tick)
    setTimeout(() => { this._suppressClick = false; }, 0);
    if (this.onDragEnd) this.onDragEnd(e.clientX, e.clientY, p.row, p.col);
    e.preventDefault();
  }

  _onPointerCancel(e) {
    if (!this._dragging) return;
    if (e.pointerId !== this._dragging.pointerId) return;
  try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
  this._dragging = null;
  this._dragOver = null;
  setTimeout(() => { this._suppressClick = false; }, 0);
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
    const hintRadius = cellSize * 0.15;
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

        // resaltar movimientos posibles (puntos verdes)
        if (hints.some((h) => h.row === i && h.col === j)) {
          ctx.beginPath();
          ctx.arc(x, y, hintRadius, 0, Math.PI * 2);
          // Usar rgba para compatibilidad amplia (evitar 8-char hex que algunos contextos no soportan)
          ctx.fillStyle = "rgba(78,240,45,0.95)";
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
        // Si estamos arrastrando y esta es la ficha origen, no la dibujamos aquí (se dibuja como 'ghost')
        if (cell > 0 && !(this._dragging && this._dragging.fromRow === i && this._dragging.fromCol === j)) {
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

  // Si hay un candidato de arrastre (dragOver) lo pintamos como hint grande
    if (this._dragOver && this._dragOver.row != null) {
      const r = this._dragOver.row, c = this._dragOver.col;
      if (r >= 0 && c >= 0 && r < model.size && c < model.size && model.getCell(r, c) === 0) {
        const x = c * cellSize + offsetX;
        const y = r * cellSize + offsetY;
        ctx.beginPath();
        ctx.arc(x, y, hintRadius * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = this._dragOver.valid ? "rgba(78,240,45,0.95)" : "rgba(255,0,0,0.6)";
        ctx.fill();
      }
    }

  // Dibujar ficha fantasma mientras se arrastra
    if (this._dragging) {
      const drag = this._dragging;
      // coordenadas locales en canvas (CSS px)
      const rect = this.canvas.getBoundingClientRect();
      const lx = drag.clientX - rect.left;
      const ly = drag.clientY - rect.top;
      const ballImage = this.ballImages[drag.type];
      const size = pegRadius * 2;
      ctx.save();
        ctx.globalAlpha = 0.95;
        if (ballImage) {
          ctx.drawImage(ballImage, lx - size/2, ly - size/2, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(lx, ly, pegRadius, 0, Math.PI * 2);
          ctx.fillStyle = drag.type === 1 ? "#f00" : "#00f";
          ctx.fill();
        }
      ctx.restore();
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
  // Restablecer transform y escalar para que el dibujo use unidades de píxeles CSS
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // Calcula y devuelve layout (en píxeles CSS) sin modificar el model
  computeLayout() {
    const clientW = this.canvas.clientWidth;
    const clientH = this.canvas.clientHeight;
    // Reservar un padding vertical para que los bordes se vean mejor
    const verticalPadding = Math.floor(clientH * (this.verticalPaddingFactor || 0));
    // Ajustar tamaño del tablero restando el padding superior e inferior
    const boardSize = Math.min(clientW, Math.max(0, clientH - 2 * verticalPadding));
    const cellSize = boardSize / this.model.size;
    const offsetX = (clientW - boardSize) / 2 + cellSize / 2;
    // El offsetY comienza en verticalPadding + medio celda para centrar la primera ficha
    const offsetY = verticalPadding + cellSize / 2;
    return { clientW, clientH, boardSize, cellSize, offsetX, offsetY, verticalPadding };
  }

  // Redimensiona el canvas y redibuja
  resizeAndRedraw() {
    this.resizeCanvasForDPR();
    // El controlador/llamador decide cuándo dibujar; aquí forzamos un redraw
    this.drawBoard();
  }
}
