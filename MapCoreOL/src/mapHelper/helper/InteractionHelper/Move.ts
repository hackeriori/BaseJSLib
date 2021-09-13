import {MapFrame} from "../../MapFrame";
import Map from "ol/Map";
import MapHelper from "../../index";
import {Translate} from "ol/interaction";
import BaseFeature from "../../instance/Feature/BaseFeature";
import {getFeatureInstanceByFeature} from "../../global";
import Feature from "ol/Feature";
import {Point} from "ol/geom";

export default class Move extends MapFrame {
  private translate?: Translate
  callback?: (feature: BaseFeature) => void

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  start(callback?: (feature: BaseFeature) => void) {
    this.mapHelper.interaction.interactionType = "move";
    const collection = this.mapHelper.interaction.collection;
    this.translate = new Translate({
      features: collection,
    });

    this.translate.on('translateend', evt => {
      if (callback) {
        let feature = evt.features.item(0);
        if (feature.get('features')) {
          feature = feature.get('features')[0];
          (feature.getGeometry()! as Point).setCoordinates((evt.features.item(0).getGeometry()! as Point).getCoordinates());
        }
        callback(getFeatureInstanceByFeature(feature, this.mapHelper)!);
      }
    })
    this.map.addInteraction(
      this.translate
    );
    this.callback = callback;
  }

  stop() {
    if (this.translate) {
      this.map.removeInteraction(this.translate);
      this.translate = undefined;
      this.mapHelper.interaction.interactionType = undefined;
    }
  }
}