import { DGCRapidEngine } from './DGCRapidEngine'
import type { DGCRapidEngineConfig } from './DGCRapidEngineConfig'
import { createDGCRapidEngineConfig } from './DGCRapidEngineConfig'
import { GameObject } from './GameObject'
import type { Rapid } from 'rapid-render'

/**
 * Base Game class that provides a foundation for DGC games using Rapid.js
 * Games should extend this class to implement their specific logic
 */
export abstract class DGCRapidGame {
  protected canvas: HTMLCanvasElement
  protected engine: DGCRapidEngine
  protected isInitialized: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    
    // Create the DGC engine with the game's configuration
    const userConfig = this.getEngineConfig()
    const config = createDGCRapidEngineConfig(userConfig, canvas)
    
    // Calculate and set canvas dimensions based on grid configuration
    const canvasWidth = config.gridWidth * config.cellSize + (config.gridOffset.x * 2)
    const canvasHeight = config.gridHeight * config.cellSize + (config.gridOffset.y * 2)
    
    // Set canvas dimensions for proper scaling reference
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
    
    console.log(`🎮 Canvas dimensions set to ${canvasWidth}x${canvasHeight}`)
    console.log(`🎮 Grid: ${config.gridWidth}x${config.gridHeight}, Cell: ${config.cellSize}px, Offset: ${config.gridOffset.x}x${config.gridOffset.y}`)
    console.log(`🎮 Actual canvas element size: ${this.canvas.width}x${this.canvas.height}`)
    
    this.engine = new DGCRapidEngine(config)
  }

  /**
   * Get the engine configuration
   * Override this method to customize the engine settings
   */
  protected abstract getEngineConfig(): DGCRapidEngineConfig

  /**
   * Setup game-specific logic after engine creation
   * Override this method to add your game objects, event handlers, etc.
   */
  protected abstract setupGame(): Promise<void>

  /**
   * Initialize the game
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🎮 Starting DGC Game initialization...')
      
      // Initialize the engine
      await this.engine.initialize()
      
      // Setup game-specific logic
      await this.setupGame()
      
      this.isInitialized = true
      console.log('✅ DGC Game initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize DGC Game:', error)
      throw error
    }
  }

  /**
   * Start the game
   */
  public start(): void {
    if (!this.isInitialized) {
      throw new Error('Game must be initialized before starting')
    }
    
    console.log('🚀 Starting DGC Game')
    this.engine.start()
  }

  /**
   * Stop the game
   */
  public stop(): void {
    console.log('⏹️ Stopping DGC Game')
    this.engine.stop()
  }

  /**
   * Get the game engine
   */
  public getEngine(): DGCRapidEngine {
    return this.engine
  }

  /**
   * Get the canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  /**
   * Add a GameObject to the game
   */
  public addGameObject(gameObject: GameObject): void {
    this.engine.addGameObject(gameObject)
  }

  /**
   * Remove a GameObject from the game
   */
  public removeGameObject(gameObject: GameObject): void {
    this.engine.removeGameObject(gameObject)
  }

  /**
   * Create a new GameObject and add it to the game
   */
  public createGameObject(objectType: string, x: number = 0, y: number = 0, properties: any = {}): GameObject {
    const objectManager = this.engine['gameObjectManager'] // Access private member
    return objectManager.createObject(objectType, x, y, properties)
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
   * Get the current mouse position
   */
  public getMousePosition(): { x: number; y: number } {
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

  /**
   * Convert grid coordinates to screen coordinates
   */
  public gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
    return this.engine.gridToScreen(gridX, gridY)
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  public screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    return this.engine.screenToGrid(screenX, screenY)
  }

  /**
   * Get the engine configuration
   */
  public getConfig(): DGCRapidEngineConfig {
    return this.engine.getConfig()
  }

  /**
   * Get the renderer (Rapid.js renderer)
   */
  public getRenderer(): Rapid {
    return this.engine.getRapidRenderer()
  }

  /**
   * Add a game object to the engine
   */
  public addObject(gameObject: GameObject): void {
    this.engine.addGameObject(gameObject)
  }

  /**
   * Check if the game is initialized (backward compatibility)
   */
  public get isGameInitialized(): boolean {
    return this.isInitialized
  }
}
