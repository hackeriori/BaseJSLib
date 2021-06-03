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
          alert('我被点了' + feature.getProperties().name)
        });
        feature.setNormalStyle([{
          image: {
            stroke: {
              color: 'red',
              width: 1,
            },
            fill: {color: 'rgba(255,255,255,0.01)'},
            radius: 5
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
          }
        }]);
      }
      const feature1 = layer.createFeature(
        {
          type: "Feature",
          id: 'test1',
          geometry: {
            type: 'Polygon',
            coordinates: [[[11849039.569133734, 3429868.8046412035], [11848920.136277039, 3429708.7646132316], [11849254.548275786, 3429694.432670428]]]
          },
          properties: {id: 'test1', name: 'test', clickable: true}
        });
      if (feature1) {
        feature1.setNormalStyle([{
          fill: {
            color: 'red'
          }
        }]);
        feature1.setHighLightStyle([{
          fill: {
            color: 'yellow'
          }
        }]);
      }
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
      })
      if (pel) {
        pel.on('singleClick', () => {
          alert('我被点了' + pel.id);
        });
        pel.on('rightClick', () => {
          console.log('我被右键点了');
        });
      }
    }
    mapHelper.interaction.customEvents.start(x => console.log(x));
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
