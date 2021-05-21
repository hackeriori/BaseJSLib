import BaseEvent from "ol/events/Event";
import FeatureInstance from "../instance/Feature";
import Feature from "ol/Feature";
import {StyleType} from "../instance/Feature/types";

export interface ClusterEventType extends BaseEvent {
  target: Feature,
  featureInstances: FeatureInstance[],
}

export interface ClusterStyles {
  normalStyles: StyleType[],
  highLightStyles: StyleType[],
}