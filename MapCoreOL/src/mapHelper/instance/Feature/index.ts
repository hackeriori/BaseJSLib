import {MapFrame} from "../../MapFrame";
import Map from 'ol/Map';
import Feature from "ol/Feature";
import geoJson from "../../global";
import VectorSource from "ol/source/Vector";
import {FeaturePropCreateType, FeatureGeoType} from "./types";
import {Geometry as GeometryType} from "geojson";

export default class FeatureInstance extends MapFrame {
  //ol原生源
  readonly nativeSource: VectorSource;
  //ol原生元素对象
  readonly nativeFeature: Feature;
  //元素ID
  readonly id: string;
  //元素列表
  readonly featureList: { [key: string]: FeatureInstance };

  constructor(map: Map, geoJSONFeature: FeatureGeoType<GeometryType, FeaturePropCreateType>, featureList: { [key: string]: FeatureInstance }, source: VectorSource) {
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
}