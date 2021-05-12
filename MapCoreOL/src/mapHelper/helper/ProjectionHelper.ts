import proj4 from 'proj4'
import Map from "ol/Map";
import {Coordinate} from "ol/coordinate";

export default class ProjectionTransition {
  private readonly defaultProjection: string

  constructor(public map: Map) {
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
    if (!outProjection) {
      outProjection = this.defaultProjection;
      if (!inProjection)
        inProjection = outProjection === 'EPSG:4326' ? 'EPSG:3857' : 'EPSG:4326';
      return proj4(inProjection, outProjection, coordinate);
    } else {
      if (!inProjection)
        inProjection = this.defaultProjection;
      return proj4(inProjection, outProjection, coordinate);
    }
  }
}