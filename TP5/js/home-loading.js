// Script para mostrar el spinner de carga al cargar la página home
;(() => {
  // Mostrar la pantalla de carga inmediatamente
  const loadingScreen = document.getElementById("loading-screen")
  const loadingPorcentage = document.getElementById("loading-porcentage")

  if (loadingScreen && loadingPorcentage) {
    loadingScreen.style.display = "flex"

    let porcentaje = 0
    const loadingInterval = setInterval(() => {
      porcentaje += 5 // Incrementa más rápido para una carga más fluida
      loadingPorcentage.textContent = porcentaje + "%"

      if (porcentaje >= 100) {
        clearInterval(loadingInterval)
        // Ocultar el spinner después de completar
        setTimeout(() => {
          loadingScreen.style.display = "none"
        }, 300) // Pequeño delay para que se vea el 100%
      }
    }, 50) // Actualiza cada 50ms para una animación suave
  }
})()

