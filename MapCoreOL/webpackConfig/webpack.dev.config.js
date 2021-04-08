const HtmlWebpackPlugin = require('html-webpack-plugin');
const {resolve} = require('path');

module.exports = {
  //devtool: 'eval-source-map',
  resolve: {
    symlinks: false,
  },
  devtool: 'eval-cheap-module-source-map',
  entry: resolve(__dirname, '../src/index.ts'),
  output: {
    pathinfo: false,
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
            transpileOnly: true
          }
        }],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
    ]
  },
  //测试时使用的模版
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, '../src/index.html'),
    })
  ],
  devServer: {
    //自动打开浏览器
    open: true
  },
  externals: [
    {
      vue: 'Vue',
      '@turf/turf': 'turf'
    },
    function ({context, request}, callback) {
      if (request.startsWith('ol/')) {
        const root = request.split('/');
        return callback(null, root);
      }
      callback();
    }
  ],
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    runtimeChunk: true
  },
  mode: "development"
};
