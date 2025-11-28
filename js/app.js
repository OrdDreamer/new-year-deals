/**
 * Головний файл додатку
 * Імпортує та ініціалізує всі модулі
 */

import { initMobileMenu } from "./modules/mobileMenu.js";
import { initFeedbacks } from "./modules/feedbacks.js";
import { loadProducts } from "./modules/products.js";
import { initAllSliders } from "./modules/sliders.js";

/**
 * Ініціалізує додаток після завантаження DOM
 */
document.addEventListener("DOMContentLoaded", function () {
  // Ініціалізуємо мобільне меню
  initMobileMenu();

  // Ініціалізуємо відео відгуки
  initFeedbacks(false);

  // Завантажуємо товари
  loadProducts();

  // Ініціалізуємо слайдери
  initAllSliders();
});
