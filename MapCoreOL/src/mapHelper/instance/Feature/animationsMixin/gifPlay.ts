import AnimationsSharedData from "./sharedData";
import applyMixins from "../../../../../../Utils/applyMixins";
import {Options as IconOptions} from "ol/style/Icon";
import {StyleType} from "../types";

abstract class GifPlayAnimation {
  async playGif(gifUrl: string, style?: StyleType) {
    if (!this.canPlayNow())
      return;
    const geometry = this.nativeFeature.getGeometry()!;
    //不是点，退出
    if (geometry.getType() !== 'Point') {
      console.log('播放动画的元素不是点类型');
      return;
    }
    this.setState();
    const gif = gifler(gifUrl);
    let runOnce = true;
    let hideOnce = false;
    const innerStyle: StyleType = style || {image: {}};
    gif.frames(document.createElement('canvas'), (ctx, frame) => {
      if (this.animationVisible) {
        hideOnce = true;
        if (runOnce) {
          if (innerStyle.image) {
            const imageStyle = innerStyle.image as IconOptions;
            imageStyle.img = ctx.canvas;
            imageStyle.imgSize = [frame.width, frame.height];
          }
          this.nativeFeature.setStyle(this.mapHelper.style.createStyle(innerStyle));
          runOnce = false;
        }
        ctx.clearRect(0, 0, frame.width, frame.height);
        ctx.drawImage(frame.buffer, frame.x, frame.y);
        this.nativeFeature.changed();
      } else {
        if (hideOnce) {
          hideOnce = false;
          this.nativeFeature.changed();
        }
      }
    }, true);
  }
}

interface GifPlayAnimation extends AnimationsSharedData {
}

applyMixins(GifPlayAnimation, [AnimationsSharedData]);

export default GifPlayAnimation