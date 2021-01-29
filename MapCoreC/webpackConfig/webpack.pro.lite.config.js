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
      }
    }
  ]
};
