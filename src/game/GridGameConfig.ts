import type { DGCEngineConfig } from '../engine/DGCEngineConfig'

/**
 * Configuration for grid-based games that extends the base engine config
 */
export interface GridGameConfig extends DGCEngineConfig {
  /**
   * Game grid dimensions
   */
  gridWidth: number
  gridHeight: number
  
  /**
   * Grid cell size in pixels
   */
  cellSize?: number
  
  /**
   * Grid offset from canvas edges
   */
  gridOffset?: { x: number; y: number }
}

/**
 * Default configuration values for grid-based games
 */
export const DEFAULT_GRID_CONFIG: Partial<GridGameConfig> = {
  targetFPS: 60,
  cellSize: 30,
  gridOffset: { x: 50, y: 50 }
}

/**
 * Create a complete grid game configuration object with defaults
 */
export function createGridGameConfig(config: GridGameConfig): Required<GridGameConfig> {
  return {
    ...DEFAULT_GRID_CONFIG,
    ...config
  } as Required<GridGameConfig>
}

/**
 * Grid coordinate conversion utilities
 */
export class GridCoordinateSystem {
  private cellSize: number
  private gridOffset: { x: number; y: number }
  
  constructor(cellSize: number, gridOffset: { x: number; y: number }) {
    this.cellSize = cellSize
    this.gridOffset = gridOffset
  }
  
  /**
   * Convert grid X coordinate to screen X coordinate
   */
  public gridToScreenX(gridX: number): number {
    return this.gridOffset.x + gridX * this.cellSize
  }
  
  /**
   * Convert grid Y coordinate to screen Y coordinate
   */
  public gridToScreenY(gridY: number): number {
    return this.gridOffset.y + gridY * this.cellSize
  }
  
  /**
   * Convert screen X coordinate to grid X coordinate
   */
  public screenToGridX(screenX: number): number {
    return Math.floor((screenX - this.gridOffset.x) / this.cellSize)
  }
  
  /**
   * Convert screen Y coordinate to grid Y coordinate
   */
  public screenToGridY(screenY: number): number {
    return Math.floor((screenY - this.gridOffset.y) / this.cellSize)
  }
}
