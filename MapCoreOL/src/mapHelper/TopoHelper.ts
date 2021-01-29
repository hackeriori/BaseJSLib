import Map from "ol/Map";
import GeoJSON from 'ol/format/GeoJSON'
import Feature from "ol/Feature";
import {getArea, getLength} from 'ol/sphere';
import Geometry from "ol/geom/Geometry";

export default class TopoHelper {
  geoJSON = new GeoJSON();

  constructor(private map: Map) {
  }

  /**
   * 判断featureIn是否被featureOut所包含
   * @param featureOut
   * @param featureIn
   */
  async isContains(featureOut: Feature, featureIn: Feature) {
    const {default: booleanContains} = await import(/* webpackChunkName: "turf" */'@turf/boolean-contains');
    const geoFeatureOut = this.geoJSON.writeFeatureObject(featureOut);
    const geoFeatureIn = this.geoJSON.writeFeatureObject(featureIn);
    return booleanContains(geoFeatureOut, geoFeatureIn);
  }

  /**
   * 获取面积
   * @param feature 元素
   */
  getArea(feature: Feature): number
  /**
   * 获取面积
   * @param geometry 几何体
   */
  getArea(geometry: Geometry): number
  getArea(param: Feature | Geometry) {
    let calcPolygon: Geometry | undefined;
    if (param instanceof Feature) {
      calcPolygon = param.getGeometry();
    } else
      calcPolygon = param;
    return getArea(calcPolygon, {projection: this.map.getView().getProjection()});
  }

  /**
   * 获取长度
   * @param feature 元素
   */
  getLength(feature: Feature): number
  /**
   * 获取长度
   * @param geometry 几何体
   */
  getLength(geometry: Geometry): number
  getLength(polygon: Feature | Geometry) {
    let calcPolygon: Geometry | undefined;
    if (polygon instanceof Feature) {
      calcPolygon = polygon.getGeometry();
    } else
      calcPolygon = polygon;
    return getLength(calcPolygon, {projection: this.map.getView().getProjection()});
  }
}