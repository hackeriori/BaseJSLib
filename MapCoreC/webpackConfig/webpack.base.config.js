//公共环境配置
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      //vue使用vue-loader
      {
        test: /\.vue$/i,
        use: ['vue-loader']
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
