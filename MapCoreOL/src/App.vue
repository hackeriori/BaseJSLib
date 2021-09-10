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
    const layer = mapHelper.layer.createLayer('test', {
      source: mapHelper.layer.createVectorSource({}),
    });
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
          console.log('我被点了' + feature.getProperties().name)
        });
        feature.setNormalStyle([{
          image: {
            stroke: {
              color: 'red',
              width: 1,
            },
            fill: {color: 'rgba(255,255,255,0.01)'},
            radius: 5,
          },
          text:{
            text:'你好'
          }
        }]);
        feature.setHighLightStyle([{
          image: {
            stroke: {
              color: 'yellow',
              width: 2,
            },
            fill: {color: 'rgba(255,255,255,0.01)'},
            radius: 5
          },
          text:{
            text:'你好'
          }
        }]);
      }
      layer.createFeature(
        {
          type: "Feature",
          id: 'test1',
          geometry: {
            type: 'Polygon',
            coordinates: [[[11849049.123762269, 3429890.3025554083], [11848762.484906198, 3429613.218327875], [11849383.535761015, 3429496.174128313]]]
          },
          properties: {id: 'test1', name: 'test1', clickable: true}
        });
      layer.createFeature(
        {
          type: "Feature",
          id: 'test2',
          geometry: {
            type: 'LineString',
            coordinates: [[11849481.470703507, 3429761.3150701774], [11850011.752587235, 3429758.9264130434]]
          },
          properties: {id: 'test2', name: 'test2', clickable: true}
        });
      const dom = document.createElement('div');
      dom.style.height = '32px';
      dom.style.width = '32px';
      dom.style.backgroundColor = 'red';
      const pel = layer.createPel({
        id: 'testPel',
        options: {
          element: dom,
          position: [11849211.99781884, 3430166.63782584],
          stopEvent: false
        }
      });
      if (pel) {
        pel.on('singleClick', () => {
          console.log('我被点了' + pel.id);
        });
        pel.on('rightClick', () => {
          console.log('我被右键点了');
        });
        window.pel = pel;
      }
    }
    mapHelper.interaction.customEvents.start(x => console.log(x));
    // mapHelper.interaction.rotateAndZoom.start(['rotate'] , x => console.log(x.id));
    // mapHelper.interaction.move.start();
    mapHelper.interaction.modify.start();
    window.mapHelper = mapHelper;
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
