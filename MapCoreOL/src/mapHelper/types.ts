import {Coordinate} from "ol/coordinate";

export type MapDropCallBack = (coordinate: Coordinate, dataTransfer: DataTransfer | null) => void;