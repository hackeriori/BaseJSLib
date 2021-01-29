import Map from 'ol/Map';
import Modify, {Options as ModifyOptions} from "ol/interaction/Modify";
import Select, {Options as SelectOptions} from "ol/interaction/Select";
import Snap from "ol/interaction/Snap";
import {ManyFeatureCallBack, ModifyFeatureItem} from "./types";
import Feature from 'ol/Feature';
import Polygon from "ol/geom/Polygon";
import {getUid} from 'ol/util';
import VectorLayer from "ol/layer/Vector";

export default class ModifyFeature {
  private select?: Select;
  private modify?: Modify;
  private snap?: Snap;
  private modifyList: ModifyFeatureItem[] = [];

  constructor(private map: Map) {
  }

  private getItemFromList(uid: string) {
    return this.modifyList.find(x => x.uid === uid)
  }

  clearList() {
    this.modifyList = [];
  }

  private getModifiedFeatures() {
    const modifiedFeatures: Feature[] = [];
    this.modifyList.forEach(x => modifiedFeatures.push(x.feature));
    return modifiedFeatures;
  }

  cancelModify() {
    this.modifyList.forEach(x => {
      const geometry = x.feature.getGeometry() as Polygon;
      geometry.setCoordinates(x.coordinate);
    })
    this.clearList();
  }

  start(selectOptions: SelectOptions, callBack: ManyFeatureCallBack, modifyOptions?: ModifyOptions) {
    this.select = new Select(selectOptions);
    this.select.on('select', evt => {
      const deselected = evt.deselected;
      if (deselected.length > 0) {
        let modified = false;
        for (const item of deselected) {
          const uid = getUid(item);
          if (this.getItemFromList(uid)) {
            modified = true;
            break;
          }
        }
        if (modified)
          callBack(this.getModifiedFeatures());
      }
    });
    this.map.addInteraction(this.select);
    if (!modifyOptions)
      modifyOptions = {features: this.select.getFeatures()};
    else
      modifyOptions.features = this.select.getFeatures();
    this.modify = new Modify(modifyOptions);
    this.modify.on('modifystart', evt => {
      evt.features.forEach(x => {
        const uid = getUid(x);
        const item = this.getItemFromList(uid);
        if (!item) {
          this.modifyList.push({
            uid: uid,
            feature: x,
            coordinate: (x.getGeometry() as Polygon).getCoordinates()
          });
        }
      });
    });
    this.modify.on('modifyend', evt => {
      evt.features.forEach(x => {
        const uid = getUid(x);
        const item = this.getItemFromList(uid);
        //如果坐标相等（未改动），那么移除
        if (item && item.coordinate.toString() === (x.getGeometry() as Polygon).getCoordinates().toString()) {
          this.modifyList.splice(this.modifyList.findIndex(x => x.uid === uid));
        }
      });
    });
    this.map.addInteraction(this.modify);
    if (selectOptions.layers) {
      const layers = selectOptions.layers as VectorLayer[];
      if (layers.length > 0) {
        this.snap = new Snap({source: layers[0].getSource()});
        this.map.addInteraction(this.snap);
      }
    }
  }

  stop() {
    if (this.select) {
      this.map.removeInteraction(this.select);
      this.select = undefined;
    }
    if (this.snap) {
      this.map.removeInteraction(this.snap);
      this.snap = undefined;
    }
    if (this.modify) {
      this.map.removeInteraction(this.modify);
      this.modify = undefined;
    }
    this.cancelModify();
    this.clearList();
  }
}