import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import Cluster from "ol/source/Cluster";
import FeatureInstance from "../Feature";
import MapHelper from "../../index";
import {ClusterStyles} from "../../helper/types";

export default abstract class SourceMixin {
  mapHelper!: MapHelper
  featureList!: { [key: string]: FeatureInstance };
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

  /**
   * 返回图层是否为聚合图层
   */
  isCluster() {
    if (this.nativeLayer instanceof VectorLayer) {
      const source = this.nativeLayer.getSource();
      return source instanceof Cluster;
    } else
      return false;
  }

  /**
   * 设置聚合
   * @param cluster 是否聚合
   * @param clusterStyles 聚合样式
   */
  setCluster(cluster: boolean, clusterStyles?: ClusterStyles) {
    if (this.nativeLayer instanceof VectorLayer) {
      const layer = this.nativeLayer
      let source = layer.getSource();
      const isCluster = source instanceof Cluster
      if (cluster && isCluster)
        source = this.getVectorSource()!
      if (!cluster && !isCluster)
        return;
      if (cluster) {
        let clusterAble = true;
        for (let featureListKey in this.featureList) {
          if (this.featureList[featureListKey].nativeFeature.getGeometry()!.getType() !== 'Point') {
            clusterAble = false;
            console.log(`图层中的所有元素必须是点类型才可以聚合`);
            break;
          }
        }
        if (clusterAble) {
          layer.setSource(this.mapHelper.layer.createVectorSource({
            source: source
          }, clusterStyles));
        }
      } else {
        layer.setSource(this.getVectorSource()!);
      }
    } else {
      console.log(`id为[${this.id}]的图层不是几何类型图层`);
    }
  }
}