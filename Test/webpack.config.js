//公共环境配置

module.exports = {
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      //vue使用vue-loader
      {
        test: /\.css$/i,
        use: ['css-loader']
      }
    ]
  }
};
