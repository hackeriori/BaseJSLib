import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import Cluster from "ol/source/Cluster";
import FeatureInstance from "../Feature";
import MapHelper from "../../index";
import PelInstance from "../Feature/Pel";

export default abstract class SourceMixin {
  mapHelper!: MapHelper
  featureList!: { [key: string]: FeatureInstance };
  //图元列表
  pelList!: { [key: string]: PelInstance };
  //ol原生图层
  readonly nativeLayer!: BaseLayer;
  //图层ID
  readonly id!: string;

  /**
   * 获取几何源
   * @param log 是否打印错误信息，默认是
   */
  getVectorSource(log = true) {
    if (this.nativeLayer instanceof VectorLayer) {
      const source = this.nativeLayer.getSource();
      if (source instanceof Cluster)
        return source.getSource();
      return source;
    } else {
      if (log)
        console.log(`id为[${this.id}]的图层不是几何类型图层`);
    }
  }
}