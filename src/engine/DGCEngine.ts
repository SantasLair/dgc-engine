import { Rapid } from 'rapid-render'
import { EventManager } from './EventManager'
import { GameObjectManager, type ObjectFilter } from './GameObjectManager'
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
   * Follows GameMaker's complete event order
   */
  private gameLoop = (): void => {
    if (!this.isRunning) {
      return
    }
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    // Update at target FPS
    if (deltaTime >= this.targetFrameTime) {
      // === GameMaker Event Order ===
      
      // Cache active objects array for performance (avoid 8+ array allocations)
      const allActiveObjects = this.gameObjectManager.getAllActiveObjects()
      
      // Input and Timer Events
      this.processInputEvents()
      this.processTimerEvents(deltaTime)
      
      // Step Phase (using cached active objects)
      this.processGameMakerEvent('step_begin', allActiveObjects)
      this.processGameMakerEvent('step', allActiveObjects)
      this.processGameMakerEvent('collision', allActiveObjects)
      this.processGameMakerEvent('step_end', allActiveObjects)
      
      // Animation Updates
      this.processAnimationEvents()
      
      // Draw Phase (using cached active objects)
      this.startRender()
      this.processGameMakerEvent('draw_begin', allActiveObjects)
      this.processGameMakerEvent('draw', allActiveObjects)
      this.processGameMakerEvent('draw_end', allActiveObjects)
      this.processGameMakerEvent('draw_gui_begin', allActiveObjects)
      this.processGameMakerEvent('draw_gui', allActiveObjects)
      this.processGameMakerEvent('draw_gui_end', allActiveObjects)
      this.endRender()
      
      // Cleanup
      this.inputManager.endFrame()
      this.lastTime = currentTime
    }
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
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

  // === Object Management Methods ===

  /**
   * Get the number of objects of a specific type
   * @param objectType - Object type name or 'all' for all objects
   */
  public getObjectCount(objectType?: ObjectFilter): number {
    return this.gameObjectManager.getObjectCount(objectType)
  }

  /**
   * Check if any objects of a specific type exist
   * @param objectType - Object type name or 'all' for all objects
   */
  public hasObjects(objectType?: ObjectFilter): boolean {
    return this.gameObjectManager.getObjectCount(objectType) > 0
  }

  /**
   * Destroy all objects of a specific type
   * @param objectType - Object type name or 'all' for all objects
   */
  public destroyObjects(objectType: ObjectFilter): void {
    const objects = this.gameObjectManager.getObjectsByType(objectType)
    for (const obj of objects) {
      this.gameObjectManager.destroyObject(obj.id)
    }
  }

  /**
   * Process input events
   */
  private processInputEvents(): void {
    // Check for key press/release events and trigger object events
    for (const gameObject of this.gameObjectManager.getAllActiveObjects()) {
      // Check for any key that was just pressed
      // Note: In GameMaker, specific key events are usually handled by individual objects
      // This is a simplified version - objects can listen for specific keys in their event scripts
      
      // Mouse events
      if (this.inputManager.isMouseButtonJustPressed(0)) { // Left mouse
        this.eventManager.queueObjectEvent(gameObject, 'mouse_left_pressed', {
          mouseX: this.inputManager.getMouseX(),
          mouseY: this.inputManager.getMouseY()
        })
      }
      
      if (this.inputManager.isMouseButtonJustReleased(0)) { // Left mouse
        this.eventManager.queueObjectEvent(gameObject, 'mouse_left_released', {
          mouseX: this.inputManager.getMouseX(),
          mouseY: this.inputManager.getMouseY()
        })
      }
      
      if (this.inputManager.isMouseButtonJustPressed(2)) { // Right mouse
        this.eventManager.queueObjectEvent(gameObject, 'mouse_right_pressed', {
          mouseX: this.inputManager.getMouseX(),
          mouseY: this.inputManager.getMouseY()
        })
      }
      
      if (this.inputManager.isMouseButtonJustReleased(2)) { // Right mouse
        this.eventManager.queueObjectEvent(gameObject, 'mouse_right_released', {
          mouseX: this.inputManager.getMouseX(),
          mouseY: this.inputManager.getMouseY()
        })
      }
    }
  }

  /**
   * Process timer/alarm events (GameMaker-style alarms)
   */
  private processTimerEvents(deltaTime: number): void {
    // Update timers for all game objects
    for (const gameObject of this.gameObjectManager.getAllActiveObjects()) {
      // Update any timers this object might have
      gameObject.updateTimers(deltaTime)
    }
  }

  /**
   * Process animation events (sprite animation frame changes)
   */
  private processAnimationEvents(): void {
    // Update sprite animations for all game objects
    for (const gameObject of this.gameObjectManager.getAllActiveObjects()) {
      if (!gameObject.visible) continue
      
      // Update sprite animation if object has one
      gameObject.updateAnimation()
    }
  }

  /**
   * Process a specific GameMaker event for all game objects (optimized version)
   */
  private processGameMakerEvent(eventName: string, cachedObjects?: GameObject[]): void {
    const objects = cachedObjects || this.gameObjectManager.getAllActiveObjects()
    
    for (const gameObject of objects) {
      gameObject.executeEventSync(eventName as any, { deltaTime: 0 })
    }
  }

  // === Render Control Methods ===

  /**
   * Start Render - Initialize rendering phase
   */
  private startRender(): void {
    this.rapid.startRender()
    this.drawingSystem.clearFrame()
  }

  /**
   * End Render - Finalize rendering phase
   */
  private endRender(): void {
    this.rapid.endRender()
  }
}
