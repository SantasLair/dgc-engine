import type { Position } from '../game/types'

/**
 * Abstract renderer interface that the game engine can use
 * This allows different rendering backends while keeping the engine renderer-agnostic
 */
export interface IRenderer {
  /**
   * Initialize the renderer
   */
  initialize(): Promise<void>
  
  /**
   * Check if the renderer is ready
   */
  isReady(): boolean
  
  /**
   * Wait for the renderer to be ready
   */
  waitForReady(): Promise<void>
  
  /**
   * Clear the screen/canvas
   */
  clear(): void
  
  /**
   * Update/render the current frame
   */
  render(): void
  
  /**
   * Draw a game object at its current position
   */
  drawObject(object: any): void
  
  /**
   * Convert screen coordinates to game grid coordinates
   */
  screenToGrid(screenX: number, screenY: number): Position
  
  /**
   * Convert grid coordinates to screen coordinates
   */
  gridToScreen(gridX: number, gridY: number): Position
  
  /**
   * Set up mouse/touch event handling
   */
  setupInputHandlers(onPointerDown: (position: Position) => void): void
  
  /**
   * Get the underlying renderer application (for advanced usage)
   */
  getApp(): any
  
  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void
  
  /**
   * Cleanup resources
   */
  destroy(): void
}

/**
 * Renderer configuration options
 */
export interface RendererConfig {
  canvas: HTMLCanvasElement
  width: number
  height: number
  gridWidth: number
  gridHeight: number
  backgroundColor?: number
  antialias?: boolean
}
