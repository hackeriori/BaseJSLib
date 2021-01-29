import Map from "ol/Map";
import {unByKey} from "ol/Observable";
import Select, {Options as SelectOptions} from "ol/interaction/Select";
import {ClickableVerify, OneFeatureCallBack} from "./types";
import Feature from "ol/Feature";
import {EventsKey} from "ol/events";

export default class SingleClickFeature {
  private obSingleClick?: EventsKey;
  private select?: Select;

  constructor(private map: Map) {
  }

  start(selectOptions: SelectOptions, featureClickableVerify: ClickableVerify, clickCallBack: OneFeatureCallBack, clusterClickableVerify: ClickableVerify = [], unClickCallBack?: () => void) {
    function isClickedOnLimitFeature(clickableVerify: ClickableVerify, feature: Feature) {
      if (typeof clickableVerify === 'object') {
        return clickableVerify.includes(feature.get('layer'));
      } else {
        return clickableVerify(feature);
      }
    }

    this.select = new Select(selectOptions);
    const dom = this.map.getTargetElement();
    this.select.on('select', evt => {
      const selected = evt.selected;
      let cursor = 'auto';
      if (selected.length > 0) {
        let feature = selected[0];
        const features = feature.get('features');
        if (features) {//聚合图形
          feature = features[0];
          if (features.length === 1) {//未聚合
            if (isClickedOnLimitFeature(featureClickableVerify, feature))
              cursor = 'pointer';
          } else {//聚合状态
            if (isClickedOnLimitFeature(clusterClickableVerify, feature))
              cursor = 'pointer';
          }
        } else {
          if (isClickedOnLimitFeature(featureClickableVerify, feature))
            cursor = 'pointer';
        }
      }
      dom.style.cursor = cursor;
    });
    this.map.addInteraction(this.select);
    const select = this.select;
    this.obSingleClick = this.map.on('click', () => {
      const selectedFeatures = select.getFeatures().getArray();
      let clickOnFeature = false;
      if (selectedFeatures.length === 1) {
        let selectedFeature = selectedFeatures[0];
        const features = selectedFeature.get('features');
        if (features) {//聚合图形
          selectedFeature = features[0];
          if (features.length === 1) {//未聚合
            if (isClickedOnLimitFeature(featureClickableVerify, selectedFeature)) {
              clickCallBack(selectedFeature);
              clickOnFeature = true
            }
          } else {//聚合状态
            if (isClickedOnLimitFeature(clusterClickableVerify, selectedFeature)) {
              clickCallBack(selectedFeature);
              clickOnFeature = true
            }
          }
        } else {
          if (isClickedOnLimitFeature(featureClickableVerify, selectedFeature)) {
            clickCallBack(selectedFeature);
            clickOnFeature = true
          }
        }
      }
      if (!clickOnFeature && unClickCallBack)//点击地图空白处
        unClickCallBack()
    });
  }

  stop() {
    if (this.obSingleClick) {
      unByKey(this.obSingleClick);
      this.obSingleClick = undefined;
    }
    if (this.select) {
      this.map.removeInteraction(this.select);
      this.select = undefined;
    }
  }
}