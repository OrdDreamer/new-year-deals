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

// Універсальна функція для створення безкінечної прокрутки каруселей
function createInfiniteScroll(selector) {
  const carouselList = document.querySelector(selector);

  if (!carouselList) return;

  // Отримуємо всі оригінальні елементи
  const originalItems = Array.from(carouselList.children);

  // Створюємо копії для візуального ефекту
  originalItems.forEach(item => {
    const clone = item.cloneNode(true);

    // Приховуємо копії від скрін-рідерів та пошукових систем
    clone.setAttribute('aria-hidden', 'true');

    // Додаємо копію до списку
    carouselList.appendChild(clone);
  });
}

// Універсальна функція для керування анімацією каруселей
function initCarouselAnimation(selector) {
  const carouselList = document.querySelector(selector);

  if (!carouselList) return;

  // Пауза анімації при наведенні миші
  carouselList.addEventListener('mouseenter', function() {
    this.style.animationPlayState = 'paused';
  });

  // Відновлення анімації при відведенні миші
  carouselList.addEventListener('mouseleave', function() {
    this.style.animationPlayState = 'running';
  });

  // Пауза анімації при фокусі (для доступності)
  carouselList.addEventListener('focusin', function() {
    this.style.animationPlayState = 'paused';
  });

  // Відновлення анімації при втраті фокусу
  carouselList.addEventListener('focusout', function() {
    this.style.animationPlayState = 'running';
  });
}

// Функція для ініціалізації таймера
function initTimer() {
  const timerElement = document.getElementById('timer');
  const timerDays = document.getElementById('timer-days');
  const timerHours = document.getElementById('timer-hours');
  const timerMinutes = document.getElementById('timer-minutes');
  const timerSeconds = document.getElementById('timer-seconds');

  if (!timerElement || !timerDays || !timerHours || !timerMinutes || !timerSeconds) {
    return;
  }

  // Функція для обчислення цільової дати (00:00 11.11 поточного року)
  function getTargetDate() {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Створюємо дату 11.11 поточного року о 00:00 за часом користувача
    const targetDate = new Date(currentYear, 10, 11, 0, 0, 0, 0); // Місяць 10 = листопад (0-11)

    // Якщо дата вже пройшла в цьому році, беремо наступний рік
    if (now > targetDate) {
      return new Date(currentYear + 1, 10, 11, 0, 0, 0, 0);
    }

    return targetDate;
  }

  // Функція для форматування чисел (додавання ведучого нуля)
  function formatTime(value) {
    return String(value).padStart(2, '0');
  }

  // Функція для оновлення таймера
  function updateTimer() {
    const now = new Date();
    const targetDate = getTargetDate();
    const timeLeft = targetDate - now;

    // Якщо час вже пройшов, приховуємо таймер
    if (timeLeft <= 0) {
      timerElement.classList.add('hero__timer--hidden');
      return;
    }

    // Обчислюємо дні, години, хвилини та секунди
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Оновлюємо відображення
    timerDays.textContent = formatTime(days);
    timerHours.textContent = formatTime(hours);
    timerMinutes.textContent = formatTime(minutes);
    timerSeconds.textContent = formatTime(seconds);

    // Показуємо таймер, якщо він був прихований і час ще є
    if (timerElement.classList.contains('hero__timer--hidden')) {
      timerElement.classList.remove('hero__timer--hidden');
    }
  }

  // Перевіряємо, чи час ще є при завантаженні
  const targetDate = getTargetDate();
  const now = new Date();
  const timeLeft = targetDate - now;

  // Якщо час ще є, показуємо таймер і запускаємо оновлення
  if (timeLeft > 0) {
    updateTimer();
    // Оновлюємо таймер кожну секунду
    setInterval(updateTimer, 1000);
  }
  // Якщо часу немає, таймер залишається прихованим (за замовчуванням)
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

  // Ініціалізуємо таймер
  initTimer();

  // Ініціалізуємо безкінечну прокрутку маркетплейсів
  createInfiniteScroll('.marketplaces__list');

  // Ініціалізуємо безкінечну прокрутку пропозицій
  createInfiniteScroll('.top-discount-products__list');
  initCarouselAnimation('.top-discount-products__list');

  // Ініціалізуємо безкінечну прокрутку категорій
  createInfiniteScroll('.how-to-order__categories-list');
  initCarouselAnimation('.how-to-order__categories-list');
});

