function moverCarrusel(direccion, carruselId) {
    const carrusel = document.getElementById(carruselId).querySelector('.contenedor-carrusel');
    const desplazamiento = 300; // La cantidad de desplazamiento en píxeles
    const cards = carrusel.querySelectorAll('.game-card');
  
   //  Primero, mueve el carrusel
    if (direccion === 'izquierda') {
      carrusel.scrollLeft -= desplazamiento;
    } else if (direccion === 'derecha') {
      carrusel.scrollLeft += desplazamiento;
    }
  
     //Después de mover el carrusel, aplica la animación a las cards
    cards.forEach(card => {
      card.style.animation = 'none'; // Reinicia la animación
      card.offsetHeight; // Fuerza al navegador a aplicar los cambios 
      card.style.animation = `inclinacion 0.8s ease-in-out`; // Aplica la animación
    });
}
function moverCarruselDestacado(direccion, carruselId) {
    const carrusel = document.getElementById(carruselId).querySelector('.contenedor-carruseldestacado');
    const desplazamiento = 300;  //La cantidad de desplazamiento en píxeles
    const cards = carrusel.querySelectorAll('.destacado-card');
  
    // Primero, mueve el carrusel
    if (direccion === 'izquierda') {
      carrusel.scrollLeft -= desplazamiento;
    } else if (direccion === 'derecha') {
      carrusel.scrollLeft += desplazamiento;
    }
  
     //Después de mover el carrusel, aplica la animación a las cards
    cards.forEach(card => {
      card.style.animation = 'none';  //Reinicia la animación
      card.offsetHeight;  //Fuerza al navegador a aplicar los cambios
      card.style.animation = `inclinacion 0.6s ease-in-out`;  //Aplica la animación
    });
}


const carrousel = document.getElementById("carrousel");
const images = carrousel ? carrousel.querySelectorAll('.carrousel-img-item') : [];
const prevBtn = document.querySelector(".carrousel-btn.prev");
const nextBtn = document.querySelector(".carrousel-btn.next");

let currentIndex = 0;
let isAnimating = false;

// Mostrar primera imagen
if (images.length > 0) {
    images[currentIndex].classList.add('active');
}

function changeImage(newIndex, direction) {
    if (isAnimating || !carrousel || images.length === 0) return;
    isAnimating = true;
    
    const currentImg = images[currentIndex];
    const newImg = images[newIndex];
    
    // Limpiar clases anteriores
    images.forEach(img => {
        img.classList.remove('fade-out-up', 'fade-in-up', 'fade-out-down', 'fade-in-down');
    });
    
    // Aplicar animaciones según dirección
    if (direction === 'next') {
        currentImg.classList.add('fade-out-up');
        newImg.classList.add('fade-in-up', 'active');
    } else {
        currentImg.classList.add('fade-out-down');
        newImg.classList.add('fade-in-down', 'active');
    }
    
    // Limpiar después de la animación
    setTimeout(() => {
        currentImg.classList.remove('active', 'fade-out-up', 'fade-out-down');
        currentIndex = newIndex;
        isAnimating = false;
    }, 800);
}

// Event listener para botón NEXT
if (nextBtn && carrousel) {
    nextBtn.addEventListener("click", () => {
        const nextIndex = (currentIndex + 1) % images.length;
        changeImage(nextIndex, 'next');
    });
}

// Event listener para botón PREV
if (prevBtn && carrousel) {
    prevBtn.addEventListener("click", () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        changeImage(prevIndex, 'prev');
    });
}
