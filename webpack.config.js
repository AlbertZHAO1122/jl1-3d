const path = require('path');
const { VueLoaderPlugin } = require("vue-loader");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    IslandDisplay: './src/components/IslandDisplay/index.js',
    LandDisplay: './src/components/LandDisplay/index.js',
    index: './src/components/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].umd.js',
    library: 'Jl13d',
    libraryTarget: 'umd',
  },
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, 'src'),
  //   },
  // },
  plugins: [
    // 先删除原来的文件，再打包
    new CleanWebpackPlugin(),
    new VueLoaderPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'vue-style-loader', 'css-loader']
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader'
          }
        ]
      },
    ]
  }
}