const HtmlWebpackPlugin = require('html-webpack-plugin'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = {
  entry: {
    client: './src/client/client.js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      { test: /\.handlebars$/, loader: 'handlebars-loader' },
    ],
  },
  resolve: {
    extensions: ['*', '.js'],
  },
  output: {
    path: `${__dirname}/src/public`,
    publicPath: '/',
  },
  devServer: {
    contentBase: './',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
    }),
  ],
};
