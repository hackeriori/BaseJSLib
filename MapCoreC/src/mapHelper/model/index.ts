import * as _CesiumType from 'cesium'
import FocusMe from './FocusMe';
import Render from './Render'
import applyMixins from "../../../../Utils/applyMixins";
import ModelOptions from "../helper/modelTypes";

class ModelShell {
  //模型的实例
  readonly nativeModel: _CesiumType.Model;
  protected nativePrimitives: _CesiumType.PrimitiveCollection;
  protected readonly id: string;
  //指向modelHelper的modelList
  protected readonly modelList: Map<string, ModelShell>;

  /**
   * 创建的model，不会立即渲染
   * @param nativeViewer viewer
   * @param modelList 模型列表
   * @param option 模型选项
   */
  constructor(protected readonly nativeViewer: _CesiumType.Viewer, modelList: Map<string, ModelShell>, option: ModelOptions) {
    this.id = option.id;
    this.modelList = modelList;
    const hpr = option.pose || new Cesium.HeadingPitchRoll();
    const origin = Cesium.Cartesian3.fromDegrees(option.coordinate[0], option.coordinate[1], option.coordinate[2]);
    const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(origin, hpr);
    this.nativeModel = Cesium.Model.fromGltf({
      url: option.url,
      modelMatrix: modelMatrix,
    });
    this.nativePrimitives = nativeViewer.scene.primitives;
    this.modelList.set(this.id, this);
  }

  /**
   * 从primitives中移出model并销毁
   */
  destroy() {
    //从primitives移出后，模型已自动销毁，无需再调用model.destroy()
    this.nativePrimitives.remove(this.nativeModel);
    if (this.modelList.has(this.id))
      this.modelList.delete(this.id);
  }
}

interface ModelShell extends FocusMe, Render {
}

applyMixins(ModelShell, [FocusMe, Render]);

export default ModelShell