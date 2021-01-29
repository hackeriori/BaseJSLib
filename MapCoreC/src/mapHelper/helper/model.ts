import * as _CesiumType from 'cesium'
import ModelShell from "../model";
import * as url from "url";
import ModelOptions from "./modelTypes";

export default class ModelHelper {
  //模型列表
  private readonly modelList = new Map<string, ModelShell>();

  constructor(private readonly nativeViewer: _CesiumType.Viewer) {
  }

  /**
   * 创建的model，不会立即渲染
   */
  createModel(option: ModelOptions) {
    //验证
    if (this.modelList.has(option.id))
      return `模型加载失败：模型ID“${option.id}”与已有模型重复`;
    return new ModelShell(this.nativeViewer, this.modelList, option);
  }

  /**
   * 获取模型
   * @param id 模型ID
   */
  getModel(id: string) {
    return this.modelList.get(id);
  }

  /**
   * 移除模型
   * @param id 模型ID
   */
  removeModel(id: string) {
    const model = this.modelList.get(id);
    if (model)
      model.destroy();
  }
}