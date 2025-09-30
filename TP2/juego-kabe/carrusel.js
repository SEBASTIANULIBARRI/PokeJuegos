function moverCarrusel(direccion, carruselId) {
    const carrusel = document.getElementById(carruselId).querySelector('.contenedor-carrusel');
    const desplazamiento = 300; // La cantidad de desplazamiento en píxeles
    const cards = carrusel.querySelectorAll('.game-card');
  
    // Primero, mueve el carrusel
    if (direccion === 'izquierda') {
      carrusel.scrollLeft -= desplazamiento;
    } else if (direccion === 'derecha') {
      carrusel.scrollLeft += desplazamiento;
    }
  
    // Después de mover el carrusel, aplica la animación a las cards
    cards.forEach(card => {
      card.style.animation = 'none'; // Reinicia la animación
      card.offsetHeight; // Fuerza al navegador a aplicar los cambios 
      card.style.animation = `inclinacion 0.8s ease-in-out`; // Aplica la animación
    });
  }
  
