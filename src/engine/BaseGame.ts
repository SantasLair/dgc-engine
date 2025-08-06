import { GameEngine } from './GameEngine'
import type { GameEngineConfig } from './GameEngineConfig'
import type { IRenderer } from './IRenderer'
import { GameObject } from './GameObject'

/**
 * Base Game class that provides a foundation for games using the GameEngine
 * Games should extend this class to implement their specific logic
 */
export abstract class BaseGame {
  protected canvas: HTMLCanvasElement
  protected engine: GameEngine
  protected isInitialized: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    
    // Engine will be created in the start() method using the factory
    this.engine = new GameEngine() // Temporary, will be replaced
  }

  /**
   * Create and configure the game engine
   * Override this method to customize engine configuration
   */
  protected async createEngine(): Promise<GameEngine> {
    const config = this.getEngineConfig()
    return await GameEngine.create(config)
  }

  /**
   * Get the engine configuration
   * Override this method to customize the engine settings
   */
  protected abstract getEngineConfig(): GameEngineConfig

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

    // Create and configure the engine with renderer
    this.engine = await this.createEngine()
    
    // Setup game-specific logic
    await this.setupGame()
    
    // Start the engine
    await this.engine.start()
    
    this.isInitialized = true
  }

  /**
   * Stop the game
   */
  public async stop(): Promise<void> {
    if (!this.isInitialized) return
    
    await this.engine.stop()
    this.isInitialized = false
  }

  /**
   * Restart the game
   */
  public async restart(): Promise<void> {
    await this.stop()
    await this.start()
  }

  /**
   * Get the game engine for advanced usage
   */
  public getEngine(): GameEngine {
    return this.engine
  }

  /**
   * Get the renderer
   */
  public getRenderer(): IRenderer | null {
    return this.engine.getRenderer()
  }

  /**
   * Check if the game is initialized
   */
  public get isGameInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * Create a game object using the engine
   */
  protected createObject(objectType: string, x: number, y: number): GameObject {
    return this.engine.createObject(objectType, x, y)
  }

  /**
   * Add an existing game object to the engine
   */
  protected addObject(object: GameObject): void {
    this.engine.getObjectManager().addExistingObject(object)
  }

  /**
   * Emit an engine event
   */
  protected emitEvent(eventType: string, eventData?: any): void {
    this.engine.emitEvent(eventType, eventData)
  }

  /**
   * Listen for engine events
   */
  protected addEventListener(eventType: string, callback: (eventData?: any) => void): void {
    this.engine.addEventListener(eventType, callback)
  }

  /**
   * Update the renderer (typically called automatically by the engine)
   */
  protected updateRenderer(): void {
    const renderer = this.getRenderer()
    if (renderer) {
      renderer.render()
    }
  }
}
