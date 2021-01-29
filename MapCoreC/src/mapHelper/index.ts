import * as _CesiumType from 'cesium'
import ModelHelper from "./helper/model";

export default class MapHelper {
  readonly nativeViewer: _CesiumType.Viewer;
  readonly modelHelper: ModelHelper;

  constructor(container: Element | string, options?: _CesiumType.Viewer.ConstructorOptions) {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MzQwYjlkOS1hNGZjLTQwNjgtOGIyNS0yOTg2MzM2NzNkZGEiLCJpZCI6MzAyMzAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTM0MTQwNjd9.omJmQrys2jf-5CR9Es5Sg-uTpqK8xK_pIk_ZKXtUKkU';
    let preOptions: _CesiumType.Viewer.ConstructorOptions = {
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: 'http://webrd0{Server}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8',
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        minimumLevel: 1,
        maximumLevel: 18,
        customTags: {
          Server: function () {
            return Math.floor(Math.random() * 3 + 1)
          }
        }
      }),
      infoBox: false,
      homeButton: false,
      timeline: false,
      geocoder: false,
      baseLayerPicker: false,
      sceneModePicker: true,
      animation: false,
      // 显示阴影
      //shadows:true,
      // 显示模型动画
      //shouldAnimate:true,
      //terrainProvider: createWorldTerrain()
    }
    preOptions = {...preOptions, ...options};
    this.nativeViewer = new Cesium.Viewer(container, preOptions);
    //// 以下为添加图层的方法
    // this.viewer.scene.imageryLayers.addImageryProvider(new UrlTemplateImageryProvider({
    //   url: 'http://www.google.cn/maps/vt?lyrs=h@189&gl=cn&x={x}&y={y}&z={z}',
    //   tilingScheme: new WebMercatorTilingScheme(),
    //   minimumLevel: 1,
    //   maximumLevel: 18
    // }));
    // 隐藏Cesium LOGO
    (this.nativeViewer as any)._cesiumWidget._creditContainer.style.display = "none";
    // 如果是开发模式，显示FPS
    if (process.env.NODE_ENV === 'development')
      this.nativeViewer.scene.debugShowFramesPerSecond = true;
    this.modelHelper = new ModelHelper(this.nativeViewer);
  }

}