import * as PIXI from 'pixi.js'

/**
 * Configuration for the DGC game engine
 */
export interface DGCEngineConfig {
  /**
   * Canvas element to render to
   */
  canvas: HTMLCanvasElement
  
  /**
   * Game grid dimensions
   */
  gridWidth: number
  gridHeight: number
  
  /**
   * Target frames per second
   */
  targetFPS?: number
  
  /**
   * PIXI Application settings
   */
  pixiConfig?: Partial<PIXI.ApplicationOptions>
  
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
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<DGCEngineConfig> = {
  targetFPS: 60,
  cellSize: 30,
  gridOffset: { x: 50, y: 50 },
  pixiConfig: {
    backgroundColor: 0x333333,
    antialias: true
  }
}

/**
 * Helper function to merge user config with defaults
 */
export function createDGCEngineConfig(config: DGCEngineConfig): Required<DGCEngineConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    pixiConfig: {
      ...DEFAULT_CONFIG.pixiConfig,
      ...config.pixiConfig
    },
    gridOffset: {
      ...DEFAULT_CONFIG.gridOffset,
      ...config.gridOffset
    }
  } as Required<DGCEngineConfig>
}
