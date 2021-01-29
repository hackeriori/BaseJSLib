import Vue from 'vue/dist/vue.esm'
import Element from 'element-ui'
import MapCoreOL from '../../MapCoreOL/dist/mapCoreOL'

Vue.use(Element);

new Vue({
  el: '#app',
  components: {demo: MapCoreOL},
  methods:{
    async mapLoaded(mapHelper){
      const center = await mapHelper.projectionHelper.transCoordinate([109.98135578498345, 38.695451668515396])
      mapHelper.viewHelper.setViewerInfo({
        center: center,
        zoom: 13,
      });
    }
  }
});
