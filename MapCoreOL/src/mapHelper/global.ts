import GeoJSON from 'ol/format/GeoJSON'
import Feature from "ol/Feature";
import FeatureInstance from "./instance/Feature";
import MapHelper from "./index";
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
      text: '${num}'
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
      text: '${num}'
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

interface DebounceReturnFunType<T extends (...args: any) => any> {
  (...arg: Parameters<T>): void,

  // 取消执行
  cancel(): void
}

/**
 * 防抖，目标函数在防抖时间内不会执行，每次执行防抖方法都会造成防抖时间延长，超过防抖时间才会执行
 * @param fn 目标函数
 * @param delay 防抖时间
 * @param immediate 是否立即执行
 * @param resultCallback 用于获取目标函数执行结果的回调方法
 */
export function debounce<T extends (...args: any) => any>(fn: T, delay: number, immediate = false, resultCallback?: (result: ReturnType<T>) => void) {
  let timer: NodeJS.Timeout | null = null
  //是否已执行
  let isInvoke = false

  const _debounce: DebounceReturnFunType<T> = function (this: any, ...args) {
    if (timer)
      clearTimeout(timer)
    if (immediate && !isInvoke) {
      const result = fn.apply(this, args)
      if (resultCallback)
        resultCallback(result)
      isInvoke = true
    }
    timer = setTimeout(() => {
      const result = fn.apply(this, args)
      if (resultCallback)
        resultCallback(result)
      timer = null
    }, delay)
  }

  _debounce.cancel = function () {
    if (timer) clearTimeout(timer)
    timer = null
  }

  return _debounce
}

export interface ZoomConfig {
  // 最大缩放层级，达到或超过后缩放比例为1
  maxZoom: number,
  // 最小缩放层级，达到或小于后使用最小缩放比例minScale
  minZoom: number,
  // 最小缩放比例，大于0小于1
  minScale: number
}

/**
 * 根据配置（例如pel对象带的配置）和当前的缩放层级，计算出缩放大小
 * @param config 带配置的对象
 * @param zoom 当前的缩放层级
 */
export function getZoomScale(config: ZoomConfig, zoom: number) {
  let scale: number
  if (zoom >= config.maxZoom) {
    scale = 1;
  } else if (zoom <= config.minZoom) {
    scale = config.minScale;
  } else {
    const zoomPercent = (zoom - config.minZoom) / (config.maxZoom - config.minZoom);
    scale = config.minScale + zoomPercent * (1 - config.minScale);
  }
  return scale;
}