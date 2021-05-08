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

@Component({
  components: {MapView}
})
export default class App extends Vue {
  @Ref() readonly mapView!: MapView;

  mapLoaded(mapHelper: MapHelper) {
    const layer = mapHelper.layer.createLayer('test', {source: mapHelper.layer.createVectorSource({})});
    if (layer) {
      const feature = layer.createFeature(
        {
          type: "Feature",
          id: 'test',
          geometry: {type: 'Point', coordinates: [11849201.99781884, 3430156.63782584]},
          properties: {id: 'test', name: 'test', clickable: true}
        });
      if (feature) {
        feature.on('singleClick', () => {
          alert('我被点了' + feature.getProperties().name)
        });
      }
    }
    mapHelper.interactionHelper.customEvents.start();
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
