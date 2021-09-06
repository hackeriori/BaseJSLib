import Map from 'ol/Map'
import {MapFrame} from "../MapFrame";
import LayerInstance from "../instance/Layer";
import {Options as TileOptions} from "ol/layer/BaseTile";
import {Options as VectorOptions} from "ol/layer/BaseVector";
import VectorSource, {Options as VectorSourceOptions} from "ol/source/Vector";
import Cluster, {Options as ClusterSourceOptions} from "ol/source/Cluster";
import XYZ, {Options as XYZSourceOptions} from "ol/source/XYZ";
import MapHelper from "../index";
import Feature from "ol/Feature";
import BaseEvent from "ol/events/Event";
import {
  getDefaultHighLightClusterStyles,
  getDefaultNormalClusterStyles,
  getFeatureInstanceByFeature,
  getPelInstanceByFeature
} from "../global";
import {ClusterEventType, ClusterStyles} from "./types";
import FeatureInstance from "../instance/Feature";
import {StyleType} from "../instance/Feature/types";
import PelInstance from '../instance/Feature/Pel';

export default class LayerHelper extends MapFrame {
  readonly layerList: { [key: string]: LayerInstance } = {};

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  /**
   * 创建图层
   * @param id 图层ID
   * @param options 图层选项
   */
  createLayer(id: string, options: TileOptions | VectorOptions) {
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
   */
  createVectorSource(options: VectorSourceOptions | ClusterSourceOptions, clusterStyles?: ClusterStyles) {
    if ('source' in options) {
      const cluster = new Cluster(options);
      cluster.on('addfeature', evt => {
        const {feature} = evt;
        const features = feature.get('features') as Feature[];
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
          let normalStyles: StyleType[];
          let highLightStyles: StyleType[];
          if (clusterStyles) {
            normalStyles = clusterStyles.normalStyles;
            highLightStyles = clusterStyles.highLightStyles;
          } else {
            normalStyles = getDefaultNormalClusterStyles();
            highLightStyles = getDefaultHighLightClusterStyles();
          }
          const normalStyle = normalStyles.map(x => {
            if (x.text)
              x.text.text = features.length.toString();
            return this.mapHelper.style.createStyle(x);
          });
          const highLightStyle = highLightStyles.map(x => {
            if (x.text)
              x.text.text = features.length.toString();
            return this.mapHelper.style.createStyle(x);
          });
          feature.set('normalStyle', normalStyle);
          feature.set('highLightStyle', highLightStyle);
          feature.setStyle(normalStyle);
        }
        //设置事件
        feature.set('clickable', true);
        feature.on('singleClick', () => {
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
        feature.on('rightClick', () => {
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
        feature.on('mouseEnter', () => {
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
        feature.on('mouseLeave', () => {
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
    return new XYZ(options);
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