import type { RendererType } from './RendererFactory'
import type { RendererConfig } from './IRenderer'

/**
 * Configuration for the game engine
 */
export interface GameEngineConfig {
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
   * Renderer type to use
   */
  rendererType?: RendererType
  
  /**
   * Target frames per second
   */
  targetFPS?: number
  
  /**
   * Additional renderer-specific configuration
   */
  rendererConfig?: Partial<RendererConfig>
}

/**
 * Helper function to create a complete RendererConfig from GameEngineConfig
 */
export function createRendererConfig(gameConfig: GameEngineConfig): RendererConfig {
  return {
    canvas: gameConfig.canvas,
    width: gameConfig.canvas.width,
    height: gameConfig.canvas.height,
    gridWidth: gameConfig.gridWidth,
    gridHeight: gameConfig.gridHeight,
    ...gameConfig.rendererConfig
  }
}
