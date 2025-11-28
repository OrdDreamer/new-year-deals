function openMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burgerBtn = document.getElementById("burger-btn");

  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.add("mobile-menu--active");
    burgerBtn.setAttribute("aria-expanded", true);

    document.body.style.overflow = "hidden";
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const burgerBtn = document.getElementById("burger-btn");

  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.remove("mobile-menu--active");
    burgerBtn.setAttribute("aria-expanded", false);

    document.body.style.overflow = "";
  }
}

function initFeedbacks(pauseOtherVideos = false) {
  const sectionFeedbacksElement = document.querySelector("#feedbacks");
  const feedbackVideos =
    sectionFeedbacksElement.querySelectorAll(".feedbacks__video");

  const updateWrapperState = (video) => {
    const wrapper = video.closest(".feedbacks__video-wrapper");

    if (!wrapper) {
      return;
    }

    if (video.paused) {
      wrapper.classList.remove("feedbacks__video-wrapper--playing");
    } else {
      wrapper.classList.add("feedbacks__video-wrapper--playing");
    }
  };

  const pauseOtherFeedbackVideos = (currentVideo) => {
    feedbackVideos.forEach((video) => {
      if (video !== currentVideo && !video.paused) {
        video.pause();
      }
    });
  };

  const toggleFeedbackVideo = (video) => {
    if (video.paused) {
      if (pauseOtherVideos) {
        pauseOtherFeedbackVideos(video);
      }
      video.play();
    } else {
      video.pause();
    }
  };

  feedbackVideos.forEach((video) => {
    const wrapper = video.closest(".feedbacks__video-wrapper");
    updateWrapperState(video);

    wrapper.addEventListener("click", function () {
      toggleFeedbackVideo(video);
    });

    video.addEventListener("play", function () {
      updateWrapperState(video);
    });

    video.addEventListener("pause", function () {
      updateWrapperState(video);
    });

    video.addEventListener("ended", function () {
      updateWrapperState(video);
    });

    video.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleFeedbackVideo(video);
      }
    });
  });
}

function renderProduct(product) {
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

function renderProducts(products, containerSelector) {
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

async function loadProducts() {
  try {
    const response = await fetch("/data/products.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Рендеримо товари для секції "by-categories"
    if (data.byCategories) {
      renderProducts(
        data.byCategories,
        ".splide-by-categories.products-slider"
      );
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

document.addEventListener("DOMContentLoaded", function () {
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

  initFeedbacks(false);
  loadProducts();
});
