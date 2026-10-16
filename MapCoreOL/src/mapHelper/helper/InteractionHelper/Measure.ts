import Map from "ol/Map";
import Draw, {Options as DrawOptions} from "ol/interaction/Draw";
import {Coordinate} from "ol/coordinate";
import Polygon, {fromCircle} from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";
import {getArea, getLength} from 'ol/sphere';
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import {MeasureResult} from "./types";
import {Circle, Geometry, Point} from "ol/geom";
import {MapFrame} from "../../MapFrame";
import MapHelper from "../../index";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Text from 'ol/style/Text'
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {noModifierKeys} from 'ol/events/condition';

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

export default class Measure extends MapFrame {
  private draw?: Draw;
  private readonly source: VectorSource<Geometry>;
  // 保存右键事件处理函数引用
  private contextMenuHandler: ((e: MouseEvent) => void) | undefined;

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
    this.source = new VectorSource({});
    const layer = new VectorLayer({
      source: this.source,
      zIndex: 9999
    })
    this.map.addLayer(layer);
  }

  start(geometryType: 'LineString' | 'Polygon' | 'Circle', callBack?: MeasureResult, drawOptions?: DrawOptions) {
    this.mapHelper.interaction.stopAll();
    let listener: EventsKey | undefined = undefined;
    let projection = this.map.getView().getProjection();
    let measureResult = 0;
    let measureUnit = '';
    let output = '';
    let tooltipCoordinate: Coordinate | undefined = undefined;

    function formatLength(line: LineString) {
      let length = getLength(line, {projection: projection});
      let unit: string;
      if (length > 1000) {
        unit = '千米'
        length = Math.round((length / 1000) * 100) / 100;
      } else {
        unit = '米'
        length = Math.round(length * 100) / 100;
      }
      return {
        length,
        unit
      };
    }

    function formatArea(polygon: Polygon) {
      let area = getArea(polygon, {projection: projection});
      let unit;
      if (area > 1000000) {
        unit = '平方千米'
        area = Math.round((area / 1000000) * 100) / 100;
      } else {
        unit = '平方米'
        area = Math.round(area * 100) / 100;
      }
      return {
        area,
        unit
      };
    }

    function getMeasureFeatureStyle(text: string, coordinate?: Coordinate, needOffset = false) {
      const styleBase = new Style({
        fill: new Fill({
          color: 'rgba(255,255,255,0.4)'
        }),
        stroke: new Stroke({
          color: '#3399CC',
          width: 1.25
        })
      });
      let styleText: Style | undefined;
      if (coordinate)
        styleText = new Style({
          geometry: new Point(coordinate),
          text: new Text({
            backgroundStroke: new Stroke({
              width: 1,
              color: 'white'
            }),
            backgroundFill: new Fill({
              color: '#ffcc33'
            }),
            padding: [4, 4, 4, 4],
            fill: new Fill({
              color: 'white'
            }),
            font: '14px sans-serif',
            text: text,
            offsetY: needOffset ? -17 : 0
          })
        })
      if (styleText)
        return [styleBase, styleText];
      else
        return styleBase
    }

    let options: DrawOptions = {
      type: geometryType as any
    }

    // 获取地图画布DOM元素
    const mapTarget = this.map.getTargetElement();
    // ...在创建 Draw 前加入 condition：
    options = {...options, ...drawOptions};
    options.source = this.source;
    // 只允许左键（button=0）触发绘制，右键不新增点。
    options.condition = (e: any) => noModifierKeys(e) && e.originalEvent.button === 0;
    this.draw = new ScaledDraw(this.map, options);
    this.draw.on('drawstart', evt => {
      let sketch = evt.feature;

      sketch.setStyle(() => getMeasureFeatureStyle(output, tooltipCoordinate, options.type === 'LineString'));

      // 通过DOM元素绑定右键事件（替代map.on('contextmenu')）
      this.contextMenuHandler = (e: MouseEvent) => {
        // 阻止浏览器默认右键菜单
        e.preventDefault();
        if (this.draw) {
          this.draw.removeLastPoint();
        }
      };
      // 绑定DOM右键事件
      mapTarget.addEventListener('contextmenu', this.contextMenuHandler);
      listener = sketch.getGeometry()!.on('change', (cEvt: any) => {
        const geom = cEvt.target;
        if (geom instanceof Polygon) {
          const {area, unit} = formatArea(geom);
          measureResult = area;
          measureUnit = unit;
          output = area + unit;
          tooltipCoordinate = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          const {length, unit} = formatLength(geom);
          measureResult = length;
          measureUnit = unit;
          output = length + unit;
          tooltipCoordinate = geom.getLastCoordinate();
        } else if (geom instanceof Circle) {
          const {area, unit} = formatArea(fromCircle(geom));
          measureResult = area;
          measureUnit = unit;
          output = area + unit;
          tooltipCoordinate = geom.getCenter();
        }
      });
    });
    // 当右键回退时，如果最后一个点也被回退掉，会触发此事件，此时需要移除DOM右键事件监听，以避免下一次drawstart再次注册事件，会造成一次右键回退两个点
    this.draw.on('drawabort', () => {
      if (this.contextMenuHandler && mapTarget) {
        mapTarget.removeEventListener('contextmenu', this.contextMenuHandler);
        this.contextMenuHandler = undefined;
      }
    })
    this.draw.on('drawend', evt => {
      evt.feature.setStyle(getMeasureFeatureStyle(output, tooltipCoordinate, options.type === 'LineString'));
      // 移除DOM右键事件监听，避免内存泄漏和多次触发
      if (this.contextMenuHandler && mapTarget) {
        mapTarget.removeEventListener('contextmenu', this.contextMenuHandler);
        this.contextMenuHandler = undefined;
      }
      if (listener)
        unByKey(listener);
      if (callBack)
        callBack(measureResult, measureUnit, evt.feature);
    });

    this.map.addInteraction(this.draw);
  }

  clear() {
    this.source.clear();
  }

  stop() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
      this.draw = undefined;
    }
    // 新增：移除DOM右键事件
    const mapTarget = this.map.getTargetElement();
    if (this.contextMenuHandler && mapTarget) {
      mapTarget.removeEventListener('contextmenu', this.contextMenuHandler);
      this.contextMenuHandler = undefined;
    }
  }
}
