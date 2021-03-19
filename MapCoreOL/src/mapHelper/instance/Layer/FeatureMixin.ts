import FeatureInstance from "../Feature";
import {FeaturePropCreateType, FeatureGeoType} from "../Feature/types";
import SourceMixin from "./SourceMixin";
import applyMixins from "../../../../../Utils/applyMixins";
import {MapFrame} from "../../MapFrame";
import {Geometry as GeometryType} from "geojson";

class FeatureMixin {
  //元素列表
  protected featureList!: { [key: string]: FeatureInstance };
  //图层ID
  readonly id!: string;

  /**
   * 创建元素
   * @param geoJSONFeature 元素geoJSON
   */
  createFeature(geoJSONFeature: FeatureGeoType<GeometryType, FeaturePropCreateType>) {
    if (this.featureList[geoJSONFeature.id as string])
      console.log(`元素id[${geoJSONFeature.id}]重复，重复的元素未添加到图层中`);
    else {
      const source = this.getVectorSource();
      if (source) {
        geoJSONFeature.properties.layerID = geoJSONFeature.properties.layerID || this.id;
        return new FeatureInstance(this.map, geoJSONFeature, this.featureList, source);
      }
    }
  }

  /**
   * 按元素ID获取元素实例
   * @param id
   */
  getFeature(id: string) {
    return this.featureList[id] as FeatureInstance | undefined;
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
}

interface FeatureMixin extends SourceMixin, MapFrame {
}

applyMixins(FeatureMixin, [SourceMixin]);

export default FeatureMixin