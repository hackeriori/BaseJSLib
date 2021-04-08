import Map from 'ol/Map'
import {MapFrame} from "./MapFrame";
import {MapOptions} from 'ol/PluggableMap'
import getMapPreOptions from "./mapPreOptions";
import LayerHelper from "./helper/LayerHelper";

export default class MapHelper extends MapFrame {
  layer: LayerHelper

  constructor(options: MapOptions, addDefaultLayer: boolean) {
    let preOptions = getMapPreOptions();
    preOptions = {...preOptions, ...options};
    const map = new Map(preOptions);
    super(map);
    this.layer = new LayerHelper(map);
    //添加默认图层
    if (addDefaultLayer) {
      this.layer.createLayer('gdStreet', {
        source: this.layer.createTileSource({
          url: "http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8",
          crossOrigin: 'anonymous',
          maxZoom: 18
        })
      })
    }
  }
}