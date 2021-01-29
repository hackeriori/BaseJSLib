import Map from "ol/Map";
import {EventsKey} from "ol/events";
import {NotingClick} from "./types";
import {unByKey} from "ol/Observable";

export default class MapClick {
  private obSingleClick?: EventsKey;

  constructor(private map: Map) {
  }

  start(callBack: NotingClick) {
    this.obSingleClick = this.map.on('singleclick', evt => {
      callBack(evt.coordinate);
    });
  }

  stop() {
    if (this.obSingleClick) {
      unByKey(this.obSingleClick);
      this.obSingleClick = undefined;
    }
  }
}