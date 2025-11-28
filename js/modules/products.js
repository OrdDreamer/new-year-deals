/**
 * Модуль для роботи з товарами та категоріями
 */

import productsData from '../../data/products.json';
import {
  getSliderByCategories,
  getSliderAdditionalOffers,
} from './sliders.js';

let categoriesData = null;

/**
 * Рендерить HTML для одного товару
 */
export function renderProduct(product) {
  return `
    <li class="splide__slide products__item">
      <a
        class="products__link"
        href="${product.url}"
        target="_blank"
        rel="noopener"
      >
        <article class="products__card">
          <img
            class="products__image"
            src="${product.image_url}"
            alt=""
            width="280"
            height="280"
            loading="lazy"
            aria-hidden="true"
          />
          <header class="products__card-header">
            <h3 class="products__card-title">${product.title}</h3>
            <p class="products__card-price">${product.price}</p>
          </header>
        </article>
      </a>
    </li>
  `;
}

/**
 * Оновлює слайди в Splide слайдері через remove/add
 */
function updateSplideSlides(splideInstance, products) {
  if (!splideInstance) {
    console.error("Splide instance not found");
    return;
  }

  // Видаляємо всі існуючі слайди
  splideInstance.remove(() => true);

  // Додаємо нові слайди
  const slidesHtml = products.map(renderProduct);
  splideInstance.add(slidesHtml);
}

/**
 * Рендерить список товарів у контейнер
 */
export function renderProducts(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }

  // Визначаємо, який слайдер використовувати на основі селектора
  let splideInstance = null;
  if (containerSelector.includes('splide-by-categories')) {
    splideInstance = getSliderByCategories();
  } else if (containerSelector.includes('splide-additional-offers')) {
    splideInstance = getSliderAdditionalOffers();
  }

  // Якщо Splide інстанс існує, використовуємо метод remove/add
  if (splideInstance) {
    updateSplideSlides(splideInstance, products);
    return;
  }

  // Якщо Splide ще не ініціалізований, використовуємо старий метод
  const productsList = container.querySelector(".splide__list.products");
  if (!productsList) {
    console.error(`Products list not found in: ${containerSelector}`);
    return;
  }

  productsList.innerHTML = products.map(renderProduct).join("");
}

/**
 * Рендерить таби категорій
 */
export function renderTabs(categories) {
  const tabsContainer = document.getElementById("offers-tabs");
  if (!tabsContainer) {
    console.error("Tabs container not found");
    return;
  }

  if (!categories || categories.length === 0) {
    return;
  }

  tabsContainer.innerHTML = `
    <ul class="offers__tabs-list" role="tablist">
      ${categories
        .map(
          (category, index) => `
        <li class="offers__tabs-item" role="presentation">
          <button
            class="offers__tab ${index === 0 ? "offers__tab--active" : ""}"
            type="button"
            role="tab"
            aria-selected="${index === 0 ? "true" : "false"}"
            aria-controls="offers-products"
            data-category-index="${index}"
          >
            ${category.name}
          </button>
        </li>
      `
        )
        .join("")}
    </ul>
  `;

  // Додаємо обробники подій для табів
  const tabButtons = tabsContainer.querySelectorAll(".offers__tab");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const categoryIndex = parseInt(this.dataset.categoryIndex);
      switchCategory(categoryIndex, categories);
    });
  });
}

/**
 * Перемикає категорію товарів
 */
export function switchCategory(categoryIndex, categories) {
  // Оновлюємо активний таб
  const tabsContainer = document.getElementById("offers-tabs");
  const tabButtons = tabsContainer.querySelectorAll(".offers__tab");
  tabButtons.forEach((button, index) => {
    if (index === categoryIndex) {
      button.classList.add("offers__tab--active");
      button.setAttribute("aria-selected", "true");
    } else {
      button.classList.remove("offers__tab--active");
      button.setAttribute("aria-selected", "false");
    }
  });

  // Оновлюємо товари
  if (categories[categoryIndex] && categories[categoryIndex].products) {
    renderProducts(
      categories[categoryIndex].products,
      ".splide-by-categories.products-slider"
    );
  }
}

/**
 * Завантажує товари з JSON файлу
 * Шляхи до зображень обробляються під час збірки через webpack loader
 */
export function loadProducts() {
  try {
    const data = productsData;

    // Зберігаємо дані категорій для подальшого використання
    categoriesData = data.byCategories;

    // Рендеримо таби для секції "by-categories"
    if (data.byCategories && Array.isArray(data.byCategories)) {
      renderTabs(data.byCategories);

      // Рендеримо товари першої категорії за замовчуванням
      if (data.byCategories[0] && data.byCategories[0].products) {
        renderProducts(
          data.byCategories[0].products,
          ".splide-by-categories.products-slider"
        );
      }
    }

    // Рендеримо товари для секції "additional-offers"
    if (data.additionalOffers) {
      renderProducts(
        data.additionalOffers,
        ".splide-additional-offers.products-slider"
      );
    }

    // Викликаємо подію для повідомлення про завантаження товарів
    window.dispatchEvent(new CustomEvent("productsLoaded"));
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

