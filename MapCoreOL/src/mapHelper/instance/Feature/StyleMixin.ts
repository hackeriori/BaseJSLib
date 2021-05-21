import {StyleType} from "./types";
import {StyleCircle, StyleText} from "./types";
import Style, {StyleLike} from "ol/style/Style";
import Fill, {Options as FillOptions} from "ol/style/Fill";
import Stroke, {Options as StrokeOptions} from "ol/style/Stroke";
import Text, {Options as TextOptions} from "ol/style/Text";
import ImageStyle from "ol/style/Image";
import CircleStyle from "ol/style/Circle";
import Icon, {Options as IconOptions} from "ol/style/Icon";
import Feature from "ol/Feature";

export abstract class StyleMixin {
  //ol原生元素对象
  readonly nativeFeature!: Feature;
  //普通样式
  normalStyle?: StyleLike;
  //高亮样式
  highLightStyle?: StyleLike;

  /**
   * 设置普通样式
   * @param styles 样式数组
   * @param useIt 是否立即使用在元素上
   */
  setNormalStyle(styles?: StyleType[], useIt = true) {
    if (styles) {
      const createdStyles: Style[] = [];
      styles.forEach(x => createdStyles.push(this.createStyle(x)));
      this.normalStyle = createdStyles;
      if (useIt)
        this.nativeFeature.setStyle(createdStyles);
    } else {
      if (this.normalStyle)
        this.nativeFeature.setStyle(this.normalStyle);
    }
  }

  /**
   * 设置高亮样式
   * @param styles 样式数组
   */
  setHighLightStyle(styles?: StyleType[]) {
    if (styles) {
      const createdStyles: Style[] = [];
      styles.forEach(x => createdStyles.push(this.createStyle(x)));
      this.highLightStyle = createdStyles;
    } else {
      if (this.highLightStyle)
        this.nativeFeature.setStyle(this.highLightStyle);
    }
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
  private createImageStyle(image: StyleCircle | IconOptions) {
    if (image.hasOwnProperty('radius')) {
      const circle = image as StyleCircle
      return new CircleStyle({
        fill: circle.fill ? this.createFillStyle(circle.fill) : undefined,
        radius: circle.radius,
        stroke: circle.stroke ? this.createStrokeStyle(circle.stroke) : undefined,
        displacement: circle.displacement,
      });
    } else
      return new Icon(image);
  }
}