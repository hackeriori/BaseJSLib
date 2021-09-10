import {MapFrame} from "../../MapFrame";
import Map from "ol/Map";
import MapHelper from "../../index";
import BaseFeature from "../../instance/Feature/BaseFeature";
import {Modify} from "ol/interaction";

export default class ModifyAction extends MapFrame {
  modify?: Modify

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  start(callback?: (feature: BaseFeature) => void) {
    this.mapHelper.interaction.interactionType = "modify";
    const collection = this.mapHelper.interaction.collection;
    this.modify = new Modify({
      features: collection
    })
    this.map.addInteraction(this.modify);
  }

  stop() {
    if (this.modify) {
      this.map.removeInteraction(this.modify);
      this.modify = undefined;
      this.mapHelper.interaction.interactionType = undefined;
    }
  }
}