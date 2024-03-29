import Map from 'ol/Map';
import Feature from "ol/Feature";
import geoJson, {getZoomScale} from "../../global";
import VectorSource from "ol/source/Vector";
import FeaturePropType, {FeatureGeoType} from "./types";
import {StyleLike} from "ol/style/Style";
import BaseFeature from "./BaseFeature";
import MapHelper from "../../index";
import StyleMixin from './StyleMixin';
import applyMixins from "../../../../../Utils/applyMixins";
import MeasureMixin from './MeasureMixin';
import {FitOptions} from "ol/View";
import {Geometry, SimpleGeometry} from "ol/geom";
import LayerInstance from "../Layer";
import TopologyMixin from "./TopologyMixin";
import AnimationMixin from './animationsMixin';

class FeatureInstance extends BaseFeature {
  //ol原生源
  readonly nativeSource: VectorSource<Geometry>;
  //ol原生元素对象
  readonly nativeFeature: Feature<Geometry>;
  //元素ID
  readonly id: string;
  //图层实例
  readonly layerInstance: LayerInstance;
  //样式缓存（用于隐藏时缓存样式）
  public styleLike?: StyleLike = undefined;
  //普通样式
  normalStyle?: StyleLike = undefined;
  //高亮样式
  highLightStyle?: StyleLike = undefined;
  //注册的事件
  singleClickEvents: ((evt: {type: string}) => void)[] = [];
  doubleClickEvents: ((evt: {type: string}) => void)[] = [];
  rightClickEvents: ((evt: {type: string}) => void)[] = [];
  mouseEnterEvents: ((evt: {type: string}) => void)[] = [];
  mouseLeaveEvents: ((evt: {type: string}) => void)[] = [];
  //随图层按比例缩放的最小图层
  minZoom = 1;
  //随图层按比例缩放的最大图层
  maxZoom = 18;
  //随图层按比例缩放的最小比例（最大为1）
  minScale = 0.1;
  //是否正在播放动画
  protected isPlayAnimation = false;
  //元素动画是否可见
  protected animationVisible = true;

  constructor(map: Map, mapHelper: MapHelper, geoJSONFeature: FeatureGeoType, layerInstance: LayerInstance, source: VectorSource<Geometry>) {
    super(map, mapHelper);
    this.id = geoJSONFeature.id as string
    this.layerInstance = layerInstance;
    this.nativeSource = source;
    if (geoJSONFeature.geometry.type === 'Polygon') {
      //如果是多边形，需要闭合
      for (let i = 0; i < geoJSONFeature.geometry.coordinates.length; i++) {
        const ring = geoJSONFeature.geometry.coordinates[i];
        if (ring.length > 0 && ring[0].toString() !== ring[ring.length - 1].toString())
          ring.push([ring[0][0], ring[0][1]]);
      }
    }
    this.nativeFeature = geoJson.readFeature(geoJSONFeature);
    this.layerInstance.featureList[this.id] = this;
    this.nativeSource.addFeature(this.nativeFeature);
  }

  /**
   * 移除元素（内置错误提示）
   */
  destroy() {
    if (this.layerInstance.featureList[this.id]) {
      this.stopAnimations();
      this.nativeSource.removeFeature(this.nativeFeature);
      this.mapHelper.zoomFeatures.delete(this.layerInstance.id + this.id);
      delete this.layerInstance.featureList[this.id];
    } else
      console.log(`id为[${this.id}]的元素不存在，移除失败`);
  }

  /**
   * 获取元素的属性（浅拷贝副本），排除自带的geometry属性
   */
  getProperties() {
    const properties = this.nativeFeature.getProperties();
    delete properties.geometry;
    return properties as FeaturePropType;
  }

  /**
   * 隐藏元素（通过设置元素样式的方法隐藏）
   */
  hide() {
    if (this.isPlayAnimation)
      this.animationVisible = false;
    else {
      if (this.styleLike === undefined) {
        this.styleLike = this.nativeFeature.getStyle();
        this.nativeFeature.setStyle(() => []);
      }
    }
  }

  /**
   * 显示元素（通过设置元素样式的方法显示）
   */
  show() {
    if (this.isPlayAnimation) {
      this.animationVisible = true;
      this.map.render();
    } else {
      if (this.styleLike !== undefined) {
        this.nativeFeature.setStyle(this.styleLike);
        this.styleLike = undefined;
      }
    }
  }

  on(type: 'singleClick', callback: (evt: {type: string}) => void): void
  on(type: 'doubleClick', callback: (evt: {type: string}) => void): void
  on(type: 'rightClick', callback: (evt: {type: string}) => void): void
  on(type: 'mouseEnter', callback: (evt: {type: string}) => void): void
  on(type: 'mouseLeave', callback: (evt: {type: string}) => void): void
  on(type: string | string[], callback: (evt: {type: string}) => void): void {
    if (Array.isArray(type)) {
      type.forEach(x => {
        (this as any)[x + 'Events'].push(callback);
      })
    } else
      (this as any)[type + 'Events'].push(callback);
    this.nativeFeature.on(type as any, callback);
  }

  /**
   * 缩放至元素
   */
  zoomTo(options?: FitOptions) {
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      const size = this.map.getSize()!;
      const view = this.map.getView();
      const paddingSize = 0.1;
      const leftRight = size[0] * paddingSize;
      const topBottom = size[1] * paddingSize;
      let fitOptions: FitOptions = {
        padding: [topBottom, leftRight, topBottom, leftRight],
        duration: 300
      };
      if (geometry.getType() === 'Point') {
        fitOptions.maxZoom = view.getZoom();
      }
      if (options)
        fitOptions = {...fitOptions, ...options};
      view.fit(geometry as SimpleGeometry, fitOptions);
    }
  }

  /**
   * 设置按图层缩放层级放大缩小的图标，
   * @param max 最大层级，在最大层级时，缩放比例为1
   * @param min 最小层级，在最小层级时，缩放比例为minScale
   * @param minScale 最小缩放比例，默认0.1
   */
  setZoomLevelScale(max: number, min: number, minScale = 0.1) {
    this.maxZoom = max;
    this.minZoom = min;
    this.minScale = minScale;
    this.zoomLevelChanged(this.map.getView()!.getZoom()!)
    this.mapHelper.zoomFeatures.set(this.layerInstance.id + this.id, this);
  }

  /**
   * 图层改变时的回调
   * @param zoom 缩放层级
   */
  zoomLevelChanged(zoom: number) {
    const scale = getZoomScale(this, zoom);
    //这里试过使用图元的外包盒（即parent），是不行的，因为外包盒被ol实时改变，这里改变一次会被ol覆盖
    if (Array.isArray(this.normalStyle)) {
      this.normalStyle.forEach(x => {
        x.getImage()?.setScale(scale);
        x.getText()?.setScale(scale);
      });

    }
    if (Array.isArray(this.highLightStyle)) {
      this.highLightStyle.forEach(x => {
        x.getImage()?.setScale(scale);
        x.getText()?.setScale(scale);
      });
    }
    const style = this.nativeFeature.getStyle();
    if (Array.isArray(style)) {
      style.forEach(x => {
        x.getImage()?.setScale(scale);
        x.getText()?.setScale(scale);
      });
      this.nativeFeature.setStyle(style);
    }
  }
}

interface FeatureInstance extends StyleMixin, MeasureMixin, TopologyMixin, AnimationMixin {

}

applyMixins(FeatureInstance, [StyleMixin, MeasureMixin, TopologyMixin, AnimationMixin]);

export default FeatureInstance