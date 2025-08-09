import { Rapid } from 'rapid-render'
import { EventManager } from './EventManager'
import { GameObjectManager, type ObjectFilter } from './GameObjectManager'
import { GameObject } from './GameObject'
import { DrawingSystem } from './DrawingSystem.ts'
import type { EngineConfig } from './EngineConfig.ts'
import { createDGCEngineConfig } from './EngineConfig.ts'
import { InputManager } from './InputManager'

/**
 * DGC game engine powered by Rapid.js
 * This engine uses Rapid.js for immediate mode rendering
 */
export class Engine {
  private rapid: Rapid
  private config: Required<EngineConfig>
  private eventManager: EventManager
  private gameObjectManager: GameObjectManager
  private inputManager: InputManager
  private drawingSystem: DrawingSystem
  private lastTime: number = 0
  private targetFrameTime: number
  private isRunning: boolean = false
  private animationFrameId: number | null = null
  private accumulator: number = 0  // For frame rate smoothing
  private maxFrameTime: number = 50  // Cap maximum frame time to prevent spiral of death
  
  // Performance monitoring
  private frameCount: number = 0
  private lastFPSUpdate: number = 0
  private currentFPS: number = 0
  
  constructor(config: EngineConfig) {
    this.config = createDGCEngineConfig(config)
    this.targetFrameTime = 1000 / this.config.targetFPS
    
    // Initialize Rapid.js with guaranteed canvas
    this.rapid = new Rapid({
      ...this.config.rapidConfig,
      canvas: this.config.canvas
    })
    
    // Initialize the GameMaker-style drawing system
    this.drawingSystem = new DrawingSystem(this.rapid)
    
    // Initialize managers
    this.eventManager = new EventManager()
    this.gameObjectManager = new GameObjectManager(this.eventManager, this.drawingSystem)
    this.inputManager = new InputManager(this.config.canvas)
    
    console.log(`🎮 DGCEngine initialized successfully with Rapid.js targeting ${this.config.targetFPS} FPS`)
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
    this.lastFPSUpdate = this.lastTime // Initialize FPS timer
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
  private gameLoop = (): void => {
    if (!this.isRunning) {
      return
    }
    
    const currentTime = performance.now()
    const deltaTime = Math.min(currentTime - this.lastTime, this.maxFrameTime)
    
    // Accumulate time for stable frame rate
    this.accumulator += deltaTime
    
    // Cache active objects array for performance (single allocation per frame)
    let allActiveObjects: GameObject[] | null = null
    
    // Process frames at consistent intervals
    while (this.accumulator >= this.targetFrameTime) {
      // === GameMaker Event Order ===

      // Cache active objects array for performance (avoid multiple array allocations)
      if (!allActiveObjects) {
        allActiveObjects = this.gameObjectManager.getAllActiveObjects()
      }

      // Input and Timer Events
      this.processInputEvents()
      this.processTimerEvents(this.targetFrameTime, allActiveObjects) // Use fixed timestep

      // Step Phase (using cached active objects)
      this.invokeVirtualForAll('onStepBegin', allActiveObjects)
      this.invokeVirtualForAll('onStep', allActiveObjects)
      // ToDo: calculate collisions and other physics here
      this.invokeVirtualForAll('onStepEnd', allActiveObjects)
      // ToDo: update animations and other visual effects here

      // Subtract processed time
      this.accumulator -= this.targetFrameTime
    }
    
    // Always render (interpolation could be added here for smoothness)
    // Draw Phase (reuse cached active objects from step phase, or get fresh if no steps occurred)
    if (!allActiveObjects) {
      allActiveObjects = this.gameObjectManager.getAllActiveObjects()
    }
    this.startRender()
    this.invokeVirtualForAll('onDrawBegin', allActiveObjects)
    this.invokeVirtualForAll('onDraw', allActiveObjects)
    this.invokeVirtualForAll('onDrawEnd', allActiveObjects)
    this.endRender()
    
    // Cleanup
    this.inputManager.endFrame()
    this.eventManager.clearObjectEventQueue() // Clear any orphaned events
    
    // Update FPS calculation
    this.frameCount++
    if (currentTime - this.lastFPSUpdate >= 1000) { // Update FPS every second
      this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFPSUpdate))
      this.frameCount = 0
      this.lastFPSUpdate = currentTime
    }
    
    this.lastTime = currentTime
    
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
  public getDrawingSystem(): DrawingSystem {
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
  public getConfig(): Required<EngineConfig> {
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
    return this.currentFPS || Math.round(1000 / this.targetFrameTime)
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
    // Input events are now processed via the InputManager and accessed directly by objects
    // Objects can check input state directly using this.inputManager in their virtual methods
    // No need to iterate through objects or queue events here
    
    // Optional: Process global input events that affect the engine itself
    // (reserved for future engine-level input handling)
  }

  /**
   * Process timer/alarm events (GameMaker-style alarms)
   */
  private processTimerEvents(deltaTime: number, gameObjects?: GameObject[]): void {
    const objects = gameObjects || this.gameObjectManager.getAllActiveObjects()
    // Update timers for all game objects
    for (const gameObject of objects) {
      // Update any timers this object might have
      gameObject.updateTimers(deltaTime)
    }
  }

  /**
   * Process virtual event methods for all game objects
   */
  private invokeVirtualForAll(methodName: keyof GameObject, cachedObjects?: GameObject[]): void {
    const objects = cachedObjects || this.gameObjectManager.getAllActiveObjects()
    
    for (const gameObject of objects) {
      const method = gameObject[methodName] as Function
      if (typeof method === 'function') {
        try {
          method.call(gameObject)
        } catch (error) {
          console.error(`Error executing ${methodName} on ${gameObject.objectType}:`, error)
        }
      }
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
