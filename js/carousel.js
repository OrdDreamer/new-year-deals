/**
 * Створює та керує каруселлю з кнопками навігації
 * @param {string} carouselSelector - Селектор контейнера каруселі
 * @param {Object} options - Опції конфігурації
 */
function initCarousel(carouselSelector, options = {}) {
  const defaults = {
    itemsPerView: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4
    },
    showIndicators: true,
    loop: false,
    autoplay: false,
    autoplayInterval: 5000
  };

  const config = { ...defaults, ...options };
  const carousel = document.querySelector(carouselSelector);
  
  if (!carousel) return;

  const viewport = carousel.querySelector('.carousel__viewport');
  const list = carousel.querySelector('.carousel__list');
  const items = Array.from(list.querySelectorAll('.carousel__item'));
  const prevButton = carousel.querySelector('.carousel__button--prev');
  const nextButton = carousel.querySelector('.carousel__button--next');
  const indicatorsContainer = carousel.querySelector('.carousel__indicators');

  if (config.loop) {
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      list.appendChild(clone);
    });
  }


  if (!viewport || !list || !items.length) return;

  let currentIndex = 0;
  let itemsPerView = getItemsPerView();
  let autoplayTimer = null;

  // Визначаємо кількість елементів на екрані
  function getItemsPerView() {
    const width = window.innerWidth;
    if (width >= 1200) return config.itemsPerView.large;
    if (width >= 992) return config.itemsPerView.desktop;
    if (width >= 576) return config.itemsPerView.tablet;
    return config.itemsPerView.mobile;
  }

  // Оновлюємо позицію каруселі
  function updateCarousel() {
    const itemWidth = 100 / itemsPerView;
    const translateX = -(currentIndex * itemWidth);
    list.style.transform = `translateX(${translateX}%)`;
    
    updateButtons();
    if (config.showIndicators) updateIndicators();
  }

  // Оновлюємо стан кнопок
  function updateButtons() {
    if (!prevButton || !nextButton) return;

    if (config.loop) {
      prevButton.disabled = false;
      nextButton.disabled = false;
    } else {
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex >= items.length - itemsPerView;
    }
  }

  // Створюємо індикатори
  function createIndicators() {
    if (!indicatorsContainer || !config.showIndicators) return;

    indicatorsContainer.innerHTML = '';
    const totalPages = Math.ceil(items.length / itemsPerView);

    for (let i = 0; i < totalPages; i++) {
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.className = 'carousel__indicator';
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-label', `Перейти до слайду ${i + 1}`);
      indicator.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      
      indicator.addEventListener('click', () => goToSlide(i * itemsPerView));
      
      indicatorsContainer.appendChild(indicator);
    }
  }

  // Оновлюємо індикатори
  function updateIndicators() {
    if (!indicatorsContainer) return;
    const indicators = indicatorsContainer.querySelectorAll('.carousel__indicator');
    const currentPage = Math.floor(currentIndex / itemsPerView);
    
    indicators.forEach((indicator, index) => {
      if (index === currentPage) {
        indicator.classList.add('carousel__indicator--active');
        indicator.setAttribute('aria-selected', 'true');
      } else {
        indicator.classList.remove('carousel__indicator--active');
        indicator.setAttribute('aria-selected', 'false');
      }
    });
  }

  // Перехід до конкретного слайду
  function goToSlide(index) {
    const maxIndex = config.loop 
      ? items.length 
      : Math.max(0, items.length - itemsPerView);
    
    if (config.loop) {
      currentIndex = index % items.length;
      if (currentIndex < 0) currentIndex = items.length - 1;
    } else {
      currentIndex = Math.max(0, Math.min(index, maxIndex));
    }
    
    updateCarousel();
    resetAutoplay();
  }

  // Попередній слайд
  function prevSlide() {
    if (config.loop) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(Math.max(0, currentIndex - 1));
    }
  }

  // Наступний слайд
  function nextSlide() {
    if (config.loop) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(Math.min(items.length - itemsPerView, currentIndex + 1));
    }
  }

  // Автопрогортування
  function startAutoplay() {
    if (!config.autoplay || autoplayTimer) return;
    
    autoplayTimer = setTimeout(() => {
      nextSlide();
    }, config.autoplayInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    if (config.autoplay) {
      startAutoplay();
    }
  }

  // Обробники подій
  if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
  }

  if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
  }

  // Пауза автопрогортування при наведенні
  if (config.autoplay) {
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
  }

  // Обробка зміни розміру вікна
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newItemsPerView = getItemsPerView();
      if (newItemsPerView !== itemsPerView) {
        itemsPerView = newItemsPerView;
        currentIndex = Math.min(currentIndex, Math.max(0, items.length - itemsPerView));
        createIndicators();
        updateCarousel();
      }
    }, 250);
  });

  // Ініціалізація
  createIndicators();
  updateCarousel();
  
  if (config.autoplay) {
    startAutoplay();
  }

  // Підтримка клавіатури
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });

  // Підтримка свайпів та перетягування (touch gestures та mouse drag)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isDragging = false;
  let startTranslateX = 0;
  const minSwipeDistance = 50; // Мінімальна відстань для спрацювання свайпу

  // Обробка початку дотику
  viewport.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isDragging = true;
    
    // Зберігаємо поточну позицію для плавного переміщення
    const itemWidth = 100 / itemsPerView;
    startTranslateX = -(currentIndex * itemWidth);
    
    // Зупиняємо автопрогортування під час свайпу
    stopAutoplay();
    
    // Додаємо клас для відключення transitions під час перетягування
    list.style.transition = 'none';
  }, { passive: true });

  // Обробка руху пальця
  viewport.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    // Обчислюємо різницю від початкової позиції
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;
    
    // Перевіряємо, чи це горизонтальний свайп (більше горизонтального руху, ніж вертикального)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Запобігаємо прокрутці сторінки під час горизонтального свайпу
      e.preventDefault();
      
      // Обчислюємо нову позицію в процентах
      const itemWidth = 100 / itemsPerView;
      const viewportWidth = viewport.offsetWidth;
      const translatePercent = (diffX / viewportWidth) * 100;
      const newTranslateX = startTranslateX + translatePercent;
      
      // Обмежуємо переміщення межами каруселі
      const maxTranslate = 0;
      const minTranslate = -(items.length - itemsPerView) * itemWidth;
      
      if (config.loop) {
        // Для loop режиму дозволяємо вільне переміщення
        list.style.transform = `translateX(${newTranslateX}%)`;
      } else {
        // Для звичайного режиму обмежуємо межами
        const constrainedX = Math.max(minTranslate, Math.min(maxTranslate, newTranslateX));
        list.style.transform = `translateX(${constrainedX}%)`;
      }
    }
  }, { passive: false });

  // Обробка завершення дотику
  viewport.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Відновлюємо transitions
    list.style.transition = '';
    
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    
    // Обчислюємо відстань та напрямок свайпу
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    
    // Перевіряємо, чи це горизонтальний свайп
    if (absDiffX > absDiffY && absDiffX > minSwipeDistance) {
      if (diffX > 0) {
        // Свайп вправо - попередній слайд
        prevSlide();
      } else {
        // Свайп вліво - наступний слайд
        nextSlide();
      }
    } else {
      // Якщо свайп не виконано, повертаємося до поточної позиції
      updateCarousel();
    }
    
    // Відновлюємо автопрогортування
    if (config.autoplay) {
      startAutoplay();
    }
  }, { passive: true });

  // Обробка скасування дотику (наприклад, коли палець виходить за межі екрану)
  viewport.addEventListener('touchcancel', () => {
    if (isDragging) {
      isDragging = false;
      list.style.transition = '';
      updateCarousel();
      
      if (config.autoplay) {
        startAutoplay();
      }
    }
  }, { passive: true });

  // Підтримка перетягування мишкою (для десктопу)
  let mouseDown = false;
  let mouseStartX = 0;

  viewport.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    const itemWidth = 100 / itemsPerView;
    startTranslateX = -(currentIndex * itemWidth);
    stopAutoplay();
    list.style.transition = 'none';
    viewport.style.cursor = 'grabbing';
    e.preventDefault();
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    
    const diffX = e.clientX - mouseStartX;
    const itemWidth = 100 / itemsPerView;
    const viewportWidth = viewport.offsetWidth;
    const translatePercent = (diffX / viewportWidth) * 100;
    const newTranslateX = startTranslateX + translatePercent;
    
    const maxTranslate = 0;
    const minTranslate = -(items.length - itemsPerView) * itemWidth;
    
    if (config.loop) {
      list.style.transform = `translateX(${newTranslateX}%)`;
    } else {
      const constrainedX = Math.max(minTranslate, Math.min(maxTranslate, newTranslateX));
      list.style.transform = `translateX(${constrainedX}%)`;
    }
  });

  viewport.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    
    mouseDown = false;
    list.style.transition = '';
    viewport.style.cursor = '';
    
    const diffX = e.clientX - mouseStartX;
    const absDiffX = Math.abs(diffX);
    
    if (absDiffX > minSwipeDistance) {
      if (diffX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      updateCarousel();
    }
    
    if (config.autoplay) {
      startAutoplay();
    }
  });

  viewport.addEventListener('mouseleave', () => {
    if (mouseDown) {
      mouseDown = false;
      list.style.transition = '';
      viewport.style.cursor = '';
      updateCarousel();
      
      if (config.autoplay) {
        startAutoplay();
      }
    }
  });
}

// Ініціалізація каруселі після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
  // Ініціалізуємо карусель в секції offers
  initCarousel('#offers-carousel', {
    itemsPerView: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4
    },
    showIndicators: true,
    loop: false,
    autoplay: false,
    autoplayInterval: 3000
  });
});

