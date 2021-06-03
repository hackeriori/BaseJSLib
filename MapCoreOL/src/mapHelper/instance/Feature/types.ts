import {Feature, GeoJsonProperties, Geometry} from "geojson";
import {Options as OverlayOptions} from 'ol/Overlay';
import {Options as FillOptions} from "ol/style/Fill";
import {Options as StrokeOptions} from "ol/style/Stroke";
import TextPlacement from "ol/style/TextPlacement";
import {Options as IconOptions} from "ol/style/Icon";

export interface FeaturePropCreateType {
  id: string;
  name: string;
  clickable: boolean;
}

export default interface FeaturePropType extends FeaturePropCreateType {
  layerID: string;
}

export interface FeatureGeoType<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends Feature<G, P> {
  id: string;
}

export interface PelOptionsType {
  id: string,
  options: OverlayOptions,
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

export interface FlashPointParamsType {
  //持续时间，单位毫秒，默认800
  duration: number,
  //颜色，不要使用rgba格式，默认红色
  color: string,
  //圈由外向内扩散,默认true
  outToIn: boolean,
  //圈的最大半径，默认30
  maxRadius: number,
  //圈的最小半径，默认5
  minRadius: number,
}