const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {resolve} = require('path')

module.exports = {
  //这里只定义一个入口，html通过index.ts带入，定义两个下面的output会错误
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  entry: resolve(__dirname, './src/index.ts'),
  output: {
    libraryTarget: "umd",
    library: 'To',
    libraryExport: 'default',
    path: resolve(__dirname, './dist'),
    filename: "awaitTo.js",
  },
  module: {
    rules: [
      //将ts文件编译为js,将ts后缀增加到vue文件以编译vue
      {
        test: /\.tsx?$/i,
        use: ["ts-loader"],
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  mode: "production",
};
