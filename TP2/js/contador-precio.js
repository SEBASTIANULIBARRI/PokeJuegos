document.querySelectorAll(".price").forEach(priceDiv => {
  const plusIcon = document.createElement("div");
  plusIcon.classList.add("plus-icon");

  const plusImg = document.createElement("img");
  plusImg.src = "img/+.png";
  plusImg.alt = "agregar al carrito";
  plusImg.classList.add("plus-btn");

  plusIcon.appendChild(plusImg);

  // Insertar justo después de cada .price
  priceDiv.insertAdjacentElement("afterend", plusIcon);
});

      let contador = 0;
const cartCount = document.getElementById("cart-count");

document.querySelectorAll(".plus-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const gameImg = e.target; // el propio botón

    if (gameImg.getAttribute("src") === "img/+.png") {
      gameImg.setAttribute("src", "img/quitar.png");
      contador++;
    } else {
      gameImg.setAttribute("src", "img/+.png");
      contador--;
    }

    // aseguramos que no baje de 0
    if (contador < 0) contador = 0;

    // actualizar numerito
    cartCount.textContent = contador;

    if (contador > 0) {
      cartCount.style.display = "inline-block";
    } else {
      cartCount.style.display = "none";
    }
  });
});