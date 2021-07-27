import Feature from "ol/Feature";
import {LineString, MultiLineString, MultiPoint, Point, Polygon} from "ol/geom";
import geoJson from "../../global";
import {booleanContains, booleanCrosses, feature} from "@turf/turf";

/**
 * 判断featureIn是否被featureOut所包含
 * @param featureOut 面类型
 * @param featureIn
 */
function isContainAB(featureOut: Feature, featureIn: Feature) {
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
function isCrossAB(featureOut: Feature, featureIn: Feature) {
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
  readonly nativeFeature!: Feature;

  /**
   * 判断是否包含目标元素
   */
  isContain(featureIn: Feature) {
    if (this.nativeFeature.getGeometry()!.getType() === 'Polygon')
      return isContainAB(this.nativeFeature, featureIn);
    else {
      console.log('指定图形不是面类型，无法计算');
      return false;
    }
  }

  /**
   * 判断是否被目标元素包含
   */
  isBeContain(featureOut: Feature) {
    if (featureOut.getGeometry()!.getType() === 'Polygon')
      return isContainAB(featureOut, this.nativeFeature);
    else {
      console.log('目标图形不是面类型，无法计算');
      return false;
    }
  }

  /**
   * 判断是否与目标元素相交
   * @param targetFeature
   */
  isCross(targetFeature: Feature) {
    const type = this.nativeFeature.getGeometry()!.getType();
    const typeTarget = targetFeature.getGeometry()!.getType();
    if (type === 'Polygon' || type === 'LineString') {
      return isCrossAB(this.nativeFeature, targetFeature);
    } else if (type === 'Point' || type === 'MultiLineString') {
      if (typeTarget === 'Polygon' || typeTarget === 'LineString') {
        return isCrossAB(targetFeature, this.nativeFeature);
      }
    }
    console.log('无法计算是否相交');
    return false;
  }
}

