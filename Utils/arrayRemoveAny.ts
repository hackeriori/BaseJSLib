/**
 * 移除数组中匹配表达式的所有项
 * @param array 数组
 * @param fun 表达式
 * @param firstOnly 是否只删除第一个匹配项
 */
export function arrayRemoveAny<T>(array: T[], fun: (item: T) => boolean, firstOnly = false) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (fun(array[i])) {
      array.splice(i, 1);
      if (firstOnly)
        break;
    }
  }
}