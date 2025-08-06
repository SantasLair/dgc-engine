import type { IRenderer } from './IRenderer'
import { PixiRenderer } from './renderers/PixiRenderer'
import type { RendererConfig } from './index'

/**
 * Available renderer types
 */
export type RendererType = 'pixi' | 'canvas' | 'webgl'

/**
 * Factory for creating renderer instances
 * This abstracts renderer creation from the game engine
 */
export class RendererFactory {
  /**
   * Create a renderer instance based on type
   */
  static createRenderer(type: RendererType, config: RendererConfig): IRenderer {
    switch (type) {
      case 'pixi':
        return new PixiRenderer(config)
      
      case 'canvas':
        // TODO: Implement Canvas renderer
        throw new Error('Canvas renderer not yet implemented')
      
      case 'webgl':
        // TODO: Implement WebGL renderer  
        throw new Error('WebGL renderer not yet implemented')
      
      default:
        throw new Error(`Unknown renderer type: ${type}`)
    }
  }
  
  /**
   * Get the default renderer type
   */
  static getDefaultRendererType(): RendererType {
    return 'pixi'
  }
  
  /**
   * Check if a renderer type is supported
   */
  static isRendererSupported(type: RendererType): boolean {
    switch (type) {
      case 'pixi':
        return true
      case 'canvas':
      case 'webgl':
        return false // Not yet implemented
      default:
        return false
    }
  }
}
