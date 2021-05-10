import Map from 'ol/Map'
import {MapFrame} from "../MapFrame";
import LayerInstance from "../instance/Layer";
import {Options as TileOptions} from "ol/layer/BaseTile";
import {Options as VectorOptions} from "ol/layer/BaseVector";
import VectorSource, {Options as VectorSourceOptions} from "ol/source/Vector";
import Cluster, {Options as ClusterSourceOptions} from "ol/source/Cluster";
import XYZ, {Options as XYZSourceOptions} from "ol/source/XYZ";
import MapHelper from "../index";

export default class LayerHelper extends MapFrame {
  private readonly layerList: { [key: string]: LayerInstance } = {};

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  /**
   * 创建图层
   * @param id 图层ID
   * @param options 图层选项
   */
  createLayer(id: string, options: TileOptions | VectorOptions) {
    if (this.layerList[id])
      console.log(`图层id[${id}]重复，重复的图层未添加到地图上`);
    else {
      const layer = new LayerInstance(this.map, this.mapHelper, id, options, this.layerList);
      layer.mapHelper = this.mapHelper;
      return layer;
    }
  }

  /**
   * 创建矢量数据源
   * @param options 数据源选项
   */
  createVectorSource(options: VectorSourceOptions | ClusterSourceOptions) {
    if ('source' in options)
      return new Cluster(options);
    else
      return new VectorSource(options);
  }

  /**
   * 创建瓦片源
   * @param options 数据源选项
   */
  createTileSource(options: XYZSourceOptions) {
    return new XYZ(options);
  }

  /**
   * 按图层ID获取图层实例
   * @param id 图层ID
   */
  getLayer(id: string) {
    return this.layerList[id] as LayerInstance | undefined;
  }

  /**
   * 移除图层
   * @param id 图层ID
   */
  removeLayer(id: string) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.destroy();
      return true;
    } else
      return false;
  }
}