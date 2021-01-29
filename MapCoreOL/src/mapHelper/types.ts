import {Coordinate} from "ol/coordinate";
import {Options} from "ol/layer/BaseVector";
import {Options as FillOptions} from "ol/style/Fill";
import {Options as StrokeOptions} from "ol/style/Stroke";
import TextPlacement from "ol/style/TextPlacement";
import {Options as IconOptions} from "ol/style/Icon";

export interface BaseLayerTypes {
  id: string;
  visibility: boolean;
}

export interface FeaturePropertiesTypes {
  id: string;
  name: string;
  layer: string;
  clickable: boolean;
}

export type MapDropCallBack = (coordinate: Coordinate, dataTransfer: DataTransfer | null) => void;

export interface StyleImageItem {
  src: string;
  img: HTMLImageElement;
}

export interface ViewerInfo {
  center: Coordinate;
  zoom?: number;
  resolution?: number;
}

export interface StyleType {
  fill?: FillOptions;
  stroke?: StrokeOptions;
  text?: StyleText;
  image?: StyleCircle | IconOptions;
  zIndex?: number;
}

export interface StyleText {
  font?: string;
  maxAngle?: number;
  offsetX?: number;
  offsetY?: number;
  overflow?: boolean;
  placement?: TextPlacement;
  scale?: number;
  rotateWithView?: boolean;
  rotation?: number;
  text?: string;
  textAlign?: string;
  textBaseline?: string;
  fill?: FillOptions;
  stroke?: StrokeOptions;
  backgroundFill?: FillOptions;
  backgroundStroke?: StrokeOptions;
  padding?: number[];
}

export interface StyleCircle {
  fill?: FillOptions;
  radius: number;
  stroke?: StrokeOptions;
  displacement?: number[];
}