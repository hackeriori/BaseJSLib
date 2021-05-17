import Map from 'ol/Map'
import {MapFrame} from "./MapFrame";
import {MapOptions} from 'ol/PluggableMap'
import getMapPreOptions from "./mapPreOptions";
import LayerHelper from "./helper/LayerHelper";
import {MapDropCallBack} from "./types";
import {getOffsetX, getOffsetY} from "../../../Utils/getOffset";
import InteractionHelper from "./helper/InteractionHelper";
import ProjectionHelper from "./helper/ProjectionHelper";

export default class MapHelper extends MapFrame {
  layer: LayerHelper
  interaction: InteractionHelper
  projection: ProjectionHelper
  //X偏移量缓存
  private offsetX?: number;
  //Y偏移量缓存
  private offsetY?: number;

  constructor(options: MapOptions, addDefaultLayer: boolean) {
    let preOptions = getMapPreOptions();
    preOptions = {...preOptions, ...options};
    const map = new Map(preOptions);
    super(map);
    this.layer = new LayerHelper(map, this);
    this.interaction = new InteractionHelper(map, this);
    this.projection = new ProjectionHelper(map, this);
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
    this.mapHelper = this;
  }

  /**
   * 将地图设置为可拖放
   * @param mapDropCallBack 回调函数，返回坐标和DataTransfer
   */
  setDropAble(mapDropCallBack: MapDropCallBack) {
    const el = this.map.getTargetElement();
    el.ondragover = ev => ev.preventDefault();
    el.ondrop = ev => {
      if (this.offsetX === undefined)
        this.offsetX = getOffsetX(el);
      if (this.offsetY === undefined)
        this.offsetY = getOffsetY(el);
      const pixel = [ev.clientX - this.offsetX, ev.clientY - this.offsetY];
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      mapDropCallBack(coordinate, ev.dataTransfer);
    }
  }
}