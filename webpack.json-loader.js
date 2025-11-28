/**
 * Кастомний webpack loader для обробки JSON файлів
 * Додає publicPath до шляхів зображень в полі image_url
 */
module.exports = function (source) {
  const options = this.getOptions() || {};
  const basePath = options.basePath || '';

  if (!basePath) {
    // Якщо basePath не встановлено, повертаємо JSON без змін
    return source;
  }

  try {
    // Парсимо JSON
    const data = JSON.parse(source);

    // Функція для обробки шляху до зображення
    const processImageUrl = (imageUrl) => {
      if (!imageUrl) return imageUrl;

      // Пропускаємо абсолютні URL
      if (
        imageUrl.startsWith('http://') ||
        imageUrl.startsWith('https://') ||
        imageUrl.startsWith('//')
      ) {
        return imageUrl;
      }

      // Якщо шлях вже містить basePath, не додаємо його знову
      if (imageUrl.startsWith(basePath)) {
        return imageUrl;
      }

      // Додаємо basePath до шляху
      // Видаляємо початковий слеш, якщо він є
      const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
      // Видаляємо завершальний слеш з basePath, якщо він є
      const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

      return `${cleanBasePath}/${cleanPath}`;
    };

    // Обробляємо byCategories
    if (data.byCategories && Array.isArray(data.byCategories)) {
      data.byCategories = data.byCategories.map((category) => ({
        ...category,
        products: category.products
          ? category.products.map((product) => ({
              ...product,
              image_url: processImageUrl(product.image_url),
            }))
          : [],
      }));
    }

    // Обробляємо additionalOffers
    if (data.additionalOffers && Array.isArray(data.additionalOffers)) {
      data.additionalOffers = data.additionalOffers.map((product) => ({
        ...product,
        image_url: processImageUrl(product.image_url),
      }));
    }

    // Повертаємо оброблений JSON
    return JSON.stringify(data, null, 2);
  } catch (error) {
    // Якщо помилка парсингу, повертаємо оригінальний source
    console.warn('JSON loader: помилка обробки JSON', error);
    return source;
  }
};

