import Map from "ol/Map";
import {MapFrame} from "../../MapFrame";
import CustomEvents from "./CustomEvents";
import MapHelper from "../../index";
import LayerInstance from "../../instance/Layer";
import Measure from "./Measure";

export default class InteractionHelper extends MapFrame {
  customEvents: CustomEvents;
  measure: Measure;
  drawLayer?: LayerInstance;

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.customEvents = new CustomEvents(map, this.mapHelper);
    this.measure = new Measure(map, this.mapHelper);
  }

  stopAll() {
    this.customEvents.stop();
    this.measure.stop();
    if (this.drawLayer) {
      this.drawLayer.stopDraw();
      this.drawLayer = undefined;
    }
  }
}