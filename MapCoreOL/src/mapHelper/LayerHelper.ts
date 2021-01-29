import Map from 'ol/Map'
import VectorLayer from "ol/layer/Vector";
import TileLayer from 'ol/layer/Tile';
import {Options as TileOptions} from 'ol/layer/BaseTile';
import {Options as VectorOptions} from 'ol/layer/BaseVector';
import VectorSource, {Options as SourceOptions} from "ol/source/Vector";
import Feature from 'ol/Feature';
import GeometryType from "ol/geom/GeometryType";
import {Coordinate} from "ol/coordinate";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon, {fromCircle} from "ol/geom/Polygon";
import Geometry from "ol/geom/Geometry";
import {FeaturePropertiesTypes} from './types';
import XYZ, {Options as XYZOptions} from "ol/source/XYZ";
import Cluster from "ol/source/Cluster";
import Circle from "ol/geom/Circle";
import MultiLineString from "ol/geom/MultiLineString";
import BaseLayer from "ol/layer/Base";
import Source from "ol/source/Source";
import TileSource from "ol/source/Tile";

export default class LayerHelper {

  constructor(public map: Map) {
  }

  /**
   * 添加矢量图层
   * @param vectorLayerOptions 矢量图层选项
   * @param id 图层ID
   */
  createLayer(vectorLayerOptions: VectorOptions, id: string): VectorLayer
  /**
   * 添加瓦片图层
   * @param tileLayerOptions 瓦片图层选项
   * @param id 图层ID
   */
  createLayer(tileLayerOptions: TileOptions, id: string): TileLayer
  createLayer(options: VectorOptions | TileOptions, id: string) {
    let layer: BaseLayer;
    if (options.source! instanceof TileSource)
      layer = new TileLayer(options as TileOptions);
    else
      layer = new VectorLayer(options as VectorOptions);
    layer.set('id', id)
    this.map.addLayer(layer);
    return layer;
  }

  /**
   * 获取所有图层
   */
  getLayers(): BaseLayer[]
  /**
   * 获取所有矢量图层
   * @param type 传入"vector"
   */
  getLayers(type: 'vector'): VectorLayer[]
  /**
   * 获取所有瓦片图层
   * @param type 传入"tile"
   */
  getLayers(type: 'tile'): TileLayer[]
  getLayers(type?: 'vector' | 'tile') {
    const layers = this.map.getLayers().getArray();
    let result: BaseLayer[] = [];
    switch (type) {
      case undefined:
        result = layers;
        break;
      case "vector":
        result = layers.filter(x => x instanceof VectorLayer);
        break;
      case "tile":
        result = layers.filter(x => x instanceof TileLayer);
        break;
    }
    return result;
  }

  /**
   * 通过ID获取图层
   * @param id
   */
  getLayerByID(id: string) {
    const layers = this.getLayers();
    return layers.find(x => x.get('id') === id);
  }

  /**
   * 创建矢量源（通过url属性区分重载）
   * @param vectorOptions 矢量源选项
   * @param isCluster 是否为聚合图层，默认为非聚合图层
   */
  createSource(vectorOptions: SourceOptions, isCluster?: boolean): VectorSource
  /**
   * 创建瓦片源（通过url属性区分重载）
   * @param xyzOptions 瓦片源选项
   */
  createSource(xyzOptions: XYZOptions): XYZ
  createSource(options: SourceOptions | XYZOptions, isCluster = false) {
    let source: Source
    if ('url' in options) {
      source = new XYZ(options as XYZOptions);
    } else {
      const vectorSource = new VectorSource(options);
      if (isCluster)
        source = new Cluster({source: vectorSource});
      else
        source = vectorSource;
    }
    return source;
  }

  /**
   * 获取图层的源（如果是聚合的返回真实源）
   * @param layer
   */
  getSource(layer: VectorLayer) {
    function getClusterSource(source: any): VectorSource {
      if (source.source)
        return source.source;
      else
        return source;
    }

    const source = layer.getSource();
    return getClusterSource(source);
  }

  createFeature(type: GeometryType.POINT, coordinate: Coordinate, properties?: FeaturePropertiesTypes): Feature<Point>
  createFeature(type: GeometryType.LINE_STRING, coordinate: Coordinate[], properties?: FeaturePropertiesTypes): Feature<LineString>
  createFeature(type: GeometryType.MULTI_LINE_STRING, coordinate: Coordinate[][], properties?: FeaturePropertiesTypes): Feature<LineString>
  createFeature(type: GeometryType.POLYGON, coordinate: Coordinate[][], properties?: FeaturePropertiesTypes): Feature<Polygon>
  createFeature(type: GeometryType, coordinate: Coordinate | Coordinate[] | Coordinate[][], properties?: FeaturePropertiesTypes) {
    let geometry: Geometry;
    switch (type) {
      case GeometryType.POINT:
        geometry = new Point(coordinate as Coordinate);
        break;
      case GeometryType.LINE_STRING:
        geometry = new LineString(coordinate as Coordinate[]);
        break;
      case GeometryType.MULTI_LINE_STRING:
        geometry = new MultiLineString(coordinate as Coordinate[][]);
        break;
      case GeometryType.POLYGON:
        geometry = new Polygon(coordinate as Coordinate[][]);
        break;
      default:
        throw `type为${type}的类型错误，请检查`;
    }
    let feature: Feature;
    if (properties) {
      (properties as any).geometry = geometry;
      feature = new Feature(properties);
    } else {
      feature = new Feature(geometry);
    }
    return feature;
  }

  /**
   * 查找图层中的指定元素
   * @param layerID 图层ID
   * @param featureID 元素ID
   */
  getFeatureByID(layerID: string, featureID: string): Feature | undefined;
  /**
   * 查找图层中的指定元素
   * @param layer 图层对象
   * @param featureID 元素ID
   */
  getFeatureByID(layer: VectorLayer, featureID: string): Feature | undefined;
  /**
   * 查找图层中的指定元素
   * @param source 矢量源对象
   * @param featureID 元素ID
   */
  getFeatureByID(source: VectorSource, featureID: string): Feature | undefined;
  getFeatureByID(param: string | VectorLayer | VectorSource, featureID: string) {
    let source: VectorSource;
    let sourceTemp: VectorSource | undefined = undefined;
    let layer: VectorLayer | undefined = undefined;
    if (typeof param === 'string') {
      const foundLayer = this.getLayerByID(param);
      if (foundLayer) {
        if (foundLayer instanceof VectorLayer)
          layer = foundLayer
        else {
          console.log(`id为${param}的图层不是一个矢量图层，请检查`);
          return undefined;
        }
      } else {
        console.log(`id为${param}的图层没有找到，请检查`);
        return undefined;
      }
    } else if (param instanceof VectorLayer)
      layer = param;
    else
      sourceTemp = param;
    if (sourceTemp)
      source = sourceTemp;
    else {
      source = this.getSource(layer!);
    }
    return source.getFeatures().find(x => x.get('id') === featureID);
  }

  /**
   * 从圆生成一个多边形
   * @param circle 圆
   * @param sides 边数，默认32
   * @param angle 角度，默认0
   */
  generatePolygonFromCircle(circle: Circle, sides?: number, angle?: number) {
    return fromCircle(circle, sides, angle);
  }

  /**
   * 获取元素的属性，排除自带的geometry属性,通常用于序列化后存储元素属性
   * @param feature
   */
  getFeatureProperties(feature: Feature) {
    const properties = feature.getProperties();
    delete properties.geometry;
    return properties as FeaturePropertiesTypes;
  }
}