import {MapFrame} from "../MapFrame";
import Map from "ol/Map";
import MapHelper from "../index";
import {ViewerInfo} from "./types";

export default class ViewHelper extends MapFrame {
  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  /**
   * 获取当前视口信息
   */
  getViewerInfo() {
    const viewer = this.map.getView();
    const viewerInfo: ViewerInfo = {
      center: viewer.getCenter()!,
      zoom: viewer.getZoom()!,
      resolution: viewer.getResolution()!,
    }
    return viewerInfo;
  }

  /**
   * 设置当前视口
   * @param viewerInfo 视口信息
   * @param useAnimate 是否使用动画
   */
  setViewerInfo(viewerInfo: ViewerInfo, useAnimate = true) {
    const view = this.map.getView();
    if (useAnimate)
      view.animate({
        center: viewerInfo.center,
        zoom: viewerInfo.zoom,
        resolution: viewerInfo.resolution,
        duration: 300
      });
    else {
      view.setCenter(viewerInfo.center);
      if (viewerInfo.zoom)
        view.setZoom(viewerInfo.zoom);
      else if (viewerInfo.resolution)
        view.setResolution(viewerInfo.resolution)
    }
  }

  /**
   * 截取当前屏幕
   */
  screenShot() {
    const canvas = this.map.getTargetElement().querySelector<HTMLCanvasElement>('.ol-layer canvas');
    if (canvas) {
      let url;
      try {
        url = canvas.toDataURL();
      } catch {
        console.log('截图失败');
      }
      return url;
    }
  }

  /**
   * 获取当前视野包络矩形
   * @param outProjection 输出坐标系
   */
  getBBox(outProjection?: string){
    const extent = this.map.getView().calculateExtent(this.map.getSize());
    if(outProjection){
      const coordinate1 = [extent[0],extent[1]];
      const coordinate2 = [extent[2],extent[3]];
      const translatedCoordinate1 = this.mapHelper.projection.transCoordinate(coordinate1,undefined,outProjection);
      const translatedCoordinate2 = this.mapHelper.projection.transCoordinate(coordinate2,undefined,outProjection);
      extent[0] = translatedCoordinate1[0];
      extent[1] = translatedCoordinate1[1];
      extent[2] = translatedCoordinate2[0];
      extent[3] = translatedCoordinate2[1];
    }
    return extent
  }
}