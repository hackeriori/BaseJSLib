/**
 * 获取第position位的二进制值
 * @param value 原数值
 * @param position 第N位
 */
export function getBitAt(value: number, position: number) {
  return ((value >> (position - 1)) & 1) as 0 | 1;
}

/**
 * 修改第position位的二进制数值，并返回修改后的结果
 * @param value 原数值
 * @param position 第N位
 * @param flag 修改值
 */
export function modifyBitAt(value: number, position: number, flag: 0 | 1) {
  let temp = 1;
  let result: number;
  temp <<= position - 1;
  if (flag)
    result = value | temp;
  else {
    temp = ~temp;
    result = value & temp;
  }
  return result
}