// Función para simular la carga y redirección
function startLoadingAndRedirect() {
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

const loginForm = document.getElementById('loginForm');
const googleBtn = document.getElementById('google');
const facebookBtn = document.getElementById('facebook');

if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    // Allow browser validation to run
    if (!loginForm.checkValidity()) return;

    e.preventDefault();
    startLoadingAndRedirect();
  });
}

if (googleBtn) googleBtn.addEventListener('click', function(e){ e.preventDefault(); startLoadingAndRedirect(); });
if (facebookBtn) facebookBtn.addEventListener('click', function(e){ e.preventDefault(); startLoadingAndRedirect(); });