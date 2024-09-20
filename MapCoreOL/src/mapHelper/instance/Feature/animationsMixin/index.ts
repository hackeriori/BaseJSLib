import applyMixins from "../../../../../../Utils/applyMixins";
import LineFlowAnimation from "./lineFlow";
import FlashAnimation from "./flash";
import {unByKey} from "ol/Observable";
import TrackPlayAnimation from "./trackPlay";
import GifPlayAnimation from "./gifPlay";
import RotateAnimation from './rotate';
import ColorFlashAnimation from './colorFlash';

abstract class AnimationsMixin {
  /**
   * 停止所有动画
   */
  stopAnimations() {
    if (this.lineFlowAnimationKey) {
      unByKey(this.lineFlowAnimationKey);
      this.lineFlowAnimationKey = undefined;
    }
    if (this.rotateAnimationKey) {
      unByKey(this.rotateAnimationKey);
      if (Array.isArray(this.normalStyle) && this.rotateAngleNormal != null)
        this.normalStyle[0].getImage()?.setRotation(this.rotateAngleNormal)
      if (Array.isArray(this.highLightStyle) && this.rotateAngleHighLight != null)
        this.highLightStyle[0].getImage()?.setRotation(this.rotateAngleHighLight)
    }
    if (this.colorAnimationKey) {
      unByKey(this.colorAnimationKey);
      if (Array.isArray(this.normalStyle) && this.colorImageNormal != null)
        this.normalStyle[0].setImage(this.colorImageNormal)
      if (Array.isArray(this.highLightStyle) && this.colorImageHighLight != null)
        this.highLightStyle[0].setImage(this.colorImageHighLight)
    }
    if (this.playStyleLike !== undefined)
      this.nativeFeature.setStyle(this.playStyleLike);
    this.isPlayAnimation = false;
    this.show();
  }

  /**
   * 获取播放动画状态，是否正在播放动画
   */
  getPlayState() {
    return this.isPlayAnimation;
  }
}

interface AnimationsMixin extends LineFlowAnimation, FlashAnimation, TrackPlayAnimation, GifPlayAnimation, RotateAnimation, ColorFlashAnimation {
}

applyMixins(AnimationsMixin, [LineFlowAnimation, FlashAnimation, TrackPlayAnimation, GifPlayAnimation, RotateAnimation, ColorFlashAnimation]);

export default AnimationsMixin