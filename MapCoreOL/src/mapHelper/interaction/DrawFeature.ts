import Map from 'ol/Map'
import Draw, {createBox, createRegularPolygon, Options as DrawOptions} from "ol/interaction/Draw";
import Snap from "ol/interaction/Snap";
import {OneFeatureCallBack} from "./types";

export default class DrawFeature {
  private draw?: Draw;
  private snap?: Snap;

  constructor(private map: Map) {
  }

  start(drawOptions: DrawOptions, callBack: OneFeatureCallBack) {
    this.draw = new Draw(drawOptions);
    this.draw.on('drawend', evt => callBack(evt.feature));
    this.map.addInteraction(this.draw);
    if (drawOptions.source) {
      this.snap = new Snap({source: drawOptions.source});
      this.map.addInteraction(this.snap);
    }
  }

  stop() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
      this.draw = undefined;
    }
    if (this.snap) {
      this.map.removeInteraction(this.snap);
      this.snap = undefined;
    }
  }

  /**
   * 获取绘制矩形函数，常用于绘制圆形时传入该函数以绘制矩形
   */
  getFunCreateBox() {
    return createBox();
  }

  /**
   * 获取绘制规则多边形函数，常用于绘制三角形，五角形等
   * @param sides 多边形边数
   * @param angle 顶角角度
   */
  getFunCreateRegularPolygon(sides?: number, angle?: number) {
    return createRegularPolygon(sides, angle);
  }
}