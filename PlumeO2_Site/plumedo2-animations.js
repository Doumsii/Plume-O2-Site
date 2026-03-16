/* ============================================================
   PLUME D'O² — Script animations (classes corrigées)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. HEADER GLASSMORPHISM ─────────────────────────── */
  const navbar = document.querySelector('header.navbar');

  if (navbar) {
    navbar.classList.add('at-top');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.remove('at-top');
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
        navbar.classList.add('at-top');
      }
    }, { passive: true });
  }

  /* ── 2. INTERSECTION OBSERVER ───────────────────────── */
  const targets = document.querySelectorAll(
    '.mission-content, ' +
    '.section-header, ' +
    '.player-card-profile, ' +
    '.streaming-links, ' +
    '.upcoming-text, ' +
    '.upcoming-gallery-scroll, ' +
    '.article-card, ' +
    '.product-card, ' +
    '.scroll-img'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    }
  );

  targets.forEach((el) => observer.observe(el));

});
