import Map from "ol/Map";
import {MapFrame} from "../../MapFrame";
import CustomEvents from "./CustomEvents";

export default class InteractionHelper extends MapFrame {
  customEvents: CustomEvents;

  constructor(map: Map) {
    super(map);
    this.customEvents = new CustomEvents(map);
  }

  stopAll(){
    this.customEvents.stop();
  }
}