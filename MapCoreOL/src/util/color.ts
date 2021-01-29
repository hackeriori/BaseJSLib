/**
 * 十六进制颜色转换为RGBA格式
 * @param str
 * @param n 透明度，取值0-1之间
 * @return {string|*}
 */
export function colorToRGBA(str: string, n: number) {
  //十六进制颜色转换为RGB格式
  let sColor = str.toLowerCase();
  if (sColor.length === 4) {
    let sColorNew = "#";
    for (let i = 1; i < 4; i++) {  //例如：#eee,#fff等
      const color = sColor.slice(i, i + 1);
      sColorNew += color.concat(color);
    }
    sColor = sColorNew;
  }
  //处理六位颜色值
  const sColorChange = [];
  for (let i = 1; i < 7; i += 2) {
    sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
  }
  return "rgba(" + sColorChange.join(",") + "," + n + ")";
}

/**
 * 校验是否为十六进制颜色
 * @param str 十六进制色
 * @return {boolean}
 */
export function testStrColor(str: string) {
  const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return reg.test(str);
}

/**
 * 校验是否为RGBA色，如果是则返回RGBA数组
 * @param rgba
 * @return {boolean|number[]}
 */
export function testRGBA(rgba: string) {
  const reg = /^rgba\((\s*\d{1,3}\s*,){3}\s*(0|(0(\.\d+))|1)\s*\)$/;
  let status = reg.test(rgba);
  if (status) {
    const str = rgba.slice(5, rgba.length - 1);
    const arr = str.split(',').map(x => Number(x));
    arr.forEach(function (item, index) {
      if (index === arr.length - 1) {
        if (item < 0 || item > 1)
          status = false;
      } else {
        if (item < 0 || item > 255)
          status = false;
      }
    });
    if (status)
      return arr;
  }
  return false;
}

/**
 * 将RGBA颜色的数组转换为RGBA色
 * @param {Array} arrColor
 * @param opacity 透明度
 * @return {string}
 */
export function arrToRGBA(arrColor: number[], opacity = 1) {
  if (arrColor.length === 3)
    return `rgba(${arrColor.toString()},${opacity})`;
  else
    return `rgba(${arrColor.toString()})`;
}