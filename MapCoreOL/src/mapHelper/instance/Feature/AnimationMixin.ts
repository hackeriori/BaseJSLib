import {FlashPointParamsType} from "./types";
import {flashGeom, flashPoint, getPreFlashPointParams, getHideButClickableStyle} from "./command";
import VectorLayer from "ol/layer/Vector";
import {Point} from "ol/geom";
import Style, {StyleLike} from "ol/style/Style";
import LayerInstance from "../Layer";
import Feature from "ol/Feature";
import Map from "ol/Map";
import Stroke from "ol/style/Stroke";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";

export default abstract class AnimationMixin {
  map!: Map;
  //图层实例
  readonly layerInstance!: LayerInstance;
  //样式缓存（用于隐藏时缓存样式）
  protected styleLike?: StyleLike;
  //ol原生元素对象
  readonly nativeFeature!: Feature;
  //是否正在播放动画
  protected isPlayAnimation!: Boolean;
  //线动画key
  private lineFlowAnimationKey?: EventsKey;
  //元素动画是否可见
  protected animationVisible!: boolean;
  //样式缓存（用于播放动画时缓存样式）
  private playStyleLike?: StyleLike = undefined;
  //普通样式
  normalStyle?: StyleLike = undefined;

  hide!: () => void;
  show!: () => void;

  /**
   * 闪烁动画
   */
  async flash(options?: Partial<FlashPointParamsType>) {
    if (this.styleLike || !this.layerInstance.visibly)
      return;
    const preOptions = getPreFlashPointParams();
    const _options: FlashPointParamsType = {...preOptions, ...options};
    const geometry = this.nativeFeature.getGeometry();
    if (geometry) {
      const type = geometry.getType();
      switch (type) {
        case 'Point':
          await flashPoint(this.layerInstance.nativeLayer as VectorLayer, geometry as Point, this.map, _options);
          break;
        case 'Polygon':
        case 'MultiPolygon':
        case 'LineString':
        case 'MultiLineString':
          await flashGeom(this.layerInstance.nativeLayer as VectorLayer, this.nativeFeature, this.map, _options)
          break;
        default:
          return;
      }
    }
  }

  /**
   * 开始线流动动画
   * @param durationTime 一个周期的持续时间（单位毫秒,默认1000）
   * @param baseColor 线颜色,默认红色
   * @param width 线宽度,默认5
   * @param dashColor 断点颜色,默认黄色
   */
  playLineFlowAnimation(durationTime = 1000, baseColor = 'red', width = 5, dashColor = 'yellow') {
    //正在播放动画，退出
    if (this.isPlayAnimation)
      return;
    //元素不可见，退出
    if (this.styleLike || !this.layerInstance.visibly)
      return;
    const geometry = this.nativeFeature.getGeometry()!;
    //不是线，退出
    if (geometry.getType() !== 'LineString') {
      console.log('播放线流动动画的元素不是线类型');
      return;
    }

    this.isPlayAnimation = true;
    this.playStyleLike = this.nativeFeature.getStyle();
    this.nativeFeature.setStyle(getHideButClickableStyle(this.normalStyle));

    const duration = Math.abs(durationTime);
    const direction = durationTime > 0;

    let styleBase = new Style({
      stroke: new Stroke({
        color: baseColor,
        width: width,
      })
    });

    let styleFlow = new Style({
      stroke: new Stroke({
        color: dashColor,
        width: width,
        lineDash: [20, 60],
        lineDashOffset: 0,
      })
    });

    let startTime = new Date().getTime();

    const animate = (event: RenderEvent) => {
      if (this.animationVisible) {
        const vectorContext = getVectorContext(event);
        const frameState = event.frameState;
        let elapsed = frameState.time - startTime;
        if (elapsed > duration) {
          startTime = new Date().getTime();
          elapsed = frameState.time - startTime;
        }
        const elapsedRatio = elapsed / duration;
        let offset = -80 * elapsedRatio;
        if (!direction)
          offset = -offset
        styleFlow.getStroke().setLineDashOffset(offset);
        vectorContext.setStyle(styleBase)
        vectorContext.drawGeometry(geometry);
        vectorContext.setStyle(styleFlow);
        vectorContext.drawGeometry(geometry);
        this.map.render();
      }
    }

    this.lineFlowAnimationKey = this.layerInstance.nativeLayer.on('postrender', animate) as EventsKey;
    this.map.render();
  }

  /**
   * 停止所有动画
   */
  stopAnimations() {
    if (this.lineFlowAnimationKey) {
      unByKey(this.lineFlowAnimationKey);
      this.lineFlowAnimationKey = undefined;
    }
    if (this.playStyleLike !== undefined)
      this.nativeFeature.setStyle(this.playStyleLike);
    this.isPlayAnimation = false;
    this.show();
  }

  /**
   * 获取播放动画状态，是否正在播放动画
   */
  getPlayState(){
    return this.isPlayAnimation;
  }
}