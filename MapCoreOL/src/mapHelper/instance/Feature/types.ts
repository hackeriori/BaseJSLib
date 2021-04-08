import {Feature, GeoJsonProperties, Geometry} from "geojson";

export interface FeaturePropCreateType {
  id: string;
  name: string;
  clickable: boolean;
}

export default interface FeaturePropType extends FeaturePropCreateType {
  layerID: string;
}

export interface FeatureGeoType<G extends Geometry | null = Geometry, P = GeoJsonProperties> extends Feature<G, P> {
  id: string;
}