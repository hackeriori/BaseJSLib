import AnimationsSharedData from './sharedData';
import applyMixins from '../../../../../../Utils/applyMixins';
import type {ColorFlashParamsType} from '../types';
import type Style from 'ol/style/Style';
import RenderEvent from 'ol/render/Event';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Geometry} from 'ol/geom';
import Icon from 'ol/style/Icon';

abstract class ColorFlashAnimation {
  colorFlash(options?: any) {
    if (this.styleLike || !this.layerInstance.visibly)
      return;
    const preOptions: ColorFlashParamsType = {
      scale: false,
      color: '#ff0000',
      frequency: 1
    };
    const _options: ColorFlashParamsType = Object.assign(preOptions, options);
    const duration = 1 / _options.frequency * 1000;
    const geometry = this.nativeFeature.getGeometry();
    if (!Array.isArray(this.normalStyle)) return;
    const styleNormal = this.normalStyle[0];
    let styleHighLight: Style | undefined;
    if (Array.isArray(this.highLightStyle))
      styleHighLight = this.highLightStyle[0];
    if (geometry && styleNormal.getImage()) {
      const type = geometry.getType();
      this.colorImageNormal = styleNormal.getImage().clone() as Icon;
      if (styleHighLight) {
        this.colorImageHighLight = styleHighLight.getImage()?.clone() as Icon;
      }
      if (type === 'Point' && this.colorImageNormal.getImage(1)) {
        const start = new Date().getTime();
        const canvas = document.createElement('canvas');
        canvas.width = this.colorImageNormal!.getImageSize()[0];
        canvas.height = this.colorImageNormal!.getImageSize()[1];
        const min = canvas.width / 15;
        const max = canvas.width / 4;
        const range = max - min;
        const iconStyle = new Icon({
          anchor: this.colorImageNormal!.getAnchor(),
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          crossOrigin: 'Anonymous',
          img: canvas,
          displacement: this.colorImageNormal!.getDisplacement(),
          opacity: this.colorImageNormal!.getOpacity(),
          scale: this.colorImageNormal!.getScale(),
          rotateWithView: this.colorImageNormal!.getRotateWithView(),
          rotation: this.colorImageNormal!.getRotation(),
          size: this.colorImageNormal!.getSize(),
          imgSize: this.colorImageNormal!.getImageSize()
        })
        const animate = (event: RenderEvent) => {
          const frameState = event.frameState!;
          const elapsed = frameState.time - start;
          const context = canvas.getContext('2d');
          if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.shadowColor = _options.color;
            context.shadowBlur = (elapsed % duration) / duration * range + min;
            context.drawImage(this.colorImageNormal!.getImage(1) as HTMLImageElement, 0, 0);
            _options.scale && iconStyle.setScale((elapsed % duration) / duration * 0.34 + 0.66);
            styleNormal.setImage(iconStyle);
            if (styleHighLight) {
              styleHighLight.setImage(iconStyle)
            }
            this.nativeFeature.changed();
          }
          this.map.render();
        }
        this.colorAnimationKey = (this.layerInstance.nativeLayer as VectorLayer<VectorSource<Geometry>>).on('postrender', animate);
        this.map.render();
      }
    }
  }
}

interface ColorFlashAnimation extends AnimationsSharedData {
}

applyMixins(ColorFlashAnimation, [AnimationsSharedData]);

export default ColorFlashAnimation;