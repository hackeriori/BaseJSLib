import {Coordinate} from "ol/coordinate";
import Feature from "ol/Feature";

export type NotingClick = (coordinate: Coordinate) => void;

export type MeasureResult = (result: number, unit: string, feature: Feature) => void;