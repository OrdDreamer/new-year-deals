/**
 * Модуль для роботи з товарами та категоріями
 */

import productsData from '../../data/products.json';
import {
  getSliderByCategories,
  getSliderAdditionalOffers,
} from './sliders.js';

let categoriesData = null;

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

function updateSplideSlides(splideInstance, products) {
  if (!splideInstance) {
    console.error("Splide instance not found");
    return;
  }

  // Видаляємо всі існуючі слайди
  splideInstance.remove(() => true);
  const slidesHtml = products.map(renderProduct);
  splideInstance.add(slidesHtml);
}

export function renderProducts(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }

  let splideInstance = null;
  if (containerSelector.includes('splide-by-categories')) {
    splideInstance = getSliderByCategories();
  } else if (containerSelector.includes('splide-additional-offers')) {
    splideInstance = getSliderAdditionalOffers();
  }

  if (splideInstance) {
    updateSplideSlides(splideInstance, products);
    return;
  }

  const productsList = container.querySelector(".splide__list.products");
  if (!productsList) {
    console.error(`Products list not found in: ${containerSelector}`);
    return;
  }

  productsList.innerHTML = products.map(renderProduct).join("");
}

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

  const tabButtons = tabsContainer.querySelectorAll(".offers__tab");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const categoryIndex = parseInt(this.dataset.categoryIndex);
      switchCategory(categoryIndex, categories);
    });
  });
}

export function switchCategory(categoryIndex, categories) {
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
    categoriesData = data.byCategories;

    if (data.byCategories && Array.isArray(data.byCategories)) {
      renderTabs(data.byCategories);

      if (data.byCategories[0] && data.byCategories[0].products) {
        renderProducts(
          data.byCategories[0].products,
          ".splide-by-categories.products-slider"
        );
      }
    }

    if (data.additionalOffers) {
      renderProducts(
        data.additionalOffers,
        ".splide-additional-offers.products-slider"
      );
    }

    window.dispatchEvent(new CustomEvent("productsLoaded"));
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

