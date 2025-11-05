const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
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
        return `url(${quote}${this.basePath}${slash}${filePath}${quote})`;
      });
      // Потім обробляємо без лапок
      content = content.replace(/url\((\/(?!\/))([^"')]+)\)/g, (match, slash, filePath) => {
        // Пропускаємо абсолютні URL (http://, https://, //, data:)
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || 
            filePath.startsWith('//') || filePath.startsWith('data:')) {
          return match;
        }
        return `url(${this.basePath}${slash}${filePath})`;
      });
    } else {
      // Обробка HTML: замінюємо атрибути href, src, content
      content = content.replace(/(href|src|content)=["'](\/(?!\/))([^"']+)["']/g, (match, attr, slash, filePath) => {
        // Пропускаємо абсолютні URL (http://, https://, //)
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('//')) {
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

      const html404File = path.join(outputPath, '404.html');
      this.replacePathsInFile(html404File);

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

// Отримуємо basePath (webpack передає env як параметр)
module.exports = (env = {}) => {
  const basePath = getBasePath(env);
  
  return merge(common, {
    mode: 'production',
    output: {
      publicPath: basePath ? `${basePath}/` : '/',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        publicPath: basePath ? `${basePath}/` : '/',
      }),
      new CopyPlugin({
        patterns: [
          { from: 'img', to: 'img' },
          { from: 'css', to: 'css' },
          { from: 'favicon.ico', to: 'favicon.ico' },
        ],
      }),
      // Підміна шляхів (якщо basePath встановлено)
      ...(basePath ? [new ReplacePathsPlugin(basePath)] : []),
    ],
  });
};
