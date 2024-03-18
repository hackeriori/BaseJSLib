import Map from 'ol/Map'
import {MapFrame} from "../MapFrame";
import LayerInstance from "../instance/Layer";
import {Options as TileOptions} from "ol/layer/BaseTile";
import {Options as VectorOptions} from "ol/layer/BaseVector";
import VectorSource, {Options as VectorSourceOptions} from "ol/source/Vector";
import Cluster, {Options as ClusterSourceOptions} from "ol/source/Cluster";
import XYZ, {Options as XYZSourceOptions} from "ol/source/XYZ";
import {Options as WMTSOptions} from 'ol/source/WMTS';
import WMTSGrid from 'ol/tilegrid/WMTS';
import MapHelper from "../index";
import Feature from "ol/Feature";
import BaseEvent from "ol/events/Event";
import {
  getDefaultHighLightClusterStyles,
  getDefaultNormalClusterStyles,
  getFeatureInstanceByFeature,
  getPelInstanceByFeature,
  getZoomScale,
  type ZoomConfig
} from "../global";
import {ClusterEventType, ClusterStyle, ClusterStyles} from "./types";
import FeatureInstance from "../instance/Feature";
import PelInstance from '../instance/Feature/Pel';
import CircleStyle from "ol/style/Circle";
import {Tile, Vector, WMTS} from "ol/source";
import {Geometry} from "ol/geom";
import {Options as ImageOptions} from "ol/layer/BaseImage";
import ImageSource, {Options as ImageSourceOptions} from "ol/source/ImageStatic";
import {get as getProjection} from "ol/proj";
import {getTopLeft, getWidth} from "ol/extent";

export default class LayerHelper extends MapFrame {
  readonly layerList: {[key: string]: LayerInstance} = {};

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  /**
   * 创建图层
   * @param id 图层ID
   * @param options 图层选项
   */
  createLayer(id: string, options: TileOptions<Tile | WMTS> | VectorOptions<Vector<Geometry>> | ImageOptions<ImageSource>) {
    if (this.layerList[id])
      console.log(`图层id[${id}]重复，重复的图层未添加到地图上`);
    else {
      return new LayerInstance(this.map, this.mapHelper, id, options, this.layerList);
    }
  }

  /**
   * 创建数据源，如果时创建聚合源，可以指定styles参数
   * @param options 数据源选项
   * @param clusterStyles 聚合图元样式
   * @param zoom 聚合缩放配置
   */
  createVectorSource(options: VectorSourceOptions | ClusterSourceOptions, clusterStyles?: ClusterStyles, zoom?: ZoomConfig) {
    const dealStyle = (x: ClusterStyle, length: number) => {
      const style = this.mapHelper.style.createStyle(x);
      if (x.text)
        style.getText().setText(x.text.text?.replace('${num}', length.toString()));
      if (clusterStyles && x.autoIncrease && x.image && 'radius' in x.image) {
        const circle = style.getImage() as CircleStyle;
        circle.setRadius(circle.getRadius() + Math.floor(length / x.increaseNumber!) * x.increaseBy!);
      }
      return style;
    }

    if ('source' in options) {
      const cluster = new Cluster(options);
      cluster.on('addfeature', evt => {
        const feature = evt.feature!;
        const features = feature.get('features') as Feature<Geometry>[];
        const featureInstances = features.map(x => getFeatureInstanceByFeature(x, this.mapHelper))
          .filter(x => x) as FeatureInstance[];
        const pelInstances = features.map(x => getPelInstanceByFeature(x, this.mapHelper))
          .filter(x => x) as PelInstance[];
        //设置样式
        if (features.length === 1) {
          //单个元素
          if (featureInstances.length === 1) {
            feature.setStyle(featureInstances[0].nativeFeature.getStyle());
          } else if (pelInstances.length === 1) {
            feature.setStyle(pelInstances[0].nativeFeature.getStyle()); //此步非常坑爹，如果不设置，样式会采用默认样式
            pelInstances[0].isCluster = false;
          }
        } else {
          pelInstances.forEach(x => x.isCluster = true);
          //聚合元素
          let normalStyles: ClusterStyle[];
          let highLightStyles: ClusterStyle[];
          if (clusterStyles) {
            normalStyles = clusterStyles.normalStyles;
            highLightStyles = clusterStyles.highLightStyles;
          } else {
            normalStyles = getDefaultNormalClusterStyles();
            highLightStyles = getDefaultHighLightClusterStyles();
          }
          //#region 设置聚合缩放，由于这个回调是地图缩放后必定调用，所以就没必要放地图缩放回调里面去执行zoomLevelChanged了
          if (zoom) {
            const scale = getZoomScale(zoom, this.mapHelper.map.getView().getZoom()!);
            normalStyles.forEach(x => {
              x.image && 'src' in x.image && (x.image.scale = scale);
              x.text && (x.text.scale = scale);
            });
            highLightStyles.forEach(x => {
              x.image && 'src' in x.image && (x.image.scale = scale);
              x.text && (x.text.scale = scale);
            });
          }
          //#endregion
          const normalStyle = normalStyles.map(x => dealStyle(x, features.length));
          const highLightStyle = highLightStyles.map(x => dealStyle(x, features.length));
          feature.set('normalStyle', normalStyle);
          feature.set('highLightStyle', highLightStyle);
          feature.setStyle(normalStyle);
        }
        //设置事件
        feature.set('clickable', true);
        feature.on('singleClick' as any, () => {
          if (features.length === 1 && featureInstances.length === 1)
            featureInstances[0].singleClickEvents.forEach(x => x({type: 'singleClick'}));
          else {
            const baseEvent = new BaseEvent('singleClick') as ClusterEventType;
            baseEvent.featureInstances = featureInstances;
            baseEvent.pelInstances = pelInstances;
            baseEvent.target = feature;
            cluster.dispatchEvent(baseEvent);
          }
        });
        feature.on('rightClick' as any, () => {
          if (features.length === 1 && featureInstances.length === 1)
            featureInstances[0].rightClickEvents.forEach(x => x({type: 'rightClick'}));
          else {
            const baseEvent = new BaseEvent('rightClick') as ClusterEventType;
            baseEvent.featureInstances = featureInstances;
            baseEvent.pelInstances = pelInstances;
            baseEvent.target = feature;
            cluster.dispatchEvent(baseEvent);
          }
        });
        feature.on('mouseEnter' as any, () => {
          if (features.length === 1 && featureInstances.length === 1)
            featureInstances[0].mouseEnterEvents.forEach(x => x({type: 'mouseEnter'}));
          else {
            const baseEvent = new BaseEvent('mouseEnter') as ClusterEventType;
            baseEvent.featureInstances = featureInstances;
            baseEvent.pelInstances = pelInstances;
            baseEvent.target = feature;
            cluster.dispatchEvent(baseEvent);
          }
        });
        feature.on('mouseLeave' as any, () => {
          if (features.length === 1 && featureInstances.length === 1)
            featureInstances[0].mouseLeaveEvents.forEach(x => x({type: 'mouseLeave'}));
          else {
            const baseEvent = new BaseEvent('mouseLeave') as ClusterEventType;
            baseEvent.featureInstances = featureInstances;
            baseEvent.pelInstances = pelInstances;
            baseEvent.target = feature;
            cluster.dispatchEvent(baseEvent);
          }
        });
      })
      return cluster;
    } else
      return new VectorSource(options);
  }

  /**
   * 创建瓦片源
   * @param options 数据源选项
   */
  createTileSource(options: XYZSourceOptions) {
    if (!options.crossOrigin) {
      options.crossOrigin = 'anonymous';
    }
    return new XYZ(options);
  }

  /**
   * 创建图片源
   * @param options 图片源选项
   */
  createImageSource(options: ImageSourceOptions) {
    if (!options.crossOrigin) {
      options.crossOrigin = 'anonymous';
    }
    return new ImageSource(options);
  }

  /**
   * 创建WMTS源
   * @param options WMTS选项(tileGrid除外)
   */
  createWMTSSource(options: PartialByKeys<WMTSOptions, 'tileGrid' | 'matrixSet'>) {
    if (!options.crossOrigin) {
      options.crossOrigin = 'anonymous';
    }
    if (!options.tileGrid) {
      //默认使用3857的网格
      const projection = getProjection('EPSG:3857')!;
      const projectionExtent = projection.getExtent();
      const size = getWidth(projectionExtent) / 256;
      const maxZoom = 21;
      const resolutions = new Array(maxZoom);
      const matrixIds = new Array(maxZoom);
      for (let z = 0; z < maxZoom; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
      options.tileGrid = new WMTSGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      })
    }
    if (options.wrapX === undefined || options.wrapX === null)
      options.wrapX = true;
    if (!options.matrixSet)
      options.matrixSet = 'GoogleMapsCompatible';
    return new WMTS(options as WMTSOptions);
  }

  /**
   * 按图层ID获取图层实例
   * @param id 图层ID
   */
  getLayer(id: string) {
    return this.layerList[id] as LayerInstance | undefined;
  }

  /**
   * 移除图层
   * @param id 图层ID
   */
  removeLayer(id: string) {
    const layer = this.getLayer(id);
    if (layer) {
      layer.destroy();
      return true;
    } else
      return false;
  }
}
