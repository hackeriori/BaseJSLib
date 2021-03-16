import BaseLayer from "ol/layer/Base";
import {Options as TileOptions} from 'ol/layer/BaseTile';
import {Options as VectorOptions} from 'ol/layer/BaseVector';
import TileSource from "ol/source/Tile";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import {MapFrame} from "../../MapFrame";
import Map from 'ol/Map'

export default class LayerInstance extends MapFrame {
  nativeLayer: BaseLayer;
  mapType: 'tile' | 'vector';

  constructor(map: Map, public readonly id: string, options: TileOptions | VectorOptions, private readonly layerList: { [key: string]: LayerInstance }) {
    super(map);
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

}