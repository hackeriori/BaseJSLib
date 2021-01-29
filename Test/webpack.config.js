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
      },
      {
        test: /\.less$/i,
        use: [{loader: "file-loader?name=[name].css"}, 'extract-loader', 'css-loader', 'less-loader']
      }
    ]
  }
};
