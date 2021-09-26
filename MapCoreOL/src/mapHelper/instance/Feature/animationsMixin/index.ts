import applyMixins from "../../../../../../Utils/applyMixins";
import LineFlowAnimation from "./lineFlow";
import FlashAnimation from "./flash";
import {unByKey} from "ol/Observable";
import TrackPlayAnimation from "./trackPlay";
import GifPlayAnimation from "./gifPlay";

abstract class AnimationsMixin {
  /**
   * 停止所有动画
   */
  stopAnimations() {
    if (this.lineFlowAnimationKey) {
      unByKey(this.lineFlowAnimationKey);
      this.lineFlowAnimationKey = undefined;
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

interface AnimationsMixin extends LineFlowAnimation, FlashAnimation, TrackPlayAnimation, GifPlayAnimation {
}

applyMixins(AnimationsMixin, [LineFlowAnimation, FlashAnimation, TrackPlayAnimation, GifPlayAnimation]);

export default AnimationsMixin