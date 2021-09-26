interface gifType {
  frames(canvas: HTMLCanvasElement, render: (ctx: any, frame: any) => void, b: boolean): void
}

declare function gifler (url: string): gifType