import BaseFeature from "./BaseFeature";
import Map from "ol/Map";
import Overlay from 'ol/Overlay';
import {PelOptionsType} from "./types";
import {Coordinate} from "ol/coordinate";
import MapHelper from "../../index";
import {FitOptions} from "ol/View";
import {Extent} from "ol/extent";
import {flashPoint} from "./command";
import LayerInstance from "../Layer";

export default class PelInstance extends BaseFeature {
  //原生对象
  readonly nativeOverlay: Overlay;
  //元素ID
  readonly id: string;
  //所属图层示例
  readonly layerInstance: LayerInstance;
  //位置信息缓存
  private position?: Coordinate = undefined;
  //图元自身的显隐属性（在开关图层时决定图元是否显隐）
  private visible = true;

  constructor(map: Map, mapHelper: MapHelper, options: PelOptionsType, layerInstance: LayerInstance) {
    super(map, mapHelper);
    this.id = options.id;
    this.layerInstance = layerInstance;
    //如果图层不可见，那么缓存位置
    if (!layerInstance.visibly) {
      this.position = options.options.position;
      options.options.position = undefined;
    }
    this.nativeOverlay = new Overlay(options.options);
    this.layerInstance.pelList[this.id] = this;
    this.map.addOverlay(this.nativeOverlay);

    //添加高亮移除事件
    if (options.options.element)
      options.options.element.addEventListener('pointermove', ev => {
        this.mapHelper.interaction.customEvents.notifyLevel();
        ev.preventDefault();
      });
  }

  /**
   * 移除元素（内置提示）
   */
  destroy(): void {
    if (this.layerInstance.pelList[this.id]) {
      this.map.removeOverlay(this.nativeOverlay);
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
    //如果打开了图层，并且元素可见，那么显示
    if (layerFlag && !this.layerInstance.visibly && this.visible)
      changed = true;
    //如果打开了元素
    else if (!layerFlag && !this.visible) {
      this.visible = true;
      //图层可见的情况下显示
      if (this.layerInstance.visibly)
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
    if (layerFlag && this.layerInstance.visibly)
      changed = true;
    //如果关闭了元素，那么设置隐藏
    else if (!layerFlag && this.visible) {
      this.visible = false;
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
        if (type === 'singleClick') {
          if ((ev as PointerEvent).button === 0)
            callback({type: (type)});
          else
            return;
        } else
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

  flash() {

  }
}