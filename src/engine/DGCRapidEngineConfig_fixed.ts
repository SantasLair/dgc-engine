import { Color } from 'rapid-render'
import type { IRapidOptions } from 'rapid-render'

/**
 * Configuration for the DGC game engine with Rapid.js
 */
export interface DGCRapidEngineConfig {
  /**
   * Canvas element to render to (added automatically by DGCRapidGame)
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
export const DEFAULT_RAPID_CONFIG: Partial<DGCRapidEngineConfig> = {
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
export function createDGCRapidEngineConfig(config: DGCRapidEngineConfig, canvas?: HTMLCanvasElement): Required<DGCRapidEngineConfig> {
  const merged = {
    ...DEFAULT_RAPID_CONFIG,
    ...config,
    canvas: canvas || config.canvas, // Use provided canvas or canvas from config
    rapidConfig: {
      canvas: canvas || config.canvas, // Always use the provided canvas
      ...DEFAULT_RAPID_CONFIG.rapidConfig,
      ...config.rapidConfig
    }
  } as Required<DGCRapidEngineConfig>
  
  return merged
}
