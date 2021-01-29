import Map from "ol/Map";
import {Coordinate} from "ol/coordinate";

export default class ProjectionTransition {
  private readonly defaultProjection: string

  constructor(public map: Map) {
    this.defaultProjection = map.getView().getProjection().getCode();
  }

  async addDefinition(name: string, projection: string) {
    const {default: proj4} = await import(/* webpackChunkName: "proj4" */'proj4');
    proj4.defs(name, projection);
  }

  /**
   * 转换坐标
   * @param coordinate 坐标点
   * @param inProjection 输入坐标，默认为当前地图坐标的对立坐标
   * @param outProjection 输出坐标，默认为当前地图坐标
   */
  async transCoordinate(coordinate: Coordinate, inProjection?: string, outProjection?: string) {
    if (!outProjection)
      outProjection = this.defaultProjection;
    if (!inProjection)
      inProjection = outProjection === 'EPSG:4326' ? 'EPSG:3859' : 'EPSG:4326'
    const {default: proj4} = await import(/* webpackChunkName: "proj4" */'proj4');
    return proj4(inProjection, outProjection, coordinate);
  }
}