declare module '@saehrimnir/druidjs' {
  export class PCA {
    constructor(data: number[][], dimensions?: number)
    transform(): Matrix
  }

  export class Matrix {
    shape: [number, number]
    entry(row: number, col: number): number
  }
}
