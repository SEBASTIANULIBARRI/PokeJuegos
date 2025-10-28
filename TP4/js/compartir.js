 // Modal compartir
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('modalCompartir');
            const btnCompartir = document.querySelector('.btn-compartir-img');
            const closeCompartir = document.getElementById('closeCompartir');
            if (modal && btnCompartir && closeCompartir) {
                btnCompartir.addEventListener('click', function(e) {
                    e.stopPropagation();
                    modal.style.display = 'flex';
                });
                closeCompartir.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        });