import Map from 'ol/Map'
import {MapFrame} from "./MapFrame";
import {MapOptions} from 'ol/PluggableMap'
import getMapPreOptions from "./mapPreOptions";
import LayerHelper from "./helper/LayerHelper";
import XYZ from "ol/source/XYZ";

export default class MapHelper extends MapFrame {
  layer: LayerHelper

  constructor(options: MapOptions, addDefaultLayer: boolean) {
    let preOptions = getMapPreOptions();
    preOptions = {...preOptions, ...options};
    //如果地图初始化选项含图层，则需要对
    const map = new Map(preOptions);
    super(map);
    this.layer = new LayerHelper(map);
    //添加默认图层
    if (addDefaultLayer) {
      this.layer.createLayer('gdStreet', {
        source: new XYZ({
          url: "http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8",
          crossOrigin: 'anonymous',
          maxZoom: 18
        })
      })
    }
  }
}