const {merge} = require('webpack-merge');
const baseConfig = require('./webpackConfig/webpack.base.config');
const devConfig = require('./webpackConfig/webpack.dev.config');
const proConfig = require('./webpackConfig/webpack.pro.config');
const proLiteConfig = require('./webpackConfig/webpack.pro.lite.config');

module.exports = (env, argv) => {
  process.env.NODE_ENV = argv.model;
  const configs = [];
  configs.push(baseConfig)
  if (argv.model === 'development')
    configs.push(devConfig);
  else {
    configs.push(proConfig);
    if (argv.isLite)
      configs.push(proLiteConfig);
  }
  return merge(configs);
}
