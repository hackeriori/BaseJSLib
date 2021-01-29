import GetInfoFunType from "./types";

const message = '未初始化getInfoFun，请检查';

// 此类用于封装和处理等待结果
// 在构建To实例时，传入getInfoFun处理函数（To设计为类的原因就是方便不同的类实例有自定义的处理函数，这样在请求不同系统接口时很方便处理）
// 等待后返回此类实例
// 最后通过链式调用或普通调用getInfo(s)来获取最终的结果
export default class ToResult<T> {
  getInfoFun: GetInfoFunType = data => data

  constructor(public data: T | undefined, public err: any, _getInfoFun?: GetInfoFunType) {
    if (_getInfoFun)
      this.getInfoFun = _getInfoFun;
  }

  // 获取单个异步等待处理结果
  getInfo<P = T>() {
    if (this.data) {
      if (this.getInfoFun) {
        return this.getInfoFun<P>(this.data);
      } else
        console.log(message);
    }
  }

  // 获取并发处理结果，其中任何一个结果出错，将导致返回undefined
  getInfos<P>() {
    if (this.data) {
      if (this.getInfoFun) {
        const realData = (this.data as any) as Array<T | undefined>;
        const result = realData.map(x => x && this.getInfoFun!<P>(x)).filter(x => x) as P[];
        if (result.length === realData.length)
          return result;
      } else
        console.log(message);
    }
  }
}