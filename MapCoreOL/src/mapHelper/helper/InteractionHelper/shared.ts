import Feature from "ol/Feature";
import {Geometry} from "ol/geom";
import {Coordinate} from "ol/coordinate";
import Polygon from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";
import {getCenter, getHeight, getWidth} from "ol/extent";
import Style from "ol/style/Style";
import Point from "ol/geom/Point";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import MultiPoint from "ol/geom/MultiPoint";
import Stroke from "ol/style/Stroke";

export function calculateCenter(geometry: Geometry) {
  let center: Coordinate, coordinates: Coordinate[] | undefined, minRadius;
  const type = geometry.getType();
  if (type === 'Polygon') {
    let x = 0;
    let y = 0;
    let i = 0;
    coordinates = (geometry as Polygon).getCoordinates()[0].slice(1);
    coordinates.forEach(function (coordinate) {
      x += coordinate[0];
      y += coordinate[1];
      i++;
    });
    center = [x / i, y / i];
  } else if (type === 'LineString') {
    center = (geometry as LineString).getCoordinateAt(0.5);
    coordinates = (geometry as LineString).getCoordinates();
  } else {
    center = getCenter(geometry.getExtent());
  }
  let sqDistances: number[] | undefined;
  if (coordinates) {
    sqDistances = coordinates.map(function (coordinate) {
      const dx = coordinate[0] - center[0];
      const dy = coordinate[1] - center[1];
      return dx * dx + dy * dy;
    });
    minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3;
  } else {
    minRadius =
      Math.max(
        getWidth(geometry.getExtent()),
        getHeight(geometry.getExtent())
      ) / 3;
  }
  return {
    center: center,
    coordinates: coordinates,
    minRadius: minRadius,
    sqDistances: sqDistances,
  };
}

const style = new Style({
  geometry: function (feature) {
    const modifyGeometry = feature.get('modifyGeometry');
    return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
  },
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: '#ffcc33',
    width: 2,
  }),
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({
      color: '#ffcc33',
    }),
  }),
});

export default function setRotateStyle(feature: Feature<Geometry>) {
  feature.setStyle(function (feature) {
    const styles = [style];
    const modifyGeometry = feature.get('modifyGeometry');
    const geometry = modifyGeometry ? modifyGeometry.geometry : feature.getGeometry();
    const result = calculateCenter(geometry);
    const center = result.center;
    if (center) {
      styles.push(
        new Style({
          geometry: new Point(center),
          image: new CircleStyle({
            radius: 4,
            fill: new Fill({
              color: '#ff3333',
            }),
          }),
        })
      );
      const coordinates = result.coordinates;
      if (coordinates && result.sqDistances) {
        const minRadius = result.minRadius;
        const sqDistances = result.sqDistances;
        const rsq = minRadius * minRadius;
        const points = coordinates.filter(function (coordinate, index) {
          return sqDistances[index] > rsq;
        });
        styles.push(
          new Style({
            geometry: new MultiPoint(points),
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: '#33cc33',
              }),
            }),
          })
        );
      }
    }
    return styles;
  })
}