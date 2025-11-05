// === DESPLEGABLE DE PERFIL ===
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

