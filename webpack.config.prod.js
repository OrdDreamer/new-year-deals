const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const fs = require('fs');
const path = require('path');

// Визначаємо basePath
// Підтримуємо: PUBLIC_PATH env змінну або webpack env параметр
const getBasePath = (env = {}) => {
  // Перевіряємо PUBLIC_PATH змінну середовища
  if (process.env.PUBLIC_PATH) {
    return process.env.PUBLIC_PATH;
  }

  // Перевіряємо webpack env параметр
  if (env && env.publicPath) {
    return env.publicPath;
  }

  // Production - стандартні шляхи (без basePath)
  return '';
};

// Кастомний плагін для заміни абсолютних шляхів у HTML та CSS
class ReplacePathsPlugin {
  constructor(basePath) {
    this.basePath = basePath;
  }

  // Перевіряє, чи шлях вже містить basePath (без зміни самого шляху)
  containsBasePath(filePath) {
    if (!this.basePath) return false;
    // Перевіряємо, чи шлях починається з basePath або містить basePath/ десь всередині
    // Це працює навіть якщо є ./ в шляху (наприклад: /promo/11-11-shopping-day/./js/app.js)
    return filePath.startsWith(this.basePath) || filePath.includes(this.basePath + '/');
  }

  replacePathsInFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const isCss = filePath.endsWith('.css');

    if (isCss) {
      // Обробка CSS: замінюємо url("/img/...") та url('/img/...') на url("/landing_11-11/img/...")
      // Обробляємо різні формати: url("/path"), url('/path'), url(/path)
      // Спочатку обробляємо з лапками
      content = content.replace(/url\((["'])(\/(?!\/))([^"')]+)\1\)/g, (match, quote, slash, filePath) => {
        // Пропускаємо абсолютні URL (http://, https://, //, data:)
        if (filePath.startsWith('http://') || filePath.startsWith('https://') ||
            filePath.startsWith('//') || filePath.startsWith('data:')) {
          return match;
        }
        // Пропускаємо шляхи, які вже містять basePath (вже оброблені HtmlWebpackPlugin)
        if (this.containsBasePath(filePath)) {
          return match;
        }
        return `url(${quote}${this.basePath}${slash}${filePath}${quote})`;
      });
      // Потім обробляємо без лапок
      content = content.replace(/url\((\/(?!\/))([^"')]+)\)/g, (match, slash, filePath) => {
        // Пропускаємо абсолютні URL (http://, https://, //, data:)
        if (filePath.startsWith('http://') || filePath.startsWith('https://') ||
            filePath.startsWith('//') || filePath.startsWith('data:')) {
          return match;
        }
        // Пропускаємо шляхи, які вже містять basePath (вже оброблені HtmlWebpackPlugin)
        if (this.containsBasePath(filePath)) {
          return match;
        }
        return `url(${this.basePath}${slash}${filePath})`;
      });
    } else {
      // Обробка HTML: замінюємо атрибути href, src, content
      // ВАЖЛИВО: HtmlWebpackPlugin вже обробляє шляхи через publicPath,
      // тому тут обробляємо тільки статичні шляхи, які не були оброблені
      content = content.replace(/(href|src|content)=["'](\/(?!\/))([^"']+)["']/g, (match, attr, slash, filePath) => {
        // Пропускаємо абсолютні URL (http://, https://, //)
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('//')) {
          return match;
        }
        // Пропускаємо шляхи, які вже містять basePath (вже оброблені HtmlWebpackPlugin)
        // Нормалізуємо шлях для перевірки (видаляємо ./ та подвійні слеші)
        if (this.containsBasePath(filePath)) {
          return match;
        }
        // Пропускаємо шляхи, які є посиланнями на інші мови сторінки
        if (filePath.startsWith('ru/') || filePath.startsWith('uk/')) {
          return match;
        }
        return `${attr}="${this.basePath}${slash}${filePath}"`;
      });
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('ReplacePathsPlugin', (compilation) => {
      if (!this.basePath) return; // Підміна шляхів потрібна тільки якщо basePath встановлено

      const outputPath = compilation.outputOptions.path;

      // Обробка HTML файлів
      const htmlFile = path.join(outputPath, 'index.html');
      this.replacePathsInFile(htmlFile);

      const htmlUkFile = path.join(outputPath, 'index.uk.html');
      this.replacePathsInFile(htmlUkFile);

      const htmlRuFile = path.join(outputPath, 'index.ru.html');
      this.replacePathsInFile(htmlRuFile);

      // Обробка CSS файлів
      const cssDir = path.join(outputPath, 'css');
      if (fs.existsSync(cssDir)) {
        const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
        cssFiles.forEach(file => {
          this.replacePathsInFile(path.join(cssDir, file));
        });
      }
    });
  }
}

// Отримуємо GTM ID (з env змінної або webpack env параметра)
const getGTMId = (env = {}) => {
  // Перевіряємо GTM_ID змінну середовища
  if (process.env.GTM_ID) {
    return process.env.GTM_ID;
  }

  // Перевіряємо webpack env параметр
  if (env && env.gtmId) {
    return env.gtmId;
  }

  return '';
};

// Отримуємо basePath (webpack передає env як параметр)
module.exports = (env = {}) => {
  const basePath = getBasePath(env);
  const gtmId = getGTMId(env);

  return merge(common, {
    mode: 'production',
    output: {
      publicPath: basePath ? `${basePath}/` : '/',
    },
    optimization: {
      minimizer: [
        '...',
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                discardUnused: false,
              },
            ],
          },
        }),
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.uk.html',
        publicPath: basePath ? `${basePath}/` : '/',
        inject: false, // Вимкнути автоматичну інжекцію скриптів (скрипт вже є в HTML)
        templateParameters: {
          GTM_ID: gtmId || false,
        },
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: './index.ru.html',
        filename: 'index.ru.html',
        publicPath: basePath ? `${basePath}/` : '/',
        inject: false, // Вимкнути автоматичну інжекцію скриптів (скрипт вже є в HTML)
        templateParameters: {
          GTM_ID: gtmId || false,
        },
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
        },
      }),
      new CopyPlugin({
        patterns: [
          { from: 'img', to: 'img' },
          { from: 'css', to: 'css' },
          { from: 'favicon.ico', to: 'favicon.ico' },
        ],
      }),
      // Оптимізація зображень
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['imagemin-mozjpeg', { quality: 80, progressive: true }],
              ['imagemin-pngquant', { quality: [0.65, 0.8] }],
              [
                'imagemin-svgo',
                {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          removeUselessStrokeAndFill: false,
                        },
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
        // Оптимізуємо тільки зображення в папці img
        include: /img\/.*\.(jpe?g|png|svg)$/i,
      }),
      // Підміна шляхів (якщо basePath встановлено)
      ...(basePath ? [new ReplacePathsPlugin(basePath)] : []),
    ],
  });
};
