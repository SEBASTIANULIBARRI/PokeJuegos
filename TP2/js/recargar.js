

document.querySelectorAll('.clickeable').forEach(el => {
    el.addEventListener('click', function() {
      location.reload(); // reloads the current page
    });
  });

function clearSearch() {
    document.querySelector('.search-bar').value = '';
    document.querySelector('.search-bar').focus();
}