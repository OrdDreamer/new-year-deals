import { initMobileMenu } from "./modules/mobileMenu.js";
import { initFeedbacks } from "./modules/feedbacks.js";
import { loadProducts } from "./modules/products.js";
import { initAllSliders } from "./modules/sliders.js";

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initFeedbacks(false);
  loadProducts();
  initAllSliders();
});
