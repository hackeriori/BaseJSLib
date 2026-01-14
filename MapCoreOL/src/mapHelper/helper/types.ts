import BaseEvent from "ol/events/Event";
import FeatureInstance from "../instance/Feature";
import Feature from "ol/Feature";
import {StyleType} from "../instance/Feature/types";
import {Coordinate} from "ol/coordinate";
import PelInstance from "../instance/Feature/Pel";
import {Geometry} from "ol/geom";

export interface ClusterEventType extends BaseEvent {
  target: Feature<Geometry>,
  featureInstances: FeatureInstance[],
  pelInstances: PelInstance[],
}

export interface ClusterStyles {
  normalStyles: ClusterStyle[],
  highLightStyles: ClusterStyle[],
}

export interface ViewerInfo {
  center: Coordinate;
  zoom: number;
  resolution?: number;
}

export interface ClusterStyle extends StyleType {
  //是否自动增长
  autoIncrease?: boolean,
  //自动增长的契机
  increaseNumber?: number,
  //增长值
  increaseBy?: number
  //图片列表（根据聚合数量决定），需要按从大到小的顺序排列
  imgList?: {num: number, src: string}[]
}