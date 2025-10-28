let registerBtn = document.getElementById('registrarse-btn');
let checkbox = document.getElementById('termsCheckbox');
let changeDiv = document.querySelector('.ya-tienes-cuenta');
let successMessage = document.getElementById('successMessage');
let loadingScreen = document.getElementById('loading-screen');
let loadingPorcentage = document.getElementById('loading-porcentage');
let spinner = document.querySelector('.spinner');
const registerForm = document.getElementById('registerForm');

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

// Manejar submit del formulario para respetar 'required' y checkbox
if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
        // Si el formulario no es válido, dejar que el navegador muestre la validación
        if (!registerForm.checkValidity()) {
            return; // no prevenir, navegador mostrará mensajes
        }

        // Comprobar checkbox de términos
        if (!checkbox.checked) {
            // mostrar indicación breve y evitar envío
            event.preventDefault();
            changeDiv.style.display = 'flex';
            return;
        }

        // Si todo es válido, prevenir el envío real y mostrar pantalla de carga
        event.preventDefault();
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
                    window.location.href = 'home.html';  // Redirigir a home.html
                }, 2000); // Mostrar el mensaje de éxito por 2 segundos
            }
        }, 100); // Incrementa el porcentaje cada 100ms
    });
}
