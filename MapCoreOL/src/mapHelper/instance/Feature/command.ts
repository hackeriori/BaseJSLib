import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import {Circle} from "ol/style";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import {Point} from "ol/geom";
import Map from 'ol/Map';
import {Coordinate} from "ol/coordinate";
import {FlashPointParamsType} from "./types";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import rgba from 'color-rgba';
import {easeOut} from "ol/easing";
import Feature from "ol/Feature";

export async function flashPoint(layer: VectorLayer, point: Feature<Point> | Point | Coordinate, map: Map, param: FlashPointParamsType) {
  let listenerKey: EventsKey | undefined;
  let sfn: (() => void) | undefined;
  const fx = (elapsed: number) => {
    if (param.outToIn)
      return easeOut(1 - elapsed / param.duration);
    else
      return easeOut(elapsed / param.duration);
  }
  const middleValue = param.maxRadius - param.minRadius;
  const arrColor = rgba(param.color);
  if (!arrColor) {
    console.log('颜色值无效');
    return
  }
  arrColor.pop();
  let rPoint: Point;
  if (point instanceof Feature) {
    rPoint = point.getGeometry()!
  } else if (Array.isArray(point)) {
    rPoint = new Point(point);
  } else
    rPoint = point;
  const style = new Style({
    image: new Circle({
      radius: 30,
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
    }),
  });
  const start = new Date().getTime();
  const animate = (event: RenderEvent) => {
    const vectorContext = getVectorContext(event);
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed > param.duration && listenerKey) {
      unByKey(listenerKey);
      if (sfn) {
        sfn();
        return;
      }
    }
    const elapsedRatio = fx(elapsed)
    const radius = elapsedRatio * middleValue + param.minRadius;
    const rColor = arrToRGBA(arrColor, elapsedRatio);
    const image = style.getImage() as Circle;
    image.setRadius(radius);
    const stroke = image.getStroke();
    stroke.setColor(rColor);
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(rPoint);
    map.render()
  }
  listenerKey = layer.on('postrender', animate);
  map.render();
  return new Promise<void>(_sfn => {
    sfn = _sfn;
  });
}

/**
 * 将RGBA颜色的数组转换为RGBA色
 * @param {Array} arrColor
 * @param opacity 透明度
 * @return {string}
 */
export function arrToRGBA(arrColor: number[], opacity = 1) {
  if (arrColor.length === 3)
    return `rgba(${arrColor.toString()},${opacity})`;
  else
    return `rgba(${arrColor.toString()})`;
}