import Feature from "ol/Feature";
import {Geometry, LineString, MultiLineString, MultiPoint, Point, Polygon} from "ol/geom";
import geoJson, {getBaseFeatureInstanceByFeature} from "../../global";
import {
  booleanContains,
  booleanCrosses,
  lineSlice,
  length,
  lineOffset,
  lineString,
  midpoint,
  bezierSpline
} from "@turf/turf";
import MapHelper from "../../index";
import {getInExtentFeatures} from "./command";
import BaseFeature from "./BaseFeature";
import {Coordinate} from "ol/coordinate";
import {GeoJsonProperties} from "geojson";

const message = '指定图形不是面类型';
const lineMessage = '指定图形不是线元素';

/**
 * 判断featureIn是否被featureOut所包含
 * @param featureOut 面类型
 * @param featureIn
 */
function isContainAB(featureOut: Feature<Geometry>, featureIn: Feature<Geometry>) {
  if (featureIn.getGeometry()!.getType() === 'MultiLineString') {
    const lineStrings = (featureIn as Feature<MultiLineString>).getGeometry()!.getLineStrings();
    let contains = true;
    lineStrings.forEach(x => contains = contains && isContainAB(featureOut, new Feature(x)));
    return contains;
  } else {
    const geoFeatureOut = geoJson.writeFeatureObject(featureOut);
    const geoFeatureIn = geoJson.writeFeatureObject(featureIn);
    return booleanContains(geoFeatureOut, geoFeatureIn);
  }
}

/**
 * 判断featureOut和featureIn是否相交
 * @param featureOut 可以是线或者面
 * @param featureIn 见代码
 */
function isCrossAB(featureOut: Feature<Geometry>, featureIn: Feature<Geometry>) {
  const geometry = featureIn.getGeometry()!.getType();
  if (geometry === 'LineString') {
    const geoFeatureOut = geoJson.writeFeatureObject(featureOut);
    const geoFeatureIn = geoJson.writeFeatureObject(featureIn);
    return booleanCrosses(geoFeatureOut, geoFeatureIn);
  } else if (geometry === 'MultiLineString') {
    const lineStrings = (featureIn as Feature<MultiLineString>).getGeometry()!.getLineStrings();
    let crosses = false;
    lineStrings.forEach(x => crosses = crosses || isCrossAB(featureOut, new Feature(x)));
    return crosses;
  } else if (geometry === 'Polygon') {
    const rings = (featureIn as Feature<Polygon>).getGeometry()!.getLinearRings();
    const lineStrings = rings.map(x => new LineString(x.getCoordinates()));
    let crosses = false;
    lineStrings.forEach(x => crosses = crosses || isCrossAB(featureOut, new Feature(x)));
    return crosses;
  } else if (geometry === 'Point') {
    const multiPoint = new MultiPoint([(featureIn as Feature<Point>).getGeometry()!.getCoordinates()]);
    const geoFeatureOut = geoJson.writeFeatureObject(featureOut);
    const geoFeatureIn = geoJson.writeFeatureObject(new Feature(multiPoint));
    return booleanCrosses(geoFeatureOut, geoFeatureIn);
  } else {
    return false
  }
}

export default abstract class TopologyMixin {
  //ol原生元素对象
  readonly nativeFeature!: Feature<Geometry>;
  //元素ID
  readonly id!: string;
  mapHelper!: MapHelper

  /**
   * 获取包络矩形
   */
  getBBox() {
    return this.nativeFeature.getGeometry()!.getExtent();
  }

  /**
   * 判断是否包含目标元素
   */
  isContain(featureIn: Feature<Geometry>, logError = true) {
    if (this.nativeFeature.getGeometry()!.getType() === 'Polygon')
      return isContainAB(this.nativeFeature, featureIn);
    else {
      if (logError)
        console.log(message);
      return false;
    }
  }

  /**
   * 判断是否被目标元素包含
   */
  isBeContain(featureOut: Feature<Geometry>, logError = true) {
    if (featureOut.getGeometry()!.getType() === 'Polygon')
      return isContainAB(featureOut, this.nativeFeature);
    else {
      if (logError)
        console.log(message);
      return false;
    }
  }

  /**
   * 判断是否与目标元素相交
   */
  isCross(targetFeature: Feature<Geometry>, logError = true) {
    const type = this.nativeFeature.getGeometry()!.getType();
    const typeTarget = targetFeature.getGeometry()!.getType();
    if (type === 'Polygon' || type === 'LineString') {
      return isCrossAB(this.nativeFeature, targetFeature);
    } else if (type === 'Point' || type === 'MultiLineString') {
      if (typeTarget === 'Polygon' || typeTarget === 'LineString') {
        return isCrossAB(targetFeature, this.nativeFeature);
      }
    }
    if (logError)
      console.log('无法计算是否相交');
    return false;
  }

  /**
   * 获取在多边形中的元素
   */
  getContainFeatures() {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry && geometry.getType() === 'Polygon') {
      return getInExtentFeatures(this as any).filter(x => this.isContain(x, false)).map(x => getBaseFeatureInstanceByFeature(x, this.mapHelper)).filter(x => x) as BaseFeature[];
    } else {
      console.log(message);
    }
  }

  /**
   * 获取包含此元素的所有元素
   */
  getBeContainFeatures() {
    return getInExtentFeatures(this as any).filter(x => this.isBeContain(x, false)).map(x => getBaseFeatureInstanceByFeature(x, this.mapHelper)).filter(x => x) as BaseFeature[];
  }

  /**
   * 获取与此元素相交的所有元素
   */
  getCrossFeatures() {
    return getInExtentFeatures(this as any).filter(x => this.isCross(x, false)).map(x => getBaseFeatureInstanceByFeature(x, this.mapHelper)).filter(x => x) as BaseFeature[];
  }

  /**
   * 获取线附近的点元素在线上的距离信息
   * @param point
   */
  getLinePositionInfo(point: Coordinate) {
    const type = this.nativeFeature.getGeometry()!.getType();
    if (type === 'LineString') {
      const line = (this.nativeFeature.getGeometry() as LineString).clone();
      line.transform('EPSG:3857', 'EPSG:4326');
      const firstPoint = line.getFirstCoordinate();
      const closestPoint = line.getClosestPoint(this.mapHelper.projection.transCoordinate(point, 'EPSG:3857'));
      const subLine = lineSlice(firstPoint, closestPoint, {
        type: 'LineString',
        coordinates: line.getCoordinates()
      });
      return length(subLine, {units: 'meters'});
    } else {
      console.log(lineMessage)
    }
  }

  /**
   * 计算航线
   * @param replace 是否将计算出的航线替换掉自身
   * @param radian 航线弧度，默认为长度的10%
   */
  getAirLine(replace = true, radian = 0.1) {
    const geometry = this.nativeFeature.getGeometry() as LineString
    const type = geometry.getType();
    if (type === 'LineString') {
      if (geometry.getCoordinates().length > 2) {
        console.log('计算航线仅需两个点的线段');
        return
      }
      const lineNative = geometry.clone();
      lineNative.transform('EPSG:3857', 'EPSG:4326');
      const line = lineString(lineNative.getCoordinates());
      //获取线段长度
      const lineLength = length(line, {units: "meters"});
      const offsetLine = lineOffset(line, lineLength * radian, {units: "meters"});
      //获取偏移后线段的中点
      const midPoint = midpoint(offsetLine.geometry.coordinates[0], offsetLine.geometry.coordinates[1]);
      //计算由原线段和中点构成的贝塞尔曲线
      const bezierLine = bezierSpline(
        lineString([line.geometry.coordinates[0], midPoint.geometry.coordinates, line.geometry.coordinates[1]])
      );
      if (replace) {
        geometry.setCoordinates(bezierLine.geometry.coordinates);
        geometry.transform('EPSG:4326', 'EPSG:3857');
      }
      return bezierLine.geometry.coordinates.map(x => x);
    } else {
      console.log(lineMessage);
    }
  }
}

