module.exports = {
  //打包为库时不打包vue
  externals: [
    /**
     * 排除打包的模块，不打包的模块
     * 这里一定要注意后面的值'Vue'的大小写
     * 如果是类似<script src="https://cdn.jsdelivr.net/npm/vue"></script>这类html文件引入的vue,是大写的Vue
     * 如果是模块化项目，import Vue from 'vue'，那么是小写的vue
     */
    {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue'
      },
      '@turf/turf': {
        root: 'turf',
        commonjs: 'turf',
        commonjs2: 'turf'
      }
    },
    function ({context, request}, callback) {
      if (request.startsWith('ol/')) {
        const root = request.split('/');
        return callback(null, {
          //root 不能直接指定ol.Map这种形式，这样会导致它会去找'ol.Map'这个名字的全局变量，应写为数组形式
          root: root,
          commonjs: request,
          commonjs2: request,
        });
      }
      callback();
    }
  ]
};
