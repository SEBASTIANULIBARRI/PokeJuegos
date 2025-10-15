// Game State
const gameState = {
  currentLevel: 1,
  maxLevels: 3,
  timerStarted: false,
  timerSeconds: 0,
  timerInterval: null,
  pieces: [],
  currentImage: null,
  levelTimes: [],
  helpUsed: false,
}



// Image bank
let imageBank = [
  "img/opcionesjuego/ashypikachu.jpg",
  "img/opcionesjuego/iniciales.jpg",

]


// FILTROS
const levelFilters = [
  { name: "Escala de Grises", type: "grayscale" },
  { name: "Brillo 30%", type: "brightness" },
  { name: "Negativo", type: "negative" },
]

// Elementos de canvas
let gameCanvas, gameCtx
let previewCanvas, previewCtx
let victoryCanvas, victoryCtx

// INICIALIZACIÓN DE JUEGO
window.addEventListener("DOMContentLoaded", () => {
  gameCanvas = document.getElementById("game-canvas")
  gameCtx = gameCanvas.getContext("2d")
  previewCanvas = document.getElementById("preview-canvas")
  previewCtx = previewCanvas.getContext("2d")
  victoryCanvas = document.getElementById("victory-canvas")
  victoryCtx = victoryCanvas.getContext("2d")

  // SET TAMAÑO CANVAS
  gameCanvas.width = 600
  gameCanvas.height = 600

  // evita el menu principal con el click derecho
  gameCanvas.addEventListener("contextmenu", (e) => e.preventDefault())

  // Agrega click a la lista de eventos
  gameCanvas.addEventListener("click", handleLeftClick)
  gameCanvas.addEventListener("contextmenu", handleRightClick)
})

// Funciones de navegación
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active")
  })
  document.getElementById(screenId).classList.add("active")
}


function showMainMenu() {
  showScreen("juego")
  stopTimer()
  resetGame()
}


function showInstructions() {
  showScreen("instructions")
}

function startGame() {
  resetGame()
  gameState.currentLevel = 1
  gameState.levelTimes = []
  loadLevel()
}

function nextLevel() {
  gameState.currentLevel++
  if (gameState.currentLevel > gameState.maxLevels) {
    showCompleteScreen()
  } else {
    loadLevel()
  }
}


// Logica del juego
function loadLevel() {
  showScreen("game-screen")
  stopTimer()
  gameState.timerSeconds = 0
  gameState.timerStarted = false
  gameState.helpUsed = false
  updateTimer()

  // Pasar al siguiente nivel
  document.getElementById("current-level").textContent = gameState.currentLevel

  // Seleccionar imagen random
  const randomIndex = Math.floor(Math.random() * imageBank.length)
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.src = imageBank[randomIndex]

  img.onload = () => {
    gameState.currentImage = img
    showPreview(img)
  }
}

function showPreview(img) {
  const previewContainer = document.getElementById("preview-container")
  previewContainer.classList.add("active")
  gameCanvas.style.display = "none"

  // Set Tamaño canvas
  previewCanvas.width = 600
  previewCanvas.height = 600

  // Dibujar imagen
  previewCtx.drawImage(img, 0, 0, 600, 600)

  // Cuenta regresiva
  let count = 3
  const countdownEl = document.getElementById("countdown")
  countdownEl.textContent = count

  const countdownInterval = setInterval(() => {
    count--
    if (count > 0) {
      countdownEl.textContent = count
    } else {
      clearInterval(countdownInterval)
      previewContainer.classList.remove("active")
      gameCanvas.style.display = "block"
      initializePieces(img)
    }
  }, 1000)
}

function initializePieces(img) {
  gameState.pieces = []
  const pieceSize = 300 // 600 / 2 = 300 per piece

  // Create 4 pieces (2x2 grid)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      // Random rotation (0, 90, 180, 270)
      const rotation = Math.floor(Math.random() * 4) * 90

      gameState.pieces.push({
        row,
        col,
        rotation,
        correctRotation: 0,
        sourceX: col * pieceSize,
        sourceY: row * pieceSize,
      })
    }
  }

  drawGame()
}


function drawGame() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height)

  const pieceSize = 300
  const img = gameState.currentImage

  gameState.pieces.forEach((piece) => {
    const x = piece.col * pieceSize
    const y = piece.row * pieceSize

    gameCtx.save()

    // Mover y rotar
    gameCtx.translate(x + pieceSize / 2, y + pieceSize / 2)
    gameCtx.rotate((piece.rotation * Math.PI) / 180)

    // Dibujar piezas
    gameCtx.drawImage(
      img,
      piece.sourceX,
      piece.sourceY,
      pieceSize,
      pieceSize,
      -pieceSize / 2,
      -pieceSize / 2,
      pieceSize,
      pieceSize,
    )

    gameCtx.restore()

    // Aplicar filtro
    applyFilter(x, y, pieceSize)

    // Dibujar borde
    gameCtx.strokeStyle = "#333"
    gameCtx.lineWidth = 2
    gameCtx.strokeRect(x, y, pieceSize, pieceSize)

    // Resaltar piezas correctas
    if (piece.rotation === piece.correctRotation) {
      gameCtx.strokeStyle = "#34C759"
      gameCtx.lineWidth = 4
      gameCtx.strokeRect(x + 2, y + 2, pieceSize - 4, pieceSize - 4)
    }
  })
}

function applyFilter(x, y, size) {
  const filter = levelFilters[gameState.currentLevel - 1]
  if (!filter) return

  const imageData = gameCtx.getImageData(x, y, size, size)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (filter.type === "grayscale") {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      data[i] = data[i + 1] = data[i + 2] = gray
    } else if (filter.type === "brightness") {
      data[i] = r * 0.3
      data[i + 1] = g * 0.3
      data[i + 2] = b * 0.3
    } else if (filter.type === "negative") {
      data[i] = 255 - r
      data[i + 1] = 255 - g
      data[i + 2] = 255 - b
    }
  }

  gameCtx.putImageData(imageData, x, y)
}

function handleLeftClick(e) {
  if (!gameState.timerStarted) {
    startTimer()
  }

  const piece = getPieceAtPosition(e.offsetX, e.offsetY)
  if (piece) {
    piece.rotation = (piece.rotation - 90 + 360) % 360
    drawGame()
    checkWin()
  }
}

function handleRightClick(e) {
  e.preventDefault()

  if (!gameState.timerStarted) {
    startTimer()
  }

  const piece = getPieceAtPosition(e.offsetX, e.offsetY)
  if (piece) {
    piece.rotation = (piece.rotation + 90) % 360
    drawGame()
    checkWin()
  }
}

function getPieceAtPosition(x, y) {
  const pieceSize = 300
  const col = Math.floor(x / pieceSize)
  const row = Math.floor(y / pieceSize)

  return gameState.pieces.find((p) => p.row === row && p.col === col)
}


function checkWin() {
  const allCorrect = gameState.pieces.every((piece) => piece.rotation === piece.correctRotation)

  if (allCorrect) {
    stopTimer()
    gameState.levelTimes.push(gameState.timerSeconds)
    showVictoryScreen()
  }
}

function useHelp() {
  if (gameState.helpUsed) return

  // Encontrar pieza incorrecta
  const incorrectPiece = gameState.pieces.find((piece) => piece.rotation !== piece.correctRotation)

  if (incorrectPiece) {
    incorrectPiece.rotation = incorrectPiece.correctRotation
    gameState.timerSeconds += 5
    gameState.helpUsed = true
    updateTimer()
    drawGame()
    checkWin()
  }
}


// Funcion de timers

function startTimer() {
  if (gameState.timerStarted) return

  gameState.timerStarted = true
  gameState.timerInterval = setInterval(() => {
    gameState.timerSeconds++
    updateTimer()
  }, 1000)
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval)
    gameState.timerInterval = null
  }
  gameState.timerStarted = false
}

function updateTimer() {
  const minutes = Math.floor(gameState.timerSeconds / 60)
  const seconds = gameState.timerSeconds % 60
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  document.getElementById("timer").textContent = timeString
}

function resetGame() {
  gameState.currentLevel = 1
  gameState.timerSeconds = 0
  gameState.timerStarted = false
  gameState.pieces = []
  gameState.levelTimes = []
  stopTimer()
}

// Pantallas de victoria 
function showVictoryScreen() {
  showScreen("victory-screen")

  const minutes = Math.floor(gameState.timerSeconds / 60)
  const seconds = gameState.timerSeconds % 60
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  document.getElementById("final-time").textContent = timeString

  // Dibujar imagen completa sin filtro
  victoryCanvas.width = 400
  victoryCanvas.height = 400
  victoryCtx.drawImage(gameState.currentImage, 0, 0, 400, 400)
}

// Pantalla completada
function showCompleteScreen() {
  showScreen("complete-screen")

  const levelTimesContainer = document.getElementById("level-times")
  levelTimesContainer.innerHTML = ""

  gameState.levelTimes.forEach((time, index) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

    const div = document.createElement("div")
    div.className = "level-time-item"
    div.innerHTML = `
            <span>Nivel ${index + 1} - ${levelFilters[index].name}</span>
            <span>${timeString}</span>
        `
    levelTimesContainer.appendChild(div)
  })
}

