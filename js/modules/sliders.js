/**
 * Модуль для ініціалізації Splide слайдерів
 */

/**
 * Ініціалізує слайдери товарів
 */
export function initProductSliders() {
  const sectionOffersElement = document.querySelector("#offers");
  if (!sectionOffersElement) return;

  const prevButton = sectionOffersElement.querySelector(
    ".products-slider__button--prev"
  );
  const nextButton = sectionOffersElement.querySelector(
    ".products-slider__button--next"
  );

  if (!prevButton || !nextButton) return;

  const sliderByCategories = new Splide(".splide-by-categories", {
    type: "loop",
    fixedWidth: 280,
    fixedHeight: 280,
    gap: 16,
    autoplay: true,
    interval: 3000,
    pagination: false,
    arrows: false,
    mediaQuery: "min",
    breakpoints: {
      768: {
        fixedWidth: 328,
        fixedHeight: 328,
      },
      1200: {
        destroy: true,
      },
    },
  });

  prevButton.addEventListener("click", function () {
    sliderByCategories.go("<");
  });

  nextButton.addEventListener("click", function () {
    sliderByCategories.go(">");
  });

  sliderByCategories.mount();

  // Слайдер для additional-offers
  const sectionAdditionalOffersElement =
    document.querySelector("#additional-offers");
  if (!sectionAdditionalOffersElement) return;

  const prevButtonAdditionalOffers =
    sectionAdditionalOffersElement.querySelector(
      ".products-slider__button--prev"
    );
  const nextButtonAdditionalOffers =
    sectionAdditionalOffersElement.querySelector(
      ".products-slider__button--next"
    );

  if (!prevButtonAdditionalOffers || !nextButtonAdditionalOffers) return;

  const sliderAdditionalOffers = new Splide(".splide-additional-offers", {
    type: "loop",
    fixedWidth: 280,
    fixedHeight: 280,
    gap: 16,
    autoplay: true,
    interval: 3000,
    pagination: false,
    arrows: false,
    mediaQuery: "min",
    breakpoints: {
      768: {
        fixedWidth: 328,
        fixedHeight: 328,
      },
      1200: {
        destroy: true,
      },
    },
  });

  prevButtonAdditionalOffers.addEventListener("click", function () {
    sliderAdditionalOffers.go("<");
  });

  nextButtonAdditionalOffers.addEventListener("click", function () {
    sliderAdditionalOffers.go(">");
  });

  sliderAdditionalOffers.mount();
}

/**
 * Ініціалізує слайдер відео відгуків
 */
export function initFeedbacksSlider() {
  const sectionFeedbacksElement = document.querySelector("#feedbacks");
  if (!sectionFeedbacksElement) return;

  const prevButtonFeedbacks = sectionFeedbacksElement.querySelector(
    ".products-slider__button--prev"
  );
  const nextButtonFeedbacks = sectionFeedbacksElement.querySelector(
    ".products-slider__button--next"
  );

  if (!prevButtonFeedbacks || !nextButtonFeedbacks) return;

  const sliderFeedbacks = new Splide(".splide-feedbacks", {
    type: "loop",
    fixedWidth: 248,
    fixedHeight: 440,
    gap: 16,
    autoplay: true,
    interval: 3000,
    pagination: false,
    arrows: false,
    mediaQuery: "min",
    breakpoints: {
      1200: {
        destroy: true,
      },
    },
  });

  prevButtonFeedbacks.addEventListener("click", function () {
    sliderFeedbacks.go("<");
  });

  nextButtonFeedbacks.addEventListener("click", function () {
    sliderFeedbacks.go(">");
  });

  sliderFeedbacks.mount();
}

/**
 * Ініціалізує всі слайдери
 */
export function initAllSliders() {
  // Ініціалізуємо слайдери товарів після їх завантаження
  window.addEventListener("productsLoaded", function () {
    initProductSliders();
  });

  // Якщо товари вже завантажені (наприклад, з кешу), ініціалізуємо одразу
  setTimeout(function () {
    const productsList = document.querySelector(
      ".splide-by-categories .splide__list.products"
    );
    if (productsList && productsList.children.length > 0) {
      initProductSliders();
    }
  }, 100);

  // Ініціалізуємо слайдер відгуків одразу
  initFeedbacksSlider();
}

