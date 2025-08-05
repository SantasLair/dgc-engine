import { CellType } from './types'

/**
 * Represents the game board with grid-based layout
 */
export class GameBoard {
  private width: number
  private height: number
  private grid: number[][]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.grid = this.initializeGrid()
  }

  /**
   * Initialize the grid with default values and some obstacles
   */
  private initializeGrid(): number[][] {
    const grid: number[][] = []
    
    for (let y = 0; y < this.height; y++) {
      grid[y] = []
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = CellType.EMPTY
      }
    }
    
    // Add some random obstacles for demonstration
    this.addRandomObstacles(grid, 25) // 25% obstacle density
    
    return grid
  }

  /**
   * Add random obstacles to the grid
   */
  private addRandomObstacles(grid: number[][], density: number): void {
    const totalCells = this.width * this.height
    const obstacleCount = Math.floor((totalCells * density) / 100)
    
    for (let i = 0; i < obstacleCount; i++) {
      let x: number, y: number
      
      // Keep trying until we find an empty cell that's not the starting position
      do {
        x = Math.floor(Math.random() * this.width)
        y = Math.floor(Math.random() * this.height)
      } while (grid[y][x] !== CellType.EMPTY || (x === 0 && y === 0))
      
      grid[y][x] = CellType.OBSTACLE
    }
  }

  /**
   * Get the grid array for pathfinding
   */
  public getGrid(): number[][] {
    return this.grid
  }

  /**
   * Get the width of the board
   */
  public getWidth(): number {
    return this.width
  }

  /**
   * Get the height of the board
   */
  public getHeight(): number {
    return this.height
  }

  /**
   * Check if a position is valid (within bounds)
   */
  public isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  /**
   * Check if a position is walkable (not an obstacle)
   */
  public isWalkable(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return false
    return this.grid[y][x] === CellType.EMPTY
  }

  /**
   * Get the cell type at a specific position
   */
  public getCellType(x: number, y: number): CellType {
    if (!this.isValidPosition(x, y)) return CellType.OBSTACLE
    return this.grid[y][x] as CellType
  }

  /**
   * Set the cell type at a specific position
   */
  public setCellType(x: number, y: number, type: CellType): void {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = type
    }
  }
}
