import {MapFrame} from "../MapFrame";
import Map from "ol/Map";
import MapHelper from "../index";
import { ViewerInfo } from "./types";

export default class ViewHelper extends MapFrame{
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

}