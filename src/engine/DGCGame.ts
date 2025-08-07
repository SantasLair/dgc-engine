import { DGCEngine } from './DGCEngine'
import type { DGCEngineConfig } from './DGCEngineConfig'
import { createDGCEngineConfig } from './DGCEngineConfig'
import { GameObject } from './GameObject'
import * as PIXI from 'pixi.js'

/**
 * Base Game class that provides a foundation for DGC games
 * Games should extend this class to implement their specific logic
 */
export abstract class DGCGame {
  protected canvas: HTMLCanvasElement
  protected engine: DGCEngine
  protected isInitialized: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    
    // Create the DGC engine with the game's configuration
    const userConfig = this.getEngineConfig()
    const config = createDGCEngineConfig(userConfig)
    
    // Calculate and set canvas dimensions based on grid configuration
    const canvasWidth = config.gridWidth * config.cellSize + (config.gridOffset.x * 2)
    const canvasHeight = config.gridHeight * config.cellSize + (config.gridOffset.y * 2)
    
    // Set canvas dimensions for proper scaling reference
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
    
    console.log(`🎮 Canvas dimensions set to ${canvasWidth}x${canvasHeight}`)
    console.log(`🎮 Grid: ${config.gridWidth}x${config.gridHeight}, Cell: ${config.cellSize}px, Offset: ${config.gridOffset.x}x${config.gridOffset.y}`)
    console.log(`🎮 Actual canvas element size: ${this.canvas.width}x${this.canvas.height}`)
    
    this.engine = new DGCEngine(config)
  }

  /**
   * Get the engine configuration
   * Override this method to customize the engine settings
   */
  protected abstract getEngineConfig(): DGCEngineConfig

  /**
   * Setup game-specific logic after engine creation
   * Override this method to add your game objects, event handlers, etc.
   */
  protected abstract setupGame(): Promise<void>

  /**
   * Start the game
   */
  public async start(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Game is already initialized')
      return
    }

    try {
      console.log('🎮 Starting DGC game...')
      
      // Initialize the DGC engine
      await this.engine.initialize()
      
      // Setup game-specific logic
      await this.setupGame()
      
      // Start the engine
      this.engine.start()
      
      this.isInitialized = true
      console.log('🎮 DGC game started successfully!')
      
    } catch (error) {
      console.error('Failed to start game:', error)
      throw error
    }
  }

  /**
   * Stop the game
   */
  public stop(): void {
    if (!this.isInitialized) {
      console.warn('Game is not initialized')
      return
    }
    
    this.engine.stop()
    this.isInitialized = false
    console.log('🎮 Game stopped')
  }

  /**
   * Get direct access to the PIXI Application
   * This allows games to leverage the full power of PIXI.js
   */
  public getPixiApp(): PIXI.Application {
    return this.engine.getPixiApp()
  }

  /**
   * Get access to the rendering layers
   */
  public getLayers() {
    return this.engine.getLayers()
  }

  /**
   * Create a new game object
   */
  public createObject(objectType: string, x: number = 0, y: number = 0): GameObject {
    return this.engine.createGameObject(objectType, x, y)
  }

  /**
   * Remove a game object
   */
  public removeObject(gameObject: GameObject): void {
    this.engine.removeGameObject(gameObject)
  }

  /**
   * Get all game objects
   */
  public getGameObjects(): GameObject[] {
    return this.engine.getGameObjects()
  }

  /**
   * Get the game engine instance
   */
  public getEngine(): DGCEngine {
    return this.engine
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  public screenToGrid(screenX: number, screenY: number) {
    return this.engine.screenToGrid(screenX, screenY)
  }

  /**
   * Convert grid coordinates to screen coordinates
   */
  public gridToScreen(gridX: number, gridY: number) {
    return this.engine.gridToScreen(gridX, gridY)
  }

  /**
   * Check if a key is currently pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.engine.getInputManager().isKeyPressed(key)
  }

  /**
   * Check if a key was just pressed this frame
   */
  public isKeyJustPressed(key: string): boolean {
    return this.engine.getInputManager().isKeyJustPressed(key)
  }

  /**
   * Check if a key was just released this frame
   */
  public isKeyJustReleased(key: string): boolean {
    return this.engine.getInputManager().isKeyJustReleased(key)
  }

  /**
   * Get current mouse position
   */
  public getMousePosition() {
    return this.engine.getInputManager().getMousePosition()
  }

  /**
   * Check if a mouse button is currently pressed
   */
  public isMouseButtonPressed(button: number): boolean {
    return this.engine.getInputManager().isMouseButtonPressed(button)
  }

  /**
   * Check if a mouse button was just pressed this frame
   */
  public isMouseButtonJustPressed(button: number): boolean {
    return this.engine.getInputManager().isMouseButtonJustPressed(button)
  }

  /**
   * Check if a mouse button was just released this frame
   */
  public isMouseButtonJustReleased(button: number): boolean {
    return this.engine.getInputManager().isMouseButtonJustReleased(button)
  }
}
