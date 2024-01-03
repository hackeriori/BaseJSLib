import {MapFrame} from "../MapFrame";
import {StyleCircle, StyleRegularShape, StyleText, StyleType} from "../instance/Feature/types";
import Fill, {Options as FillOptions} from "ol/style/Fill";
import Stroke, {Options as StrokeOptions} from "ol/style/Stroke";
import Text, {Options as TextOptions} from "ol/style/Text";
import ImageStyle from "ol/style/Image";
import Style from "ol/style/Style";
import Icon, {Options as IconOptions} from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Map from "ol/Map";
import MapHelper from "../index";
import loadImg from '../../../../Utils/loadImg';
import resizeImg from '../../../../Utils/resizeImg';
import RegularShape from "ol/style/RegularShape";

export default class StyleHelper extends MapFrame {
  readonly loadImg = loadImg;
  readonly resizeImg = resizeImg;

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  /**
   * 创建样式
   * @param style 样式
   */
  createStyle(style: StyleType) {
    let fill: Fill | undefined = undefined;
    let stroke: Stroke | undefined = undefined;
    let text: Text | undefined = undefined;
    let image: ImageStyle | undefined = undefined;
    if (style.fill)
      fill = this.createFillStyle(style.fill);
    if (style.stroke)
      stroke = this.createStrokeStyle(style.stroke);
    if (style.text)
      text = this.createTextStyle(style.text);
    if (style.image)
      image = this.createImageStyle(style.image)
    return new Style({
      fill: fill,
      stroke: stroke,
      text: text,
      image: image,
      zIndex: style.zIndex,
      renderer: style.renderer
    });
  }

  /**
   * 创建填充样式
   * @param fill
   */
  private createFillStyle(fill: FillOptions) {
    return new Fill(fill);
  }

  /**
   * 创建边框样式
   * @param stroke
   */
  private createStrokeStyle(stroke: StrokeOptions) {
    return new Stroke(stroke);
  }

  /**
   * 创建文字样式
   * @param text
   */
  private createTextStyle(text: StyleText) {
    const options: TextOptions = {
      font: text.font,
      maxAngle: text.maxAngle,
      offsetX: text.offsetX,
      offsetY: text.offsetY,
      overflow: text.overflow,
      placement: text.placement,
      scale: text.scale,
      rotateWithView: text.rotateWithView,
      rotation: text.rotation,
      text: text.text,
      textAlign: text.textAlign,
      textBaseline: text.textBaseline,
      fill: text.fill ? this.createFillStyle(text.fill) : undefined,
      stroke: text.stroke ? this.createStrokeStyle(text.stroke) : undefined,
      backgroundFill: text.backgroundFill ? this.createFillStyle(text.backgroundFill) : undefined,
      backgroundStroke: text.backgroundStroke ? this.createStrokeStyle(text.backgroundStroke) : undefined,
      padding: text.padding,
    };
    return new Text(options);
  }

  /**
   * 创建圆点样式
   * @param image
   */
  private createImageStyle(image: StyleCircle): ImageStyle
  /**
   * 创建图片样式
   * @param image
   */
  private createImageStyle(image: IconOptions): ImageStyle
  /**
   * 创建形状样式
   * @param image
   */
  private createImageStyle(image: StyleRegularShape): ImageStyle
  private createImageStyle(image: StyleCircle | IconOptions | StyleRegularShape) {
    if (image.hasOwnProperty('radius') && !image.hasOwnProperty('points')) {
      const circle = image as StyleCircle;
      return new CircleStyle({
        fill: circle.fill ? this.createFillStyle(circle.fill) : undefined,
        radius: circle.radius,
        stroke: circle.stroke ? this.createStrokeStyle(circle.stroke) : undefined,
        displacement: circle.displacement,
      });
    } else if (image.hasOwnProperty('points')) {
      const circle = image as StyleRegularShape;
      return new RegularShape({
        ...circle,
        fill: circle.fill ? this.createFillStyle(circle.fill) : undefined,
        stroke: circle.stroke ? this.createStrokeStyle(circle.stroke) : undefined,
      })
    } else
      return new Icon(image);
  }
}
