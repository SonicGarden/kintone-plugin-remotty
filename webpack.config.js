module.exports = {
  entry: {
    desktop: __dirname + '/src/desktop.js',
    config: __dirname + '/src/config.js'
  },
  output: {
    path: __dirname + '/remotty/js',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'inline-source-map'
};
