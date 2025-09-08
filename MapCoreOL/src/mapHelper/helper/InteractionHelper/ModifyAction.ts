import {MapFrame} from "../../MapFrame";
import Map from "ol/Map";
import MapHelper from "../../index";
import BaseFeature from "../../instance/Feature/BaseFeature";
import {Modify} from "ol/interaction";
import {getFeatureInstanceByFeature} from "../../global";
import type PelInstance from '../../instance/Feature/Pel';
import {setAllOverlayPointerEvents} from './shared';

export default class ModifyAction extends MapFrame {
  modify?: Modify
  mapHelper: MapHelper

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.mapHelper = mapHelper;
  }

  start(callback?: (feature: BaseFeature) => void) {
    this.mapHelper.interaction.interactionType = "modify";
    const collection = this.mapHelper.interaction.collection;
    this.modify = new Modify({
      features: collection
    });
    setAllOverlayPointerEvents(this.mapHelper, false);
    this.modify.on('modifyend', evt => {
      if (callback) {
        let feature = evt.features.item(0);
        callback(getFeatureInstanceByFeature(feature as any, this.mapHelper)!);
      }
    });
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