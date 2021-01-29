<template>
  <div style="height: 100%"></div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
import MapHelper from "../mapHelper";
import * as _CesiumType from 'cesium'

@Component({
  name: 'MapCoreOL',
})
//如果不带manualInit属性，那么组件自动初始化地图，使用@map-loaded事件获取mapHelper
//如果带manualInit属性，那么在时机成熟后调用组件的initMap方法获取mapHelper
export default class MapView extends Vue {

  //是否手动初始化地图，通过initMap方法初始化
  @Prop({
    type: Boolean,
    default: () => false
  }) private readonly manualInit!: boolean;

  @Emit()
  private mapLoaded(mapHelper: MapHelper) {
  }

  // helper实例，此处巧妙利用未赋初始值不加入响应式数据。
  mapHelper!: MapHelper

  // 组件初始化时，根据Prop定义，初始化地图
  private mounted() {
    if (!this.manualInit)
      this.initMap();
  }

  /**
   * 初始化地图，可使用默认地图或自定义地图构建参数
   */
  initMap(options?: _CesiumType.Viewer.ConstructorOptions) {
    this.mapHelper = new MapHelper(this.$el, options);
    this.mapLoaded(this.mapHelper);
    return this.mapHelper;
  }
}
</script>

<style scoped>

</style>
