import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";
import {easeOut} from "ol/easing";
import {testRGBA, colorToRGBA, arrToRGBA} from "../../util/color";
import Style from "ol/style/Style";
import Stroke from 'ol/style/Stroke';
import {Circle} from "ol/style";
import {EventsKey} from "ol/events";
import {getVectorContext} from 'ol/render';
import RenderEvent from 'ol/render/Event';
import {unByKey} from "ol/Observable";

function changeStyle(style: Style, radius: number, width: number, color: string) {
  const image = style.getImage() as Circle;
  image.setRadius(radius);
  const stroke = image.getStroke();
  stroke.setColor(color);
  stroke.setWidth(width);
}

export default class FocusPoint {
  private listenerKey?: EventsKey;
  private sfn?: () => void;
  private isLoop = false;
  private fx: (elapsed: number) => number;

  constructor(private map: Map, private layer: VectorLayer, private point: Point, private duration: number, private color: string, outToIn: boolean) {
    this.fx = function (elapsed: number) {
      if (outToIn)
        return easeOut(1 - elapsed / duration);
      else
        return easeOut(elapsed / duration);
    };
  }

  async startAsync() {
    //已在外部校验过颜色，这里肯定返回数组
    const arrColor = (testRGBA(colorToRGBA(this.color, 1)) as number[]).slice(0, 3);
    const style = new Style({
      image: new Circle({
        radius: 30,
        stroke: new Stroke({
          color: this.color,
          width: 2,
        }),
      }),
    });
    const start = new Date().getTime();
    const animate = (event: RenderEvent) => {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;
      const elapsed = frameState.time - start;
      if (elapsed > this.duration) {
        unByKey(this.listenerKey!);
        this.sfn!();
        return;
      }
      const elapsedRatio = this.fx(elapsed);
      // radius will be 5 at start and 30 at end.
      const radius = elapsedRatio * 25 + 5;
      const opacity = elapsedRatio;
      const width = opacity + 1;
      const rColor = arrToRGBA(arrColor, opacity);
      changeStyle(style, radius, width, rColor);
      vectorContext.setStyle(style);
      vectorContext.drawGeometry(this.point);
      this.map.render();
    }
    this.listenerKey = this.layer.on('postrender', animate);
    this.map.render();
    return await new Promise<void>(_sfn => {
      this.sfn = _sfn;
    });
  }

  async startAndLoopAsync() {
    this.isLoop = true;
    while (this.isLoop) {
      await this.startAsync();
    }
  }

  stop() {
    if (this.listenerKey)
      unByKey(this.listenerKey);
    this.isLoop = false;
    if (this.sfn)
      this.sfn();
  }
}