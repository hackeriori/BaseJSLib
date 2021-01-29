import Map from "ol/Map";
import Feature from "ol/Feature";
import {EventsKey} from "ol/events";
import {getUid} from "ol";
import {unByKey} from "ol/Observable";
import {NotingClick} from "./types";
import BaseEvent from "ol/events/Event";

export default class CustomEvents {
  private obRightClick?: (evt: MouseEvent) => void;
  private obSingleClick?: EventsKey;
  private obDoubleClick?: EventsKey;
  private obPointerMove?: EventsKey;
  private highLightFeature?: Feature;
  private readonly target: HTMLElement;

  constructor(private map: Map) {
    this.target = this.map.getTargetElement();
  }

  start(callback?: NotingClick) {
    const target = this.target;
    this.obSingleClick = this.map.on('singleclick', evt => {
      const features = this.map.getFeaturesAtPixel(evt.pixel).filter(x => x.get('clickable'));
      if (features.length > 0) {
        const firstFeature = features[0] as Feature;
        firstFeature.dispatchEvent('singleClick');
        return;
      }
      if (callback) {
        callback(evt.coordinate);
      }
    });
    this.obDoubleClick = this.map.on('dblclick', evt => {
      const features = this.map.getFeaturesAtPixel(evt.pixel);
      if (features.length > 0) {
        const firstFeature = features[0] as Feature;
        firstFeature.dispatchEvent('doubleClick');
      }
    });
    this.obRightClick = evt => {
      const pixel = [evt.clientX, evt.clientY];
      const features = this.map.getFeaturesAtPixel(pixel);
      if (features.length > 0) {
        const firstFeature = features[0] as Feature;
        if (firstFeature.get('clickable')) {
          evt.preventDefault();
          const event = new BaseEvent('rightClick');
          event.target = this.map.getCoordinateFromPixel(pixel);
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
        const firstFeature = features[0] as Feature;
        cursor = 'pointer';
        if (this.highLightFeature) {
          if (getUid(this.highLightFeature) !== getUid(firstFeature)) {
            const leaveFeature = this.highLightFeature;
            this.highLightFeature = firstFeature;
            firstFeature.dispatchEvent('mouseEnter');
            leaveFeature.dispatchEvent('mouseLeave');
          }
        } else {
          this.highLightFeature = firstFeature;
          firstFeature.dispatchEvent('mouseEnter');
        }
      } else {
        if (this.highLightFeature) {
          const eventFeature = this.highLightFeature;
          this.highLightFeature = undefined;
          eventFeature.dispatchEvent('mouseLeave');
        }
      }
      target.style.cursor = cursor;
    });
  }

  notifyLevel() {
    if (this.highLightFeature) {
      this.target.style.cursor = 'auto';
      const eventFeature = this.highLightFeature;
      this.highLightFeature = undefined;
      eventFeature.dispatchEvent('mouseLeave');
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
}