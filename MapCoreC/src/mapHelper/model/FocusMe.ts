import * as _CesiumType from 'cesium'

export default abstract class FocusMe {
  //模型的实例
  abstract readonly nativeModel: _CesiumType.Model;
  protected abstract readonly nativeViewer: _CesiumType.Viewer

  /**
   * 将相机视角锁定到模型上
   * @param heading
   * @param pitch
   */
  focusMe(heading?: number, pitch?: number) {
    const distance = 4 * Math.max(this.nativeModel.boundingSphere.radius, this.nativeViewer.camera.frustum.near);
    const pose = new Cesium.HeadingPitchRange(heading, pitch || -Cesium.Math.PI_OVER_SIX, distance);
    // 由相对坐标算出笛卡尔世界坐标
    const center = Cesium.Matrix4.multiplyByPoint(
      this.nativeModel.modelMatrix,
      this.nativeModel.boundingSphere.center,
      new Cesium.Cartesian3()
    );
    this.nativeViewer.camera.lookAt(
      center,
      pose
    );
  }
}