import BaseFeature from "./BaseFeature";
import Map from "ol/Map";
import Overlay from 'ol/Overlay';
import {PelOptionsType} from "./types";
import {Coordinate} from "ol/coordinate";
import MapHelper from "../../index";

export default class PelInstance extends BaseFeature {
  //原生对象
  readonly nativeOverlay: Overlay;
  //元素ID
  readonly id: string;
  //图元列表
  readonly pelList: { [key: string]: PelInstance };
  private position?: Coordinate = undefined;

  constructor(map: Map, mapHelper: MapHelper, options: PelOptionsType, pelList: { [key: string]: PelInstance }) {
    super(map, mapHelper);
    this.id = options.id;
    this.pelList = pelList;
    this.nativeOverlay = new Overlay(options.options);
    this.pelList[this.id] = this;
    this.map.addOverlay(this.nativeOverlay);
    //添加高亮移除事件
    if (options.options.element)
      options.options.element.addEventListener('pointermove', ev => {
        this.mapHelper.interaction.customEvents.notifyLevel();
        ev.preventDefault();
      })
  }

  /**
   * 移除元素
   */
  destroy(): void {
    if (this.pelList[this.id]) {
      this.map.removeOverlay(this.nativeOverlay);
      delete this.pelList[this.id];
    } else
      console.log(`id为[${this.id}]的元素不存在，移除失败`);
  }

  /**
   * 显示元素（通过设置元素样式的方法显示）
   */
  show(): void {
    if (this.position)
      this.nativeOverlay.setPosition(this.position);
  }

  /**
   * 隐藏元素（通过设置元素样式的方法隐藏）
   */
  hide(): void {
    this.position = this.nativeOverlay.getPosition();
    this.nativeOverlay.setPosition(undefined);
  }

  on(type: "singleClick", callback: () => void): void;
  on(type: "doubleClick", callback: () => void): void;
  on(type: "rightClick", callback: () => void): void;
  on(type: "mouseEnter", callback: () => void): void;
  on(type: "mouseLeave", callback: () => void): void;
  on(type: string, callback: () => void): void {
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
            callback();
          else
            return;
        } else if (type === 'rightClick') {
          callback();
        } else
          callback();
        ev.preventDefault();
        ev.stopPropagation();
        ev.returnValue = false;
      })
    }
  }
}