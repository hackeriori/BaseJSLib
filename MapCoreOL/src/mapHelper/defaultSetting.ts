import {MapOptions} from "ol/PluggableMap";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import BaseLayer from "ol/layer/Base";
import {BaseLayerTypes} from "./types";

/**
 * 获取默认地图初始化选项
 * @param target 地图容器
 * @param preLayers 预制地图
 */
export function getDefaultMapInitOptions(target: HTMLElement, preLayers?: BaseLayerTypes[]) {
  const mapOptions: MapOptions = {
    target: target,
    view: new View({
      center: [11849201.99781884, 3430156.63782584],
      zoom: 16,
      enableRotation: false
    }),
    controls: []
  }
  if (preLayers) {
    mapOptions.layers = getPreMapsByLayerInfos(preLayers);
  }
  return mapOptions;
}

//预设地图
const preMap = [
  {
    id: "0", name: '高德地图', layer: new TileLayer({
      source: new XYZ({
        url: "http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8",
        crossOrigin: 'anonymous',
        maxZoom: 18
      })
    })
  },
  {
    id: "1", name: '高德地图-蓝色主题', layer: new TileLayer({
      source: new XYZ({
        url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: 'anonymous',
        maxZoom: 16
      })
    })
  },
  {
    id: "2", name: '谷歌街道地图', layer: new TileLayer({
      source: new XYZ({
        url: "http://mt2.google.cn/vt/lyrs=m@189&gl=cn&x={x}&y={y}&z={z}",
        crossOrigin: 'anonymous',
        maxZoom: 18
      })
    })
  },
  {
    id: "3", name: '谷歌卫星地图混合', layer: new TileLayer({
      source: new XYZ({
        url: "http://mt2.google.cn/vt/lyrs=y@189&gl=cn&x={x}&y={y}&z={z}",
        crossOrigin: 'anonymous',
        maxZoom: 18
      })
    })
  },
]

/**
 * 根据预设地图ID获取预设地图
 * @param id
 */
function getPreMapByID(id: string) {
  const foundMap = preMap.find(x => x.id === id);
  if (foundMap) {
    const layer = foundMap.layer
    layer.set('id', id);
    return foundMap.layer;
  } else {
    console.log(`id为${id}的预制底图没有找到，请检查！`)
    return undefined;
  }
}

/**
 * 根据传入的layer信息获取预设图层数组
 * @param layerGetInfos
 */
function getPreMapsByLayerInfos(layerGetInfos: BaseLayerTypes[]) {
  const layers: BaseLayer[] = [];
  layerGetInfos.forEach(x => {
    const layer = getPreMapByID(x.id);
    if (layer) {
      layer.setVisible(x.visibility);
      layers.push(layer);
    }
  });
  return layers;
}