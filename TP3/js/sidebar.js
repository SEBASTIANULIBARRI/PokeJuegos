 // Redirigir al hacer clic en INICIO del sidebar
      document.addEventListener("DOMContentLoaded", function () {
        var btnJugar = document.getElementById("btn-jugar");
        if (btnJugar) {
          btnJugar.addEventListener("click", function () {
            window.location.href = "pegSolitarie.html";
          });
        }
      });
      // Redirigir al hacer clic en INICIO del sidebar
      document.addEventListener("DOMContentLoaded", function () {
        var inicioBtn = document.getElementById("sidebarInicio");
        if (inicioBtn) {
          inicioBtn.addEventListener("click", function () {
            window.location.href = "home.html";
          });
        }
      });
      // Sidebar categorías desplegable con cambio de ícono
      document.addEventListener("DOMContentLoaded", function () {
        const sidebar = document.getElementById("sidebarCategorias");
        const hamburguesaBtn = document.querySelector(".hamburguesa-icon");
        const hamburguesaImg = hamburguesaBtn.querySelector("img");
        let abierto = false;
        if (sidebar && hamburguesaBtn && hamburguesaImg) {
          hamburguesaBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            abierto = !sidebar.classList.contains("abierta");
            sidebar.classList.toggle("abierta");
            hamburguesaImg.src = abierto
              ? "img/Hamburguesa-cerrar.png"
              : "img/Hamburguesa.png";
          });
          document.addEventListener("click", function (e) {
            if (
              sidebar.classList.contains("abierta") &&
              !sidebar.contains(e.target) &&
              !hamburguesaBtn.contains(e.target)
            ) {
              sidebar.classList.remove("abierta");
              hamburguesaImg.src = "img/Hamburguesa.png";
            }
          });
        }
      });
      // Mostrar/ocultar menú de perfil
      const profileBtn = document.getElementById("profileMenuBtn");
      const profileMenu = document.getElementById("profileMenu");
      document.addEventListener("click", function (e) {
        if (profileBtn.contains(e.target)) {
          profileMenu.style.display =
            profileMenu.style.display === "block" ? "none" : "block";
        } else {
          profileMenu.style.display = "none";
        }
      });