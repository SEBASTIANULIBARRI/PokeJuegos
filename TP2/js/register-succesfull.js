let registerBtn = document.getElementById('registrarse-btn');
let checkbox = document.getElementById('termsCheckbox');
let changeDiv = document.querySelector('.ya-tienes-cuenta');
let successMessage = document.getElementById('successMessage');
let loadingScreen = document.getElementById('loading-screen');
let loadingPorcentage = document.getElementById('loading-porcentage');
let spinner = document.querySelector('.spinner');

// Mostrar/ocultar botón de registro dependiendo del checkbox
checkbox.addEventListener('change', function () {
    if (this.checked) {
        registerBtn.disabled = false;  // Activa el botón de registro
        changeDiv.style.display = 'none';     // Oculta el mensaje de términos
    } else {
        registerBtn.disabled = true;   // Oculta el botón si no se acepta
        changeDiv.style.display = 'flex';    // Muestra el mensaje de términos
    }
});

// Manejar el clic en el botón de registro
registerBtn.addEventListener('click', function(event) {
    event.preventDefault();  // Prevenir comportamiento predeterminado del botón

    // Mostrar la pantalla de carga cuando se haga clic
    loadingScreen.style.display = 'flex';
    
    let porcentage = 0;
    let loadingInterval = setInterval(function() {
        porcentage += 7;
        loadingPorcentage.textContent = porcentage + '%';

        if (porcentage >= 100) {
            clearInterval(loadingInterval);

            // Reemplazar el porcentaje por el mensaje de éxito
            loadingPorcentage.textContent = '¡Registro finalizado correctamente!';
            spinner.style.display = 'none'; // Ocultar el spinner
            // Mostrar el mensaje de éxito por 2 segundos y luego redirigir
            setTimeout(function() {
                window.location.href = 'index.html';  // Redirigir a index.html
            }, 2000); // Mostrar el mensaje de éxito por 2 segundos
        }
    }, 100); // Incrementa el porcentaje cada 100ms
});
