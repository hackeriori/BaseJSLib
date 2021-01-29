import Map from 'ol/Map';
import {AnimationOptions, FitOptions} from "ol/View";
import Feature from 'ol/Feature';
import {Coordinate} from "ol/coordinate";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import GeometryType from "ol/geom/GeometryType";
import Point from "ol/geom/Point";
import {ViewerInfo} from './types';

export default class ViewHelper {
  constructor(private map: Map) {
  }

  /**
   * 历时300ms移动到图形，如果是点则移动到坐标
   * @param feature
   * @param fitOptions
   */
  zoomTo(feature: Feature, fitOptions?: FitOptions): void;
  /**
   * 历时300ms移动到该点
   * @param coordinate 中心点
   * @param maxZoom 最大缩放层级
   */
  zoomTo(coordinate: Coordinate, maxZoom?: number): void;
  zoomTo(target: Feature | Coordinate, options?: FitOptions | number) {
    if (target instanceof Feature) {
      const geometry = target.getGeometry();
      if (geometry.getType() === GeometryType.POINT) {
        const coordinate = (geometry as Point).getCoordinates();
        let maxZoom: number | undefined;
        if (options)
          maxZoom = (options as FitOptions).maxZoom;
        this.zoomTo(coordinate, maxZoom);
        return;
      }
      const size = this.map.getSize();
      const view = this.map.getView();
      const paddingSize = 0.1;
      const leftRight = size[0] * paddingSize;
      const topBottom = size[1] * paddingSize;
      let fitOptions: FitOptions = {
        padding: [topBottom, leftRight, topBottom, leftRight],
        duration: 300
      };
      if (options)
        fitOptions = Object.assign(fitOptions, options);
      view.fit(geometry as SimpleGeometry, fitOptions);
    } else {
      const coordinate = target;
      const view = this.map.getView();
      const zoom = view.getZoom();
      const animateOP: AnimationOptions = {
        center: coordinate,
        duration: 300,
      };
      if (options) {
        const maxZoom = options as number;
        if (zoom < maxZoom)
          animateOP.zoom = maxZoom;
      }
      view.animate(animateOP);
    }
  }

  /**
   * 获取当前视口信息
   */
  getViewerInfo() {
    const viewer = this.map.getView();
    const viewerInfo: ViewerInfo = {
      center: viewer.getCenter(),
      zoom: viewer.getZoom(),
      resolution: viewer.getResolution(),
    }
    return viewerInfo;
  }

  /**
   * 设置当前视口
   * @param viewerInfo 视口参数，zoom和duration必选其一，zoom优先
   */
  setViewerInfo(viewerInfo: ViewerInfo) {
    if (!viewerInfo.zoom && !viewerInfo.resolution) {
      console.log('设置视口时，缩放层级和分辨率不能同时为空');
      return
    }

    const options: AnimationOptions = {
      center: viewerInfo.center,
      duration: 300
    }

    if (viewerInfo.zoom)
      options.zoom = viewerInfo.zoom
    else {
      options.resolution = viewerInfo.resolution;
    }

    const view = this.map.getView();
    view.animate(options);
  }
}