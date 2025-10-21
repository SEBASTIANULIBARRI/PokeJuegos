// Game State
let currentLevel = 1
let currentImage = null
let pieces = []
let timerInterval = null
let startTime = 0
let elapsedTime = 0
let helpUsed = false

// Image bank
const imageBank = [
  "/images/virtual-backgrounds/abstract.png",
  "/vibrant-nature-landscape-mountains.jpg",
  "/modern-architecture-building.png",
  "/colorful-street-art-mural.jpg",
  "/serene-ocean-sunset-view.jpg",
  "/futuristic-city-skyline-night.jpg",
  "/tropical-beach-palm-trees.jpg",
  "/mountain-lake-reflection-scenery.jpg",
]

// Level configurations
const levels = [
  { name: "Nivel 1", filter: "grayscale" },
  { name: "Nivel 2", filter: "brightness" },
  { name: "Nivel 3", filter: "negative" },
]

// Initialize game
function init() {
  console.log("[v0] Initializing BLOCKA game")

  // Menu buttons
  document.getElementById("start-btn").addEventListener("click", startGame)
  document.getElementById("instructions-btn").addEventListener("click", showInstructions)
  document.getElementById("back-to-menu-btn").addEventListener("click", showMenu)

  // Game buttons
  document.getElementById("help-btn").addEventListener("click", useHelp)
  document.getElementById("quit-btn").addEventListener("click", showMenu)
  document.getElementById("next-level-btn").addEventListener("click", nextLevel)
  document.getElementById("menu-btn").addEventListener("click", showMenu)
}

// Screen management
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active")
  })
  document.getElementById(screenId).classList.add("active")
}

function showMenu() {
  showScreen("menu-screen")
  stopTimer()
  currentLevel = 1
}

function showInstructions() {
  showScreen("instructions-screen")
}

// Start game
function startGame() {
  console.log("[v0] Starting game at level", currentLevel)
  currentImage = imageBank[Math.floor(Math.random() * imageBank.length)]
  showPreview()
}

// Preview screen
function showPreview() {
  showScreen("preview-screen")
  document.getElementById("preview-level-title").textContent = levels[currentLevel - 1].name

  const canvas = document.getElementById("preview-canvas")
  const ctx = canvas.getContext("2d")
  const img = new Image()
  img.crossOrigin = "anonymous"

  img.onload = () => {
    canvas.width = 500
    canvas.height = 500
    ctx.drawImage(img, 0, 0, 500, 500)
    startCountdown()
  }

  img.src = currentImage
}

function startCountdown() {
  let count = 3
  const countdownEl = document.getElementById("countdown")
  countdownEl.textContent = count

  const countdownInterval = setInterval(() => {
    count--
    if (count > 0) {
      countdownEl.textContent = count
    } else {
      clearInterval(countdownInterval)
      initGameBoard()
    }
  }, 1000)
}

// Game board
function initGameBoard() {
  showScreen("game-screen")
  document.getElementById("level-display").textContent = levels[currentLevel - 1].name
  helpUsed = false
  document.getElementById("help-btn").disabled = false

  // Create pieces
  pieces = [
    { id: 0, rotation: getRandomRotation(), correctRotation: 0, x: 0, y: 0 },
    { id: 1, rotation: getRandomRotation(), correctRotation: 0, x: 1, y: 0 },
    { id: 2, rotation: getRandomRotation(), correctRotation: 0, x: 0, y: 1 },
    { id: 3, rotation: getRandomRotation(), correctRotation: 0, x: 1, y: 1 },
  ]

  renderGameBoard()
  startTimer()
}

function getRandomRotation() {
  const rotations = [0, 90, 180, 270]
  return rotations[Math.floor(Math.random() * rotations.length)]
}

function renderGameBoard() {
  const board = document.getElementById("game-board")
  board.innerHTML = ""

  const img = new Image()
  img.crossOrigin = "anonymous"

  img.onload = () => {
    pieces.forEach((piece) => {
      const container = document.createElement("div")
      container.className = "piece-container"
      if (piece.rotation === piece.correctRotation) {
        container.classList.add("correct")
      }

      const canvas = document.createElement("canvas")
      canvas.className = "piece-canvas"
      canvas.width = 300
      canvas.height = 300

      const indicator = document.createElement("div")
      indicator.className = "rotation-indicator"
      indicator.textContent = `${piece.rotation}°`

      container.appendChild(canvas)
      container.appendChild(indicator)
      board.appendChild(container)

      // Draw piece
      drawPiece(canvas, img, piece)

      // Add click events
      canvas.addEventListener("click", (e) => {
        e.preventDefault()
        rotatePiece(piece, -90)
      })

      canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault()
        rotatePiece(piece, 90)
      })
    })
  }

  img.src = currentImage
}

function drawPiece(canvas, img, piece) {
  const ctx = canvas.getContext("2d")
  const size = 300
  const halfSize = size / 2

  // Clear canvas
  ctx.clearRect(0, 0, size, size)

  // Save context
  ctx.save()

  // Rotate around center
  ctx.translate(halfSize, halfSize)
  ctx.rotate((piece.rotation * Math.PI) / 180)
  ctx.translate(-halfSize, -halfSize)

  // Draw image piece
  const sourceX = piece.x * (img.width / 2)
  const sourceY = piece.y * (img.height / 2)
  const sourceWidth = img.width / 2
  const sourceHeight = img.height / 2

  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size)

  // Apply filter
  applyFilter(ctx, size)

  // Restore context
  ctx.restore()
}

function applyFilter(ctx, size) {
  const filter = levels[currentLevel - 1].filter
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (filter === "grayscale") {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      data[i] = data[i + 1] = data[i + 2] = gray
    } else if (filter === "brightness") {
      data[i] = r * 0.3
      data[i + 1] = g * 0.3
      data[i + 2] = b * 0.3
    } else if (filter === "negative") {
      data[i] = 255 - r
      data[i + 1] = 255 - g
      data[i + 2] = 255 - b
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function rotatePiece(piece, degrees) {
  piece.rotation = (piece.rotation + degrees + 360) % 360
  renderGameBoard()
  checkVictory()
}

// Help feature
function useHelp() {
  if (helpUsed) return

  // Find first incorrect piece
  const incorrectPiece = pieces.find((p) => p.rotation !== p.correctRotation)
  if (incorrectPiece) {
    incorrectPiece.rotation = incorrectPiece.correctRotation
    helpUsed = true
    document.getElementById("help-btn").disabled = true

    // Add 5 seconds penalty
    elapsedTime += 5000

    renderGameBoard()
    checkVictory()
  }
}

// Timer
function startTimer() {
  startTime = Date.now() - elapsedTime
  timerInterval = setInterval(updateTimer, 100)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function updateTimer() {
  elapsedTime = Date.now() - startTime
  const seconds = Math.floor(elapsedTime / 1000)
  const minutes = Math.floor(seconds / 60)
  const displaySeconds = seconds % 60

  document.getElementById("timer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`
}

// Victory check
function checkVictory() {
  const allCorrect = pieces.every((p) => p.rotation === p.correctRotation)

  if (allCorrect) {
    stopTimer()
    showVictory()
  }
}

function showVictory() {
  showScreen("victory-screen")

  const seconds = Math.floor(elapsedTime / 1000)
  const minutes = Math.floor(seconds / 60)
  const displaySeconds = seconds % 60

  document.getElementById("final-time").textContent =
    `Tiempo: ${String(minutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`

  if (currentLevel < 3) {
    document.getElementById("victory-message").textContent = `¡Has completado el ${levels[currentLevel - 1].name}!`
    document.getElementById("next-level-btn").style.display = "block"
  } else {
    document.getElementById("victory-message").textContent = "¡Has completado todos los niveles!"
    document.getElementById("next-level-btn").style.display = "none"
  }

  // Draw complete image without filter
  const canvas = document.getElementById("victory-canvas")
  const ctx = canvas.getContext("2d")
  const img = new Image()
  img.crossOrigin = "anonymous"

  img.onload = () => {
    canvas.width = 500
    canvas.height = 500
    ctx.drawImage(img, 0, 0, 500, 500)
  }

  img.src = currentImage
}

function nextLevel() {
  currentLevel++
  elapsedTime = 0
  currentImage = imageBank[Math.floor(Math.random() * imageBank.length)]
  showPreview()
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}