  // Estrellas seleccionables en comentarios
        document.addEventListener('DOMContentLoaded', function() {
            const stars = document.querySelectorAll('.comment-form-stars .star');
            let selected = 0;
            stars.forEach((star, idx) => {
                star.addEventListener('click', function() {
                    selected = idx + 1;
                    updateStars();
                });
                star.addEventListener('mouseover', function() {
                    updateStars(idx + 1);
                });
                star.addEventListener('mouseout', function() {
                    updateStars();
                });
            });
            function updateStars(hover = 0) {
                stars.forEach((star, i) => {
                    if ((hover ? i < hover : i < selected)) {
                        star.style.color = '#41C34F';
                    } else {
                        star.style.color = '#B9B9B9';
                    }
                });
            }
            // Inicializar
            updateStars();
        });