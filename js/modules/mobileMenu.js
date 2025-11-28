/**
 * Модуль для роботи з мобільним меню
 */
export function openMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burgerBtn = document.getElementById("burger-btn");

  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.add("mobile-menu--active");
    burgerBtn.setAttribute("aria-expanded", true);
    document.body.style.overflow = "hidden";
  }
}

export function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burgerBtn = document.getElementById("burger-btn");

  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.remove("mobile-menu--active");
    burgerBtn.setAttribute("aria-expanded", false);
    document.body.style.overflow = "";
  }
}

export function initMobileMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const closeBtn = document.getElementById("mobile-menu-close");

  if (burgerBtn) {
    burgerBtn.addEventListener("click", openMobileMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileMenu);
  }

  const menuLinks = document.querySelectorAll(".mobile-menu__nav-link");
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
}

