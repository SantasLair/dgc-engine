import { CellType } from '../types'
import { GameObject, GameEvent } from '../../engine'
import { Grid } from '../Grid'

/**
 * Represents the game board with grid-based layout
 * Uses GameMaker-style Grid for clean (x, y) coordinate access
 * Extends GameObject to be managed by the room system
 */
export class GameBoard extends GameObject {
  private boardWidth: number
  private boardHeight: number
  private grid: Grid<CellType>

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
   * 
   * Note: This could also be written in GameMaker style:
   * const grid = ds_grid_create(this.boardWidth, this.boardHeight, CellType.EMPTY)
   * See src/examples/GridExamples.ts for GML-style alternatives
   */
  private initializeGrid(): Grid<CellType> {
    const grid = new Grid<CellType>(this.boardWidth, this.boardHeight, CellType.EMPTY)
    
    // Add some random obstacles for demonstration
    this.addRandomObstacles(grid, 25) // 25% obstacle density
    
    return grid
  }

  /**
   * Add random obstacles to the grid
   */
  private addRandomObstacles(grid: Grid<CellType>, density: number): void {
    const totalCells = this.boardWidth * this.boardHeight
    const obstacleCount = Math.floor((totalCells * density) / 100)
    
    for (let i = 0; i < obstacleCount; i++) {
      let x: number, y: number
      
      // Keep trying until we find an empty cell that's not the starting position
      do {
        x = Math.floor(Math.random() * this.boardWidth)
        y = Math.floor(Math.random() * this.boardHeight)
      } while (grid.get(x, y) !== CellType.EMPTY || (x === 0 && y === 0))
      
      grid.set(x, y, CellType.OBSTACLE)
    }
  }

  /**
   * Get the grid for direct access (GameMaker style)
   */
  public getGrid(): Grid<CellType> {
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
    return this.grid.isValid(x, y)
  }

  /**
   * Check if a position is walkable (not an obstacle)
   */
  public isWalkable(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return false
    return this.grid.get(x, y) === CellType.EMPTY
  }

  /**
   * Get the cell type at a specific position
   */
  public getCellType(x: number, y: number): CellType {
    if (!this.isValidPosition(x, y)) return CellType.OBSTACLE
    return this.grid.get(x, y)
  }

  /**
   * Set the cell type at a specific position
   */
  public setCellType(x: number, y: number, type: CellType): void {
    if (this.isValidPosition(x, y)) {
      this.grid.set(x, y, type)
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
    for (let x = 0; x < this.boardWidth; x++) {
      for (let y = 0; y < this.boardHeight; y++) {
        if (this.grid.get(x, y) === CellType.OBSTACLE) {
          this.grid.set(x, y, CellType.EMPTY)
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
    return this.grid.toRowMajorArray()
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
