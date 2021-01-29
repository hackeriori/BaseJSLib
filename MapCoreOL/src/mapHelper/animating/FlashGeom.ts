import {inAndOut} from "ol/easing";
import {arrToRGBA, testRGBA} from "../../util/color";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {getVectorContext} from "ol/render";
import {unByKey} from "ol/Observable";
import Map from 'ol/Map';
import VectorLayer from "ol/layer/Vector";
import Geometry from "ol/geom/Geometry";
import GeometryType from "ol/geom/GeometryType";
import {EventsKey} from "ol/events";
import RenderEvent from "ol/render/Event";

function changePolygonStyle(style: Style, color: string) {
  const fill = style.getFill();
  fill.setColor(color);
}

function changeLineStyle(style: Style, color: string) {
  const stroke = style.getStroke();
  stroke.setColor(color);
}

export default class FlashGeom {

  private listenerKey?: EventsKey;
  private sfn?: () => void;

  private readonly arrColor1: number[];
  private readonly arrColor2: number[];

  constructor(private map: Map, private layer: VectorLayer, private geom: Geometry, private duration: number, color1: string, color2: string, private width: number) {
    //已经在外部效验过
    this.arrColor1 = testRGBA(color1) as number[];
    this.arrColor2 = testRGBA(color2) as number[];
  }

  async startAsync(isLoop = false) {
    const halfDuration = this.duration / 2;

    function getElapsedRatio(elapsed: number) {
      //1->0->1
      let outToIn = true;
      if (elapsed > halfDuration) {
        elapsed -= halfDuration;
        outToIn = false;
      }
      if (outToIn)//1->0
        return inAndOut(1 - elapsed / halfDuration);
      else//0->1
        return inAndOut(elapsed / halfDuration);
    }

    function calcArrayValue(arr1: number[], arr2: number[], radio: number) {
      const returnArray = [];
      for (let i = 0, l = arr1.length; i < l; i++) {
        const gap = arr1[i] - arr2[i];
        const pushNum = arr2[i] + gap * radio;
        returnArray.push(pushNum);
      }
      return returnArray;
    }

    //判断类型
    const isPolygon = this.geom.getType() === GeometryType.POLYGON;
    let style: Style;
    if (isPolygon)
      style = new Style({
        fill: new Fill({
          color: arrToRGBA(this.arrColor1),
        }),
      });
    else
      style = new Style({
        stroke: new Stroke({
          color: arrToRGBA(this.arrColor1),
          width: this.width,
        }),
      });
    let start = new Date().getTime();
    const animate = (event: RenderEvent) => {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;
      let elapsed = frameState.time - start;
      if (elapsed > this.duration) {
        if (isLoop) {
          start = new Date().getTime();
          elapsed = 0;
        } else {
          stop();
          return;
        }
      }
      const elapsedRatio = getElapsedRatio(elapsed);
      //计算数值上下限
      const nowColor = arrToRGBA(calcArrayValue(this.arrColor1, this.arrColor2, elapsedRatio));
      if (isPolygon)
        changePolygonStyle(style, nowColor);
      else
        changeLineStyle(style, nowColor);
      vectorContext.setStyle(style);
      vectorContext.drawGeometry(this.geom);
      this.map.render();
    }

    this.listenerKey = this.layer.on('postrender', animate);
    this.map.render();
    return await new Promise<void>(_sfn => {
      this.sfn = _sfn;
    });
  }

  stop() {
    if (this.listenerKey)
      unByKey(this.listenerKey);
    if (this.sfn)
      this.sfn();
  }
}