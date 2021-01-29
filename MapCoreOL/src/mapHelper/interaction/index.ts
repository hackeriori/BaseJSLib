import Map from 'ol/Map'
import DrawFeature from "./DrawFeature";
import ModifyFeature from './ModifyFeature';
import ClickFeature from "./ClickFeature";
import Measure from "./Measure";
import CustomEvents from './CustomEvents';
import MapClick from "./MapClick";

export default class InteractionHelper {
  draw: DrawFeature;
  modify: ModifyFeature;
  click: ClickFeature;
  measure: Measure;
  customEvents: CustomEvents;
  mapClick: MapClick;

  constructor(private map: Map) {
    this.draw = new DrawFeature(map);
    this.modify = new ModifyFeature(map);
    this.click = new ClickFeature(map);
    this.measure = new Measure(map);
    this.customEvents = new CustomEvents(map);
    this.mapClick = new MapClick(map);
  }

  stopAll() {
    this.draw.stop();
    this.modify.stop();
    this.click.stop();
    this.measure.stop();
    this.customEvents.stop();
    this.mapClick.stop();
  }
}