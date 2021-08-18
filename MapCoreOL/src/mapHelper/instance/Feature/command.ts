import VectorLayer from "ol/layer/Vector";
import Style, {StyleLike} from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import {Circle} from "ol/style";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import {Point, Polygon} from "ol/geom";
import Map from 'ol/Map';
import {Coordinate} from "ol/coordinate";
import {FlashPointParamsType} from "./types";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import rgba from 'color-rgba';
import {easeOut, inAndOut} from "ol/easing";
import Feature from "ol/Feature";
import Fill from "ol/style/Fill";

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
    const nowColor = arrToRGBA(arrColor, elapsedRatio);
    const image = style.getImage() as Circle;
    image.setRadius(radius);
    const stroke = image.getStroke();
    stroke.setColor(nowColor);
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

export function getPreFlashPointParams() {
  const preOptions: FlashPointParamsType = {
    duration: 800,
    color: 'red',
    maxRadius: 30,
    minRadius: 5,
    outToIn: true,
    transitionColor: 'white'
  }
  return preOptions;
}

export async function flashGeom(layer: VectorLayer, feature: Feature, map: Map, param: FlashPointParamsType) {
  const halfDuration = param.duration / 2;
  let listenerKey: EventsKey | undefined;
  let sfn: (() => void) | undefined;

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

  const arrColor = rgba(param.color);
  if (!arrColor || (arrColor as number[]).length === 0) {
    console.log('颜色值无效');
    return
  }
  arrColor.pop();

  const transitionColor = rgba(param.transitionColor);
  if (!transitionColor || (transitionColor as number[]).length === 0) {
    console.log('过渡色无效');
    return
  }
  transitionColor.pop();

  //判断类型
  const geometry = feature.getGeometry()!;
  const geomType = geometry.getType();
  const isPolygon = geomType === "Polygon" || geomType === 'MultiPolygon';
  let style: Style;
  if (isPolygon)
    style = new Style({
      fill: new Fill({
        color: 'red',
      }),
    });
  else {
    let width = 1;
    const featureStyle = feature.getStyle();
    if (Array.isArray(featureStyle)) {
      width = (featureStyle[0].getStroke().getWidth() || width) + 2;
    } else if (featureStyle instanceof Style) {
      width = (featureStyle.getStroke().getWidth() || width) + 2;
    } else {
      width = 3;
    }
    style = new Style({
      stroke: new Stroke({
        color: 'red',
        width: width,
      }),
    });
  }

  let start = new Date().getTime();
  const animate = (event: RenderEvent) => {
    const vectorContext = getVectorContext(event);
    const frameState = event.frameState;
    let elapsed = frameState.time - start;
    if (elapsed > param.duration && listenerKey) {
      unByKey(listenerKey);
      if (sfn)
        sfn();
    }
    const elapsedRatio = getElapsedRatio(elapsed);
    //计算数值上下限
    const nowColor = arrToRGBA(calcArrayValue(arrColor, transitionColor, elapsedRatio))
    if (isPolygon)
      style.getFill().setColor(nowColor);
    else
      style.getStroke().setColor(nowColor);
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(geometry);
    map.render();
  }

  listenerKey = layer.on('postrender', animate);
  map.render();
  return await new Promise<void>(_sfn => {
    sfn = _sfn;
  });

}

export const hideStyle = new Style({
  image: new Circle({
    radius: 1,
    stroke: new Stroke({
      width: 1,
      color: 'rgba(0,0,0,0)'
    })
  }),
  stroke: new Stroke({
    width: 1,
    color: 'rgba(0,0,0,0)'
  }),
  fill: new Fill({
    color: 'rgba(0,0,0,0)'
  })
});

export function getHideButClickableStyle(normalStyle?: StyleLike) {
  let lineWidth = 1;

  //使得隐藏的线和动画宽度一致
  function getWidthFromStyle(item: Style) {
    const stroke = item.getStroke();
    if (stroke) {
      const width = stroke.getWidth();
      if (width && width > lineWidth)
        lineWidth = width;
    }
  }

  if (normalStyle) {
    if (Array.isArray(normalStyle)) {
      normalStyle.forEach(getWidthFromStyle);
    } else if (typeof normalStyle !== 'function') {
      getWidthFromStyle(normalStyle);
    }
  }

  return new Style({
    image: new Circle({
      radius: 5,
      stroke: new Stroke({
        width: 1,
        color: 'rgba(0,0,0,0.01)'
      }),
      fill: new Fill({
        color: 'rgba(0,0,0,0.01)'
      })
    }),
    stroke: new Stroke({
      width: lineWidth,
      color: 'rgba(0,0,0,0.01)'
    }),
    fill: new Fill({
      color: 'rgba(0,0,0,0.01)'
    })
  });
}