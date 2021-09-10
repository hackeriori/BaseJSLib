import Map from "ol/Map";
import {MapFrame} from "../../MapFrame";
import CustomEvents from "./CustomEvents";
import MapHelper from "../../index";
import LayerInstance from "../../instance/Layer";
import Measure from "./Measure";
import Move from "./Move";
import RotateAndZoom from "./RotateAndZoom";
import Collection from "ol/Collection";
import Feature from "ol/Feature";
import {InteractionType} from "../../instance/Feature/types";
import setRotateStyle from "./shared";
import {getFeatureInstanceByFeature} from "../../global";
import ModifyAction from "./ModifyAction";

export default class InteractionHelper extends MapFrame {
  customEvents: CustomEvents;
  measure: Measure;
  drawLayer?: LayerInstance;
  move: Move;
  rotateAndZoom: RotateAndZoom;
  interactionType?: InteractionType;
  collection: Collection<Feature>;
  modify: ModifyAction;

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.collection = new Collection();
    this.customEvents = new CustomEvents(map, this.mapHelper);
    this.measure = new Measure(map, this.mapHelper);
    this.move = new Move(map, this.mapHelper);
    this.rotateAndZoom = new RotateAndZoom(map, this.mapHelper);
    this.modify = new ModifyAction(map, this.mapHelper);
  }

  addToCollection(feature: Feature) {
    if (this.interactionType) {
      if (this.interactionType != 'move') {
        if (feature.getGeometry()!.getType() === 'Point')
          return
        else {
          setRotateStyle(feature);
        }
      }
      this.collection.push(feature);
    }
  }

  moveCollectionFeature(feature: Feature) {
    if (this.interactionType) {
      if (this.interactionType != 'move') {
        if (feature.getGeometry()!.getType() === 'Point')
          return
        else {
          feature.setStyle(getFeatureInstanceByFeature(feature, this.mapHelper)!.normalStyle)
        }
      }
      this.collection.remove(feature);
    }
  }

  stopAll() {
    this.customEvents.stop();
    this.measure.stop();
    this.move.stop();
    this.rotateAndZoom.stop();
    this.modify.stop();
    if (this.drawLayer) {
      this.drawLayer.stopDraw();
      this.drawLayer = undefined;
    }
  }
}