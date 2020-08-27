// some logic copied form here https://gist.github.com/surma/b2705b6cca29357ebea1c9e6e15684cc
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: './src/App.jsx',
  target: 'web',
  module: { 
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },    
      {
        test: /\.js$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      }, 
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
          test: /\.(png|jpg|gif)$/,
          use: [
            'file-loader',
          ],
      },
      {
        test: /\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader",
        options: {
          publicPath: "dist/",
          name: '[name].[ext]'
        }  
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ]
};