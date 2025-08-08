import { Color } from 'rapid-render'
import type { IRapidOptions } from 'rapid-render'

/**
 * Configuration for the DGC game engine with Rapid.js
 */
export interface DGCEngineConfig {
  /**
   * Canvas element to render to (added automatically by DGCGame)
   */
  canvas?: HTMLCanvasElement
  
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
   * Rapid.js renderer settings
   */
  rapidConfig?: Partial<IRapidOptions>
  
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
  rapidConfig: {
    backgroundColor: Color.fromHex("333333"),
    antialias: true
  }
}

/**
 * Create a complete configuration object with defaults
 */
export function createDGCEngineConfig(config: DGCEngineConfig, canvas?: HTMLCanvasElement): Required<DGCEngineConfig> {
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    canvas: canvas || config.canvas, // Use provided canvas or canvas from config
    rapidConfig: {
      canvas: canvas || config.canvas, // Always use the provided canvas
      ...DEFAULT_CONFIG.rapidConfig,
      ...config.rapidConfig
    }
  } as Required<DGCEngineConfig>
  
  return merged
}
