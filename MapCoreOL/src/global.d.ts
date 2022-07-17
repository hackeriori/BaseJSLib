interface Window {
  versionInfo?: {
    [key: string]: string,
  }
}

declare const ResizeObserver: any

type PartialByKeys<T, K extends keyof T> = Partial<Pick<T, K & keyof T>> & Omit<T, K & keyof T> extends infer U ? { [P in keyof U]: U[P] } : never
