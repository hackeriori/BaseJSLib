//公共环境配置
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require("webpack");
const {resolve} = require('path');

function getVersion() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${date.getFullYear()}${month < 10 ? '0' + month.toString() : month.toString()}${day < 10 ? '0' + day.toString() : day.toString()}`;
}

const version = getVersion();
const projPaths = resolve(__dirname, '../').split('\\');
const projName = projPaths[projPaths.length - 1];

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
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.version': JSON.stringify(version),
      'process.env.projName': JSON.stringify(projName),
    })
  ]
};
