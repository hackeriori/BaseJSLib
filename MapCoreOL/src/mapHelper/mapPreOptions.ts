import {MapOptions} from 'ol/PluggableMap'
import View from "ol/View";

/**
 * 获取地图预制的（默认的）参数
 */
export default function getMapPreOptions() {
  const preOptions: MapOptions = {
    view: new View({
      //梅安森附近
      center: [11849201.99781884, 3430156.63782584],
      zoom: 16,
      //不允许旋转
      enableRotation: false
    }),
    //无任何控件
    controls: []
  };
  return preOptions;
}

