import {MapFrame} from "../../MapFrame";
import Map from "ol/Map";
import MapHelper from "../../index";
import BaseFeature from "../../instance/Feature/BaseFeature";
import {calculateCenter} from "./shared";
import {Modify} from "ol/interaction";
import {never} from "ol/events/condition";
import Feature from "ol/Feature";
import {Coordinate} from "ol/coordinate";
import {ModifyGeometryType} from "./types";
import {getFeatureInstanceByFeature} from "../../global";

export default class RotateAndZoom extends MapFrame {
  modify?: Modify

  constructor(map: Map, mapHelper: MapHelper) {
    super(map, mapHelper);
  }

  start(type: string[], callback?: (feature: BaseFeature) => void) {
    this.mapHelper.interaction.interactionType = type[0] as any
    const collection = this.mapHelper.interaction.collection;
    const defaultStyle = new Modify({features: collection}).getOverlay().getStyleFunction()!;
    this.modify = new Modify({
      deleteCondition: never,
      insertVertexCondition: never,
      features: collection,
      style: function (feature, level) {
        feature.get('features').forEach(function (modifyFeature: Feature) {
          const modifyGeometry: ModifyGeometryType | undefined = modifyFeature.get('modifyGeometry');
          if (modifyGeometry) {
            const point = (feature.getGeometry()! as any).getCoordinates() as Coordinate;
            let modifyPoint = modifyGeometry.point;
            if (!modifyPoint) {
              // save the initial geometry and vertex position
              modifyPoint = point;
              modifyGeometry.point = modifyPoint;
              modifyGeometry.geometry0 = modifyGeometry.geometry;
              // get anchor and minimum radius of vertices to be used
              const result = calculateCenter(modifyGeometry.geometry0);
              modifyGeometry.center = result.center;
              modifyGeometry.minRadius = result.minRadius;
            }

            const center = modifyGeometry.center;
            const minRadius = modifyGeometry.minRadius;
            let dx, dy;
            dx = modifyPoint[0] - center[0];
            dy = modifyPoint[1] - center[1];
            const initialRadius = Math.sqrt(dx * dx + dy * dy);
            if (initialRadius > minRadius) {
              const initialAngle = Math.atan2(dy, dx);
              dx = point[0] - center[0];
              dy = point[1] - center[1];
              const currentRadius = Math.sqrt(dx * dx + dy * dy);
              if (currentRadius > 0) {
                const currentAngle = Math.atan2(dy, dx);
                const geometry = modifyGeometry.geometry0.clone();
                if (type.includes('zoom'))
                  geometry.scale(currentRadius / initialRadius, undefined, center);
                if (type.includes('rotate'))
                  geometry.rotate(currentAngle - initialAngle, center);
                modifyGeometry.geometry = geometry;
              }
            }
          }
        });
        return defaultStyle(feature, level);
      },
    });
    this.modify.on('modifystart', function (event) {
      event.features.forEach(function (feature) {
        feature.set('modifyGeometry', {geometry: feature.getGeometry()!.clone()}, true);
      });
    });
    this.modify.on('modifyend', event => {
      event.features.forEach(feature => {
        const modifyGeometry = feature.get('modifyGeometry');
        if (modifyGeometry) {
          feature.setGeometry(modifyGeometry.geometry);
          feature.unset('modifyGeometry', true);
        }
        if (callback)
          callback(getFeatureInstanceByFeature(feature, this.mapHelper)!)
      });
    });
    this.map.addInteraction(this.modify);
  }

  stop() {
    if (this.modify) {
      this.map.removeInteraction(this.modify);
      this.modify = undefined;
      this.mapHelper.interaction.interactionType = undefined;
    }
  }
}