import AnimationsSharedData from "./sharedData";
import applyMixins from "../../../../../../Utils/applyMixins";
import FeatureInstance from "../index";
import {Style} from "ol/style";
import {Geometry, LineString, Point} from "ol/geom";
import loadImg from "../../../../../../Utils/loadImg";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import lineSliceAlong from "@turf/line-slice-along";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import {LineString as GeoLineString} from 'geojson'
import geoJson from "../../../global";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Coordinate} from "ol/coordinate";

abstract class TrackPlayAnimation {
  /**
   * 轨迹播放动画
   * @param img 精灵图标
   * @param time 动画事件
   * @param showLine 是否显示轨迹线
   * @param color 轨迹颜色
   * @param width 轨迹宽度
   * @param label 精灵标签
   * @param degree 精灵与X轴的夹角（角度）
   */
  async getTrackPlayAnimationObj(img: string, time = 3000, showLine = true, color = 'red', width = 2, label?: string, degree?: number) {
    if (!this.canPlayNow())
      return;
    const geometry = this.nativeFeature.getGeometry()!;
    //不是线，退出
    if (geometry.getType() !== 'LineString') {
      console.log('播放轨迹动画的元素不是线类型');
      return;
    }
    const image = await loadImg(img, false);
    if (!image) {
      console.log('图片加载失败');
      return
    }
    this.setState();
    return new TrackPlay(this as any, image, time, showLine, color, width, label, degree);
  }
}

class TrackPlay {
  styleBase: Style;
  styleOver: Style;
  lineStyle: Style;
  pointStyle: Style;
  isPaused = true;
  elapsedTime = 0;
  listenerKey?: EventsKey;
  length: number;
  line: GeoLineString;
  radian?: number;
  renderer?: (pointStyle: Style, styleOver: Style, point: Coordinate) => void

  constructor(private featureInstance: FeatureInstance, image: HTMLImageElement, private time: number,
              private showLine: boolean, color: string, width: number, label?: string, degree?: number) {
    //设置精灵
    this.styleBase = featureInstance.nativeFeature.getStyle() as Style;
    const geometry = featureInstance.nativeFeature.getGeometry()! as LineString;
    this.line = geoJson.writeFeatureObject(this.featureInstance.nativeFeature, {
      featureProjection: 'EPSG:3857'
    }).geometry as GeoLineString;

    if (degree != undefined) {
      this.radian = degree * Math.PI / 180;
    }

    this.length = geometry.getLength();
    this.styleOver = new Style({
      geometry: new Point(geometry.getCoordinates()[0]),
      image: new Icon({
        img: image,
        imgSize: [image.width, image.height]
      }),
      text: label ? new Text({
        text: label,
        font: '14px sans-serif',
        offsetY: -image.height / 2 - 9,
        fill: new Fill({color: 'black'}),
        stroke: new Stroke({
          color: 'white',
          width: 2
        })
      }) : undefined
    });
    this.lineStyle = new Style({
      geometry: geometry,
      stroke: new Stroke({
        color,
        width
      })
    });
    this.pointStyle = new Style({
      image: new Icon({
        img: image,
        imgSize: [image.width, image.height]
      }),
      text: label ? new Text({
        text: label,
        font: '14px sans-serif',
        offsetY: -image.height / 2 - 9,
        fill: new Fill({color: 'black'}),
        stroke: new Stroke({
          color: 'white',
          width: 2
        })
      }) : undefined
    });
    this.featureInstance.nativeFeature.setStyle([this.styleBase, this.styleOver]);
  }

  async play() {
    let sfn: any
    this.featureInstance.nativeFeature.setStyle(this.styleBase);
    this.isPaused = false;
    let startTime = new Date().getTime();
    const animate = (event: RenderEvent) => {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState!;
      let elapsed = frameState.time - startTime + this.elapsedTime;
      if (elapsed > this.time || this.isPaused) {
        if (this.isPaused) {
          this.goto(elapsed);
        } else {
          this.gotoEnd();
          sfn();
        }
        this.stop();
        return;
      }
      if (elapsed > 0) {
        const nowLength = this.length * (elapsed / this.time);
        const newLine = lineSliceAlong(this.line, 0, nowLength, {units: 'meters'});
        if (newLine.geometry) {
          newLine.geometry.coordinates = newLine.geometry.coordinates.map(x => this.featureInstance.mapHelper.projection.transCoordinate(x));
          const lastPoint = newLine.geometry.coordinates[newLine.geometry.coordinates.length - 1];
          if (this.showLine) {
            vectorContext.setStyle(this.lineStyle);
            vectorContext.drawGeometry(new LineString(newLine.geometry.coordinates));
          }
          if (this.radian != undefined) {
            const pointBefore = newLine.geometry.coordinates[newLine.geometry.coordinates.length - 2];
            const rotation = this.radian - Math.atan2(lastPoint[1] - pointBefore[1], lastPoint[0] - pointBefore[0]);
            this.pointStyle.getImage().setRotation(rotation);
            this.styleOver.getImage().setRotation(rotation);
          }
          if (this.renderer) {
            this.renderer(this.pointStyle, this.styleOver, lastPoint);
          }
          vectorContext.setStyle(this.pointStyle);
          vectorContext.drawGeometry(new Point(lastPoint));
        }
      }
      this.featureInstance.map.render();
    }
    this.listenerKey = (this.featureInstance.layerInstance.nativeLayer as VectorLayer<VectorSource<Geometry>>).on('postrender', animate) as EventsKey;
    this.featureInstance.map.render();
    return new Promise(resolve => {
      sfn = resolve;
    })
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
      const newLine = lineSliceAlong(this.line, 0, nowLength, {units: 'meters'});
      if (newLine.geometry) {
        newLine.geometry.coordinates = newLine.geometry.coordinates.map(x => this.featureInstance.mapHelper.projection.transCoordinate(x));
        const lastPoint = newLine.geometry.coordinates[newLine.geometry.coordinates.length - 1];
        this.styleOver.setGeometry(new Point(lastPoint));
        if (this.showLine) {
          this.lineStyle.setGeometry(new LineString(newLine.geometry.coordinates));
          this.featureInstance.nativeFeature.setStyle([this.lineStyle, this.styleOver]);
        } else
          this.featureInstance.nativeFeature.setStyle(this.styleOver);
      }
    } else {
      this.styleOver.setGeometry(new Point((this.featureInstance.nativeFeature.getGeometry() as LineString).getCoordinates()[0]));
      this.featureInstance.nativeFeature.setStyle([this.styleBase, this.styleOver]);
    }
  }

  pause() {
    this.isPaused = true;
  }

  destroy() {
    this.stop();
    this.featureInstance.destroy();
  }
}

interface TrackPlayAnimation extends AnimationsSharedData {
}

applyMixins(TrackPlayAnimation, [AnimationsSharedData]);

export default TrackPlayAnimation