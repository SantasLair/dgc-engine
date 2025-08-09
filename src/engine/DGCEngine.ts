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
   * Follows GameMaker's complete event order
   */
  private gameLoop = async (): Promise<void> => {
    if (!this.isRunning) {
      return
    }
    
    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime
    
    // Update at target FPS
    if (deltaTime >= this.targetFrameTime) {
      // === GameMaker Event Order ===
      
      // Input and Timer Events
      this.processInputEvents()
      this.processTimerEvents(deltaTime)
      
      // Step Phase
      await this.beginStep()
      await this.step()
      await this.collision()
      await this.endStep()
      
      // Animation Updates
      this.processAnimationEvents()
      
      // Draw Phase
      this.startRender()
      await this.beginDraw()
      await this.draw()
      await this.endDraw()
      await this.beginDrawGUI()
      await this.drawGUI()
      await this.endDrawGUI()
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

  /**
   * Process input events (GameMaker-style keyboard and mouse events)
   */
  private processInputEvents(): void {
    // Check for key press/release events and trigger object events
    for (const gameObject of this.gameObjectManager.getAllObjects()) {
      if (!gameObject.active) continue
      
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
    for (const gameObject of this.gameObjectManager.getAllObjects()) {
      if (!gameObject.active) continue
      
      // Update any timers this object might have
      gameObject.updateTimers(deltaTime)
    }
  }

  /**
   * Process animation events (sprite animation frame changes)
   */
  private processAnimationEvents(): void {
    // Update sprite animations for all game objects
    for (const gameObject of this.gameObjectManager.getAllObjects()) {
      if (!gameObject.active || !gameObject.visible) continue
      
      // Update sprite animation if object has one
      gameObject.updateAnimation()
    }
  }

  /**
   * Process a specific GameMaker event for all game objects
   */
  private async processGameMakerEvent(eventName: string): Promise<void> {
    for (const gameObject of this.gameObjectManager.getAllObjects()) {
      if (!gameObject.active && eventName !== 'destroy') continue
      
      await gameObject.executeEvent(eventName as any, { deltaTime: 0 })
    }
  }

  // === GameMaker Event Methods ===

  /**
   * Step Begin Event - First step event of the frame
   */
  private async beginStep(): Promise<void> {
    await this.processGameMakerEvent('step_begin')
  }

  /**
   * Step Event - Main game logic update
   */
  private async step(): Promise<void> {
    await this.processGameMakerEvent('step')
  }

  /**
   * Collision Event - Handle object collisions
   */
  private async collision(): Promise<void> {
    await this.processGameMakerEvent('collision')
  }

  /**
   * Step End Event - Last step event of the frame
   */
  private async endStep(): Promise<void> {
    await this.processGameMakerEvent('step_end')
  }

  /**
   * Start Render - Initialize rendering phase
   */
  private startRender(): void {
    this.rapid.startRender()
    this.drawingSystem.clearFrame()
  }

  /**
   * Draw Begin Event - First draw event
   */
  private async beginDraw(): Promise<void> {
    await this.processGameMakerEvent('draw_begin')
  }

  /**
   * Draw Event - Main drawing phase
   */
  private async draw(): Promise<void> {
    await this.processGameMakerEvent('draw')
  }

  /**
   * Draw End Event - Last standard draw event
   */
  private async endDraw(): Promise<void> {
    await this.processGameMakerEvent('draw_end')
  }

  /**
   * Draw GUI Begin Event - First GUI draw event
   */
  private async beginDrawGUI(): Promise<void> {
    await this.processGameMakerEvent('draw_gui_begin')
  }

  /**
   * Draw GUI Event - GUI drawing phase
   */
  private async drawGUI(): Promise<void> {
    await this.processGameMakerEvent('draw_gui')
  }

  /**
   * Draw GUI End Event - Last GUI draw event
   */
  private async endDrawGUI(): Promise<void> {
    await this.processGameMakerEvent('draw_gui_end')
  }

  /**
   * End Render - Finalize rendering phase
   */
  private endRender(): void {
    this.rapid.endRender()
  }
}
