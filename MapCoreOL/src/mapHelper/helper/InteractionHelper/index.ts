import Map from "ol/Map";
import {MapFrame} from "../../MapFrame";
import CustomEvents from "./CustomEvents";
import MapHelper from "../../index";

export default class InteractionHelper extends MapFrame {
  customEvents: CustomEvents;

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.customEvents = new CustomEvents(map, this.mapHelper);
  }

  stopAll() {
    this.customEvents.stop();
  }
}