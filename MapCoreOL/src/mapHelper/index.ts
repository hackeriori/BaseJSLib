import Map from 'ol/Map'
import {MapOptions} from 'ol/PluggableMap'
import LayerHelper from "./LayerHelper";
import InteractionHelper from "./interaction";
import ViewHelper from "./ViewHelper";
import {MapDropCallBack} from "./types";
import StyleHelper from "./StyleHelper";
import AnimatingHelper from "./animating";
import OverLayHelper from "./OverLayHelper";
import TopoHelper from "./TopoHelper";
import 'ol/ol.css';
import ProjectionTransition from "./ProjectionTransition";

export default class MapHelper {
  map: Map;
  layerHelper: LayerHelper;
  interactionHelper: InteractionHelper;
  viewHelper: ViewHelper;
  styleHelper: StyleHelper;
  animatingHelper: AnimatingHelper;
  overlayHelper: OverLayHelper;
  topoHelper: TopoHelper;
  projectionHelper: ProjectionTransition

  constructor(options: MapOptions) {
    this.map = new Map(options);
    this.layerHelper = new LayerHelper(this.map);
    this.interactionHelper = new InteractionHelper(this.map);
    this.viewHelper = new ViewHelper(this.map);
    this.styleHelper = new StyleHelper(this.map);
    this.animatingHelper = new AnimatingHelper(this.map);
    this.overlayHelper = new OverLayHelper(this.map);
    this.topoHelper = new TopoHelper(this.map);
    this.projectionHelper = new ProjectionTransition(this.map);
  }

  /**
   * 设置可以拖拽元素到地图上
   * @param mapDropCallBack 回调函数
   * @param offsetX 地图容器的左边距
   * @param offsetY 地图容器的上边距
   */
  setDropAble(mapDropCallBack: MapDropCallBack, offsetX = 0, offsetY = 0) {
    const el = this.map.getTargetElement();
    el.ondragover = ev => ev.preventDefault();
    el.ondrop = ev => {
      const pixel = [ev.clientX - offsetX, ev.clientY - offsetY];
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      mapDropCallBack(coordinate, ev.dataTransfer);
    }
  }
}