import {MapFrame} from "../../MapFrame";
import Map from 'ol/Map';
import Feature from "ol/Feature";
import geoJson from "../../global";
import VectorSource from "ol/source/Vector";
import FeaturePropType, {FeatureGeoType} from "./types";
import {Geometry as GeometryType} from "geojson";
import {StyleLike} from "ol/style/Style";

export default class FeatureInstance extends MapFrame {
  //ol原生源
  readonly nativeSource: VectorSource;
  //ol原生元素对象
  readonly nativeFeature: Feature;
  //元素ID
  readonly id: string;
  //元素列表
  readonly featureList: { [key: string]: FeatureInstance };
  //样式缓存（用于隐藏时缓存样式）
  styleLike?: StyleLike = undefined;

  constructor(map: Map, geoJSONFeature: FeatureGeoType<GeometryType, FeaturePropType>, featureList: { [key: string]: FeatureInstance }, source: VectorSource) {
    super(map);
    this.id = geoJSONFeature.id as string
    this.featureList = featureList;
    this.nativeSource = source;
    this.nativeFeature = geoJson.readFeature(geoJSONFeature);
    this.featureList[this.id] = this;
    this.nativeSource.addFeature(this.nativeFeature);
  }

  /**
   * 移除元素
   */
  destroy() {
    if (this.featureList[this.id]) {
      this.nativeSource.removeFeature(this.nativeFeature);
      delete this.featureList[this.id];
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
    this.styleLike = this.nativeFeature.getStyle();
    this.nativeFeature.setStyle(() => []);
  }

  /**
   * 显示元素（通过设置元素样式的方法显示）
   */
  show() {
    this.nativeFeature.setStyle(this.styleLike);
  }

  on(type: 'singleClick', callback: () => void): void
  on(type: 'doubleClick', callback: () => void): void
  on(type: 'rightClick', callback: () => void): void
  on(type: 'mouseEnter', callback: () => void): void
  on(type: 'mouseLeave', callback: () => void): void
  on(type: string, callback: () => void): void {
    this.nativeFeature.on(type, callback);
  }

}