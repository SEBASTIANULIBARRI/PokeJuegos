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
function moverCarruselDestacado(direccion, carruselId) {
    const carrusel = document.getElementById(carruselId).querySelector('.contenedor-carruseldestacado');
    const desplazamiento = 300; // La cantidad de desplazamiento en píxeles
    const cards = carrusel.querySelectorAll('.destacado-card');
  
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
      card.style.animation = `inclinacion 0.2s ease-in-out`; // Aplica la animación
    });
}

const carrousel = document.getElementById("carrousel");
const prevBtn = document.querySelector(".carrousel-btn.prev");
const nextBtn = document.querySelector(".carrousel-btn.next");

let index = 0;

function showSlide() {
    const width = carrousel.clientWidth; 
    carrousel.style.transform = `translateX(${-index * width}px)`;
}

nextBtn.addEventListener("click", () => {
    if (index < carrousel.children.length - 1) {
        index++;
    } else {
        index = 0; // vuelve al inicio
    }
    showSlide();
});

prevBtn.addEventListener("click", () => {
    if (index > 0) {
        index--;
    } else {
        index = carrousel.children.length - 1; // vuelve al final
    }
    showSlide();
});

window.addEventListener("resize", showSlide);



  
  
