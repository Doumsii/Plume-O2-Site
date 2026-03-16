/* ============================================================
   PLUME D'O² — Script mobile : wrapper images cliquables
   Ajoute avant </body> :
   <script src="plumedo2-mobile.js"></script>
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Entoure chaque .scroll-img d'un wrapper pour l'effet loupe */
  const imgs = document.querySelectorAll('.scroll-img');

  imgs.forEach(img => {
    // Évite de doubler si déjà wrappé
    if (img.parentElement.classList.contains('scroll-img-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'scroll-img-wrapper';

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    /* Redirige le clic du wrapper vers le comportement existant
       (ouverture de la modal) en cliquant sur l'image */
    wrapper.addEventListener('click', () => {
      img.click();
    });
  });

});
