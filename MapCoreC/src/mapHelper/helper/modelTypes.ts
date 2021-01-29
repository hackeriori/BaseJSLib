import _CesiumType from "cesium";

export default interface ModelOptions {
  //ID,字符串型
  id: string;
  //URL地址
  url: string;
  //坐标[x,y,z]，经纬度
  coordinate: number[];
  //姿态
  pose?: _CesiumType.HeadingPitchRoll
}