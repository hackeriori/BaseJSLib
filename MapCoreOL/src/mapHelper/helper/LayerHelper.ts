import Map from 'ol/Map'
import {MapFrame} from "../MapFrame";
import LayerInstance from "../instance/Layer";
import {Options as TileOptions} from "ol/layer/BaseTile";
import {Options as VectorOptions} from "ol/layer/BaseVector";

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
}