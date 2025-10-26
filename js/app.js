function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const burgerBtn = document.getElementById('burger-btn');
  
  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.add('mobile-menu--active');
    burgerBtn.setAttribute('aria-expanded', true);
    
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const burgerBtn = document.getElementById('burger-btn');
  
  if (mobileMenu && burgerBtn) {
    mobileMenu.classList.remove('mobile-menu--active');
    burgerBtn.setAttribute('aria-expanded', false);
    
    document.body.style.overflow = '';
  }
}

// Функція для створення безкінечної прокрутки маркетплейсів
function createInfiniteMarketplacesScroll() {
  const marketplacesList = document.querySelector('.marketplaces__list');
  
  if (!marketplacesList) return;
  
  // Отримуємо всі оригінальні елементи
  const originalItems = Array.from(marketplacesList.children);
  
  // Створюємо копії для візуального ефекту
  originalItems.forEach(item => {
    const clone = item.cloneNode(true);
    
    // Приховуємо копії від скрін-рідерів та пошукових систем
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('marketplaces__item--clone');
    
    // Додаємо копію до списку
    marketplacesList.appendChild(clone);
  });
}

// Функція для керування анімацією маркетплейсів
function initMarketplacesAnimation() {
  const marketplacesList = document.querySelector('.marketplaces__list');
  
  if (!marketplacesList) return;
  
  // Перевіряємо, чи користувач віддає перевагу зменшеній анімації
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Вимікаємо анімацію для користувачів, які віддають перевагу зменшеній анімації
    marketplacesList.style.animation = 'none';
    return;
  }
  
  // Пауза анімації при наведенні миші
  marketplacesList.addEventListener('mouseenter', function() {
    this.style.animationPlayState = 'paused';
  });
  
  // Відновлення анімації при відведенні миші
  marketplacesList.addEventListener('mouseleave', function() {
    this.style.animationPlayState = 'running';
  });
  
  // Пауза анімації при фокусі (для доступності)
  marketplacesList.addEventListener('focusin', function() {
    this.style.animationPlayState = 'paused';
  });
  
  // Відновлення анімації при втраті фокусу
  marketplacesList.addEventListener('focusout', function() {
    this.style.animationPlayState = 'running';
  });
  
  // Слухаємо зміни в налаштуваннях prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', function(e) {
    if (e.matches) {
      marketplacesList.style.animation = 'none';
    } else {
      marketplacesList.style.animation = '';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const burgerBtn = document.getElementById('burger-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  
  if (burgerBtn) {
    burgerBtn.addEventListener('click', openMobileMenu);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }
  
  const menuLinks = document.querySelectorAll('.mobile-menu__nav-link');
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  
  // Ініціалізуємо безкінечну прокрутку маркетплейсів
  createInfiniteMarketplacesScroll();
  // initMarketplacesAnimation();
});

