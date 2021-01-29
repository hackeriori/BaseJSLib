import Map from "ol/Map";
import Draw, {Options as DrawOptions} from "ol/interaction/Draw";
import Feature from "ol/Feature";
import {Coordinate} from "ol/coordinate";
import Polygon, {fromCircle} from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";
import {getArea, getLength} from 'ol/sphere';
import Overlay from "ol/Overlay";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import OverlayPositioning from "ol/OverlayPositioning";
import "./Measure.css";
import {MeasureResult} from "./types";
import {Circle} from "ol/geom";

export default class Measure {
  private draw?: Draw;
  private overlays: Overlay[] = [];
  private measureTooltip: Overlay | undefined = undefined;

  constructor(private map: Map) {
  }

  start(drawOptions: DrawOptions, callBack?: MeasureResult) {
    let sketch: Feature | undefined = undefined;
    let measureTooltipElement: HTMLElement | undefined = undefined;
    let listener: EventsKey | undefined = undefined;
    let projection = this.map.getView().getProjection();
    let measureResult = 0;

    function formatLength(line: LineString) {
      const length = getLength(line, {projection: projection});
      measureResult = length;
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + '千米';
      } else {
        output = Math.round(length * 100) / 100 + '米';
      }
      return output;
    }

    function formatArea(polygon: Polygon) {
      const area = getArea(polygon, {projection: projection});
      measureResult = area;
      let output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + '千米<sup>2</sup>';
      } else {
        output = Math.round(area * 100) / 100 + '米<sup>2</sup>';
      }
      return output;
    }

    function createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode!.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip-measure';
      const measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: OverlayPositioning.BOTTOM_CENTER,
      });
      return measureTooltip;
    }

    this.draw = new Draw(drawOptions);
    this.draw.on('drawstart', evt => {
      sketch = evt.feature;
      let tooltipCoordinate: Coordinate | undefined = undefined;
      let output: string = '';

      listener = sketch.getGeometry().on('change', cEvt => {
        const geom = cEvt.target;
        if (geom instanceof Polygon) {
          output = formatArea(geom);
          tooltipCoordinate = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = formatLength(geom);
          tooltipCoordinate = geom.getLastCoordinate();
        } else if (geom instanceof Circle) {
          output = formatArea(fromCircle(geom));
          tooltipCoordinate = geom.getCenter();
        }
        if (measureTooltipElement)
          measureTooltipElement.innerHTML = output;
        if (this.measureTooltip)
          this.measureTooltip.setPosition(tooltipCoordinate);
      });
    });

    this.draw.on('drawend', evt => {
      // if (this.measureTooltip)
      //   this.measureTooltip.setOffset([0, -7]);
      if (callBack)
        callBack(measureResult, evt.feature);
      // unset tooltip so that a new one can be created
      measureTooltipElement = undefined;
      if(this.measureTooltip) {
        this.overlays.push(this.measureTooltip);
        this.measureTooltip = undefined;
      }
      if (listener)
        unByKey(listener);
    });

    this.map.addInteraction(this.draw);
    this.measureTooltip = createMeasureTooltip();
    this.map.addOverlay(this.measureTooltip);
  }

  clear() {
    this.overlays.forEach(x => this.map.removeOverlay(x));
    this.overlays = [];
  }

  removeFirst() {
    this.map.removeOverlay(this.overlays[0]);
    this.overlays.splice(0, 1);
  }

  stop() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
      this.draw = undefined;
      if(this.measureTooltip){
        this.map.removeOverlay(this.measureTooltip);
      }
    }
  }
}