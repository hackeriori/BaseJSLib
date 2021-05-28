import {StyleType} from "./types";
import Style, {StyleLike} from "ol/style/Style";
import Feature from "ol/Feature";
import MapHelper from "../../index";

export abstract class StyleMixin {
  mapHelper!: MapHelper
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
      styles.forEach(x => createdStyles.push(this.mapHelper.style.createStyle(x)));
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
      styles.forEach(x => createdStyles.push(this.mapHelper.style.createStyle(x)));
      this.highLightStyle = createdStyles;
    } else {
      if (this.highLightStyle)
        this.nativeFeature.setStyle(this.highLightStyle);
    }
  }
}