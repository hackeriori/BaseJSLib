import Map from 'ol/Map'
import {MapFrame} from "../MapFrame";
import LayerInstance from "../instance/Layer";
import {Options as TileOptions} from "ol/layer/BaseTile";
import {Options as VectorOptions} from "ol/layer/BaseVector";
import VectorSource, {Options as VectorSourceOptions} from "ol/source/Vector";

export default class LayerHelper extends MapFrame {
  private readonly layerList: { [key: string]: LayerInstance } = {};

  constructor(map: Map) {
    super(map);
  }

  /**
   * 创建图层
   */
  createLayer(id: string, options: TileOptions | VectorOptions) {
    if (this.layerList[id])
      console.log(`图层id[${id}]重复，重复的图层未添加到地图上`);
    else
      return new LayerInstance(this.map, id, options, this.layerList);
  }

  /**
   * 创建矢量源
   */
  createVectorSource(options: VectorSourceOptions) {
    return new VectorSource(options)
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