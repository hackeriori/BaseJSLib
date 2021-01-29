<template>
  <div style="height: 100%">
    <MapView ref="mapView" @map-loaded="mapLoaded"/>
    <div class="testDiv">
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from 'vue-property-decorator';
import MapView from "./components/MapView.vue";
import MapHelper from "./mapHelper";

let mapHelper: MapHelper
@Component({
  components: {MapView}
})
export default class App extends Vue {
  @Ref() readonly mapView!: MapView;

  async mapLoaded(mapHelperI: MapHelper) {
    mapHelper = mapHelperI;

    const center = await mapHelper.projectionHelper.transCoordinate([109.98135578498345, 38.695451668515396])
    mapHelper.viewHelper.setViewerInfo({
      center: center,
      zoom: 13,
    });

    const layer = mapHelper.layerHelper.createLayer({
      source: mapHelper.layerHelper.createSource({})
    }, 'test');

    const play = await mapHelper.animatingHelper.trackPlay(layer,
      'http://47.106.241.206:2020/pages/baseAssets/public/image/oneMapImage/warning-red.png',
      [
        [109.95180614352859, 38.714665819717816],
        [109.97488977444029, 38.712728279610346],
        [109.98135578498345, 38.695451668515396],
        [110.00344922311658, 38.68206546258142],
        [110.00905253306045, 38.66450656241568],
        [110.03425265197076, 38.65871682481887],
      ]);
    play.play();
  }

}
</script>

<style>
html, body, #app {
  margin: 0;
  height: 100%;
}

.testDiv {
  position: absolute;
  left: 0.5em;
  top: 0.5em;
  background-color: white;
}
</style>
