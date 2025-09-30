// === PROFILE DROPDOWN ===
document.addEventListener('DOMContentLoaded', function() {
  const profileIcon = document.querySelector('.icon-profile');
  const profileMenu = document.querySelector('.profile-menu');
  if (profileIcon && profileMenu) {
    profileIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
    });
    document.addEventListener('click', function(e) {
      if (!profileMenu.contains(e.target) && e.target !== profileIcon) {
        profileMenu.style.display = 'none';
      }
    });
  }
});

// === SIDEBAR CATEGORIAS ===
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebarCategorias');
  const openBtn = document.querySelector('.hamburguesa-icon');
  const closeBtn = document.getElementById('closeSidebar');
  if (sidebar && openBtn && closeBtn) {
    openBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.add('abierta');
    });
    closeBtn.addEventListener('click', function(e) {
      sidebar.classList.remove('abierta');
    });
    // Cerrar sidebar al hacer click fuera
    document.addEventListener('click', function(e) {
      if (sidebar.classList.contains('abierta') && !sidebar.contains(e.target) && !openBtn.contains(e.target)) {
        sidebar.classList.remove('abierta');
      }
    });
  }
});

const body = document.getElementsByClassName("categorias")[0];
body.classList.add("as");

function obtenerDatos () {
  
  fetch('https://vj.interfaces.jima.com.ar/api')
  .then(response => response.json())
  .then(games => {
   
//  let filtrados = games.filter(juego =>
//  juego.genres.some(g => g.name === "Puzzle"));     Para filtrar las categorias
//  console.log(filtrados);

  // Extraer todos los géneros de todos los juegos
  let todosLosGeneros = games.flatMap(j => j.genres);

// Quitar duplicados usando un Map por id
  let generosUnicos = Array.from(
    new Map(todosLosGeneros.map(g => [g.id, g])).values()
  );

  console.log(generosUnicos); // PARA EL MENU


  

    console.log('Juegos disponibles:', games);
    // Procesar la lista de juegos
   
    let contador = 0;
    let grupo = 1;
    games.forEach(game => {
      if (contador==0 ) {
        let div = `
        <div class="grupo-tarjetas grupo_${grupo}">

        </div>
        `
        body.innerHTML += div

      }
      
      let div_actual = document.getElementsByClassName(`grupo_${grupo}`)[0];

      let tarjeta = 
        `
        <article class="tarjeta">
           <div class="image_container">
               <img src="${game.background_image}" alt="${game.name}">
           </div>
           <h2 class="nombre-juego">${game.name}</h2>
           <span>Rating: ${game.rating}</span>
        </article>
        `;
        contador++;
        div_actual.innerHTML += tarjeta;
        console.log(contador)
        if(contador == 5 ) 
          {
            contador = 0;
            grupo ++
          }

    });
  })
  .catch(error => {
    console.error('Error al obtener los juegos:', error);
  });
  
}

obtenerDatos();