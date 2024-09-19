import type {RotateParamsType} from '../types';
import AnimationsSharedData from './sharedData';
import applyMixins from '../../../../../../Utils/applyMixins';
import RenderEvent from 'ol/render/Event';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Geometry} from 'ol/geom';
import type Style from 'ol/style/Style';

const Pi2 = Math.PI * 2;

abstract class RotateAnimation {
  rotate(options?: Partial<RotateParamsType>) {
    if (this.styleLike || !this.layerInstance.visibly)
      return;
    const preOptions: RotateParamsType = {
      // 旋转方向 0:顺时针，1:逆时针
      rotate: 0,
      // 动画频率，次/秒
      frequency: 1
    }
    const _options: RotateParamsType = Object.assign(preOptions, options);
    // 将频率转换为持续时间
    const duration = 1 / _options.frequency * 1000;
    const geometry = this.nativeFeature.getGeometry();
    if (!Array.isArray(this.normalStyle)) return;
    const styleNormal = this.normalStyle[0];
    let styleHighLight: Style | undefined;
    if (Array.isArray(this.highLightStyle))
      styleHighLight = this.highLightStyle[0];
    if (geometry) {
      const type = geometry.getType();
      if (type === 'Point' && styleNormal.getImage()) {
        this.rotateAngleNormal = styleNormal.getImage().getRotation();
        this.rotateAngleHighLight = styleHighLight?.getImage()?.getRotation();
        const start = new Date().getTime();
        const animate = (event: RenderEvent) => {
          const frameState = event.frameState!;
          const elapsed = frameState.time - start;
          const currentAngle = _options.rotate ? -(elapsed % duration) / duration * Pi2 : (elapsed % duration) / duration * Pi2;
          styleNormal.getImage().setRotation(currentAngle);
          if (styleHighLight?.getImage()) {
            styleHighLight.getImage().setRotation(currentAngle);
          }
          this.nativeFeature.changed();
          this.map.render();
        }
        this.rotateAnimationKey = (this.layerInstance.nativeLayer as VectorLayer<VectorSource<Geometry>>).on('postrender', animate);
        this.map.render();
      }
    }
  }
}

interface RotateAnimation extends AnimationsSharedData {
}

applyMixins(RotateAnimation, [AnimationsSharedData]);

export default RotateAnimation;