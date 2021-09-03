import Draw, {Options as DrawOptions} from "ol/interaction/Draw";
import {OneFeatureCallBack} from "./types";
import Snap from "ol/interaction/Snap";
import Map from 'ol/Map';
import FeatureMixin from "./FeatureMixin";
import {getUid} from "ol";
import {Circle} from "ol/geom";
import {fromCircle} from "ol/geom/Polygon";
import SourceMixin from "./SourceMixin";
import MapHelper from "../../index";
import GeometryType from "ol/geom/GeometryType";

export default class DrawFeatureMixin {
  private nativeDraw?: Draw;
  private nativeSnap?: Snap;
  map!: Map;
  mapHelper!: MapHelper;
  createFeature!: FeatureMixin['createFeature'];
  getVectorSource!: SourceMixin['getVectorSource'];

  /**
   * 开始绘制元素
   * @param geometryType
   * @param callBack 回调函数
   * @param drawOptions 绘制选项
   */
  startDraw(geometryType: GeometryType, callBack: OneFeatureCallBack, drawOptions?: DrawOptions) {
    this.mapHelper.interaction.stopAll();
    let options: DrawOptions = {
      type: geometryType,
    };
    options = {...options, ...drawOptions};
    options.source = this.getVectorSource();
    this.nativeDraw = new Draw(options);
    this.nativeDraw.on('drawend', evt => {
      //处理圆类型
      const geometry = evt.feature.getGeometry()!;
      let type = geometry.getType() as any;
      let coordinates = (geometry as any).getCoordinates();
      if (type === 'Circle') {
        const polygon = fromCircle(geometry as Circle);
        type = 'Polygon';
        coordinates = polygon.getCoordinates();
      }
      const id = getUid(evt.feature);
      const featureInstance = this.createFeature({
        type: "Feature",
        id: id,
        geometry: {
          type: type,
          coordinates: coordinates
        },
        properties: {id: id, name: '', clickable: true}
      });
      setTimeout(() => {
        const source = this.getVectorSource();
        if (source)
          source.removeFeature(evt.feature);
      });
      if (featureInstance)
        callBack(featureInstance);
    });
    this.map.addInteraction(this.nativeDraw);
    //todo:nativeSnap好像没捕捉呢？
    this.nativeSnap = new Snap({source: options.source});
    this.map.addInteraction(this.nativeSnap);
    this.mapHelper.interaction.drawLayer = this as any;
  }

  /**
   * 停止绘制
   */
  stopDraw() {
    if (this.nativeDraw) {
      this.map.removeInteraction(this.nativeDraw);
      this.nativeDraw = undefined;
    }
    if (this.nativeSnap) {
      this.map.removeInteraction(this.nativeSnap);
      this.nativeSnap = undefined;
    }
  }
}