import proj4 from 'proj4'
import Map from "ol/Map";
import {Coordinate} from "ol/coordinate";
import {MapFrame} from "../MapFrame";
import MapHelper from "../index";

export default class ProjectionHelper extends MapFrame {
  private readonly defaultProjection: string

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.defaultProjection = map.getView().getProjection().getCode();
  }

  /**
   * 添加坐标系
   * @param name 坐标系名称
   * @param projection 坐标系参数
   */
  addDefinition(name: string, projection: string) {
    proj4.defs(name, projection);
  }

  /**
   * 转换坐标，如果两个都没有，将点从对立坐标转到当前坐标，如果输出没有，将坐标从输入转到当前坐标，如果输入没有，将坐标从当前坐标转到输出坐标
   * @param coordinate 点
   * @param inProjection 输入坐标
   * @param outProjection 输出坐标
   */
  transCoordinate(coordinate: Coordinate, inProjection?: string, outProjection?: string) {
    if (outProjection) {
      if (!inProjection)
        inProjection = this.getDefaultProjection(outProjection);
      return proj4(inProjection, outProjection, coordinate);
    } else {
      if (inProjection) {
        outProjection = this.getDefaultProjection(inProjection);
      } else {
        outProjection = this.defaultProjection;
        inProjection = this.getDefaultProjection(outProjection);
      }
      return proj4(inProjection, outProjection, coordinate);
    }
  }

  /**
   * 适用于两个坐标系缺失一个求另一个的方法，获取对立坐标系或默认坐标系
   * @param inProjection
   * @private
   */
  private getDefaultProjection(inProjection: string) {
    let outProjection: string;
    switch (inProjection) {
      case 'EPSG:4326':
        outProjection = 'EPSG:3857';
        break;
      case 'EPSG:3857':
        outProjection = 'EPSG:4326';
        break;
      default:
        outProjection = this.defaultProjection;
    }
    return outProjection
  }
}