import Map from 'ol/Map'
import MapHelper from "./index";

export class MapFrame {
  mapHelper!: MapHelper

  constructor(public map: Map, mapHelper?: MapHelper) {
    if (mapHelper)
      this.mapHelper = mapHelper;
  }
}