import GeoJSON from 'ol/format/GeoJSON'
import Feature from "ol/Feature";
import FeatureInstance from "./instance/Feature";
import MapHelper from "./index";
import {StyleType} from "./instance/Feature/types";
import PelInstance from "./instance/Feature/Pel";
import {ClusterStyle} from "./helper/types";
import {Geometry} from "ol/geom";

const geoJson = new GeoJSON();
export default geoJson;

export function getFeatureInstanceByFeature(feature: Feature<Geometry>, mapHelper: MapHelper) {
  const featureInner = getBaseFeatureInstanceByFeature(feature, mapHelper);
  if (featureInner && featureInner instanceof FeatureInstance)
    return featureInner;
}

export function getBaseFeatureInstanceByFeature(feature: Feature<Geometry>, mapHelper: MapHelper) {
  const id: string | null = feature.get('id');
  const layerID: string | null = feature.get('layerID');
  if (id && layerID) {
    const layer = mapHelper.layer.getLayer(layerID);
    if (layer) {
      return layer.getFeature(id);
    }
  }
}

export function getPelInstanceByFeature(feature: Feature<Geometry>, mapHelper: MapHelper) {
  const featureInner = getBaseFeatureInstanceByFeature(feature, mapHelper);
  if (featureInner && featureInner instanceof PelInstance)
    return featureInner;
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
      },
      text: '${num}',
    },
    //是否自动增长
    autoIncrease: true,
    //自动增长的契机
    increaseNumber: 10,
    //增长值
    increaseBy: 1
  }] as ClusterStyle[]
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
      },
      text: '${num}',
    },
    //是否自动增长
    autoIncrease: true,
    //自动增长的契机
    increaseNumber: 10,
    //增长值
    increaseBy: 1
  }] as ClusterStyle[]
}

export function zoomLevelChanged(mapHelper: MapHelper) {
  const zoom = mapHelper.map.getView().getZoom();
  if (zoom) {
    for (const key in mapHelper.layer.layerList) {
      const layerInstance = mapHelper.layer.layerList[key];
      const maxZoom = layerInstance.nativeLayer.getMaxZoom();
      const minZoom = layerInstance.nativeLayer.getMinZoom();
      const zoomVisibly = zoom > minZoom && zoom < maxZoom;
      if (zoomVisibly !== layerInstance.zoomVisibly) {
        if (zoomVisibly)
          layerInstance.show(true);
        else
          layerInstance.hide(true);
      }
    }
  }
}