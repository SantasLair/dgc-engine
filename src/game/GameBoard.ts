import { CellType } from './types'
import { GameObject, GameEvent } from '../engine'

/**
 * Represents the game board with grid-based layout
 * Extends GameObject to be managed by the room system
 */
export class GameBoard extends GameObject {
  private boardWidth: number
  private boardHeight: number
  private grid: number[][]

  constructor(width: number, height: number) {
    super('GameBoard', { x: 0, y: 0, visible: true })
    
    this.boardWidth = width
    this.boardHeight = height
    this.grid = this.initializeGrid()
    
    // Setup GameObject events
    this.setupGameBoardEvents()
  }

  /**
   * Setup GameBoard-specific events
   */
  private setupGameBoardEvents(): void {
    this.addEventScript(GameEvent.CREATE, (_self) => {
      console.log('GameBoard created with dimensions:', this.boardWidth, 'x', this.boardHeight)
    })
    
    this.addEventScript(GameEvent.DESTROY, (_self) => {
      console.log('GameBoard destroyed')
    })
  }

  /**
   * Initialize the grid with default values and some obstacles
   */
  private initializeGrid(): number[][] {
    const grid: number[][] = []
    
    for (let y = 0; y < this.boardHeight; y++) {
      grid[y] = []
      for (let x = 0; x < this.boardWidth; x++) {
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
    const totalCells = this.boardWidth * this.boardHeight
    const obstacleCount = Math.floor((totalCells * density) / 100)
    
    for (let i = 0; i < obstacleCount; i++) {
      let x: number, y: number
      
      // Keep trying until we find an empty cell that's not the starting position
      do {
        x = Math.floor(Math.random() * this.boardWidth)
        y = Math.floor(Math.random() * this.boardHeight)
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
    return this.boardWidth
  }

  /**
   * Get the height of the board
   */
  public getHeight(): number {
    return this.boardHeight
  }

  /**
   * Check if a position is valid (within bounds)
   */
  public isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight
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

  /**
   * Calculate a simple path between two points on this board
   */
  public calculatePath(start: { x: number, y: number }, end: { x: number, y: number }): { x: number, y: number }[] {
    const path: { x: number, y: number }[] = []
    let current = { ...start }
    
    while (current.x !== end.x || current.y !== end.y) {
      // Move one step closer to target
      if (current.x < end.x) current.x++
      else if (current.x > end.x) current.x--
      
      if (current.y < end.y) current.y++
      else if (current.y > end.y) current.y--
      
      // Check if the cell is walkable
      if (this.isWalkable(current.x, current.y)) {
        path.push({ ...current })
      } else {
        // Simple obstacle avoidance - try alternative paths
        break
      }
    }
    
    return path
  }

  /**
   * Reset the board to its initial state
   */
  public resetBoard(): void {
    this.grid = this.initializeGrid()
    console.log('GameBoard reset')
  }

  /**
   * Clear all obstacles from the board
   */
  public clearObstacles(): void {
    for (let y = 0; y < this.boardHeight; y++) {
      for (let x = 0; x < this.boardWidth; x++) {
        if (this.grid[y][x] === CellType.OBSTACLE) {
          this.grid[y][x] = CellType.EMPTY
        }
      }
    }
    console.log('All obstacles cleared from GameBoard')
  }

  /**
   * Get a copy of the grid for pathfinding algorithms (like EasyStar.js)
   * Returns a 2D array where 0 = walkable, 1 = obstacle
   */
  public getPathfindingGrid(): number[][] {
    return this.grid.map(row => [...row])
  }

  /**
   * Get board dimensions as an object
   */
  public getDimensions(): { width: number, height: number } {
    return {
      width: this.boardWidth,
      height: this.boardHeight
    }
  }
}
