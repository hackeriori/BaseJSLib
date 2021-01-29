/**
 * 将多个类混入到基类中
 * @param baseClass 基类
 * @param otherClasses 其他类数组
 */
export default function applyMixins(baseClass: any, otherClasses: any[]) {
  otherClasses.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      !(name in baseClass.prototype) && Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
        Object.create(null)
      );
    });
  });
}