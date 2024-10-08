import {Options as OverlayOptions} from 'ol/Overlay';
import {Options as FillOptions} from "ol/style/Fill";
import {Options as StrokeOptions} from "ol/style/Stroke";
import {Options as IconOptions} from "ol/style/Icon";
import {Feature, Geometry} from "geojson";
import {RenderFunction} from "ol/style/Style";

export interface FeaturePropCreateType {
  [name: string]: any;

  id: string;
  name: string;
  clickable: boolean;
}

export default interface FeaturePropType extends FeaturePropCreateType {
  layerID: string;
}

export interface FeatureGeoType<G extends Geometry | null = Geometry, P = FeaturePropCreateType> extends Feature<G, P> {
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
  image?: StyleCircle | IconOptions | StyleRegularShape;
  zIndex?: number;
  renderer?: RenderFunction
}

export interface StyleText {
  font?: string;
  maxAngle?: number;
  offsetX?: number;
  offsetY?: number;
  overflow?: boolean;
  placement?: any;
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

export interface StyleRegularShape {
  fill?: FillOptions;
  points: number;
  radius?: number;
  radius1?: number;
  radius2?: number;
  angle?: number;
  displacement?: number[];
  stroke?: StrokeOptions;
  rotation?: number;
  rotateWithView?: boolean;
  scale?: number;
}

export interface FlashPointParamsType {
  //持续时间，单位毫秒，默认800
  duration: number,
  //颜色，不要使用rgba格式，默认红色
  color: string,
  //圈由外向内扩散，默认true
  outToIn: boolean,
  //圈的最大半径，默认30
  maxRadius: number,
  //圈的最小半径，默认5
  minRadius: number,
  //过渡色，默认白色
  transitionColor: string,
}

export type InteractionType = 'move' | 'rotate' | 'zoom' | 'modify'

export interface RotateParamsType {
  // 旋转方向 0:顺时针，1:逆时针
  rotate: 0 | 1,
  // 动画频率，次/秒
  frequency: number
}

export interface ColorFlashParamsType {
  // 是否闪烁
  scale: boolean,
  // 变化颜色
  color: string,
  // 动画频率，次/秒
  frequency: number,
}
