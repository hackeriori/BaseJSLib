import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import {Circle} from "ol/style";
import RenderEvent from "ol/render/Event";
import {getVectorContext} from "ol/render";
import {Point} from "ol/geom";
import Map from 'ol/Map';

export async function flashPoint(layer: VectorLayer, point: Point, map: Map) {
  const style = new Style({
    image: new Circle({
      radius: 30,
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
    }),
  });
  const start = new Date().getTime();
  const animate = (event: RenderEvent) => {
    const vectorContext = getVectorContext(event);
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(point);
    map.render()
  }
  layer.on('postrender',animate);
  map.render();
}