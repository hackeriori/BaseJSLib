/**
 * 重新调整图片大小，一般用于压缩图片
 * @param img HTMLImageElement
 * @param width 目标宽度
 * @param height 目标高度
 */
export default function resizeImg(img: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    const {width: originWidth, height: originHeight} = img;
    // 目标尺寸
    let targetWidth = width;
    let targetHeight = height;
    let targetX = 0;
    let targetY = 0;
    // 变形
    if (originWidth !== width || originHeight !== height) {
      // 以短边为准
      if (width > height) {
        // 宽图片
        targetWidth = Math.round(height * (originWidth / originHeight));
        targetX = Math.round((width - targetWidth) / 2);
      } else {
        // 高图片
        targetHeight = Math.round(width * (originHeight / originWidth));
        targetY = Math.round((height - targetHeight) / 2)
      }
    }
    canvas.width = width;
    canvas.height = height;
    // 图片绘制
    context.drawImage(img, targetX, targetY, targetWidth, targetHeight);
    return canvas.toDataURL();
  }
}