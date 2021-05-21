import GeoJSON from 'ol/format/GeoJSON'
import Feature from "ol/Feature";
import FeatureInstance from "./instance/Feature";
import MapHelper from "./index";
import {StyleType} from "./instance/Feature/types";

const geoJson = new GeoJSON();
export default geoJson;

export function getFeatureInstanceByFeature(feature: Feature, mapHelper: MapHelper) {
  const id: string | null = feature.get('id');
  const layerID: string | null = feature.get('layerID');
  if (id && layerID) {
    const layer = mapHelper.layer.getLayer(layerID);
    if (layer) {
      const feature = layer.getFeature(id);
      if (feature instanceof FeatureInstance) {
        return feature;
      }
    }
  }
}

export function getDefaultNormalClusterStyles() {
  return [{
    image: {
      radius: 12,
      stroke: {
        width: 1,
        color: '#3399cc'
      },
      fill: {color: 'rgba(204,153,51,0.75)'}
    },
    text: {
      font: '14px sans-serif',
      fill: {
        color: '#3399CC'
      }
    }
  }] as StyleType[]
}

export function getDefaultHighLightClusterStyles() {
  return [{
    image: {
      radius: 12,
      stroke: {
        width: 2,
        color: '#3399cc'
      },
      fill: {color: 'rgba(204,153,51,0.8)'}
    },
    text: {
      font: '14px sans-serif',
      fill: {
        color: '#3399CC'
      }
    }
  }] as StyleType[]
}