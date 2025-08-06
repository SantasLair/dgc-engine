/**
 * Grid class that mimics GameMaker's ds_grid functionality
 * Provides a clean interface for 2D grid operations without exposing array-of-arrays
 */
export class Grid<T = number> {
  private width: number
  private height: number
  private data: T[][]

  constructor(width: number, height: number, defaultValue?: T) {
    this.width = width
    this.height = height
    this.data = []
    
    // Initialize grid with column-major order for [x][y] access
    for (let x = 0; x < this.width; x++) {
      this.data[x] = []
      for (let y = 0; y < this.height; y++) {
        this.data[x][y] = defaultValue as T
      }
    }
  }

  /**
   * Get value at position (x, y) - GameMaker style: ds_grid_get(grid, x, y)
   */
  public get(x: number, y: number): T {
    if (!this.isValid(x, y)) {
      throw new Error(`Grid position (${x}, ${y}) is out of bounds. Grid size: ${this.width}x${this.height}`)
    }
    return this.data[x][y]
  }

  /**
   * Set value at position (x, y) - GameMaker style: ds_grid_set(grid, x, y, value)
   */
  public set(x: number, y: number, value: T): void {
    if (!this.isValid(x, y)) {
      throw new Error(`Grid position (${x}, ${y}) is out of bounds. Grid size: ${this.width}x${this.height}`)
    }
    this.data[x][y] = value
  }

  /**
   * Check if position is within grid bounds
   */
  public isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  /**
   * Get grid width - GameMaker style: ds_grid_width(grid)
   */
  public getWidth(): number {
    return this.width
  }

  /**
   * Get grid height - GameMaker style: ds_grid_height(grid)
   */
  public getHeight(): number {
    return this.height
  }

  /**
   * Clear grid with a value - GameMaker style: ds_grid_clear(grid, value)
   */
  public clear(value: T): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.data[x][y] = value
      }
    }
  }

  /**
   * Resize grid - GameMaker style: ds_grid_resize(grid, width, height)
   */
  public resize(newWidth: number, newHeight: number, defaultValue?: T): void {
    const oldData = this.data
    const oldWidth = this.width
    const oldHeight = this.height

    this.width = newWidth
    this.height = newHeight
    this.data = []

    // Create new grid
    for (let x = 0; x < this.width; x++) {
      this.data[x] = []
      for (let y = 0; y < this.height; y++) {
        // Copy old data if it exists, otherwise use default
        if (x < oldWidth && y < oldHeight && oldData[x]) {
          this.data[x][y] = oldData[x][y]
        } else {
          this.data[x][y] = defaultValue as T
        }
      }
    }
  }

  /**
   * Get value in region - GameMaker style: ds_grid_get_sum/mean/max/min
   */
  public getSum(x1: number, y1: number, x2: number, y2: number): number {
    let sum = 0
    for (let x = Math.max(0, x1); x <= Math.min(this.width - 1, x2); x++) {
      for (let y = Math.max(0, y1); y <= Math.min(this.height - 1, y2); y++) {
        const value = this.data[x][y]
        if (typeof value === 'number') {
          sum += value
        }
      }
    }
    return sum
  }

  /**
   * Set region to value - GameMaker style: ds_grid_set_region(grid, x1, y1, x2, y2, value)
   */
  public setRegion(x1: number, y1: number, x2: number, y2: number, value: T): void {
    for (let x = Math.max(0, x1); x <= Math.min(this.width - 1, x2); x++) {
      for (let y = Math.max(0, y1); y <= Math.min(this.height - 1, y2); y++) {
        this.data[x][y] = value
      }
    }
  }

  /**
   * Add value to position - GameMaker style: ds_grid_add(grid, x, y, value)
   */
  public add(x: number, y: number, value: number): void {
    if (!this.isValid(x, y)) return
    const current = this.data[x][y]
    if (typeof current === 'number' && typeof value === 'number') {
      this.data[x][y] = (current + value) as T
    }
  }

  /**
   * Multiply value at position - GameMaker style: ds_grid_multiply(grid, x, y, value)
   */
  public multiply(x: number, y: number, value: number): void {
    if (!this.isValid(x, y)) return
    const current = this.data[x][y]
    if (typeof current === 'number' && typeof value === 'number') {
      this.data[x][y] = (current * value) as T
    }
  }

  /**
   * Copy grid data from another grid - GameMaker style: ds_grid_copy(destination, source)
   */
  public copyFrom(sourceGrid: Grid<T>): void {
    this.resize(sourceGrid.getWidth(), sourceGrid.getHeight())
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.data[x][y] = sourceGrid.get(x, y)
      }
    }
  }

  /**
   * Get the raw data for pathfinding libraries (returns row-major for compatibility)
   */
  public toRowMajorArray(): T[][] {
    const result: T[][] = []
    for (let y = 0; y < this.height; y++) {
      result[y] = []
      for (let x = 0; x < this.width; x++) {
        result[y][x] = this.data[x][y]
      }
    }
    return result
  }

  /**
   * Create grid from row-major array data
   */
  public static fromRowMajorArray<T>(data: T[][]): Grid<T> {
    if (data.length === 0) {
      return new Grid<T>(0, 0)
    }
    
    const height = data.length
    const width = data[0].length
    const grid = new Grid<T>(width, height)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid.set(x, y, data[y][x])
      }
    }
    
    return grid
  }

  /**
   * Iterator for easy looping - allows for (let [x, y, value] of grid)
   */
  *[Symbol.iterator](): Iterator<[number, number, T]> {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        yield [x, y, this.data[x][y]]
      }
    }
  }

  /**
   * Get string representation of the grid
   */
  public toString(): string {
    let result = `Grid(${this.width}x${this.height}):\n`
    for (let y = 0; y < this.height; y++) {
      const row: string[] = []
      for (let x = 0; x < this.width; x++) {
        row.push(String(this.data[x][y]))
      }
      result += `  [${row.join(', ')}]\n`
    }
    return result
  }
}

// Type aliases for common grid types (GameMaker style)
export type NumberGrid = Grid<number>
export type StringGrid = Grid<string>
export type BooleanGrid = Grid<boolean>

// Factory functions (GameMaker style)
export function createGrid<T>(width: number, height: number, defaultValue?: T): Grid<T> {
  return new Grid<T>(width, height, defaultValue)
}

export function createNumberGrid(width: number, height: number, defaultValue: number = 0): NumberGrid {
  return new Grid<number>(width, height, defaultValue)
}

export function createStringGrid(width: number, height: number, defaultValue: string = ''): StringGrid {
  return new Grid<string>(width, height, defaultValue)
}

export function createBooleanGrid(width: number, height: number, defaultValue: boolean = false): BooleanGrid {
  return new Grid<boolean>(width, height, defaultValue)
}
