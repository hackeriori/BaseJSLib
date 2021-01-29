import Map from "ol/Map";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import {Coordinate} from "ol/coordinate";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import {getUid} from "ol";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import {LineString as GeoLineString} from 'geojson'
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import {fromLonLat} from 'ol/proj';
import {lineSliceAlongFun} from "./types";

export default class TrackObj {
  private readonly lineFeature: Feature<LineString>
  private readonly pointFeature: Feature<Point>
  private isPointOnTheMap: boolean = true;
  private readonly line: GeoLineString;
  private readonly length: number;
  private listenerKey?: EventsKey;
  private pointStyle: Style | undefined = undefined;
  private elapsedTime: number = 0;
  private isPaused = false;
  private lineSliceAlong: lineSliceAlongFun | undefined = undefined;

  constructor(private map: Map, private layer: VectorLayer, img: string, points: Coordinate[], private time: number,
              private showLine: boolean, color: string, width: number, readyCallBack?: () => void) {
    // 构建线元素及点元素
    this.line = {type: 'LineString', coordinates: points};
    points = points.map(x => fromLonLat(x));
    this.lineFeature = new Feature(new LineString(points));
    this.lineFeature.setProperties({
      id: getUid(this.lineFeature),
      name: '轨迹',
      layer: layer.get('id'),
      clickable: false,
    });
    this.length = this.lineFeature.getGeometry().getLength();
    this.pointFeature = new Feature(new Point(points[0]));
    this.pointFeature.setProperties({
      id: getUid(this.pointFeature),
      name: '精灵',
      layer: layer.get('id'),
      clickable: false,
    });
    // 渲染线元素
    if (showLine) {
      this.lineFeature.setStyle(new Style({
        stroke: new Stroke({
          color: color,
          width: width,
        })
      }));
    }
    // 添加元素
    const source = layer.getSource();
    if (showLine)
      source.addFeature(this.lineFeature);
    source.addFeature(this.pointFeature);
    this.init(img, readyCallBack);
  }

  private async init(img: string, readyCallBack?: () => void) {
    const {default: lineSliceAlongFun} = await import(/* webpackChunkName: "turf" */'@turf/line-slice-along');
    this.lineSliceAlong = lineSliceAlongFun;
    // 渲染点元素
    const imgObj = new Image();
    return new Promise(resolve => {
      imgObj.onload = () => {
        imgObj.onload = null;
        this.pointStyle = new Style({
          image: new Icon({
            img: imgObj,
            imgSize: [imgObj.width, imgObj.height]
          })
        });
        this.pointFeature.setStyle(this.pointStyle);
        readyCallBack && readyCallBack();
        resolve();
      }
      imgObj.addEventListener('error', ev => {
        console.log('图片加载失败');
        readyCallBack && readyCallBack();
      })
      imgObj.src = img
    })
  }

  play() {
    if (!this.pointStyle) {
      console.log('初始化失败');
      return;
    }
    this.pointFeature.setStyle((() => {
    }) as any);
    this.isPointOnTheMap = false;
    this.isPaused = false;
    let startTime = new Date().getTime();
    const animate = (event: RenderEvent) => {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;
      let elapsed = frameState.time - startTime + this.elapsedTime;
      if (elapsed > this.time || this.isPaused) {
        if (this.isPaused) {
          this.goto(elapsed);
        } else
          this.gotoEnd();
        this.stop()
        return;
      }
      if (elapsed > 0) {
        const nowLength = this.length * (elapsed / this.time);
        const newLine = this.lineSliceAlong!(this.line, 0, nowLength, {units: 'meters'});
        if (newLine.geometry) {
          const lastPoint = newLine.geometry.coordinates[newLine.geometry.coordinates.length - 1];
          const lastP = fromLonLat(lastPoint);
          if (this.pointStyle)
            vectorContext.setStyle(this.pointStyle);
          vectorContext.drawGeometry(new Point(lastP));
        }
      }
      this.map.render();
    }
    this.listenerKey = this.layer.on('postrender', animate);
    this.map.render();
  }

  private stop() {
    if (this.listenerKey)
      unByKey(this.listenerKey);
  }

  gotoBegin() {
    this.goto(0)
  }

  gotoEnd() {
    this.goto(this.time);
  }

  goto(time: number) {
    if (time < 0) {
      console.log('时间不能为负数');
      return
    } else if (time > this.time) {
      this.gotoEnd();
      return;
    }
    this.stop();
    this.elapsedTime = time;
    if (time === this.time)
      this.elapsedTime = 0;
    if (time > 0) {
      const nowLength = this.length * (time / this.time);
      const newLine = this.lineSliceAlong!(this.line, 0, nowLength, {units: 'meters'});
      if (newLine.geometry) {
        const lastPoint = newLine.geometry.coordinates[newLine.geometry.coordinates.length - 1];
        const lastP = fromLonLat(lastPoint);
        this.pointFeature.getGeometry().setCoordinates(lastP);
      }
    } else {
      this.pointFeature.getGeometry().setCoordinates(this.lineFeature.getGeometry().getCoordinates()[0]);
    }
    if (!this.isPointOnTheMap) {
      this.pointFeature.setStyle(this.pointStyle);
      this.isPointOnTheMap = true;
    }
  }

  pause() {
    this.isPaused = true;
  }

  destroy() {
    const source = this.layer.getSource();
    if (this.isPointOnTheMap)
      source.removeFeature(this.pointFeature);
    if (this.showLine) {
      source.removeFeature(this.lineFeature);
    }
  }
}