import BaseLayer from "ol/layer/Base";
import {Options as TileOptions} from 'ol/layer/BaseTile';
import {Options as VectorOptions} from 'ol/layer/BaseVector';
import TileSource from "ol/source/Tile";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import {MapFrame} from "../../MapFrame";
import Map from 'ol/Map';
import FeatureMixin from "./FeatureMixin";
import applyMixins from "../../../../../Utils/applyMixins";
import FeatureInstance from "../Feature";

class LayerInstance extends MapFrame {
  //ol原生图层
  readonly nativeLayer: BaseLayer;
  //图层类型
  readonly mapType: 'tile' | 'vector';
  //图层ID
  readonly id: string;
  //图层列表
  private readonly layerList: { [key: string]: LayerInstance };
  //元素列表
  protected featureList: { [key: string]: FeatureInstance } = {};

  //图层的可见性可以设置在options里面
  constructor(map: Map, id: string, options: TileOptions | VectorOptions, layerList: { [key: string]: LayerInstance }) {
    super(map);
    this.id = id;
    this.layerList = layerList;
    if (options.source instanceof TileSource) {
      this.mapType = "tile";
      this.nativeLayer = new TileLayer(options as TileOptions);
    } else {
      this.mapType = "vector";
      this.nativeLayer = new VectorLayer(options as VectorOptions);
    }
    this.layerList[id] = this;
    this.nativeLayer.set('id', id, true);
    this.map.addLayer(this.nativeLayer);
  }

  /**
   * 移除图层
   */
  destroy() {
    if (this.layerList[this.id]) {
      this.map.removeLayer(this.nativeLayer);
      delete this.layerList[this.id];
      this.featureList = {};
    } else
      console.log(`id为[${this.id}]的图层不存在，移除失败`);
  }

  /**
   * 显示图层
   */
  show() {
    this.nativeLayer.setVisible(true);
  }

  /**
   * 隐藏图层
   */
  hide() {
    this.nativeLayer.setVisible(false);
  }

  /**
   * 切换图层显隐
   */
  toggleVisible() {
    this.nativeLayer.setVisible(!this.nativeLayer.getVisible());
  }
}

interface LayerInstance extends FeatureMixin {

}

applyMixins(LayerInstance, [FeatureMixin]);

export default LayerInstance
