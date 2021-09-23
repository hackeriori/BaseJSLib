import AnimationsSharedData from "./sharedData";
import {FlashPointParamsType} from "../types";
import {flashGeom, flashPoint, getPreFlashPointParams} from "../command";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Geometry, Point} from "ol/geom";
import applyMixins from "../../../../../../Utils/applyMixins";

abstract class FlashAnimation {
  /**
   * 闪烁动画
   */
  async flash(options?: Partial<FlashPointParamsType>) {
    if (this.styleLike || !this.layerInstance.visibly)
      return;
    const preOptions = getPreFlashPointParams();
    const _options: FlashPointParamsType = {...preOptions, ...options};
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      const type = geometry.getType();
      switch (type) {
        case 'Point':
          await flashPoint(this.layerInstance.nativeLayer as VectorLayer<VectorSource<Geometry>>, geometry as Point, this.map, _options);
          break;
        case 'Polygon':
        case 'MultiPolygon':
        case 'LineString':
        case 'MultiLineString':
          await flashGeom(this.layerInstance.nativeLayer as VectorLayer<VectorSource<Geometry>>, this.nativeFeature, this.map, _options)
          break;
        default:
          return;
      }
    }
  }
}

interface FlashAnimation extends AnimationsSharedData {
}

applyMixins(FlashAnimation, [AnimationsSharedData]);

export default FlashAnimation