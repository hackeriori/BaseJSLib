<template>
  <div style="height: 100%"></div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Ref, Vue} from 'vue-property-decorator';
import MapHelper from "../mapHelper";
import {MapOptions} from 'ol/PluggableMap';
import {getDefaultMapInitOptions} from "../mapHelper/defaultSetting";
import {BaseLayerTypes} from "../mapHelper/types";
import View, {ViewOptions} from "ol/View";
import ScaleLine, {Options as ScaleLineOptions} from "ol/control/ScaleLine";
import MousePosition, {Options as MousePositionOptions} from "ol/control/MousePosition";

let mapHelper: MapHelper | undefined

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

  private mounted() {
    mapHelper = undefined;
    if (!this.manualInit) {
      this.initMap();
    }
  }

  /**
   * 初始化地图，可使用默认地图或自定义地图构建参数
   * @param mapOptions 如果不带参数，将使用默认使用谷歌地图，定位到梅安森附近
   */
  initMap(mapOptions?: MapOptions) {
    let options: MapOptions
    if (mapOptions) {
      options = mapOptions;
      options.target = this.$el as HTMLElement;
    } else
      options = getDefaultMapInitOptions(this.$el as HTMLElement, [{id: '3', visibility: true}]);
    mapHelper = new MapHelper(options);
    this.mapLoaded(mapHelper);
    return mapHelper;
  }

  /**
   * 获取地图默认初始化选项
   * @param baseLayers 图层选项（0:高德地图;1:高德地图-蓝色主题;2:谷歌街道地图;3:谷歌卫星地图混合）
   */
  getDefaultMapInitOptions(baseLayers?: BaseLayerTypes[]) {
    return getDefaultMapInitOptions(this.$el as HTMLElement, baseLayers);
  }

  /**
   * 创建视图（通常用于地图初始化之前）
   * @param options ol/View构建参数
   */
  createView(options: ViewOptions) {
    return new View(options);
  }

  /**
   * 创建比例尺控件（通常用于地图初始化之前）
   * @param options ol/control/ScaleLine构建参数
   */
  createScaleLine(options: ScaleLineOptions) {
    return new ScaleLine(options);
  }

  /**
   * 创建鼠标（指针）位置控件（通常用于地图初始化之前）
   * @param options ol/control/MousePosition构建参数
   */
  createMousePosition(options: MousePositionOptions) {
    return new MousePosition(options);
  }
}
</script>

<style scoped>

</style>
