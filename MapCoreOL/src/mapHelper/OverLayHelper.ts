import Overlay, {Options} from 'ol/Overlay';
import Map from "ol/Map";

export default class OverLayHelper {
  constructor(public map: Map) {
  }

  /**
   * 添加overlay，如果后面还要使用，请加id或保存返回值
   * @param options overlay选项
   */
  addOverlay(options: Options) {
    const overlay = new Overlay(options);
    this.map.addOverlay(overlay);
    return overlay;
  }

  /**
   * 通过ID获取overlay
   * @param id overlay‘ID
   */
  getOverlayByID(id: string): Overlay | null {
    return this.map.getOverlayById(id);
  }

  /**
   * 隐藏overlay
   * @param id overlay‘ID
   */
  hideOverlay(id: string): void
  /**
   * 隐藏overlay
   * @param overlay overlay
   */
  hideOverlay(overlay: Overlay): void
  hideOverlay(param: string | Overlay) {
    let overlay: Overlay | null;
    if (typeof param === 'string') {
      overlay = this.getOverlayByID(param);
    } else
      overlay = param;
    if (overlay)
      overlay.setPosition(undefined);
    else
      console.log(`id为${param}的overlay没有找到，请检查`);
  }
}