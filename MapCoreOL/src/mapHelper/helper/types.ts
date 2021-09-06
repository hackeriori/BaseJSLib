import BaseEvent from "ol/events/Event";
import FeatureInstance from "../instance/Feature";
import Feature from "ol/Feature";
import {StyleType} from "../instance/Feature/types";
import {Coordinate} from "ol/coordinate";
import PelInstance from "../instance/Feature/Pel";

export interface ClusterEventType extends BaseEvent {
  target: Feature,
  featureInstances: FeatureInstance[],
  pelInstances: PelInstance[],
}

export interface ClusterStyles {
  normalStyles: StyleType[],
  highLightStyles: StyleType[],
}

export interface ViewerInfo {
  center: Coordinate;
  zoom: number;
  resolution: number;
}