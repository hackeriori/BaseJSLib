<template>
  <div style="height: 100%">
    <MapView ref="mapView" @map-loaded="mapLoaded"/>
    <div class="testDiv">
      <button @click="buttonClick">点我测试</button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue} from 'vue-property-decorator';
import MapView from "./components/MapView.vue";
import MapHelper from "./mapHelper";
import ModelShell from "./mapHelper/model";

@Component({
  components: {MapView}
})
export default class App extends Vue {
  @Ref() readonly mapView!: MapView;
  mapHelper!: MapHelper
  model!: ModelShell;

  mapLoaded(_mapHelper: MapHelper) {
    this.mapHelper = _mapHelper;
    this.test();
  }

  private async test() {
    const model = this.mapHelper.modelHelper.createModel({
      id: '1',
      url: 'http://127.0.0.1:8081/CesiumAir/Cesium_Air.glb',
      coordinate: [116.58266327220134, 35.35501742561701, 0]
    });
    if(model instanceof ModelShell) {
      const modelLoaded = await model.render();
      if (modelLoaded) {
        model.focusMe();
        this.model = model;
      }
    }else{
      console.log(model)
    }
  }

  private buttonClick() {
    console.log(this.model.nativeModel.isDestroyed());
    this.model.destroy();
    console.log(this.model.nativeModel.isDestroyed());
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
}
</style>
