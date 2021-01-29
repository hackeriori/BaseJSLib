import * as _CesiumType from 'cesium'

export default abstract class Render {
  protected abstract nativePrimitives: _CesiumType.PrimitiveCollection;
  readonly abstract nativeModel: _CesiumType.Model;

  /**
   * 设置模型的容器primitives，一般用于需要自定义层的模型，在render方法之前调用。
   * @param primitives 模型的容器
   */
  setContainer(primitives: _CesiumType.PrimitiveCollection) {
    this.nativePrimitives = primitives;
  }

  /**
   * 将模型渲染到场景中，返回成功或失败
   */
  async render() {
    this.nativePrimitives.add(this.nativeModel);
    try {
      await this.nativeModel.readyPromise;
      return true;
    } catch {
      return false;
    }
  }
}