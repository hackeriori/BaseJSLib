import {MapFrame} from "../../MapFrame";
import Map from "ol/Map";
import MapHelper from "../../index";
import {Coordinate} from "ol/coordinate";
import {FitOptions} from "ol/View";
import {FlashPointParamsType} from "./types";
import Feature from "ol/Feature";
import TopologyMixin from "./TopologyMixin";
import LayerInstance from "../Layer";
import {Geometry} from "ol/geom";

abstract class BaseFeature extends MapFrame {

  protected constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  //元素ID
  abstract readonly id: string
  //ol原生元素对象
  abstract readonly nativeFeature: Feature<Geometry>;
  //所属图层示例
  abstract readonly layerInstance: LayerInstance;

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

  abstract on(type: 'singleClick', callback: (evt: { type: string }) => void): void
  abstract on(type: 'doubleClick', callback: (evt: { type: string }) => void): void
  abstract on(type: 'rightClick', callback: (evt: { type: string }) => void): void
  abstract on(type: 'mouseEnter', callback: (evt: { type: string }) => void): void
  abstract on(type: 'mouseLeave', callback: (evt: { type: string }) => void): void
  abstract on(type: string | string[], callback: (evt: { type: string }) => void): void

  /**
   * 闪烁动画
   */
  abstract async flash(options?: Partial<FlashPointParamsType>): Promise<void>
}

interface BaseFeature extends TopologyMixin {

}

export default BaseFeature