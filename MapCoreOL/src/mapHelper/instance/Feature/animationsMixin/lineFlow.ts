import AnimationsSharedData from "./sharedData";
import applyMixins from "../../../../../../Utils/applyMixins";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Geometry} from "ol/geom";
import {EventsKey} from "ol/events";

abstract class LineFlowAnimation {
  /**
   * 开始线流动动画
   * @param durationTime 一个周期的持续时间（单位毫秒,默认1000）
   * @param baseColor 线颜色,默认红色
   * @param width 线宽度,默认5
   * @param dashColor 断点颜色,默认黄色
   * @param lineDash 虚线样式
   */
  playLineFlowAnimation(durationTime = 1000, baseColor = 'red', width = 5, dashColor = 'yellow',lineDash = [20, 60]) {
    if(!this.canPlayNow())
      return;
    const geometry = this.nativeFeature.getGeometry()!;
    //不是线，退出
    const geometryType = geometry.getType();
    if (geometryType !== 'LineString' && geometryType !== 'MultiLineString') {
      console.log('播放线流动动画的元素不是线类型');
      return;
    }
    this.setState();
    const duration = Math.abs(durationTime);
    const direction = durationTime > 0;

    let styleBase = new Style({
      stroke: new Stroke({
        color: baseColor,
        width: width,
      })
    });

    let styleFlow = new Style({
      stroke: new Stroke({
        color: dashColor,
        width: width,
        lineDash: lineDash,
      })
    });

    let startTime = new Date().getTime();

    const animate = (event: RenderEvent) => {
      if (this.animationVisible) {
        const vectorContext = getVectorContext(event);
        const frameState = event.frameState!;
        let elapsed = frameState.time - startTime;
        if (elapsed > duration) {
          startTime = new Date().getTime();
          elapsed = frameState.time - startTime;
        }
        const elapsedRatio = elapsed / duration;
        let offset = -80 * elapsedRatio;
        if (!direction)
          offset = -offset
        styleFlow.getStroke().setLineDashOffset(offset);
        vectorContext.setStyle(styleBase)
        vectorContext.drawGeometry(geometry);
        vectorContext.setStyle(styleFlow);
        vectorContext.drawGeometry(geometry);
        this.map.render();
      }
    }

    this.lineFlowAnimationKey = (this.layerInstance.nativeLayer as VectorLayer<VectorSource<Geometry>>).on('postrender', animate) as EventsKey;
    this.map.render();
  }
}

interface LineFlowAnimation extends AnimationsSharedData {
}

applyMixins(LineFlowAnimation, [AnimationsSharedData]);

export default LineFlowAnimation