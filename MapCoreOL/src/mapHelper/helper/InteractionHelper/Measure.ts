import Map from "ol/Map";
import Draw, {Options as DrawOptions} from "ol/interaction/Draw";
import {Coordinate} from "ol/coordinate";
import Polygon, {fromCircle} from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";
import {getArea, getLength} from 'ol/sphere';
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import {MeasureResult} from "./types";
import {Circle, Point} from "ol/geom";
import {MapFrame} from "../../MapFrame";
import MapHelper from "../../index";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Text from 'ol/style/Text'
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

export default class Measure extends MapFrame {
  private draw?: Draw;
  private readonly source: VectorSource;

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
        }),
      });
      let styleText: Style | undefined;
      if (coordinate)
        styleText = new Style({
          geometry: new Point(coordinate),
          text: new Text({
            backgroundStroke: new Stroke({
              width: 1,
              color: 'white',
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
      type: geometryType as any,
    }
    options = {...options, ...drawOptions};
    options.source = this.source;
    this.draw = new Draw(options);
    this.draw.on('drawstart', evt => {
      let sketch = evt.feature;

      sketch.setStyle(() => getMeasureFeatureStyle(output, tooltipCoordinate, options.type === 'LineString'));

      listener = sketch.getGeometry()!.on('change', cEvt => {
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

    this.draw.on('drawend', evt => {
      if (callBack)
        callBack(measureResult, measureUnit, evt.feature);
      evt.feature.setStyle(getMeasureFeatureStyle(output, tooltipCoordinate, options.type === 'LineString'));
      if (listener)
        unByKey(listener);
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
  }
}