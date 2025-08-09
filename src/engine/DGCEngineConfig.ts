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
   * Target frames per second
   */
  targetFPS?: number
  
  /**
   * Rapid.js renderer settings
   */
  rapidConfig?: Partial<IRapidOptions>
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<DGCEngineConfig> = {
  targetFPS: 60,
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
