

document.querySelectorAll('.clickeable').forEach(el => {
    el.addEventListener('click', function() {
      location.reload(); // reloads the current page
    });
  });

