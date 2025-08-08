import { DGCEngine } from './DGCEngine'
import type { DGCEngineConfig } from './DGCEngineConfig'
import { createDGCEngineConfig } from './DGCEngineConfig'
import { GameObject } from './GameObject'
import { RoomManager } from './Room'
import type { Rapid } from 'rapid-render'

/**
 * Base Game class that provides a foundation for DGC games using Rapid.js
 * Games should extend this class to implement their specific logic
 */
export abstract class DGCGame {
  protected canvas: HTMLCanvasElement
  protected engine: DGCEngine
  protected roomManager: RoomManager
  protected isInitialized: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    
    // Create the DGC engine with the game's configuration
    const userConfig = this.getEngineConfig()
    const config = createDGCEngineConfig(userConfig, canvas)
    
    // Let the game configure canvas dimensions
    this.configureCanvas(config)
    
    this.engine = new DGCEngine(config)
    
    // Initialize room manager as part of the engine
    this.roomManager = new RoomManager({
      dataPath: '/data/rooms/',
      objectTypes: new Map(),
      roomClasses: new Map()
    })
    
    // Set this game instance on the room manager for object management
    this.roomManager.setGameInstance(this)
    console.log('🏗️ RoomManager initialized in engine')
  }

  /**
   * Get the engine configuration
   * Override this method to customize the engine settings
   */
  protected abstract getEngineConfig(): DGCEngineConfig

  /**
   * Configure canvas dimensions - can be overridden by subclasses
   */
  protected configureCanvas(_config: Required<DGCEngineConfig>): void {
    // Default implementation - set canvas to a reasonable size if not specified
    if (!this.canvas.width || !this.canvas.height) {
      this.canvas.width = 800
      this.canvas.height = 600
    }
    console.log(`🎮 Canvas dimensions: ${this.canvas.width}x${this.canvas.height}`)
  }

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
      
      // Engine is already initialized in constructor
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
  public getEngine(): DGCEngine {
    return this.engine
  }

  /**
   * Get the room manager
   */
  public getRoomManager(): RoomManager {
    return this.roomManager
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
    console.log(`🎮 DGCGame.addGameObject() called for: ${gameObject.objectType} at (${gameObject.x}, ${gameObject.y})`)
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
   * Get the current mouse X position - GameMaker style
   */
  public getMouseX(): number {
    return this.engine.getInputManager().getMouseX()
  }

  /**
   * Get the current mouse Y position - GameMaker style
   */
  public getMouseY(): number {
    return this.engine.getInputManager().getMouseY()
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
   * Get the engine configuration
   */
  public getConfig(): DGCEngineConfig {
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
