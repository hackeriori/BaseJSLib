import {MapFrame} from "../../MapFrame";
import Map from "ol/Map";
import MapHelper from "../../index";
import {Coordinate} from "ol/coordinate";
import {FitOptions} from "ol/View";

export default abstract class BaseFeature extends MapFrame {

  protected constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  /**
   * 移除元素
   */
  abstract destroy(): void

  /**
   * 隐藏元素（通过设置元素样式的方法隐藏）
   */
  abstract hide(): void

  /**
   * 显示元素（通过设置元素样式的方法显示）
   */
  abstract show(): void

  /**
   * 缩放至元素
   */
  abstract zoomTo(options?: FitOptions): void

  /**
   * 获取拐点信息
   * @param outProjection 返回结果的坐标系
   */
  abstract getCoordinates(outProjection?: string): Coordinate | Coordinate[] | Coordinate[][] | undefined

  abstract on(type: 'singleClick', callback: () => void): void
  abstract on(type: 'doubleClick', callback: () => void): void
  abstract on(type: 'rightClick', callback: () => void): void
  abstract on(type: 'mouseEnter', callback: () => void): void
  abstract on(type: 'mouseLeave', callback: () => void): void
  abstract on(type: string | string[], callback: () => void): void
}