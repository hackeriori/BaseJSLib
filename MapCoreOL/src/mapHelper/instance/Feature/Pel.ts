import BaseFeature from "./BaseFeature";
import Map from "ol/Map";
import Overlay from 'ol/Overlay';
import {FlashPointParamsType, PelOptionsType} from "./types";
import {Coordinate} from "ol/coordinate";
import MapHelper from "../../index";
import {FitOptions} from "ol/View";
import {Extent} from "ol/extent";
import {flashPoint, getPreFlashPointParams} from "./command";
import LayerInstance from "../Layer";
import {Point} from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import {StyleLike} from "ol/style/Style";
import TopologyMixin from "./TopologyMixin";
import applyMixins from "../../../../../Utils/applyMixins";

class PelInstance extends BaseFeature {
  //原生对象
  readonly nativeOverlay: Overlay;
  //ol原生元素对象，此对象设置为始终不可见
  readonly nativeFeature: Feature;
  //元素ID
  readonly id: string;
  //所属图层示例
  readonly layerInstance: LayerInstance;
  //位置信息缓存
  private position?: Coordinate = undefined;
  //图元自身的显隐属性（在开关图层时决定图元是否显隐）
  private visible = true;
  //是否处于聚合状态
  private _isCluster = false;
  //ol原生源
  readonly nativeSource: VectorSource;
  //样式缓存（用于隐藏时缓存样式）
  protected styleLike?: StyleLike = undefined;

  constructor(map: Map, mapHelper: MapHelper, options: PelOptionsType, layerInstance: LayerInstance, source: VectorSource) {
    super(map, mapHelper);
    this.id = options.id;
    this.layerInstance = layerInstance;
    this.nativeSource = source;
    this.nativeFeature = new Feature({
      geometry: new Point(options.options.position!),
      id: options.id,
      name: '',
      clickable: false,
      layerID: this.layerInstance.id
    });
    this.nativeFeature.setStyle(this.mapHelper.style.createStyle({
      image: {
        radius: 5,
        stroke: {
          color: 'rgba(255,255,255,0)'
        }
      }
    }));
    //如果图层不可见，那么缓存位置
    if (!layerInstance.visibly || !layerInstance.zoomVisibly) {
      this.position = options.options.position;
      options.options.position = undefined;
    }
    this.nativeOverlay = new Overlay(options.options);
    this.layerInstance.pelList[this.id] = this;
    this.nativeSource.addFeature(this.nativeFeature);
    this.map.addOverlay(this.nativeOverlay);
    //添加高亮移除事件
    if (options.options.element)
      options.options.element.addEventListener('pointermove', ev => {
        this.mapHelper.interaction.customEvents.notifyLevel();
        ev.stopPropagation();
      });
  }

  get isCluster() {
    return this._isCluster;
  }

  //在设置和获取聚合状态时，不用考虑图层，因为隐藏的图层无法触发。
  set isCluster(value) {
    const changed = this._isCluster !== value;
    this._isCluster = value;
    if (value && changed && !this.position) {
      this.position = this.nativeOverlay.getPosition();
      this.nativeOverlay.setPosition(undefined);
    } else if (!value && changed && this.visible) {
      this.nativeOverlay.setPosition(this.position);
      this.position = undefined;
    }
  }

  /**
   * 移除元素（内置提示）
   */
  destroy(): void {
    if (this.layerInstance.pelList[this.id]) {
      this.map.removeOverlay(this.nativeOverlay);
      this.nativeSource.removeFeature(this.nativeFeature);
      delete this.layerInstance.pelList[this.id];
    } else
      console.log(`id为[${this.id}]的元素不存在，移除失败`);
  }

  /**
   * 显示元素（通过设置元素样式的方法显示）
   * @param layerFlag 是否通过图层控制显隐
   */
  show(layerFlag = false) {
    let changed = false;
    //如果打开了图层，并且元素可见，并且没有聚合，那么显示
    if (layerFlag && this.layerInstance.visibly && this.layerInstance.zoomVisibly && this.visible && !this.isCluster)
      changed = true;
    //如果打开了元素
    else if (!layerFlag && !this.visible) {
      this.visible = true;
      if (this.styleLike) {
        this.nativeFeature.setStyle(this.styleLike);
        this.styleLike = undefined;
      }
      //图层可见的情况下，并且没有聚合显示
      if (this.layerInstance.visibly && this.layerInstance.zoomVisibly && !this.isCluster)
        changed = true;
    }
    if (changed) {
      this.nativeOverlay.setPosition(this.position);
      this.position = undefined;
    }
  }

  /**
   * 隐藏元素（通过设置元素样式的方法隐藏）
   * @param layerFlag 是否通过图层控制显隐
   */
  hide(layerFlag = false) {
    let changed = false;
    //如果关闭了图层，那么设置隐藏
    if (layerFlag && (!this.layerInstance.visibly || !this.layerInstance.zoomVisibly))
      changed = true;
    //如果关闭了元素，那么设置隐藏
    else if (!layerFlag && this.visible) {
      this.visible = false;
      if (!this.styleLike) {
        this.styleLike = this.nativeFeature.getStyle();
        this.nativeFeature.setStyle(() => []);
      }
      changed = true;
    }
    if (changed && !this.position) {
      this.position = this.nativeOverlay.getPosition();
      this.nativeOverlay.setPosition(undefined);
    }
  }

  on(type: "singleClick", callback: (evt: { type: string }) => void): void;
  on(type: "doubleClick", callback: (evt: { type: string }) => void): void;
  on(type: "rightClick", callback: (evt: { type: string }) => void): void;
  on(type: "mouseEnter", callback: (evt: { type: string }) => void): void;
  on(type: "mouseLeave", callback: (evt: { type: string }) => void): void;
  on(type: string | string[], callback: (evt: { type: string }) => void): void {
    if (Array.isArray(type)) {
      for (let i = 0; i < type.length; i++) {
        this.on(type[i] as any, callback)
      }
      return;
    }
    //注册事件
    const element = this.nativeOverlay.getElement();
    if (element) {
      element.style.cursor = 'pointer';
      let event: string;
      switch (type) {
        case 'singleClick':
          event = 'pointerdown';
          break;
        case 'doubleClick':
          //暂时不支持双击
          return
        case 'rightClick':
          event = 'contextmenu';
          break;
        case 'mouseEnter':
          event = 'mouseenter';
          break;
        case 'mouseLeave':
          event = 'mouseleave';
          break;
        default:
          return;
      }
      element.addEventListener(event, ev => {
        if (type === 'singleClick' && (ev as PointerEvent).button !== 0)
          return;
        callback({type: type});
        ev.preventDefault();
        ev.stopPropagation();
        ev.returnValue = false;
      })
    }
  }

  /**
   * 获取拐点信息
   * @param outProjection 返回结果的坐标系
   */
  getCoordinates(outProjection?: string): Coordinate | Coordinate[] | Coordinate[][] | undefined {
    let outCoordinates: Coordinate | Coordinate[] | Coordinate[][] | undefined;
    let coordinates = this.position || this.nativeOverlay.getPosition();
    if (outProjection && coordinates)
      outCoordinates = this.mapHelper.projection.transCoordinates(coordinates, undefined, outProjection);
    else
      outCoordinates = coordinates;
    return outCoordinates
  }

  /**
   * 缩放至元素
   */
  zoomTo(options?: FitOptions) {
    const coordinate = this.getCoordinates() as Coordinate;
    const extent: Extent = [coordinate[0], coordinate[1], coordinate[0], coordinate[1]];
    const view = this.map.getView();
    let fitOptions: FitOptions = {
      duration: 300,
      maxZoom: view.getZoom(),
    };
    if (options)
      fitOptions = {...fitOptions, ...options};
    view.fit(extent, fitOptions);
  }

  /**
   * 闪动动画
   * @param options 动画参数
   */
  async flash(options?: Partial<FlashPointParamsType>) {
    if (!this.visible || !this.layerInstance.visibly)
      return;
    const coordinate = this.getCoordinates();
    if (coordinate) {
      const preOptions = getPreFlashPointParams();
      const _options: FlashPointParamsType = {...preOptions, ...options};
      await flashPoint(this.layerInstance.nativeLayer as VectorLayer, coordinate as Coordinate, this.map, _options);
    }
  }

  /**
   * 获取包络矩形
   */
  getBBox() {
    return this.nativeFeature.getGeometry()!.getExtent();
  }
}

interface PelInstance extends TopologyMixin {

}

applyMixins(PelInstance, [TopologyMixin]);

export default PelInstance