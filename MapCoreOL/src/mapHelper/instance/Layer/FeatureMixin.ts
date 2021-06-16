import FeatureInstance from "../Feature";
import FeaturePropType, {FeaturePropCreateType, FeatureGeoType, PelOptionsType} from "../Feature/types";
import SourceMixin from "./SourceMixin";
import applyMixins from "../../../../../Utils/applyMixins";
import {MapFrame} from "../../MapFrame";
import {Geometry as GeometryType, FeatureCollection} from "geojson";
import geoJson from "../../global";
import * as turf from '@turf/turf'
import PelInstance from "../Feature/Pel";

class FeatureMixin {
  //元素列表
  featureList!: { [key: string]: FeatureInstance };
  //图元列表
  pelList: { [key: string]: PelInstance } = {};
  //图层ID
  readonly id!: string;
  //图层可见性
  visibly!: boolean;

  /**
   * 创建元素（瓦片图层不影响，如果是瓦片图层由于拿不到source，该方法会返回undefined）
   * @param geoJSONFeature 元素geoJSON
   */
  createFeature(geoJSONFeature: FeatureGeoType<GeometryType, FeaturePropCreateType>) {
    if (this.featureList[geoJSONFeature.id])
      console.log(`元素id[${geoJSONFeature.id}]重复，重复的元素未添加到图层中`);
    else {
      const source = this.getVectorSource();
      if (source) {
        const geoJSONDate = geoJSONFeature as FeatureGeoType<GeometryType, FeaturePropType>;
        geoJSONDate.properties.layerID = this.id;
        return new FeatureInstance(this.map, this.mapHelper, geoJSONDate, this as any, source);
      }
    }
  }

  /**
   * 添加图元
   * @param options 图元对象参数
   */
  createPel(options: PelOptionsType) {
    if (this.pelList[options.id])
      console.log(`元素id[${options.id}]重复，重复的元素未添加到图层中`);
    else {
      const source = this.getVectorSource();
      if (source)
        return new PelInstance(this.map, this.mapHelper, options, this as any, source);
    }
  }

  /**
   * 按元素ID获取元素实例
   * @param id 元素ID
   */
  getFeature(id: string) {
    const feature = this.featureList[id] as FeatureInstance | undefined;
    if (feature)
      return feature;
    else {
      return this.pelList[id] as PelInstance | undefined;
    }
  }

  /**
   * 移除元素
   * @param id 元素ID
   */
  removeFeature(id: string) {
    const feature = this.getFeature(id);
    if (feature) {
      feature.destroy();
      return true;
    } else
      return false;
  }

  /**
   * 获取图层的BBox(extent)，如果图层不包含元素，则返回undefined
   */
  getBBox() {
    const geoCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };
    for (let id in this.featureList) {
      geoCollection.features.push(geoJson.writeFeatureObject(this.featureList[id].nativeFeature));
    }
    if (geoCollection.features.length > 0)
      return turf.bbox(geoCollection);
  }
}

interface FeatureMixin extends SourceMixin, MapFrame {
}

applyMixins(FeatureMixin, [SourceMixin]);

export default FeatureMixin