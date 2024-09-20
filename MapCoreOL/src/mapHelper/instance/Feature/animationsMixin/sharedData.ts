import Map from "ol/Map";
import LayerInstance from "../../Layer";
import {StyleLike} from "ol/style/Style";
import Feature from "ol/Feature";
import {Geometry} from "ol/geom";
import {EventsKey} from "ol/events";
import {getHideButClickableStyle} from "../command";
import MapHelper from "../../../index";
import type Icon from 'ol/style/Icon';

export default abstract class AnimationsSharedData {
  map!: Map;
  mapHelper!: MapHelper
  //图层实例
  readonly layerInstance!: LayerInstance;
  //样式缓存（用于隐藏时缓存样式）
  protected styleLike?: StyleLike;
  //ol原生元素对象
  readonly nativeFeature!: Feature<Geometry>;
  //是否正在播放动画
  protected isPlayAnimation!: Boolean;
  //线动画key
  protected lineFlowAnimationKey?: EventsKey;
  //元素动画是否可见
  protected animationVisible!: boolean;
  //样式缓存（用于播放动画时缓存样式）
  protected playStyleLike?: StyleLike;
  //普通样式
  normalStyle?: StyleLike;
  //高亮样式
  highLightStyle?: StyleLike;
  //旋转动画初始旋转量
  rotateAngleNormal?: number;
  //旋转动画初始旋转量
  rotateAngleHighLight?: number;
  //旋转动画key
  rotateAnimationKey?: EventsKey;
  //染色动画初始图片
  colorImageNormal?: Icon;
  //染色动画初始图片
  colorImageHighLight?: Icon;
  //染色动画key
  colorAnimationKey?: EventsKey;


  hide!: () => void;
  show!: () => void;

  protected canPlayNow() {
    //正在播放动画，退出
    if (this.isPlayAnimation)
      return false;
    //元素不可见，退出
    return !this.styleLike;
  }

  /**
   * 准备动画状态
   * @protected
   */
  protected setState() {
    this.isPlayAnimation = true;
    this.playStyleLike = this.nativeFeature.getStyle();
    this.nativeFeature.setStyle(getHideButClickableStyle(this.normalStyle));
  }
}