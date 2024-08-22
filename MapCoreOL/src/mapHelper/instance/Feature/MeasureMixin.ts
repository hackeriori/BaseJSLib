import Feature from "ol/Feature";
import {getArea, getLength} from 'ol/sphere';
import Map from "ol/Map";
import MapHelper from "../../index";
import {Coordinate} from "ol/coordinate";
import {Geometry} from "ol/geom";
import {along, lineString, center} from "@turf/turf";
import geoJson from '../../global';

export default abstract class MeasureMixin {
  mapHelper!: MapHelper;
  map!: Map;
  //元素ID
  readonly id!: string;
  //ol原生元素对象
  readonly nativeFeature!: Feature<Geometry>;

  /**
   * 计算面积
   */
  calcArea() {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry && geometry.getType() === 'Polygon') {
      return getArea(geometry, {projection: this.map.getView().getProjection()});
    } else
      console.log(`ID为${this.id}的元素不是多边形，无法计算面积`);
  }

  /**
   * 计算长度
   */
  calcLength() {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry && geometry.getType() === 'LineString') {
      return getLength(geometry, {projection: this.map.getView().getProjection()});
    } else
      console.log(`ID为${this.id}的元素不是折线，无法计算长度`);
  }

  /**
   * 计算外包矩形盒
   * @param outProjection 返回结果的坐标系
   */
  calcExtent(outProjection?: string) {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      const extent = geometry.getExtent();
      if (outProjection) {
        const c1 = this.mapHelper.projection.transCoordinate([extent[0], extent[1]], undefined, outProjection);
        const c2 = this.mapHelper.projection.transCoordinate([extent[2], extent[3]], undefined, outProjection);
        extent[0] = c1[0];
        extent[1] = c1[1];
        extent[2] = c2[0];
        extent[3] = c2[1];
      }
      return extent;
    }
  }

  /**
   * 获取拐点信息
   * @param outProjection 返回结果的坐标系
   */
  getCoordinates(outProjection?: string) {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      if ((geometry as any).getCoordinates) {
        let coordinates = (geometry as any).getCoordinates() as Coordinate | Coordinate[] | Coordinate[][] | undefined;
        if (outProjection && coordinates)
          coordinates = this.mapHelper.projection.transCoordinates(coordinates, undefined, outProjection);
        return coordinates;
      }
    }
  }

  /**
   * 获取图形中心点
   * @param outProjection
   */
  getCenter(outProjection?: string) {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      let coordinates: Coordinate;
      const type = geometry.getType();
      if (type === 'Point')
        coordinates = (geometry as any).getCoordinates();
      else if (type === 'LineString') {
        const gisCoordinates: Coordinate[] = this.mapHelper.projection.transCoordinates((geometry as any).getCoordinates() as Coordinate[], undefined, 'EPSG:4326');
        const centerPoint = along(lineString(gisCoordinates), (this.calcLength() as number) / 2, {units: 'meters'});
        coordinates = this.mapHelper.projection.transCoordinate(centerPoint.geometry.coordinates, 'EPSG:4326');
      } else {
        const feature = geoJson.writeFeatureObject(this.nativeFeature);
        (feature.geometry as any).coordinates = this.mapHelper.projection.transCoordinates((feature.geometry as any).coordinates, undefined, 'EPSG:4326');
        const centerPoint = center(feature as any);
        coordinates = this.mapHelper.projection.transCoordinate(centerPoint.geometry.coordinates, 'EPSG:4326');
      }
      if (outProjection && coordinates)
        coordinates = this.mapHelper.projection.transCoordinates(coordinates, undefined, outProjection);
      return coordinates;
    }
  }
}