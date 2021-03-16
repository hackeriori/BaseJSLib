<template>
  <div style="height: 100%">
  </div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
import MapHelper from "../mapHelper";
import {MapOptions} from 'ol/PluggableMap'

@Component({
  name: 'MapView'
})
export default class MapView extends Vue {
  // helper实例，此处巧妙利用未赋初始值不加入响应式数据。
  mapHelper!: MapHelper

  //是否手动初始化地图，通过initMap方法初始化
  @Prop({
    type: Boolean,
    default: () => false
  }) private readonly manualInit!: boolean;

  //是否在地图完成后添加默认图层（例如高德地图）
  @Prop({
    type: Boolean,
    default: () => true
  }) private readonly addDefaultLayer!: boolean;

  //地图加载完成事件
  @Emit()
  private mapLoaded(mapHelper: MapHelper) {
  }

  // 组件初始化时，根据Prop中manualInit的定义，初始化地图
  private mounted() {
    if (!this.manualInit)
      this.initMap();
  }

  //初始化地图
  initMap(options?: MapOptions) {
    const mapInitOptions: MapOptions = options ? options : {};
    mapInitOptions.target = this.$el as HTMLElement;
    this.mapHelper = new MapHelper(mapInitOptions, this.addDefaultLayer);
    this.mapLoaded(this.mapHelper);
    return this.mapHelper;
  }
}
</script>

<style scoped>

</style>