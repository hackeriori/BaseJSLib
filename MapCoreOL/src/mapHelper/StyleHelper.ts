import Map from 'ol/Map';
import {StyleCircle, StyleImageItem, StyleText, StyleType} from "./types";
import Style from "ol/style/Style";
import Fill, {Options as FillOptions} from "ol/style/Fill";
import Stroke, {Options as StrokeOptions} from "ol/style/Stroke";
import Text, {Options as TextOptions} from "ol/style/Text";
import ImageStyle from "ol/style/Image";
import CircleStyle from "ol/style/Circle";
import Icon, {Options as IconOptions} from "ol/style/Icon";

export default class StyleHelper {
  private defaultWidth = 32;
  private defaultHeight = 32;
  private styleImageItems: StyleImageItem[] = [];

  constructor(private map: Map) {
  }

  /**
   * 设置输出图像的宽，高 todo:待废除
   * @param width
   * @param height
   */
  setDefaultSize(width: number, height: number) {
    this.defaultWidth = width;
    this.defaultHeight = height;
  }

  /**
   * 从缓存中获取img或新建img todo:待废除
   * @param src
   * @param callback
   */
  getImage(src: string, callback: (styleImageItem: StyleImageItem) => void) {
    const styleImageItem = this.styleImageItems.find(x => x.src === src);
    if (styleImageItem)
      return styleImageItem;
    else {
      const newStyleImageItem: StyleImageItem = {
        src: src,
        img: new Image()
      }
      newStyleImageItem.img.onload = function () {
        newStyleImageItem.img.onload = null;
        callback(newStyleImageItem);
      }
      this.styleImageItems.push(newStyleImageItem);
      newStyleImageItem.img.src = src;
    }
  }

  /**
   * 重新设置标签 todo:待废除
   * @param style 样式
   * @param label 标签
   */
  setTextForStyle(style: Style, label: string) {
    const text = style.getText();
    text.setText(label);
  }

  /**
   * 创建样式
   * @param style 样式描述
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
    if ('radius' in image) {
      return new CircleStyle({
        fill: image.fill ? this.createFillStyle(image.fill) : undefined,
        radius: image.radius,
        stroke: image.stroke ? this.createStrokeStyle(image.stroke) : undefined,
        displacement: image.displacement,
      });
    } else
      return new Icon(image);
  }
}