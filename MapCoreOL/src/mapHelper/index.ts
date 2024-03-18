import OlMap from 'ol/Map'
import {MapFrame} from "./MapFrame";
import {MapOptions} from 'ol/PluggableMap'
import getMapPreOptions from "./mapPreOptions";
import LayerHelper from "./helper/LayerHelper";
import {MapDropCallBack} from "./types";
import {getOffsetX, getOffsetY} from "../../../Utils/getOffset";
import InteractionHelper from "./helper/InteractionHelper";
import ProjectionHelper from "./helper/ProjectionHelper";
import ViewHelper from "./helper/ViewHelper";
import StyleHelper from "./helper/StyleHelper";
import {debounce, zoomLevelChanged} from "./global";
import setVersion from "../version";
import Zoom, {Options as ZoomOptions} from 'ol/control/Zoom'
import ScaleLine, {Options as ScaleLineOptions} from 'ol/control/ScaleLine';
import MousePosition, {Options as MousePositionOptions} from 'ol/control/MousePosition';
import OverviewMap, {Options as OverviewOptions} from "ol/control/OverviewMap";
import ZoomSlider, {Options as ZoomSliderOptions} from "ol/control/ZoomSlider";

setVersion();

export default class MapHelper extends MapFrame {
  layer: LayerHelper
  interaction: InteractionHelper
  projection: ProjectionHelper
  style: StyleHelper
  view: ViewHelper
  //随图层缩放的元素
  zoomFeatures: Map<string, {zoomLevelChanged(zoom: number): void}>;
  //X偏移量缓存
  private offsetX?: number;
  //Y偏移量缓存
  private offsetY?: number;

  constructor(options: MapOptions, addDefaultLayer = true) {
    let preOptions = getMapPreOptions();
    preOptions = {...preOptions, ...options};

    const map = new OlMap(preOptions);
    super(map);
    this.mapHelper = this;
    this.layer = new LayerHelper(map, this);
    this.interaction = new InteractionHelper(map, this);
    this.projection = new ProjectionHelper(map, this);
    this.style = new StyleHelper(map, this);
    this.view = new ViewHelper(map, this);
    this.zoomFeatures = new Map();
    //添加默认图层
    if (addDefaultLayer) {
      this.layer.createLayer('gdStreet', {
        source: this.layer.createTileSource({
          url: "http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8",
          crossOrigin: "Anonymous",
          maxZoom: 18
        })
      })
    }
    //注册缩放事件，
    this.view.on('zoomLevelChanged', () => {
      //控制图元显隐
      zoomLevelChanged(this);
      const zoom = this.map.getView().getZoom()!;
      this.zoomFeatures.forEach(x => {
        x.zoomLevelChanged(zoom);
      });
    });
    //注册容器大小改变事件
    if ((window as any).ResizeObserver) {
      const resizeObserver = new ResizeObserver(debounce(() => {
        map.updateSize();
      }, 50));
      resizeObserver.observe(map.getTargetElement());
    }
  }

  static getZoomControl(options?: ZoomOptions) {
    let preOptions: ZoomOptions = {
      zoomInTipLabel: '放大',
      zoomOutTipLabel: '缩小'
    };
    preOptions = {...preOptions, ...options};
    return new Zoom(preOptions);
  }

  static getZoomSliderControl(options?: ZoomSliderOptions) {
    return new ZoomSlider(options);
  }

  static getScaleLineControl(options?: ScaleLineOptions) {
    return new ScaleLine(options);
  }

  static getMousePositionControl(options?: MousePositionOptions) {
    let fixedNumber = 2;
    if (options && options.projection === 'EPSG:4326')
      fixedNumber = 6;
    let preOptions: MousePositionOptions = {
      coordinateFormat(x) {
        if (x)
          return `${x[0].toFixed(fixedNumber)},${x[1].toFixed(fixedNumber)}`
        else
          return '';
      }
    }
    preOptions = {...preOptions, ...options};
    return new MousePosition(preOptions)
  }

  static getOverviewMapControl(options?: OverviewOptions) {
    return new OverviewMap(options);
  }

  /**
   * 将地图设置为可拖放
   * @param mapDropCallBack 回调函数，返回坐标和DataTransfer
   */
  setDropAble(mapDropCallBack: MapDropCallBack) {
    const el = this.map.getTargetElement();
    el.ondragover = ev => ev.preventDefault();
    el.ondrop = ev => {
      ev.preventDefault();
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
