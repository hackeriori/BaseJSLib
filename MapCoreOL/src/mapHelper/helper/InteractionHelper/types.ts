import {Coordinate} from "ol/coordinate";
import Feature from "ol/Feature";
import {Geometry} from "ol/geom";

export type NotingClick = (coordinate: Coordinate) => void;

export type MeasureResult = (result: number, unit: string, feature: Feature<Geometry>) => void;

export interface ModifyGeometryType {
  geometry: Geometry,
  point: Coordinate
  geometry0: Geometry,
  center: Coordinate,
  minRadius: number,
}