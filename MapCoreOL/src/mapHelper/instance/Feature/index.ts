import Map from 'ol/Map';
import Feature from "ol/Feature";
import geoJson from "../../global";
import VectorSource from "ol/source/Vector";
import FeaturePropType, {FeatureGeoType} from "./types";
import {Geometry as GeometryType} from "geojson";
import {StyleLike} from "ol/style/Style";
import BaseFeature from "./BaseFeature";
import MapHelper from "../../index";
import StyleMixin from './StyleMixin';
import applyMixins from "../../../../../Utils/applyMixins";
import MeasureMixin from './MeasureMixin';
import {FitOptions} from "ol/View";
import {SimpleGeometry} from "ol/geom";
import LayerInstance from "../Layer";

class FeatureInstance extends BaseFeature {
  //ol原生源
  readonly nativeSource: VectorSource;
  //ol原生元素对象
  readonly nativeFeature: Feature;
  //元素ID
  readonly id: string;
  //元素列表
  readonly layerInstance: LayerInstance;
  //样式缓存（用于隐藏时缓存样式）
  protected styleLike?: StyleLike = undefined;
  //普通样式
  normalStyle?: StyleLike = undefined;
  //高亮样式
  highLightStyle?: StyleLike = undefined;

  constructor(map: Map, mapHelper: MapHelper, geoJSONFeature: FeatureGeoType<GeometryType, FeaturePropType>, layerInstance: LayerInstance, source: VectorSource) {
    super(map, mapHelper);
    this.id = geoJSONFeature.id as string
    this.layerInstance = layerInstance;
    this.nativeSource = source;
    this.nativeFeature = geoJson.readFeature(geoJSONFeature);
    this.layerInstance.featureList[this.id] = this;
    this.nativeSource.addFeature(this.nativeFeature);
  }

  /**
   * 移除元素（内置错误提示）
   */
  destroy() {
    if (this.layerInstance.featureList[this.id]) {
      this.nativeSource.removeFeature(this.nativeFeature);
      delete this.layerInstance.featureList[this.id];
    } else
      console.log(`id为[${this.id}]的元素不存在，移除失败`);
  }

  /**
   * 获取元素的属性（浅拷贝副本），排除自带的geometry属性
   */
  getProperties() {
    const properties = this.nativeFeature.getProperties();
    delete properties.geometry;
    return properties as FeaturePropType;
  }

  /**
   * 隐藏元素（通过设置元素样式的方法隐藏）
   */
  hide() {
    if (!this.styleLike) {
      this.styleLike = this.nativeFeature.getStyle();
      this.nativeFeature.setStyle(() => []);
    }
  }

  /**
   * 显示元素（通过设置元素样式的方法显示）
   */
  show() {
    if (this.styleLike) {
      this.nativeFeature.setStyle(this.styleLike);
      this.styleLike = undefined;
    }
  }

  on(type: 'singleClick', callback: (evt: { type: string }) => void): void
  on(type: 'doubleClick', callback: (evt: { type: string }) => void): void
  on(type: 'rightClick', callback: (evt: { type: string }) => void): void
  on(type: 'mouseEnter', callback: (evt: { type: string }) => void): void
  on(type: 'mouseLeave', callback: (evt: { type: string }) => void): void
  on(type: string | string[], callback: (evt: { type: string }) => void): void {
    this.nativeFeature.on(type, callback);
  }

  /**
   * 缩放至元素
   */
  zoomTo(options?: FitOptions) {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      const size = this.map.getSize()!;
      const view = this.map.getView();
      const paddingSize = 0.1;
      const leftRight = size[0] * paddingSize;
      const topBottom = size[1] * paddingSize;
      let fitOptions: FitOptions = {
        padding: [topBottom, leftRight, topBottom, leftRight],
        duration: 300
      };
      if (geometry.getType() === 'Point') {
        fitOptions.maxZoom = view.getZoom();
      }
      if (options)
        fitOptions = {...fitOptions, ...options};
      view.fit(geometry as SimpleGeometry, fitOptions);
    }
  }
}

interface FeatureInstance extends StyleMixin, MeasureMixin {

}

applyMixins(FeatureInstance, [StyleMixin, MeasureMixin]);

export default FeatureInstance