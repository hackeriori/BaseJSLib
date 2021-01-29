import Feature from "ol/Feature";
import {Coordinate} from "ol/coordinate";

export type OneFeatureCallBack = (feature: Feature) => void;
export type ManyFeatureCallBack = (features: Feature[]) => void;
type VerifyFeatureCallBack = (feature: Feature) => boolean;
//是否可点击验证（图层ID数组或回调）
export type ClickableVerify = string[] | VerifyFeatureCallBack;

export interface ModifyFeatureItem {
  uid: string;
  feature: Feature;
  coordinate: Coordinate[][];
}

export type MeasureResult = (result: number, feature: Feature) => void;

export type NotingClick = (coordinate: Coordinate) => void;