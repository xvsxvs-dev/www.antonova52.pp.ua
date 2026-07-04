const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = new Date().getFullYear();
const footer = document.querySelector('.site-footer p');
if (footer) {
  footer.textContent = `Будинок, де важливі комфорт, порядок та спільна відповідальність. © ${year}`;
}

document.querySelectorAll('details.year').forEach(yearDetails => {
    // Слухаємо подію зміни стану (відкриття/закриття)
    yearDetails.addEventListener('toggle', (event) => {
        // Якщо секція року щойно ЗАКРИЛАСЯ (open === false)
        if (!yearDetails.open) {
            // Знаходимо всі місяці всередині цього року і закриваємо їх
            yearDetails.querySelectorAll('details.month').forEach(monthDetails => {
                monthDetails.open = false;
            });
        }
    });
});