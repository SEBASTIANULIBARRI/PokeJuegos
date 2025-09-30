// Función para simular la carga y redirección
function simularCargaYRedireccionar(event) {
    event.preventDefault(); // Evitar la redirección inmediata del enlace
  
    document.getElementById('loading-screen').style.display = 'flex';

    let porcentaje = 0;
    let loadingInterval = setInterval(function() {
      porcentaje += 2; 
      document.getElementById('loading-porcentage').textContent = porcentaje + '%';

      if (porcentaje >= 100) {
        clearInterval(loadingInterval); 
        window.location.href = 'home.html';
      }
    }, 100);
  }
  
  // Event listeners para los botones
  document.getElementById('btn-login').addEventListener('click', simularCargaYRedireccionar);
  document.getElementById('google').addEventListener('click', simularCargaYRedireccionar);
  document.getElementById('facebook').addEventListener('click', simularCargaYRedireccionar);