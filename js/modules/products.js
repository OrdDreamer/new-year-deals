/**
 * Модуль для роботи з товарами та категоріями
 */

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
 * Рендерить список товарів у контейнер
 */
export function renderProducts(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }

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

    // Оновлюємо Splide слайдер
    if (typeof Splide !== "undefined") {
      const byCategoriesElement = document.querySelector(".splide-by-categories");
      if (byCategoriesElement && byCategoriesElement.splide) {
        byCategoriesElement.splide.refresh();
      }
    }
  }
}

/**
 * Завантажує товари з JSON файлу
 */
export async function loadProducts() {
  try {
    const response = await fetch("/data/products.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

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

    // Оновлюємо існуючі екземпляри Splide після завантаження товарів
    if (typeof Splide !== "undefined") {
      // Оновлюємо слайдер для by-categories
      const byCategoriesElement = document.querySelector(".splide-by-categories");
      if (byCategoriesElement && byCategoriesElement.splide) {
        byCategoriesElement.splide.refresh();
      }

      // Оновлюємо слайдер для additional-offers
      const additionalOffersElement = document.querySelector(
        ".splide-additional-offers"
      );
      if (additionalOffersElement && additionalOffersElement.splide) {
        additionalOffersElement.splide.refresh();
      }
    }

    // Викликаємо подію для повідомлення про завантаження товарів
    window.dispatchEvent(new CustomEvent("productsLoaded"));
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

