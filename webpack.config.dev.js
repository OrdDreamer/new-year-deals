const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    publicPath: '/', // Dev server завжди з кореня
  },
  devServer: {
    liveReload: true,
    hot: true,
    open: true,
    static: ['./'],
  },
});
