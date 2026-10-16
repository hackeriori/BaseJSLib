import Draw, {Options as DrawOptions, createBox} from "ol/interaction/Draw";
import {OneFeatureCallBack} from "./types";
import Snap from "ol/interaction/Snap";
import Map from 'ol/Map';
import FeatureMixin from "./FeatureMixin";
import {getUid} from "ol";
import {Circle} from "ol/geom";
import {fromCircle} from "ol/geom/Polygon";
import SourceMixin from "./SourceMixin";
import MapHelper from "../../index";

function getMapPixel(map: Map, event: MouseEvent): number[] {
  const viewport = map.getViewport();
  const rect = viewport.getBoundingClientRect();
  const size = map.getSize();

  if (!size || !rect.width || !rect.height)
    return [event.clientX - rect.left, event.clientY - rect.top];

  return [
    (event.clientX - rect.left) * size[0] / rect.width,
    (event.clientY - rect.top) * size[1] / rect.height
  ];
}

/** 在 Draw 处理鼠标移动前应用修正后的像素坐标。 */
class ScaledDraw extends Draw {
  constructor(private readonly map: Map, options: DrawOptions) {
    super(options);
  }

  handleEvent(event: any): boolean {
    if (event.originalEvent) {
      const pixel = getMapPixel(this.map, event.originalEvent as MouseEvent);
      event.pixel = pixel;
      event.coordinate = this.map.getCoordinateFromPixel(pixel);
    }
    return super.handleEvent(event);
  }
}

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
  startDraw(geometryType: any, callBack: OneFeatureCallBack, drawOptions?: DrawOptions) {
    this.mapHelper.interaction.stopAll();
    let type = geometryType;
    //矩形
    let geometryFunction: any = undefined;
    if (geometryType === 'Box') {
      type = 'Circle'
      geometryFunction = createBox();
    }
    let options: DrawOptions = {
      type,
    };
    options = {...options, ...drawOptions};
    if (geometryFunction) {
      options.geometryFunction = geometryFunction;
    }
    options.source = this.getVectorSource();
    this.nativeDraw = new ScaledDraw(this.map, options);
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
