export function getOffsetX(element: HTMLElement) {
  let actualLeft = element.offsetLeft;
  let current = element.offsetParent;
  while (current) {
    actualLeft += (current as HTMLDivElement).offsetLeft;
    current = (current as HTMLDivElement).offsetParent;
  }
  return actualLeft;
}

export function getOffsetY(element: HTMLElement) {
  let actualTop = element.offsetTop;
  let current = element.offsetParent;
  while (current) {
    actualTop += (current as HTMLDivElement).offsetTop;
    current = (current as HTMLDivElement).offsetParent;
  }
  return actualTop;
}