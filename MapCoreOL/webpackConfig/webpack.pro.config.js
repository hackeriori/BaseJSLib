const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const {resolve} = require('path')

module.exports = {
  //这里只定义一个入口，html通过index.ts带入，定义两个下面的output会错误
  entry: resolve(__dirname, '../outLib/index.ts'),
  output: {
    libraryTarget: "umd",
    library: 'MapCoreOL',
    libraryExport: 'default',
    path: resolve(__dirname, '../dist'),
    filename: "mapCoreOL.js",
    chunkFilename: "chunks/mapCoreOL.[name].js",
  },
  module: {
    rules: [
      //将ts文件编译为js,将ts后缀增加到vue文件以编译vue
      {
        test: /\.tsx?$/i,
        use: [{
          loader: "ts-loader",
          options: {
            appendTsSuffixTo: [/\.vue$/i],
          }
        }],
      },
      //打包时处理html文件
      {
        test: /\.html$/i,
        use: [
          {loader: "file-loader?name=[name].[ext]"},
          {loader: "extract-loader"},
          {
            loader: "html-loader",
            options: {
              //不处理src
              attributes: false,
            }
          }
        ],
      },
      //编译css到js,再通过style-loader添加到html的style标签中
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
        // use: ['style-loader', 'css-loader']
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['outLib', 'mapCoreOL.js.LICENSE.txt']
    }),
    new MiniCssExtractPlugin({
      filename: 'mapCoreOL.css'
    }),
    new OptimizeCssAssetsWebpackPlugin()
  ],
  mode: "production",
};
