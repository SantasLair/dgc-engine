import { Rapid } from 'rapid-render'
import { EventManager } from './EventManager'
import { GameObjectManager } from './GameObjectManager'
import { GameObject } from './GameObject'
import { DGCDrawingSystem } from './DGCDrawingSystem'
import type { DGCEngineConfig } from './DGCEngineConfig'
import { createDGCEngineConfig } from './DGCEngineConfig'
import { InputManager } from './InputManager'

/**
 * DGC game engine powered by Rapid.js
 * This engine uses Rapid.js for immediate mode rendering that aligns with GameMaker's draw events
 */
export class DGCEngine {
  private rapid: Rapid
  private config: Required<DGCEngineConfig>
  private eventManager: EventManager
  private gameObjectManager: GameObjectManager
  private inputManager: InputManager
  private drawingSystem: DGCDrawingSystem
  private lastTime: number = 0
  private targetFrameTime: number
  private isRunning: boolean = false
  private animationFrameId: number | null = null
  
  constructor(config: DGCEngineConfig) {
    this.config = createDGCEngineConfig(config)
    this.targetFrameTime = 1000 / this.config.targetFPS
    
    // Initialize Rapid.js with guaranteed canvas
    this.rapid = new Rapid({
      ...this.config.rapidConfig,
      canvas: this.config.canvas
    })
    
    // Initialize the GameMaker-style drawing system
    this.drawingSystem = new DGCDrawingSystem(this.rapid)
    
    // Initialize managers
    this.eventManager = new EventManager()
    this.gameObjectManager = new GameObjectManager(this.eventManager, this.drawingSystem)
    this.inputManager = new InputManager(this.config.canvas)
    
    console.log('🎮 DGCEngine initialized successfully with Rapid.js')
  }
  
  /**
   * Start the game engine
   */
  public start(): void {
    if (this.isRunning) {
      return
    }
    
    this.isRunning = true
    this.lastTime = performance.now()
    this.gameLoop()
  }
  
  /**
   * Stop the game engine
   */
  public stop(): void {
    this.isRunning = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  // Dispose input listeners
  this.inputManager.dispose()
  }
  
  /**
   * Main game loop using requestAnimationFrame
   */
  private gameLoop = async (): Promise<void> => {
    if (!this.isRunning) {
      return
    }
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    // Update at target FPS
    if (deltaTime >= this.targetFrameTime) {
      this.update(deltaTime)
      await this.render()
      this.lastTime = currentTime
    }
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }
  
  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    // Update all game objects
    this.gameObjectManager.update(deltaTime)
    
    // Clear input state at end of frame
    this.inputManager.endFrame()
  }
  
  /**
   * Render the game using Rapid.js immediate mode rendering
   */
  private async render(): Promise<void> {
    // Start Rapid.js render cycle
    this.rapid.startRender()
    
    // Clear the drawing system (though Rapid.js handles this automatically)
    this.drawingSystem.clearFrame()
    
    // Render all game objects with their draw events
    this.gameObjectManager.draw()
    
    // Process all queued draw events immediately for immediate mode rendering
    await this.eventManager.processObjectEvents()
    
    // End Rapid.js render cycle
    this.rapid.endRender()
  }
  
  /**
   * Add a game object to the engine
   */
  public addGameObject(gameObject: GameObject): void {
    this.gameObjectManager.addExistingObject(gameObject)
  }
  
  /**
   * Remove a game object from the engine
   */
  public removeGameObject(gameObject: GameObject): void {
    this.gameObjectManager.destroyObject(gameObject.id)
  }
  
  /**
   * Get the input manager
   */
  public getInputManager(): InputManager {
    return this.inputManager
  }
  
  /**
   * Get the event manager
   */
  public getEventManager(): EventManager {
    return this.eventManager
  }
  
  /**
   * Get the drawing system for immediate mode drawing
   */
  public getDrawingSystem(): DGCDrawingSystem {
    return this.drawingSystem
  }
  
  /**
   * Get the underlying Rapid.js renderer
   */
  public getRapidRenderer(): Rapid {
    return this.rapid
  }
  
  /**
   * Get the canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.config.canvas
  }
  
  /**
   * Get engine configuration
   */
  public getConfig(): Required<DGCEngineConfig> {
    return this.config
  }

  /**
   * Get the game object manager
   */
  public getObjectManager(): GameObjectManager {
    return this.gameObjectManager
  }

  /**
   * Get current FPS (frames per second)
   */
  public getFPS(): number {
    // Simple FPS calculation based on target frame time
    return Math.round(1000 / this.targetFrameTime)
  }
}
