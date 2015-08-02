var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    alias: {
      'joiny': path.join(__dirname, '..', '..', 'src')
    },
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel', 'eslint-loader'],
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: path.join(__dirname, '..', '..', 'src')
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }]
  }
};
