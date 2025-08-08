import { DGCGame } from '../engine/DGCGame'
import type { DGCEngineConfig } from '../engine/DGCEngineConfig'
import type { GridGameConfig } from './GridGameConfig'
import { createGridGameConfig, GridCoordinateSystem } from './GridGameConfig'

/**
 * Base class for grid-based games that extends DGCGame
 * Provides grid coordinate conversion and canvas sizing based on grid dimensions
 */
export abstract class GridGame extends DGCGame {
  protected gridConfig!: Required<GridGameConfig> // Will be initialized in getEngineConfig
  private _gridSystem?: GridCoordinateSystem
  
  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    // gridSystem will be lazily initialized when first accessed
  }

  /**
   * Get the grid system (lazy initialization)
   */
  protected get gridSystem(): GridCoordinateSystem {
    if (!this._gridSystem) {
      this._gridSystem = new GridCoordinateSystem(
        this.gridConfig.cellSize,
        this.gridConfig.gridOffset
      )
    }
    return this._gridSystem
  }

  /**
   * Get the grid-specific game configuration
   * Override this method to provide grid settings
   */
  protected abstract getGridConfig(): GridGameConfig

  /**
   * Get the engine configuration (converts from grid config)
   */
  protected getEngineConfig(): DGCEngineConfig {
    // Initialize gridConfig if not already done (called during super() constructor)
    if (!this.gridConfig) {
      this.gridConfig = createGridGameConfig(this.getGridConfig())
    }
    
    // Extract base engine config from grid config
    const { gridWidth, gridHeight, cellSize, gridOffset, ...engineConfig } = this.gridConfig
    return engineConfig
  }

  /**
   * Configure canvas dimensions based on grid configuration
   */
  protected configureCanvas(_config: Required<DGCEngineConfig>): void {
    // Calculate canvas dimensions based on grid configuration
    const canvasWidth = this.gridConfig.gridWidth * this.gridConfig.cellSize + (this.gridConfig.gridOffset.x * 2)
    const canvasHeight = this.gridConfig.gridHeight * this.gridConfig.cellSize + (this.gridConfig.gridOffset.y * 2)
    
    // Set canvas dimensions for proper scaling reference
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
    
    console.log(`🎮 Canvas dimensions set to ${canvasWidth}x${canvasHeight}`)
    console.log(`🎮 Grid: ${this.gridConfig.gridWidth}x${this.gridConfig.gridHeight}, Cell: ${this.gridConfig.cellSize}px, Offset: ${this.gridConfig.gridOffset.x}x${this.gridConfig.gridOffset.y}`)
    console.log(`🎮 Actual canvas element size: ${this.canvas.width}x${this.canvas.height}`)
  }

  /**
   * Convert grid X coordinate to screen X coordinate - GameMaker style
   */
  public gridToScreenX(gridX: number): number {
    return this.gridSystem.gridToScreenX(gridX)
  }

  /**
   * Convert grid Y coordinate to screen Y coordinate - GameMaker style
   */
  public gridToScreenY(gridY: number): number {
    return this.gridSystem.gridToScreenY(gridY)
  }

  /**
   * Convert screen X coordinate to grid X coordinate - GameMaker style
   */
  public screenToGridX(screenX: number): number {
    return this.gridSystem.screenToGridX(screenX)
  }

  /**
   * Convert screen Y coordinate to grid Y coordinate - GameMaker style
   */
  public screenToGridY(screenY: number): number {
    return this.gridSystem.screenToGridY(screenY)
  }

  /**
   * Get the grid configuration
   */
  public getGridConfiguration(): Required<GridGameConfig> {
    return this.gridConfig
  }
}
