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
  "img/opcionesjuego/pikachu.jpg",
  "img/opcionesjuego/pokelegen.jpg",
  "img/opcionesjuego/pokemon.webp",
  "img/opcionesjuego/pokemones.jpg",
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

const CANVAS_SIZE = 600

// INICIALIZACIÓN DE JUEGO
window.addEventListener("DOMContentLoaded", () => {
  gameCanvas = document.getElementById("game-canvas")
  gameCtx = gameCanvas.getContext("2d")
  previewCanvas = document.getElementById("preview-canvas")
  previewCtx = previewCanvas.getContext("2d")
  victoryCanvas = document.getElementById("victory-canvas")
  victoryCtx = victoryCanvas.getContext("2d")

  // Asegurar que el canvas interno coincida con el tamaño que usamos (evita zoom)
  gameCanvas.width = CANVAS_SIZE
  gameCanvas.height = CANVAS_SIZE
  gameCanvas.style.width = CANVAS_SIZE + "px"
  gameCanvas.style.height = CANVAS_SIZE + "px"

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
  console.log(gameState.currentLevel)
  gameState.currentLevel++
  if(gameState.currentLevel == gameState.maxLevels ) document.getElementById("nextLevel").textContent = "Ver resultados" 
  if (gameState.currentLevel > gameState.maxLevels) {
    showCompleteScreen()
  } else {
    loadLevel()
  }
}
//CARROUSEL 
function startImageCarousel(imageArray, totalDuration = 5000, startInterval = 150, endInterval = 900) {
  return new Promise((resolve) => {
    const canvas = document.getElementById("game-canvas")
    const ctx = canvas.getContext("2d")
    const canvasSize = CANVAS_SIZE

    let elapsed = 0
    let currentInterval = startInterval
    let finalIndex = Math.floor(Math.random() * imageArray.length) // ya definimos el ganador
    let finalImage = null

    function drawImage(img) {
      ctx.clearRect(0, 0, canvasSize, canvasSize)
      const size = Math.min(img.width, img.height)
      const cropX = (img.width - size) / 2
      const cropY = (img.height - size) / 2
      ctx.drawImage(img, cropX, cropY, size, size, 0, 0, canvasSize, canvasSize)
    }

    function nextImage() {
      const index = Math.floor(Math.random() * imageArray.length)
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageArray[index]

      img.onload = () => {
        drawImage(img)
      }

      elapsed += currentInterval
      if (elapsed < totalDuration) {
        const progress = elapsed / totalDuration
        currentInterval = startInterval + (endInterval - startInterval) * progress
        setTimeout(nextImage, currentInterval)
      } else {
        // Cargar y mostrar la imagen final elegida
        const finalImg = new Image()
        finalImg.crossOrigin = "anonymous"
        finalImg.src = imageArray[finalIndex]

        finalImg.onload = () => {
          finalImage = finalImg
          animateFinalImage(finalImg, ctx, canvasSize, () => {
            resolve(finalIndex) // devolvemos el índice ganador
          })
        }
      }
    }

    nextImage()
  })
}
function animateFinalImage(img, ctx, canvasSize, resolve) {
  const size = Math.min(img.width, img.height)
  const cropX = (img.width - size) / 2
  const cropY = (img.height - size) / 2

  let scale = 1
  const maxScale = 1.15
  const steps = 20
  const flashSteps = 6
  let step = 0

  function animate() {
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Efecto de zoom suave
    const drawSize = canvasSize * scale
    const offset = (canvasSize - drawSize) / 2
    ctx.drawImage(img, cropX, cropY, size, size, offset, offset, drawSize, drawSize)

    // Flash intermitente al final
    if (step > steps - flashSteps) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(step % 2) * 0.5})`
      ctx.fillRect(0, 0, canvasSize, canvasSize)
    }

    if (step < steps) {
      scale += (maxScale - 1) / steps
      step++
      requestAnimationFrame(animate)
    } else {
      resolve()
    }
  }

  animate()
}


function loadLevel() {
  showScreen("game-screen")
  stopTimer()
  gameState.timerSeconds = 0
  gameState.timerStarted = false
  gameState.helpUsed = false
  updateTimer()

  document.getElementById("current-level").textContent = gameState.currentLevel

  // INICIAR CARRUSEL
  startImageCarousel(imageBank, 5000, 150, 900).then((finalIndex) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageBank[finalIndex]

    img.onload = () => {
      gameState.currentImage = img

      // Calcular recorte central
      const cropSize = Math.min(img.width, img.height)
      const cropX = Math.floor((img.width - cropSize) / 2)
      const cropY = Math.floor((img.height - cropSize) / 2)
      gameState.imageCrop = { cropX, cropY, cropSize }

      showPreview(img)
    }
  })
}
/*// Logica del juego
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

    // Calcular recorte central cuadrado en la imagen original (para evitar estirar)
    const cropSize = Math.min(img.width, img.height)
    const cropX = Math.floor((img.width - cropSize) / 2)
    const cropY = Math.floor((img.height - cropSize) / 2)
    gameState.imageCrop = { cropX, cropY, cropSize }

    showPreview(img)
  }
}*/

function showPreview(img) {
  const previewContainer = document.getElementById("preview-container")
  previewContainer.classList.add("active")
  gameCanvas.style.display = "none"

  // Set Tamaño canvas
  previewCanvas.width = CANVAS_SIZE
  previewCanvas.height = CANVAS_SIZE
  previewCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // Usar recorte central para ajustar la imagen sin estirar/zoomear
  const { cropX, cropY, cropSize } = gameState.imageCrop || { cropX: 0, cropY: 0, cropSize: Math.min(img.width, img.height) }
  previewCtx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

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

  // Tamaño destino de cada pieza en canvas
  const pieceSize = gameCanvas.width / 2

  // Tamaño de fuente por pieza en la imagen original (usar recorte central)
  const { cropSize } = gameState.imageCrop
  const sourcePieceSize = cropSize / 2

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
        // coordenadas en la imagen original recortada
        sourceX: col * sourcePieceSize,
        sourceY: row * sourcePieceSize,
        sourceSize: sourcePieceSize,
        destSize: pieceSize,
      })
    }
  }

  drawGame()
}


function drawGame() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height)

  const img = gameState.currentImage
  const { cropX, cropY } = gameState.imageCrop

  gameState.pieces.forEach((piece) => {
    const pieceSize = piece.destSize
    const x = piece.col * pieceSize
    const y = piece.row * pieceSize

    gameCtx.save()

    // Mover y rotar
    gameCtx.translate(x + pieceSize / 2, y + pieceSize / 2)
    gameCtx.rotate((piece.rotation * Math.PI) / 180)

    // Dibujar pieza usando las coordenadas en la imagen original recortada
    gameCtx.drawImage(
      img,
      cropX + piece.sourceX,
      cropY + piece.sourceY,
      piece.sourceSize,
      piece.sourceSize,
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

  const piece = getPieceAtPosition(e)
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

  const piece = getPieceAtPosition(e)
  if (piece) {
    piece.rotation = (piece.rotation + 90) % 360
    drawGame()
    checkWin()
  }
}

function getPieceAtPosition(e) {
  // Convertir coordenadas del evento al sistema de coordenadas interno del canvas
  const rect = gameCanvas.getBoundingClientRect()
  const scaleX = gameCanvas.width / rect.width
  const scaleY = gameCanvas.height / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY

  const pieceSize = gameCanvas.width / 2
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
  if(minutes >= 2 ){
    showDefeatScreen() 
    stopTimer()
  }
}

function resetGame() {
  gameState.currentLevel = 1
  gameState.timerSeconds = 0
  gameState.timerStarted = false
  gameState.pieces = []
  gameState.levelTimes = []
  stopTimer()
}

//Retry
function retryLevel() {
  stopTimer()
  gameState.timerSeconds = 0
  gameState.timerStarted = false
  gameState.helpUsed = false
  showScreen("game-screen")
  loadLevel()
}


// Pantallas de victoria 
function showVictoryScreen() {
  showScreen("victory-screen")

  const minutes = Math.floor(gameState.timerSeconds / 60)
  const seconds = gameState.timerSeconds % 60
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  document.getElementById("final-time").textContent = timeString

  // Dibujar imagen completa sin filtro usando el recorte central
  const { cropX, cropY, cropSize } = gameState.imageCrop
  victoryCanvas.width = 400
  victoryCanvas.height = 400
  victoryCtx.clearRect(0, 0, 400, 400)
  victoryCtx.drawImage(gameState.currentImage, cropX, cropY, cropSize, cropSize, 0, 0, 400, 400)
}

//defeat
function showDefeatScreen() {
  showScreen("defeat-screen")

  // Calcular tiempo final
  const minutes = Math.floor(gameState.timerSeconds / 60)
  const seconds = gameState.timerSeconds % 60
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  document.getElementById("defeat-time").textContent = timeString

  // Dibujar imagen en escala de grises para indicar derrota
  const { cropX, cropY, cropSize } = gameState.imageCrop
  const defeatCanvas = document.getElementById("defeat-canvas")
  const defeatCtx = defeatCanvas.getContext("2d")

  defeatCanvas.width = 400
  defeatCanvas.height = 400
  defeatCtx.clearRect(0, 0, 400, 400)

  defeatCtx.filter = "grayscale(100%) brightness(50%)"
  defeatCtx.drawImage(gameState.currentImage, cropX, cropY, cropSize, cropSize, 0, 0, 400, 400)
  defeatCtx.filter = "none"

  // Texto “DERROTA” superpuesto
  defeatCtx.font = "bold 48px sans-serif"
  defeatCtx.fillStyle = "rgba(255, 0, 0, 0.8)"
  defeatCtx.textAlign = "center"
  defeatCtx.fillText("DERROTA", 200, 220)
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

