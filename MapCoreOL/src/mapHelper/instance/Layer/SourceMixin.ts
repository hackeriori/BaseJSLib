import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import Cluster from "ol/source/Cluster";

export default abstract class SourceMixin {
  //ol原生图层
  readonly nativeLayer!: BaseLayer;
  //图层ID
  readonly id!: string;

  /**
   * 获取几何源
   */
  getVectorSource() {
    if (this.nativeLayer instanceof VectorLayer) {
      const source = this.nativeLayer.getSource();
      if (source instanceof Cluster)
        return source.getSource();
      return source;
    } else {
      console.log(`id为[${this.id}]的图层不是几何类型图层`);
    }
  }
}