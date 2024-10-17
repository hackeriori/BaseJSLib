import Map from "ol/Map";
import Feature from "ol/Feature";
import {EventsKey} from "ol/events";
import {getUid} from "ol";
import {unByKey} from "ol/Observable";
import {NotingClick} from "./types";
import BaseEvent from "ol/events/Event";
import {MapFrame} from "../../MapFrame";
import MapHelper from "../../index";
import {getFeatureInstanceByFeature} from "../../global";
import {Geometry} from "ol/geom";

export default class CustomEvents extends MapFrame {
  private obRightClick?: (evt: MouseEvent) => void;
  private obSingleClick?: EventsKey;
  private obDoubleClick?: EventsKey;
  private obPointerMove?: EventsKey;
  private highLightFeature?: Feature<Geometry>;
  private readonly target: HTMLElement;

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.target = map.getTargetElement();
  }

  start(callback?: NotingClick) {
    this.mapHelper.interaction.stopAll();
    const target = this.target;
    this.obSingleClick = this.map.on('singleclick', evt => {
      const features = this.map.getFeaturesAtPixel(evt.pixel).filter(x => x.get('clickable'));
      if (features.length > 0) {
        const firstFeature = features[0] as Feature<Geometry>;
        if (!this.mapHelper.interaction.interactionType) {
          const event = new BaseEvent('singleClick');
          // 这里的坐标是基于canvas的偏移坐标，且已经经过缩放计算
          const pixel = [...(evt as any).On];
          event.target = {
            coordinate: this.map.getCoordinateFromPixel(pixel),
            pixel
          };
          firstFeature.dispatchEvent(event);
        }
        return;
      }
      if (callback) {
        callback(evt.coordinate);
      }
    }) as EventsKey;
    this.obDoubleClick = this.map.on('dblclick', evt => {
      const features = this.map.getFeaturesAtPixel(evt.pixel);
      if (features.length > 0) {
        const firstFeature = features[0] as Feature<Geometry>;
        if (!this.mapHelper.interaction.interactionType)
          firstFeature.dispatchEvent('doubleClick');
      }
    }) as EventsKey;
    this.obRightClick = evt => {
      // 这里如果使用clientX，那么canvas原点不在0，0时会拿不到元素，但是使用offsetX又会在缩放时拿不到正确的坐标，需要自己二次计算
      const pixel = [Math.round(evt.offsetX / devicePixelRatio), Math.round(evt.offsetY / devicePixelRatio)];
      const features = this.map.getFeaturesAtPixel(pixel);
      if (features.length > 0) {
        const firstFeature = features[0] as Feature<Geometry>;
        if (firstFeature.get('clickable')) {
          evt.preventDefault();
          const event = new BaseEvent('rightClick');
          event.target = {
            coordinate: this.map.getCoordinateFromPixel(pixel),
            pixel
          };
          if (!this.mapHelper.interaction.interactionType)
            firstFeature.dispatchEvent(event);
          return;
        }
      }
    };
    this.target.addEventListener('contextmenu', this.obRightClick);
    this.obPointerMove = this.map.on('pointermove', evt => {
      if (evt.dragging)
        return;
      const features = this.map.getFeaturesAtPixel(evt.pixel).filter(x => x.get('clickable'));
      let cursor = 'auto';
      if (features.length > 0) {
        const firstFeature = features[0] as Feature<Geometry>;
        cursor = 'pointer';
        if (this.highLightFeature) {
          if (getUid(this.highLightFeature) !== getUid(firstFeature)) {
            const leaveFeature = this.highLightFeature;
            this.highLightFeature = firstFeature;
            if (!this.mapHelper.interaction.interactionType)
              firstFeature.dispatchEvent('mouseEnter');
            this.mapHelper.interaction.addToCollection(firstFeature);
            this.setStyle(firstFeature, false);
            if (!this.mapHelper.interaction.interactionType)
              leaveFeature.dispatchEvent('mouseLeave');
            this.mapHelper.interaction.moveCollectionFeature(leaveFeature);
            this.setStyle(leaveFeature);
          }
        } else {
          this.highLightFeature = firstFeature;
          if (!this.mapHelper.interaction.interactionType)
            firstFeature.dispatchEvent('mouseEnter');
          this.mapHelper.interaction.addToCollection(firstFeature);
          this.setStyle(firstFeature, false);
        }
      } else {
        if (this.highLightFeature) {
          const eventFeature = this.highLightFeature;
          this.highLightFeature = undefined;
          if (!this.mapHelper.interaction.interactionType)
            eventFeature.dispatchEvent('mouseLeave');
          this.mapHelper.interaction.moveCollectionFeature(eventFeature);
          this.setStyle(eventFeature);
        }
      }
      target.style.cursor = cursor;
    }) as EventsKey;
  }

  notifyLevel() {
    if (this.highLightFeature) {
      this.target.style.cursor = 'auto';
      const eventFeature = this.highLightFeature;
      this.highLightFeature = undefined;
      eventFeature.dispatchEvent('mouseLeave');
      this.setStyle(eventFeature);
    }
  }

  stop() {
    if (this.obSingleClick) {
      unByKey(this.obSingleClick);
      this.obSingleClick = undefined;
    }
    if (this.obDoubleClick) {
      unByKey(this.obDoubleClick);
      this.obDoubleClick = undefined;
    }
    if (this.obPointerMove) {
      unByKey(this.obPointerMove);
      this.obPointerMove = undefined;
    }
    if (this.highLightFeature) {
      this.highLightFeature.dispatchEvent('mouseLeave');
      this.highLightFeature = undefined;
    }
    if (this.obRightClick) {
      this.target.removeEventListener('contextmenu', this.obRightClick);
    }
  }

  /**
   * 设置GIS元素的样式
   * @param feature
   * @param normalStyle
   * @private
   */
  private setStyle(feature: Feature<Geometry>, normalStyle = true) {
    if (this.mapHelper.interaction.interactionType)
      return
    const features = feature.get('features') as Feature<Geometry>[];
    if (features) {
      //聚合元素
      if (features.length === 1) {
        const featureInstance = getFeatureInstanceByFeature(features[0], this.mapHelper);
        if (featureInstance && !featureInstance.getPlayState()) {
          if (normalStyle && featureInstance.normalStyle)
            feature.setStyle(featureInstance.normalStyle);
          else if (featureInstance.highLightStyle)
            feature.setStyle(featureInstance.highLightStyle);
        }
      } else {
        if (normalStyle)
          feature.setStyle(feature.get('normalStyle'));
        else
          feature.setStyle(feature.get('highLightStyle'));
      }
    } else {
      const featureInstance = getFeatureInstanceByFeature(feature, this.mapHelper);
      if (featureInstance && !featureInstance.getPlayState() && !featureInstance.styleLike) {
        if (normalStyle)
          featureInstance.setNormalStyle();
        else
          featureInstance.setHighLightStyle();
      }
    }
  }
}