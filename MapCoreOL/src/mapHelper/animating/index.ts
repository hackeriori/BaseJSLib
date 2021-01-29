import Map from 'ol/Map'
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";
import FocusPoint from "../animating/FocusPoint";
import Geometry from "ol/geom/Geometry";
import FlashGeom from "../animating/FlashGeom";
import {Coordinate} from "ol/coordinate";
import TrackObj from "./TrackPlay";

export default class AnimatingHelper {
  constructor(private map: Map) {
  }

  focusToPoint(layer: VectorLayer, point: Point, duration = 800, color = '#ff0000', outToIn = true) {
    return new FocusPoint(this.map, layer, point, duration, color, outToIn);
  }

  flashGeom(layer: VectorLayer, geom: Geometry, duration = 800, color1 = 'rgba(255,255,255,0)', color2 = 'rgba(255,0,0,0.8)', width = 1) {
    return new FlashGeom(this.map, layer, geom, duration, color1, color2, width);
  }

  async trackPlay(layer: VectorLayer, img: string, points: Coordinate[],  time = 5000,
                  showLine = true, color = 'red', width = 2) {
    return new Promise<TrackObj>(resolve => {
      let trackObj: TrackObj;
      const callback = () => resolve(trackObj);
      trackObj = new TrackObj(this.map, layer, img, points, time, showLine, color, width, callback);
    });
  }
}