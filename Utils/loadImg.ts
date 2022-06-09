/**
 * 新建一个HTMLImageElement，并设置src为指定的地址，在图片载入成功后返回img，否则抛出异常。
 * @param src 图片地址
 * @param crossOrigin 设置图片跨域，常用于canvas导出（需远程服务器支持）
 */
export default async function loadImg(src: string, crossOrigin = true): Promise<HTMLImageElement | undefined> {
  return new Promise<HTMLImageElement | undefined>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      resolve(img)
    });
    img.addEventListener('error', () => {
      resolve(undefined);
    });
    if (crossOrigin)
      img.crossOrigin = 'Anonymous';
    img.src = src;
  });
}