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
import PelInstance from "../Feature/Pel";
import MapHelper from "../../index";
import {zoomLevelChanged} from "../../global";
import DrawFeatureMixin from "./DrawFeatureMixin";
import {Tile, Vector} from "ol/source";
import {Geometry} from "ol/geom";

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
  featureList: { [key: string]: FeatureInstance } = {};
  //图元列表
  pelList: { [key: string]: PelInstance } = {};
  //图层可见性
  visibly: boolean;
  //图层因缩放层级限制的可见性
  zoomVisibly: boolean;

  //图层的可见性可以设置在options里面
  constructor(map: Map, mapHelper: MapHelper, id: string, options: TileOptions<Tile> | VectorOptions<Vector<Geometry>>, layerList: { [key: string]: LayerInstance }) {
    super(map, mapHelper);
    this.id = id;
    this.layerList = layerList;
    if (options.source instanceof TileSource) {
      this.mapType = "tile";
      this.nativeLayer = new TileLayer(options as TileOptions<Tile>);
    } else {
      this.mapType = "vector";
      this.nativeLayer = new VectorLayer(options as VectorOptions<Vector<Geometry>>);
    }
    if (options.visible !== undefined)
      this.visibly = options.visible;
    else
      this.visibly = true;
    this.zoomVisibly = this.map.getView().getZoom()! > this.nativeLayer.getMinZoom() && this.map.getView().getZoom()! < this.nativeLayer.getMaxZoom();
    this.layerList[id] = this;
    this.nativeLayer.set('id', id, true);
    this.map.addLayer(this.nativeLayer);
  }

  /**
   * 移除图层（内置提示）
   */
  destroy() {
    if (this.layerList[this.id]) {
      this.featureList = {};
      delete this.layerList[this.id];
      for (let id in this.pelList) {
        this.pelList[id].destroy();
      }
      this.map.removeLayer(this.nativeLayer);
    } else
      console.log(`id为[${this.id}]的图层不存在，移除失败`);
  }

  /**
   * 显示图层
   * @param zoomFlag 因缩放层级导致，外部调用不要传此参数
   */
  show(zoomFlag = false) {
    let changed = false;
    if (!this.visibly && !zoomFlag) {
      this.visibly = true;
      this.nativeLayer.setVisible(true);
      changed = true;
    } else if (!this.zoomVisibly && zoomFlag) {
      this.zoomVisibly = true;
      changed = true;
    }
    if (changed) {
      for (let id in this.pelList) {
        this.pelList[id].show(true);
      }
    }
  }

  /**
   * 隐藏图层
   * @param zoomFlag 因缩放层级导致，外部调用不要传此参数
   */
  hide(zoomFlag = false) {
    let changed = false;
    if (this.visibly && !zoomFlag) {
      this.visibly = false;
      this.nativeLayer.setVisible(false);
      changed = true;
    } else if (this.zoomVisibly && zoomFlag) {
      this.zoomVisibly = false;
      changed = true;
    }
    if (changed) {
      for (let id in this.pelList) {
        this.pelList[id].hide(true);
      }
    }
  }

  /**
   * 切换图层显隐
   */
  toggleVisible() {
    if (this.visibly)
      this.hide();
    else
      this.show();
  }

  /**
   * 设置图层最大缩放层级
   * @param zoom
   */
  setMaxZoom(zoom: number) {
    this.nativeLayer.setMaxZoom(zoom);
    zoomLevelChanged(this.mapHelper);
  }

  /**
   * 设置图层最小缩放层级
   * @param zoom
   */
  setMinZoom(zoom: number) {
    this.nativeLayer.setMinZoom(zoom);
    zoomLevelChanged(this.mapHelper);
  }
}

interface LayerInstance extends FeatureMixin, DrawFeatureMixin {

}

applyMixins(LayerInstance, [FeatureMixin, DrawFeatureMixin]);

export default LayerInstance